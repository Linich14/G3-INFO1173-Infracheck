import logging
from typing import Optional, List
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
        denuncia = None,  # Can be ReportModel instance
        comentario = None  # Can be ComentarioReporte instance
    ) -> Notification:
        """
        Crea una notificación en la base de datos
        
        Args:
            usuario: Usuario que recibirá la notificación
            titulo: Título de la notificación
            mensaje: Mensaje detallado
            tipo: Tipo de notificación (info, success, warning, error)
            denuncia: Reporte relacionado (opcional)
            comentario: Comentario relacionado (opcional)
        
        Returns:
            Notification: La notificación creada
        """
        try:
            notificacion = Notification.objects.create(
                usuario=usuario,
                titulo=titulo,
                mensaje=mensaje,
                tipo=tipo,
                denuncia=denuncia,
                comentario=comentario
            )
            logger.info(f"Notificación creada: {titulo} para usuario {usuario.usua_nickname}")
            return notificacion
        except Exception as e:
            logger.error(f"Error al crear notificación: {str(e)}")
            raise
    
    def notify_followers_new_comment(
        self,
        reporte,  # ReportModel instance
        comentario,  # ComentarioReporte instance
        autor_comentario: Usuario
    ) -> List[Notification]:
        """
        Notifica a todos los seguidores de un reporte y al autor del reporte cuando alguien comenta
        
        Args:
            reporte: ReportModel - El reporte que fue comentado
            comentario: ComentarioReporte - El comentario creado
            autor_comentario: Usuario - El usuario que hizo el comentario
        
        Returns:
            List[Notification]: Lista de notificaciones creadas
        """
        try:
            from reports.models.seguimiento_reporte import SeguimientoReporte
            
            logger.info(
                f"[INICIO] notify_followers_new_comment llamado. "
                f"Reporte ID: {reporte.id}, Autor reporte: {reporte.usuario.usua_nickname} (ID: {reporte.usuario.usua_id}), "
                f"Autor comentario: {autor_comentario.usua_nickname} (ID: {autor_comentario.usua_id})"
            )
            
            # Obtener todos los seguidores del reporte
            seguidores = SeguimientoReporte.objects.filter(
                reporte=reporte
            ).select_related('usuario')
            
            logger.info(
                f"Procesando notificaciones para reporte #{reporte.id}. "
                f"Seguidores encontrados: {seguidores.count()}"
            )
            
            notificaciones_creadas = []
            usuarios_notificados = set()  # Para evitar duplicados
            
            # Notificar a los seguidores
            for seguimiento in seguidores:
                # No notificar al autor del comentario
                if seguimiento.usuario.usua_id == autor_comentario.usua_id:
                    logger.info(
                        f"Omitiendo notificación para {seguimiento.usuario.usua_nickname} "
                        f"(es el autor del comentario)"
                    )
                    continue
                
                usuarios_notificados.add(seguimiento.usuario.usua_id)
                
                # Crear notificación
                titulo = f"Nuevo comentario en reporte que sigues"
                mensaje = f"{autor_comentario.usua_nickname} comentó en '{reporte.titulo}'"
                
                notificacion = self.create_notification(
                    usuario=seguimiento.usuario,
                    titulo=titulo,
                    mensaje=mensaje,
                    tipo='info',
                    denuncia=reporte,
                    comentario=comentario
                )
                
                notificaciones_creadas.append(notificacion)
                logger.info(
                    f"Notificación enviada a seguidor {seguimiento.usuario.usua_nickname} "
                    f"(ID: {seguimiento.usuario.usua_id})"
                )
            
            # Notificar también al autor del reporte (si no es el mismo que comentó y no está ya notificado)
            logger.info(
                f"[VERIFICANDO AUTOR] Autor del reporte ID: {reporte.usuario.usua_id}, "
                f"Autor comentario ID: {autor_comentario.usua_id}, "
                f"Ya notificado: {reporte.usuario.usua_id in usuarios_notificados}"
            )
            
            if (reporte.usuario.usua_id != autor_comentario.usua_id and 
                reporte.usuario.usua_id not in usuarios_notificados):
                
                titulo = f"Nuevo comentario en tu reporte"
                mensaje = f"{autor_comentario.usua_nickname} comentó en tu reporte '{reporte.titulo}'"
                
                notificacion = self.create_notification(
                    usuario=reporte.usuario,
                    titulo=titulo,
                    mensaje=mensaje,
                    tipo='info',
                    denuncia=reporte,
                    comentario=comentario
                )
                
                notificaciones_creadas.append(notificacion)
                logger.info(
                    f"Notificación enviada al autor del reporte {reporte.usuario.usua_nickname} "
                    f"(ID: {reporte.usuario.usua_id})"
                )
            else:
                logger.info(
                    f"[NO SE NOTIFICA AL AUTOR] Razón: "
                    f"{'Es el mismo usuario que comentó' if reporte.usuario.usua_id == autor_comentario.usua_id else 'Ya fue notificado como seguidor'}"
                )
            
            logger.info(
                f"Total: Se enviaron {len(notificaciones_creadas)} notificaciones "
                f"por comentario en reporte #{reporte.id}"
            )
            
            return notificaciones_creadas
            
        except Exception as e:
            logger.error(f"Error al notificar seguidores: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            # No propagar el error para no afectar la creación del comentario
            return []


# Instancia del servicio
notification_service = NotificationService()

