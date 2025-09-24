from rest_framework import serializers
from domain.entities.usuario import Usuario
from domain.entities.sesion_token import SesionToken

class UserLoginSerializer(serializers.Serializer):
    rut = serializers.CharField(max_length=12)
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        rut = data.get('rut')
        password = data.get('password')
        
        try:
            usuario = Usuario.objects.get(usua_rut=rut, usua_estado=1)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError("Usuario no encontrado o deshabilitado.")
        
        if not usuario.check_password(password):
            raise serializers.ValidationError("Contraseña incorrecta.")
        
        # Eliminar todos los tokens anteriores del usuario
        SesionToken.objects.filter(usua_id=usuario).delete()
        
        # Generar nuevo token
        token = SesionToken.generate_token(usuario, hours=24)
        
        data['usuario'] = usuario
        data['token'] = token.token_valor
        data['expires_at'] = token.token_expira_en
        
        return data