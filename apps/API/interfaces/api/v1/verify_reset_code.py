from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from interfaces.api.serializers.password_reset import VerifyResetCodeSerializer, TemporaryResetToken
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def verify_reset_code_view(request):
    """
    Endpoint para verificar código de reset de 6 dígitos.
    
    Body (JSON):
    {
        "identifier": "12.345.678-9",  // RUT o email del usuario
        "code": "123456"               // Código de 6 dígitos
    }
    
    Respuesta exitosa (200):
    {
        "message": "Código válido",
        "success": true,
        "reset_token": "temp_token_here"
    }
    
    Respuesta de error (400/401):
    {
        "message": "Código inválido o expirado",
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
        
        serializer = VerifyResetCodeSerializer(data=request.data)
        
        if serializer.is_valid():
            validated_data = serializer.validated_data
            usuario = validated_data['usuario']
            reset_record = validated_data['reset_record']
            code = validated_data['code']
            
            # Generar token temporal para el siguiente paso
            reset_token = TemporaryResetToken.generate_token(reset_record)
            
            logger.info(f"Código de reset verificado exitosamente para usuario: {usuario.usua_rut}")
            
            return Response(
                {
                    'message': 'Código válido',
                    'success': True,
                    'reset_token': reset_token
                }, 
                status=status.HTTP_200_OK
            )
        
        else:
            logger.warning(f"Intento de verificación con código inválido: {serializer.errors}")
            
            return Response(
                {
                    'message': 'Código inválido o expirado',
                    'success': False,
                    'errors': [str(error) for errors in serializer.errors.values() for error in errors]
                }, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    except Exception as e:
        logger.error(f"Error inesperado en verify reset code: {str(e)}")
        return Response(
            {
                'message': 'Error interno del servidor. Intente nuevamente.',
                'success': False,
                'errors': ['Error interno del servidor']
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )