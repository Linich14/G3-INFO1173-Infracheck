from rest_framework import serializers
from django.contrib.auth.hashers import check_password

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        # Obtener usuario del contexto
        request = self.context.get('request')
        usuario = getattr(request, 'auth_user', None)

        if not usuario:
            raise serializers.ValidationError("Usuario no autenticado.")

        # Verificar contraseña actual
        if not check_password(current_password, usuario.usua_pass):
            raise serializers.ValidationError("La contraseña actual es incorrecta.")

        # Verificar que la nueva contraseña sea diferente
        if check_password(new_password, usuario.usua_pass):
            raise serializers.ValidationError("La nueva contraseña debe ser diferente a la actual.")

        # Verificar confirmación
        if new_password != confirm_password:
            raise serializers.ValidationError("La confirmación de contraseña no coincide.")

        # Validaciones adicionales de seguridad
        if len(new_password) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")

        return data