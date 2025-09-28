from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status  
from interfaces.api.serializers.password_reset import ResetPasswordSerializer, TemporaryResetToken
from domain.entities.recuperar_usuario import RecuperarUsuario
from domain.entities.sesion_token import SesionToken
from django.contrib.auth.hashers import make_password
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def reset_password_view(request):
    """
    Endpoint para actualizar contraseña usando token temporal.
    
    Body (JSON):
    {
        "reset_token": "temp_token_here",    // Token temporal del paso anterior
        "new_password": "nueva_contraseña",   // Nueva contraseña
        "confirm_password": "nueva_contraseña" // Confirmación de contraseña
    }
    
    Respuesta exitosa (200):
    {
        "message": "Contraseña actualizada exitosamente",
        "success": true
    }
    
    Respuesta de error (400/401):
    {
        "message": "Token inválido",
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
        
        serializer = ResetPasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            validated_data = serializer.validated_data
            reset_token = validated_data['reset_token']
            new_password = validated_data['new_password']
            
            # Buscar el registro de reset activo que coincida con el token
            try:
                # Obtener todos los registros de reset activos
                active_resets = RecuperarUsuario.objects.filter(
                    reus_usado=False,
                    reus_expira_en__gt=timezone.now()
                )
                
                matching_reset = None
                for reset_record in active_resets:
                    if TemporaryResetToken.validate_token(reset_token, reset_record):
                        matching_reset = reset_record
                        break
                
                if not matching_reset:
                    logger.warning(f"Intento de reset con token inválido: {reset_token[:10]}...")
                    return Response(
                        {
                            'message': 'Token inválido o expirado',
                            'success': False,
                            'errors': ['Token inválido']
                        }, 
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                # Verificar que el registro sigue siendo válido
                if not matching_reset.is_valid():
                    matching_reset.delete()
                    return Response(
                        {
                            'message': 'Token expirado',
                            'success': False,
                            'errors': ['Token expirado']
                        }, 
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                usuario = matching_reset.usua_id
                
                # Actualizar la contraseña del usuario
                usuario.usua_pass = make_password(new_password)
                usuario.save()
                
                # Marcar el código de reset como usado
                matching_reset.marcar_como_usado()
                
                # Invalidar todas las sesiones activas del usuario
                SesionToken.objects.filter(usua_id=usuario).delete()
                
                # Limpiar todos los códigos de reset del usuario
                RecuperarUsuario.objects.filter(usua_id=usuario).delete()
                
                logger.info(f"Contraseña actualizada exitosamente para usuario: {usuario.usua_rut}")
                
                return Response(
                    {
                        'message': 'Contraseña actualizada exitosamente',
                        'success': True
                    }, 
                    status=status.HTTP_200_OK
                )
            
            except Exception as token_error:
                logger.error(f"Error validando token de reset: {str(token_error)}")
                return Response(
                    {
                        'message': 'Token inválido',
                        'success': False,
                        'errors': ['Token inválido']
                    }, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        else:
            logger.warning(f"Datos inválidos para reset de contraseña: {serializer.errors}")
            
            return Response(
                {
                    'message': 'Datos inválidos',
                    'success': False,
                    'errors': [str(error) for errors in serializer.errors.values() for error in errors]
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except Exception as e:
        logger.error(f"Error inesperado en reset password: {str(e)}")
        return Response(
            {
                'message': 'Error interno del servidor. Intente nuevamente.',
                'success': False,
                'errors': ['Error interno del servidor']
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )