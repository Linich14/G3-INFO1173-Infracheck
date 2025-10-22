from typing import List, Optional, Dict, Any
from django.db import transaction
from django.db.models import Count, Q, Avg, Sum
from django.core.exceptions import ValidationError as DjangoValidationError
from datetime import datetime, timedelta
from collections import defaultdict

from proyectos.models import ProyectoModel, ProyectoArchivosModel
from reports.models import ReportModel


class ProyectoNotFoundException(Exception):
    """Excepción cuando no se encuentra un proyecto"""
    def __init__(self, proyecto_id: int):
        self.message = f"Proyecto con ID {proyecto_id} no encontrado"
        super().__init__(self.message)


class ProyectoValidationException(Exception):
    """Excepción para errores de validación de proyectos"""
    def __init__(self, errors: Dict):
        self.errors = errors
        self.message = "Errores de validación"
        super().__init__(self.message)


class ProyectoService:
    """Servicio para gestión completa de proyectos municipales"""
    
    # ==================== MÉTODOS CRUD ====================
    
    @transaction.atomic
    def create_proyecto(
        self,
        proy_titulo: str,
        proy_descripcion: str,
        denu_id: int,
        proy_estado: int = 1,
        proy_lugar: str = '',
        proy_prioridad: int = 1,
        proy_fecha_inicio_estimada = None,
        proy_tipo_denuncia: str = '',
        archivos: List[Dict] = None
    ) -> ProyectoModel:
        """Crea un nuevo proyecto vinculado a una denuncia"""
        
        # Validar que la denuncia existe
        try:
            denuncia = ReportModel.objects.get(id=denu_id)
        except ReportModel.DoesNotExist:
            raise ProyectoValidationException({"denu_id": "La denuncia no existe"})
        
        # Limpiar datos
        proy_titulo = proy_titulo.strip()
        proy_descripcion = proy_descripcion.strip()
        proy_lugar = proy_lugar.strip() if proy_lugar else denuncia.ubicacion
        proy_tipo_denuncia = proy_tipo_denuncia.strip() if proy_tipo_denuncia else denuncia.tipo_denuncia.nombre
        
        # Crear proyecto
        proyecto = ProyectoModel(
            proy_titulo=proy_titulo,
            proy_descripcion=proy_descripcion,
            proy_estado=proy_estado,
            proy_visible=1,
            denu_id=denuncia,
            proy_lugar=proy_lugar,
            proy_prioridad=proy_prioridad,
            proy_fecha_inicio_estimada=proy_fecha_inicio_estimada,
            proy_tipo_denuncia=proy_tipo_denuncia
        )
        
        # Validar modelo
        try:
            proyecto.full_clean()
        except DjangoValidationError as e:
            raise ProyectoValidationException(e.message_dict)
        
        # Guardar
        proyecto.save()
        
        # Crear archivos si se proporcionan
        if archivos:
            self._create_archivos(proyecto, archivos)
        
        return proyecto
    
    def _create_archivos(self, proyecto: ProyectoModel, archivos: List[Dict]):
        """Crea archivos asociados al proyecto"""
        for archivo_data in archivos:
            archivo = ProyectoArchivosModel(
                proy_id=proyecto,
                **archivo_data
            )
            try:
                archivo.full_clean()
                archivo.save()
            except DjangoValidationError as e:
                # Log del error pero continuar con los demás archivos
                print(f"Error al crear archivo: {e}")
    
    def get_proyecto_by_id(self, proyecto_id: int) -> Optional[ProyectoModel]:
        """Obtiene un proyecto por ID con relaciones precargadas"""
        try:
            return ProyectoModel.objects.select_related('denu_id').prefetch_related('archivos').get(proy_id=proyecto_id)
        except ProyectoModel.DoesNotExist:
            return None
    
    def get_proyectos_by_denuncia(self, denu_id: int) -> List[ProyectoModel]:
        """Obtiene proyectos vinculados a una denuncia específica"""
        return list(
            ProyectoModel.objects
            .select_related('denu_id')
            .prefetch_related('archivos')
            .filter(denu_id=denu_id, proy_visible=1)
        )
    
    def get_all_proyectos(
        self,
        estado: Optional[int] = None,
        prioridad: Optional[int] = None,
        categoria: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[ProyectoModel]:
        """
        Obtiene todos los proyectos con filtros opcionales
        
        Args:
            estado: Filtro por estado del proyecto (1-7)
                1 = Planificación
                2 = En Progreso
                3 = Completado
                4 = Cancelado
                5 = Pendiente
                6 = Aprobado
                7 = Rechazado
            
            prioridad: Filtro por nivel de urgencia/prioridad (1-3)
                1 = Normal
                2 = Importante
                3 = Muy Importante (Urgente)
            
            categoria: Filtro por tipo/categoría de denuncia (texto)
                Ejemplos: "Bache o pavimento dañado", "Alumbrado público deficiente", etc.
            
            search: Búsqueda de texto en título, descripción y lugar
        
        Returns:
            Lista de proyectos que coincidan con los filtros
        """
        queryset = ProyectoModel.objects.select_related('denu_id').prefetch_related('archivos').filter(proy_visible=1)
        
        # Aplicar filtros
        if estado is not None:
            queryset = queryset.filter(proy_estado=estado)
        
        if prioridad is not None:
            queryset = queryset.filter(proy_prioridad=prioridad)
        
        if categoria:
            queryset = queryset.filter(proy_tipo_denuncia__icontains=categoria)
        
        if search:
            queryset = queryset.filter(
                Q(proy_titulo__icontains=search) |
                Q(proy_descripcion__icontains=search) |
                Q(proy_lugar__icontains=search)
            )
        
        return list(queryset)
    
    @transaction.atomic
    def update_proyecto(self, proyecto_id: int, **kwargs) -> ProyectoModel:
        """Actualiza un proyecto existente"""
        proyecto = self.get_proyecto_by_id(proyecto_id)
        if not proyecto:
            raise ProyectoNotFoundException(proyecto_id)
        
        # Actualizar campos permitidos
        allowed_fields = [
            'proy_titulo', 'proy_descripcion', 'proy_estado',
            'proy_lugar', 'proy_prioridad', 'proy_fecha_inicio_estimada',
            'proy_tipo_denuncia', 'proy_visible'
        ]
        
        changed = False
        for field, value in kwargs.items():
            if field in allowed_fields and hasattr(proyecto, field):
                current_value = getattr(proyecto, field)
                if isinstance(value, str):
                    value = value.strip()
                if current_value != value:
                    setattr(proyecto, field, value)
                    changed = True
        
        if changed:
            try:
                proyecto.full_clean()
                proyecto.save()
            except DjangoValidationError as e:
                raise ProyectoValidationException(e.message_dict)
        
        return proyecto
    
    @transaction.atomic
    def delete_proyecto(self, proyecto_id: int, hard_delete: bool = False) -> Dict:
        """Elimina un proyecto (soft delete por defecto)"""
        proyecto = self.get_proyecto_by_id(proyecto_id)
        if not proyecto:
            raise ProyectoNotFoundException(proyecto_id)
        
        if hard_delete:
            proyecto.delete()
            message = "Proyecto eliminado permanentemente"
        else:
            proyecto.proy_visible = 0
            proyecto.save()
            message = "Proyecto ocultado exitosamente"
        
        return {
            "message": message,
            "proy_id": proyecto_id,
            "deleted_at": datetime.now().isoformat()
        }
    
    # ==================== MÉTODOS DE CONSULTA ====================
    
    def get_proyectos_by_estado(self, estado: int) -> List[ProyectoModel]:
        """Obtiene proyectos por estado"""
        return list(
            ProyectoModel.objects
            .select_related('denu_id')
            .filter(proy_estado=estado, proy_visible=1)
        )
    
    def get_proyectos_by_prioridad(self, prioridad: int) -> List[ProyectoModel]:
        """Obtiene proyectos por prioridad"""
        return list(
            ProyectoModel.objects
            .select_related('denu_id')
            .filter(proy_prioridad=prioridad, proy_visible=1)
        )
    
    def get_proyectos_urgentes(self) -> List[ProyectoModel]:
        """Obtiene proyectos con prioridad alta (Muy Importante)"""
        return self.get_proyectos_by_prioridad(3)
    
    def get_proyectos_activos(self) -> List[ProyectoModel]:
        """Obtiene proyectos en progreso o pendientes"""
        return list(
            ProyectoModel.objects
            .select_related('denu_id')
            .filter(proy_estado__in=[2, 5], proy_visible=1)
        )
    
    def get_proyectos_completados(self) -> List[ProyectoModel]:
        """Obtiene proyectos completados"""
        return self.get_proyectos_by_estado(3)
    
    def get_recent_proyectos(self, days: int = 30) -> List[ProyectoModel]:
        """Obtiene proyectos recientes"""
        from django.utils import timezone
        cutoff = timezone.now() - timedelta(days=days)
        return list(
            ProyectoModel.objects
            .select_related('denu_id')
            .filter(proy_creado__gte=cutoff, proy_visible=1)
        )
    
    # ==================== REPORTES ASOCIADOS ====================
    
    def get_reportes_asociados(self, proyecto_id: int) -> List[ReportModel]:
        """Obtiene los reportes/denuncias asociadas a un proyecto"""
        proyecto = self.get_proyecto_by_id(proyecto_id)
        if not proyecto:
            raise ProyectoNotFoundException(proyecto_id)
        
        # Por ahora solo retorna la denuncia principal
        # Puedes extender esto para incluir múltiples reportes si implementas una tabla de relación
        return [proyecto.denu_id] if proyecto.denu_id else []
    
    def add_reporte_problema(
        self,
        proyecto_id: int,
        descripcion: str,
        usuario_id: int
    ) -> Dict:
        """Añade un reporte de problema a un proyecto"""
        proyecto = self.get_proyecto_by_id(proyecto_id)
        if not proyecto:
            raise ProyectoNotFoundException(proyecto_id)
        
        # Aquí podrías crear un nuevo ReportModel vinculado al proyecto
        # Por ahora solo retornamos un placeholder
        return {
            "message": "Reporte de problema registrado",
            "proyecto_id": proyecto_id,
            "descripcion": descripcion,
            "fecha": datetime.now().isoformat()
        }
    
    # ==================== ESTADÍSTICAS ====================
    
    def get_statistics(self) -> Dict:
        """Estadísticas generales de proyectos"""
        total = ProyectoModel.objects.count()
        visible = ProyectoModel.objects.filter(proy_visible=1).count()
        
        # Por estado
        estado_counts = dict(
            ProyectoModel.objects
            .filter(proy_visible=1)
            .values('proy_estado')
            .annotate(count=Count('proy_id'))
            .values_list('proy_estado', 'count')
        )
        
        # Por prioridad
        prioridad_counts = dict(
            ProyectoModel.objects
            .filter(proy_visible=1)
            .values('proy_prioridad')
            .annotate(count=Count('proy_id'))
            .values_list('proy_prioridad', 'count')
        )
        
        return {
            "total": total,
            "visible": visible,
            "hidden": total - visible,
            "by_estado": {
                "planificacion": estado_counts.get(1, 0),
                "en_progreso": estado_counts.get(2, 0),
                "completado": estado_counts.get(3, 0),
                "cancelado": estado_counts.get(4, 0),
                "pendiente": estado_counts.get(5, 0),
                "aprobado": estado_counts.get(6, 0),
                "rechazado": estado_counts.get(7, 0),
            },
            "by_prioridad": {
                "normal": prioridad_counts.get(1, 0),
                "importante": prioridad_counts.get(2, 0),
                "muy_importante": prioridad_counts.get(3, 0),
            },
            "recent_30days": len(self.get_recent_proyectos(30)),
            "recent_7days": len(self.get_recent_proyectos(7)),
            "activos": len(self.get_proyectos_activos()),
            "completados": len(self.get_proyectos_completados()),
        }
    
    def get_proyecto_statistics(self, proyecto_id: int) -> Dict:
        """Estadísticas específicas de un proyecto"""
        proyecto = self.get_proyecto_by_id(proyecto_id)
        if not proyecto:
            raise ProyectoNotFoundException(proyecto_id)
        
        # Obtener reportes asociados
        reportes = self.get_reportes_asociados(proyecto_id)
        
        # Calcular estadísticas
        total_reportes = len(reportes)
        total_archivos = proyecto.get_total_archivos()
        dias_activo = proyecto.get_days_since_creation()
        
        # Distribución por tipo de denuncia (placeholder)
        tipo_problemas = defaultdict(int)
        for reporte in reportes:
            tipo = reporte.tipo_denuncia.nombre if reporte.tipo_denuncia else 'Desconocido'
            tipo_problemas[tipo] += 1
        
        # Evolución temporal (placeholder - últimos 6 meses)
        evolucion_temporal = self._get_evolucion_temporal_reportes(reportes)
        
        return {
            "proyecto_id": proyecto_id,
            "titulo": proyecto.proy_titulo,
            "lugar": proyecto.proy_lugar,
            "estado": proyecto.get_estado_display_custom(),
            "prioridad": proyecto.get_prioridad_display(),
            "dias_activo": dias_activo,
            "total_reportes": total_reportes,
            "total_archivos": total_archivos,
            "distribucion_tipos": dict(tipo_problemas),
            "evolucion_temporal": evolucion_temporal,
            "fecha_creacion": proyecto.proy_creado.isoformat(),
            "ultima_actualizacion": proyecto.proy_actualizado.isoformat() if proyecto.proy_actualizado else None,
        }
    
    def _get_evolucion_temporal_reportes(self, reportes: List[ReportModel]) -> List[Dict]:
        """Calcula la evolución temporal de reportes (últimos 6 meses)"""
        from django.utils import timezone
        from dateutil.relativedelta import relativedelta
        
        now = timezone.now()
        evolution = []
        
        for i in range(6):
            month_start = now - relativedelta(months=i)
            month_name = month_start.strftime('%b')
            
            # Contar reportes del mes (placeholder)
            count = len([r for r in reportes if r.fecha_creacion.month == month_start.month])
            
            evolution.insert(0, {
                "mes": month_name,
                "cantidad": count
            })
        
        return evolution
    
    # ==================== ARCHIVOS ====================
    
    @transaction.atomic
    def add_archivo(self, proyecto_id: int, archivo_data: Dict) -> ProyectoArchivosModel:
        """Añade un archivo a un proyecto"""
        proyecto = self.get_proyecto_by_id(proyecto_id)
        if not proyecto:
            raise ProyectoNotFoundException(proyecto_id)
        
        archivo = ProyectoArchivosModel(
            proy_id=proyecto,
            **archivo_data
        )
        
        try:
            archivo.full_clean()
            archivo.save()
        except DjangoValidationError as e:
            raise ProyectoValidationException(e.message_dict)
        
        return archivo
    
    def get_archivos_proyecto(self, proyecto_id: int) -> List[ProyectoArchivosModel]:
        """Obtiene todos los archivos de un proyecto"""
        return list(
            ProyectoArchivosModel.objects
            .filter(proy_id=proyecto_id, proar_visible=1)
        )
    
    @transaction.atomic
    def delete_archivo(self, archivo_id: int) -> Dict:
        """Elimina un archivo (soft delete)"""
        try:
            archivo = ProyectoArchivosModel.objects.get(proar_id=archivo_id)
            archivo.proar_visible = 0
            archivo.save()
            return {
                "message": "Archivo eliminado exitosamente",
                "archivo_id": archivo_id
            }
        except ProyectoArchivosModel.DoesNotExist:
            raise ProyectoValidationException({"archivo_id": "Archivo no encontrado"})


# Instancia del servicio
proyecto_service = ProyectoService()
