from typing import List, Optional, Dict
from django.db import transaction
from django.db.models import Count, Max
from django.core.exceptions import ValidationError as DjangoValidationError
from datetime import datetime, timedelta

from reports.models import ReportModel, DenunciaEstado, TipoDenuncia, Ciudad
from reports.exceptions import ReportNotFoundException, ReportValidationException
from .validation_service import validation_service
from .notification_service import notification_service
from domain.entities.usuario import Usuario
from django.utils import timezone
from django.apps import apps

import uuid
import os
from django.core.files.storage import default_storage
from django.conf import settings
from reports.models.report_archivos import ReportArchivo


# Obtener el modelo correctamente
ReportArchivo = apps.get_model('reports', 'ReportArchivo')

class ReportService:
    """Servicio con toda la lógica de negocio de reportes"""
    
    def __init__(self):
        self.storage = default_storage
        self.base_media_path = getattr(settings, 'MEDIA_ROOT', 'media/')
    
    @transaction.atomic
    def create_report(
        self,
        titulo: str,
        descripcion: str,
        ubicacion: str,
        urgencia: int,
        usuario_id: int,
        denuncia_estado_id: int,
        tipo_denuncia_id: int,
        ciudad_id: int
    ) -> ReportModel:
        """Crea un nuevo reporte"""
        
        # Preparar datos
        data = {
            'titulo': titulo,
            'descripcion': descripcion,
            'ubicacion': ubicacion,
            'urgencia': urgencia,
            'usuario_id': usuario_id,
            'denuncia_estado_id': denuncia_estado_id,
            'tipo_denuncia_id': tipo_denuncia_id,
            'ciudad_id': ciudad_id
        }
        
        # Validaciones
        self._validate_report_creation(data)
        
        # Limpiar datos
        titulo = titulo.strip()
        descripcion = descripcion.strip()
        ubicacion = ubicacion.strip()
        
        # Obtener instancias de los objetos relacionados
        try:
            usuario = Usuario.objects.get(usua_id=usuario_id)
            denuncia_estado = DenunciaEstado.objects.get(id=denuncia_estado_id)
            tipo_denuncia = TipoDenuncia.objects.get(id=tipo_denuncia_id)
            ciudad = Ciudad.objects.get(id=ciudad_id)
        except Exception as e:
            raise ReportValidationException({"error": f"Error al obtener relaciones: {str(e)}"})
        
        # Crear reporte
        report = ReportModel(
            titulo=titulo,
            descripcion=descripcion,
            ubicacion=ubicacion,
            urgencia=urgencia,
            usuario=usuario,
            denuncia_estado=denuncia_estado,
            tipo_denuncia=tipo_denuncia,
            ciudad=ciudad,
            visible=True
        )
        
        # Validar modelo
        try:
            report.full_clean()
        except DjangoValidationError as e:
            raise ReportValidationException(e.message_dict)
        
        # Guardar
        report.save()
        
        # Notificaciones
        notification_service.notify_report_created(report)
        if report.urgencia == 3:
            notification_service.notify_urgent_report(report)
        
        return report
    
    @transaction.atomic
    def update_report(self, report_id: int, **kwargs) -> ReportModel:
        """Actualiza un reporte existente"""
        report = self._get_report_or_raise(report_id)
        
        # Validar datos si se proporcionan
        if kwargs:
            errors = validation_service.validate_report_data(kwargs)
            fk_errors = validation_service.validate_foreign_keys(kwargs)
            errors.update(fk_errors)
            
            if errors:
                raise ReportValidationException(errors)
        
        # Actualizar campos
        changed = False
        for field, value in kwargs.items():
            if field.endswith('_id') and hasattr(report, field.replace('_id', '')):
                # Manejar foreign keys
                if field == 'denuncia_estado_id':
                    new_estado = DenunciaEstado.objects.get(id=value)
                    if report.denuncia_estado != new_estado:
                        report.denuncia_estado = new_estado
                        changed = True
                elif field == 'tipo_denuncia_id':
                    new_tipo = TipoDenuncia.objects.get(id=value)
                    if report.tipo_denuncia != new_tipo:
                        report.tipo_denuncia = new_tipo
                        changed = True
            elif hasattr(report, field):
                current_value = getattr(report, field)
                if isinstance(value, str):
                    value = value.strip()
                if current_value != value:
                    setattr(report, field, value)
                    changed = True
        
        if changed:
            report.save()
            notification_service.notify_report_updated(report)
        
        return report
    
    @transaction.atomic
    def delete_report(self, report_id: int) -> Dict:
        """Elimina un reporte"""
        report = self._get_report_or_raise(report_id)
        
        # Eliminar archivos asociados primero
        self.delete_report_files(report_id)
        
        notification_service.notify_report_deleted(report)
        report.delete()
        
        return {
            "message": "Reporte eliminado exitosamente",
            "id": report_id,
            "deleted_at": datetime.now().isoformat()
        }
    
    # Métodos de consulta
    def get_all_reports(self) -> List[ReportModel]:
        """Obtiene todos los reportes visibles"""
        return list(
            ReportModel.objects
            .select_related('usuario', 'denuncia_estado', 'tipo_denuncia', 'ciudad')
            .filter(visible=True)
            .all()
        )
    
    def get_report_by_id(self, report_id: int) -> Optional[ReportModel]:
        """Obtiene un reporte por ID"""
        try:
            return ReportModel.objects.select_related(
                'usuario', 'denuncia_estado', 'tipo_denuncia', 'ciudad'
            ).get(id=report_id)
        except ReportModel.DoesNotExist:
            return None
    
    def get_reports_by_user(self, usuario_id: int) -> List[ReportModel]:
        """Obtiene reportes de un usuario"""
        return list(
            ReportModel.objects
            .select_related('denuncia_estado', 'tipo_denuncia', 'ciudad')
            .filter(usuario__usua_id=usuario_id, visible=True)
        )
    
    def get_urgent_reports(self) -> List[ReportModel]:
        """Obtiene reportes urgentes"""
        return list(
            ReportModel.objects
            .select_related('usuario', 'denuncia_estado', 'tipo_denuncia', 'ciudad')
            .filter(urgencia=3, visible=True)
        )
    
    def get_recent_reports(self, days: int = 7) -> List[ReportModel]:
        """Obtiene reportes recientes"""
        cutoff = timezone.now() - timedelta(days=days)
        return list(
            ReportModel.objects
            .select_related('usuario', 'denuncia_estado', 'tipo_denuncia', 'ciudad')
            .filter(fecha_creacion__gte=cutoff, visible=True)
        )
    
    def get_statistics(self) -> Dict:
        """Estadísticas de reportes"""
        total = ReportModel.objects.count()
        visible = ReportModel.objects.filter(visible=True).count()
        urgent = ReportModel.objects.filter(urgencia=3, visible=True).count()
        
        urgency_counts = dict(
            ReportModel.objects
            .values('urgencia')
            .annotate(count=Count('id'))
            .values_list('urgencia', 'count')
        )
        
        return {
            "total": total,
            "visible": visible,
            "hidden": total - visible,
            "urgent": urgent,
            "by_urgency": {
                "baja": urgency_counts.get(1, 0),
                "media": urgency_counts.get(2, 0),
                "alta": urgency_counts.get(3, 0),
            },
            "recent_7days": len(self.get_recent_reports(7)),
            "recent_30days": len(self.get_recent_reports(30)),
        }
    
    # Métodos privados
    def _validate_report_creation(self, data: Dict):
        """Validaciones para creación de reporte"""
        # Validaciones de datos
        errors = validation_service.validate_report_data(data)
        
        # Validaciones de FK
        fk_errors = validation_service.validate_foreign_keys(data)
        errors.update(fk_errors)
        
        # Verificar duplicados
        if validation_service.check_duplicate_report(
            data['usuario_id'], data['titulo'], data['ubicacion']
        ):
            errors['duplicado'] = "Ya existe un reporte similar reciente"
        
        if errors:
            raise ReportValidationException(errors)
    
    def _get_report_or_raise(self, report_id: int) -> ReportModel:
        """Obtiene reporte o lanza excepción"""
        report = self.get_report_by_id(report_id)
        if not report:
            raise ReportNotFoundException(report_id)
        return report
    
    # Métodos con archivos
    @transaction.atomic
    def create_report_with_files(self, data, imagenes=None, video=None):
        """Crear reporte con archivos multimedia"""
        # Validar límites antes de crear
        if imagenes and len(imagenes) > 10:
            raise ValueError("Máximo 10 imágenes permitidas")
        
        if video and imagenes and len(imagenes) == 10:
            raise ValueError("No se puede agregar video si ya hay 10 imágenes")
        
        # Crear el reporte primero
        reporte = ReportModel.objects.create(**data)
        
        try:
            # Procesar imágenes
            if imagenes:
                self._save_images(reporte, imagenes)
            
            # Procesar video
            if video:
                self._save_video(reporte, video)
                
            return reporte
            
        except Exception as e:
            # Si hay error, eliminar el reporte creado y sus archivos
            self.delete_report_files(reporte.id)
            reporte.delete()
            raise e
    
    def _save_images(self, reporte, imagenes):
        """Guardar múltiples imágenes con la estructura de carpetas especificada"""
        fecha_str = datetime.now().strftime("%d-%m-%Y")
        
        for i, imagen in enumerate(imagenes):
            # Obtener extensión sin el punto
            extension = os.path.splitext(imagen.name)[1].lower().replace('.', '')
            nombre_archivo = f"foto_{str(i+1).zfill(3)}.{extension}"
            
            # Crear estructura de carpetas: uploads/01-11-2024/id_report/images/
            carpeta_destino = f"uploads/{fecha_str}/id_{reporte.id}/images"
            
            # Crear directorio si no existe
            directorio_completo = os.path.join(self.base_media_path, carpeta_destino)
            os.makedirs(directorio_completo, exist_ok=True)
            
            # Guardar archivo físicamente
            ruta_archivo_completa = os.path.join(directorio_completo, nombre_archivo)
            with open(ruta_archivo_completa, 'wb+') as destino:
                for chunk in imagen.chunks():
                    destino.write(chunk)
            
            # Crear registro en la base de datos
            ReportArchivo.objects.create(
                denu=reporte,
                dear_nombre=nombre_archivo,
                dear_extension=extension,
                dear_es_principal=(i == 0),  # La primera imagen es principal
                dear_orden=i
            )
    
    def _save_video(self, reporte, video):
        """Guardar video con la estructura de carpetas especificada"""
        fecha_str = datetime.now().strftime("%d-%m-%Y")
        
        # Obtener extensión sin el punto
        extension = os.path.splitext(video.name)[1].lower().replace('.', '')
        nombre_archivo = f"video_001.{extension}"
        
        # Crear estructura de carpetas: uploads/01-11-2024/id_report/videos/
        carpeta_destino = f"uploads/{fecha_str}/id_{reporte.id}/videos"
        
        # Crear directorio si no existe
        directorio_completo = os.path.join(self.base_media_path, carpeta_destino)
        os.makedirs(directorio_completo, exist_ok=True)
        
        # Guardar archivo físicamente
        ruta_archivo_completa = os.path.join(directorio_completo, nombre_archivo)
        with open(ruta_archivo_completa, 'wb+') as destino:
            for chunk in video.chunks():
                destino.write(chunk)
        
        # Crear registro en la base de datos
        ReportArchivo.objects.create(
            denu=reporte,
            dear_nombre=nombre_archivo,
            dear_extension=extension,
            dear_es_principal=True,  # El video siempre es principal
            dear_orden=0
        )
    
    def _save_images_with_order(self, reporte, imagenes, orden_inicial):
        """Guardar imágenes con orden específico"""
        fecha_str = datetime.now().strftime("%d-%m-%Y")
        
        for i, imagen in enumerate(imagenes):
            # Obtener extensión sin el punto
            extension = os.path.splitext(imagen.name)[1].lower().replace('.', '')
            numero_archivo = orden_inicial + i + 1
            nombre_archivo = f"foto_{str(numero_archivo).zfill(3)}.{extension}"
            
            # Crear estructura de carpetas
            carpeta_destino = f"uploads/{fecha_str}/id_{reporte.id}/images"
            
            # Crear directorio si no existe
            directorio_completo = os.path.join(self.base_media_path, carpeta_destino)
            os.makedirs(directorio_completo, exist_ok=True)
            
            # Guardar archivo físicamente
            ruta_archivo_completa = os.path.join(directorio_completo, nombre_archivo)
            with open(ruta_archivo_completa, 'wb+') as destino:
                for chunk in imagen.chunks():
                    destino.write(chunk)
            
            # Crear registro en la base de datos
            ReportArchivo.objects.create(
                denu=reporte,
                dear_nombre=nombre_archivo,
                dear_extension=extension,
                dear_es_principal=False,  # Las imágenes adicionales no son principales
                dear_orden=orden_inicial + i
            )
    
    def get_report_files(self, reporte_id):
        """Obtener archivos de un reporte específico"""
        # Usamos objeto.pk como forma universal de referirse a la clave primaria
        return ReportArchivo.objects.filter(denu_id=reporte_id).order_by('dear_orden')
    
    def get_report_images(self, reporte_id):
        """Obtener solo imágenes de un reporte"""
        extensiones_imagen = ['jpg', 'jpeg', 'png', 'webp']
        return ReportArchivo.objects.filter(
            denu_id=reporte_id,
            dear_extension__in=extensiones_imagen
        ).order_by('dear_orden')
    
    def get_report_video(self, reporte_id):
        """Obtener video de un reporte"""
        extensiones_video = ['mp4', 'avi', 'mov', 'mkv', 'webm']
        return ReportArchivo.objects.filter(
            denu_id=reporte_id,
            dear_extension__in=extensiones_video
        ).first()
    
    def delete_report_files(self, reporte_id):
        """Eliminar todos los archivos de un reporte"""
        archivos = ReportArchivo.objects.filter(denu_id=reporte_id)
        
        for archivo in archivos:
            # Construir la ruta del archivo basada en los datos del registro
            fecha_str = datetime.now().strftime("%d-%m-%Y")
            
            # Determinar si es imagen o video
            extensiones_video = ['mp4', 'avi', 'mov', 'mkv', 'webm']
            if archivo.dear_extension in extensiones_video:
                tipo_carpeta = 'videos'
            else:
                tipo_carpeta = 'images'
            
            ruta_archivo = os.path.join(
                self.base_media_path, 
                'uploads', 
                fecha_str, 
                f'id_{reporte_id}', 
                tipo_carpeta, 
                archivo.dear_nombre
            )
            
            # Eliminar archivo físico si existe
            if os.path.exists(ruta_archivo):
                try:
                    os.remove(ruta_archivo)
                except OSError:
                    pass  # Continuar aunque no se pueda eliminar el archivo
        
        # Eliminar registros de la base de datos
        archivos.delete()
    
    def update_report_files(self, reporte, nuevas_imagenes=None, nuevo_video=None):
        """Actualizar archivos de un reporte existente"""
        
        # Validar límites antes de procesar
        imagenes_actuales = self.get_report_images(reporte.id).count()
        
        if nuevas_imagenes:
            total_imagenes = imagenes_actuales + len(nuevas_imagenes)
            if total_imagenes > 10:
                raise ValueError(f"El total de imágenes ({total_imagenes}) excede el límite de 10")
        
        # Agregar nuevas imágenes
        if nuevas_imagenes:
            # Obtener el próximo orden disponible
            ultimo_orden = ReportArchivo.objects.filter(
                denu_id=reporte.id
            ).aggregate(
                max_orden=Max('dear_orden')
            )['max_orden'] or -1
            
            self._save_images_with_order(reporte, nuevas_imagenes, ultimo_orden + 1)
        
        # Reemplazar video si se proporciona uno nuevo
        if nuevo_video:
            # Eliminar video anterior
            video_anterior = self.get_report_video(reporte.id)
            if video_anterior:
                fecha_str = datetime.now().strftime("%d-%m-%Y")
                ruta_archivo = os.path.join(
                    self.base_media_path, 
                    'uploads', 
                    fecha_str, 
                    f'id_{reporte.id}', 
                    'videos', 
                    video_anterior.dear_nombre
                )
                
                if os.path.exists(ruta_archivo):
                    try:
                        os.remove(ruta_archivo)
                    except OSError:
                        pass
                video_anterior.delete()
            
            # Guardar nuevo video
            self._save_video(reporte, nuevo_video)
    
    def set_image_as_principal(self, archivo_id):
        """Establecer una imagen como principal"""
        try:
            archivo = ReportArchivo.objects.get(dear_id=archivo_id)
            
            # Verificar que es una imagen
            extensiones_imagen = ['jpg', 'jpeg', 'png', 'webp']
            if archivo.dear_extension not in extensiones_imagen:
                raise ValueError("Solo las imágenes pueden ser principales")
            
            # Quitar principal de otras imágenes del mismo reporte
            ReportArchivo.objects.filter(
                denu_id=archivo.denu.id,
                dear_extension__in=extensiones_imagen
            ).update(dear_es_principal=False)
            
            # Establecer como principal
            archivo.dear_es_principal = True
            archivo.save()
            
            return True
        except ReportArchivo.DoesNotExist:
            return False


# Instancia global del servicio
report_service = ReportService()
