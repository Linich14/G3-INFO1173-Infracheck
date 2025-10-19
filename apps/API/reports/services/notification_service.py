import logging
from typing import Dict, Optional
from reports.models import ReportModel
from domain.entities.usuario import Usuario
from notifications.services import notification_service as notif_service

logger = logging.getLogger('reports')


class NotificationService:
    """Servicio para notificaciones de reportes - Wrapper del servicio de notificaciones"""
    
    def notify_urgent_report(self, report: ReportModel):
        """Notifica cuando se crea un reporte urgente"""
        if report.urgencia == 3:
            self._send_urgent_alert(report)
            
            # Crear notificación para el usuario
            if report.usuario:
                notif_service.create_notification(
                    usuario=report.usuario,
                    titulo="Reporte Urgente Creado",
                    mensaje=f"Tu reporte '{report.titulo}' ha sido marcado como urgente y será atendido prioritariamente.",
                    tipo='warning',
                    denuncia=report
                )
    
    def notify_report_created(self, report: ReportModel):
        """Notifica cuando se crea un reporte"""
        self._log_report_action("CREATED", report)
        
        # Crear notificación para el usuario
        if report.usuario:
            notif_service.create_notification(
                usuario=report.usuario,
                titulo="Reporte Creado Exitosamente",
                mensaje=f"Tu reporte '{report.titulo}' ha sido creado y está siendo procesado.",
                tipo='success',
                denuncia=report
            )
    
    def notify_report_updated(self, report: ReportModel):
        """Notifica cuando se actualiza un reporte"""
        self._log_report_action("UPDATED", report)
        
        # Crear notificación para el usuario
        if report.usuario:
            notif_service.create_notification(
                usuario=report.usuario,
                titulo="Reporte Actualizado",
                mensaje=f"Tu reporte '{report.titulo}' ha sido actualizado.",
                tipo='info',
                denuncia=report
            )
    
    def notify_report_deleted(self, report: ReportModel):
        """Notifica cuando se elimina un reporte"""
        self._log_report_action("DELETED", report)
        
        # Crear notificación para el usuario (antes de eliminar)
        if report.usuario:
            notif_service.create_notification(
                usuario=report.usuario,
                titulo="Reporte Eliminado",
                mensaje=f"Tu reporte '{report.titulo}' ha sido eliminado del sistema.",
                tipo='info',
                denuncia=None  # No asociar ya que será eliminado
            )
    
    def send_status_change_notification(self, report: ReportModel, old_status: str, new_status: str):
        """Notifica cambios de estado"""
        message = f"Reporte #{report.id} cambió de estado: {old_status} → {new_status}"
        logger.info(message)
        
        # Crear notificación para el usuario
        if report.usuario:
            tipo_notif = 'success' if new_status == 'resuelto' else 'info'
            notif_service.create_notification(
                usuario=report.usuario,
                titulo="Cambio de Estado",
                mensaje=f"El estado de tu reporte '{report.titulo}' cambió de {old_status} a {new_status}.",
                tipo=tipo_notif,
                denuncia=report
            )
    
    def _send_urgent_alert(self, report: ReportModel):
        """Envía alerta de reporte urgente"""
        message = f"ALERTA: Reporte urgente #{report.id} - {report.titulo}"
        print(message)
        logger.warning(f"Reporte urgente creado: {report.id}")
    
    def _log_report_action(self, action: str, report: ReportModel):
        """Registra acciones para auditoría"""
        try:
            usuario_id = report.usuario.usua_id if report.usuario else "N/A"
            logger.info(f"{action}: Report #{report.id} by user {usuario_id}")
        except Exception as e:
            logger.error(f"Error logging action {action}: {e}")


# Instancia del servicio
notification_service = NotificationService()
