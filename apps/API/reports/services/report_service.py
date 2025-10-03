from typing import List, Optional, Dict
from django.db import transaction
from django.db.models import Count
from django.core.exceptions import ValidationError as DjangoValidationError
from datetime import datetime, timedelta

from reports.models import ReportModel, DenunciaEstado, TipoDenuncia, Ciudad
from reports.exceptions import ReportNotFoundException, ReportValidationException
from .validation_service import validation_service
from .notification_service import notification_service
from domain.entities.usuario import Usuario
from django.utils import timezone


class ReportService:
    """Servicio con toda la lógica de negocio de reportes"""
    
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


# Instancia del servicio
report_service = ReportService()
