import logging
from typing import Optional
from notifications.models import Notification
from domain.entities.usuario import Usuario

logger = logging.getLogger('notifications')


class NotificationService:
    """Servicio para gestionar notificaciones"""
    
    def create_notification(
        self,
        usuario: Usuario,
        titulo: str,
        mensaje: str,
        tipo: str = 'info',
        denuncia = None  # Can be ReportModel instance
    ) -> Notification:
        """
        Crea una notificación en la base de datos
        
        Args:
            usuario: Usuario que recibirá la notificación
            titulo: Título de la notificación
            mensaje: Mensaje detallado
            tipo: Tipo de notificación (info, success, warning, error)
            denuncia: Reporte relacionado (opcional)
        
        Returns:
            Notification: La notificación creada
        """
        try:
            notificacion = Notification.objects.create(
                usuario=usuario,
                titulo=titulo,
                mensaje=mensaje,
                tipo=tipo,
                denuncia=denuncia
            )
            logger.info(f"Notificación creada: {titulo} para usuario {usuario.username}")
            return notificacion
        except Exception as e:
            logger.error(f"Error al crear notificación: {str(e)}")
            raise


# Instancia del servicio
notification_service = NotificationService()
