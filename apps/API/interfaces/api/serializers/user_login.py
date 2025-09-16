from rest_framework import serializers
from domain.entities.usuario import Usuario
from domain.entities.sesion_token import SesionToken

class UserLoginSerializer(serializers.Serializer):
    usua_nickname = serializers.CharField(max_length=50)
    usua_pass = serializers.CharField(write_only=True)
    
    def validate(self, data):
        nickname = data.get('usua_nickname')
        password = data.get('usua_pass')
        
        try:
            usuario = Usuario.objects.get(usua_nickname=nickname, usua_estado=1)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError("Usuario no encontrado o deshabilitado.")
        
        if not usuario.check_password(password):
            raise serializers.ValidationError("Contraseña incorrecta.")
        
        # Desactivar tokens anteriores del usuario
        SesionToken.objects.filter(usua_id=usuario, token_activo=True).update(token_activo=False)
        
        # Generar nuevo token
        token = SesionToken.generate_token(usuario)
        
        data['usuario'] = usuario
        data['token'] = token.token_valor
        data['token_expira_en'] = token.token_expira_en
        
        return data