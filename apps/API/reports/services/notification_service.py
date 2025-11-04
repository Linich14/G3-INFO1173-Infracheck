import logging
from typing import Dict, Optional, Union
from reports.models import ReportModel, Notification
from domain.entities.usuario import Usuario

logger = logging.getLogger('reports')


class NotificationService:
    """Servicio para notificaciones"""
    
    def get_usuario_by_rut_or_id(self, identifier: Union[str, int]) -> Optional[Usuario]:
        """
        Busca un usuario por RUT o ID
        
        Args:
            identifier: RUT (string) o ID (int) del usuario
            
        Returns:
            Usuario encontrado o None
        """
        try:
            # Intentar buscar por ID si es un número
            if isinstance(identifier, int):
                return Usuario.objects.filter(usua_id=identifier).first()
            
            # Si es string, intentar buscar por RUT
            if isinstance(identifier, str):
                # Intentar primero como ID numérico
                if identifier.isdigit():
                    usuario = Usuario.objects.filter(usua_id=int(identifier)).first()
                    if usuario:
                        return usuario
                
                # Buscar por RUT - limpiar completamente (quitar puntos, guiones y espacios)
                rut_limpio = identifier.replace('.', '').replace('-', '').replace(' ', '').lower()
                
                # Buscar todos los usuarios y comparar RUTs limpios
                for usuario in Usuario.objects.all():
                    rut_bd_limpio = usuario.usua_rut.replace('.', '').replace('-', '').replace(' ', '').lower()
                    if rut_bd_limpio == rut_limpio:
                        return usuario
                
                # Si no se encontró con comparación exacta, intentar con contains
                return Usuario.objects.filter(usua_rut__icontains=rut_limpio).first()
            
            return None
        except Exception as e:
            logger.error(f"Error buscando usuario por RUT/ID {identifier}: {str(e)}")
            return None
    
    def create_notification(
        self,
        usuario: Union[Usuario, str, int],
        titulo: str,
        mensaje: str,
        tipo: str = 'info',
        denuncia: Optional[ReportModel] = None
    ) -> Optional[Notification]:
        """
        Crea una notificación en la base de datos
        
        Args:
            usuario: Objeto Usuario, RUT (string) o ID (int) del usuario
            titulo: Título de la notificación
            mensaje: Mensaje detallado
            tipo: Tipo de notificación (info, success, warning, error)
            denuncia: Reporte relacionado (opcional)
        
        Returns:
            Notification: La notificación creada o None si falla
        """
        try:
            # Si no es un objeto Usuario, buscarlo
            if not isinstance(usuario, Usuario):
                usuario = self.get_usuario_by_rut_or_id(usuario)
                if not usuario:
                    logger.warning(f"No se encontró usuario para crear notificación: {titulo}")
                    return None
            
            notificacion = Notification.objects.create(
                usuario=usuario,
                titulo=titulo,
                mensaje=mensaje,
                tipo=tipo,
                denuncia=denuncia
            )
            logger.info(f"Notificación creada: {titulo} para usuario {usuario.usua_nickname}")
            return notificacion
        except Exception as e:
            logger.error(f"Error al crear notificación: {str(e)}")
            return None
    
    def notify_urgent_report(self, report: ReportModel):
        """Notifica cuando se crea un reporte urgente"""
        if report.urgencia == 3:
            self._send_urgent_alert(report)
            
            # Crear notificación para el usuario
            if report.usuario:
                self.create_notification(
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
            self.create_notification(
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
            self.create_notification(
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
            self.create_notification(
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
            self.create_notification(
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
