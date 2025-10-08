import logging
from typing import Dict
from reports.models import ReportModel

logger = logging.getLogger('reports')


class NotificationService:
    """Servicio para notificaciones"""
    
    def notify_urgent_report(self, report: ReportModel):
        """Notifica cuando se crea un reporte urgente"""
        if report.urgencia == 3:
            self._send_urgent_alert(report)
    
    def notify_report_created(self, report: ReportModel):
        """Notifica cuando se crea un reporte"""
        self._log_report_action("CREATED", report)
    
    def notify_report_updated(self, report: ReportModel):
        """Notifica cuando se actualiza un reporte"""
        self._log_report_action("UPDATED", report)
    
    def notify_report_deleted(self, report: ReportModel):
        """Notifica cuando se elimina un reporte"""
        self._log_report_action("DELETED", report)
    
    def _send_urgent_alert(self, report: ReportModel):
        """Envía alerta de reporte urgente"""
        # Aquí puedes implementar:
        # - Envío de emails
        # - Notificaciones push
        # - Mensajes a Slack/Teams
        # - etc.
        
        message = f"🚨 ALERTA: Reporte urgente #{report.id} - {report.titulo}"
        print(message)  # Por ahora solo imprimir
        logger.warning(f"Reporte urgente creado: {report.id}")
    
    def _log_report_action(self, action: str, report: ReportModel):
        """Registra acciones para auditoría"""
        try:
            usuario_id = report.usuario.usua_id if report.usuario else "N/A"
            logger.info(f"{action}: Report #{report.id} by user {usuario_id}")
        except Exception as e:
            logger.error(f"Error logging action {action}: {e}")
    
    def send_status_change_notification(self, report: ReportModel, old_status: str, new_status: str):
        """Notifica cambios de estado"""
        message = f"Reporte #{report.id} cambió de estado: {old_status} → {new_status}"
        logger.info(message)


# Instancia del servicio
notification_service = NotificationService()
