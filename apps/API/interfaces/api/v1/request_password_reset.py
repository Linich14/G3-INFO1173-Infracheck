from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from interfaces.api.serializers.password_reset import RequestPasswordResetSerializer
from domain.entities.recuperar_usuario import RecuperarUsuario
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def request_password_reset_view(request):
    """
    Endpoint para solicitar reset de contraseña usando RUT o email.
    
    Body (JSON):
    {
        "identifier": "12.345.678-9"  // RUT o email del usuario
    }
    
    Respuesta exitosa (200):
    {
        "message": "Código enviado al correo asociado",
        "success": true
    }
    
    Respuesta de error (400):
    {
        "message": "Usuario no encontrado",
        "success": false,
        "errors": ["string"]
    }
    """
    try:
        if request.method != 'POST':
            return Response(
                {
                    'message': 'Método no permitido. Use POST.',
                    'success': False,
                    'errors': ['Método no permitido']
                }, 
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )
        
        serializer = RequestPasswordResetSerializer(data=request.data)
        
        if serializer.is_valid():
            validated_data = serializer.validated_data
            usuario = validated_data['usuario']
            identifier = validated_data['identifier']
            
            # Generar código de reset
            reset_record = RecuperarUsuario.generate_reset_code(usuario, minutes=10)
            
            # Intentar enviar email
            try:
                subject = 'Código de Recuperación de Contraseña - InfraCheck'
                message = f"""
Hola {usuario.usua_nombre or usuario.usua_nickname},

Has solicitado restablecer tu contraseña. Tu código de verificación es:

{reset_record.reus_token}

Este código expira en 10 minutos.

Si no solicitaste este cambio, puedes ignorar este mensaje.

Saludos,
Equipo InfraCheck
                """.strip()
                
                from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@infracheck.com')
                recipient_list = [usuario.usua_email]
                
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=from_email,
                    recipient_list=recipient_list,
                    fail_silently=False
                )
                
                logger.info(f"Código de reset enviado exitosamente para usuario: {usuario.usua_rut} (email: {usuario.usua_email})")
                
                return Response(
                    {
                        'message': 'Código enviado al correo asociado',
                        'success': True
                    }, 
                    status=status.HTTP_200_OK
                )
            
            except Exception as email_error:
                logger.error(f"Error enviando email para reset de contraseña: {str(email_error)}")
                
                # Eliminar el código generado si no se pudo enviar el email
                reset_record.delete()
                
                return Response(
                    {
                        'message': 'Error enviando código. Intente nuevamente.',
                        'success': False,
                        'errors': ['Error en el servicio de correo']
                    }, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        else:
            logger.warning(f"Solicitud de reset inválida: {serializer.errors}")
            
            # Por seguridad, siempre retornar el mismo mensaje
            return Response(
                {
                    'message': 'Si el usuario existe, se enviará un código a su email.',
                    'success': False,
                    'errors': [str(error) for errors in serializer.errors.values() for error in errors]
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except Exception as e:
        logger.error(f"Error inesperado en request password reset: {str(e)}")
        return Response(
            {
                'message': 'Error interno del servidor. Intente nuevamente.',
                'success': False,
                'errors': ['Error interno del servidor']
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )