from rest_framework import serializers
from domain.entities.usuario import Usuario
from domain.entities.rol_usuario import RolUsuario


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para el perfil completo del usuario autenticado.
    Incluye todos los datos del usuario excepto la contraseña.
    """
    full_name = serializers.SerializerMethodField()
    role_name = serializers.CharField(source='rous_id.rous_nombre', read_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'usua_id',
            'usua_rut', 
            'usua_nombre',
            'usua_apellido',
            'full_name',
            'usua_nickname',
            'usua_email',
            'usua_telefono',
            'usua_creado',
            'usua_actualizado',
            'usua_estado',
            'rous_id',
            'role_name'
        ]
        read_only_fields = [
            'usua_id',
            'usua_creado',
            'usua_actualizado',
            'rous_id',
            'role_name'
        ]
    
    def get_full_name(self, obj):
        """Combina nombre y apellido para obtener el nombre completo"""
        if obj.usua_nombre and obj.usua_apellido:
            return f"{obj.usua_nombre} {obj.usua_apellido}"
        elif obj.usua_nombre:
            return obj.usua_nombre
        elif obj.usua_apellido:
            return obj.usua_apellido
        return obj.usua_nickname  # Fallback al nickname si no hay nombre/apellido


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar el perfil del usuario.
    Solo permite actualizar campos específicos.
    """
    
    class Meta:
        model = Usuario
        fields = [
            'usua_nombre',
            'usua_apellido', 
            'usua_nickname',
            'usua_email',
            'usua_telefono'
        ]
    
    def validate_usua_nickname(self, value):
        """Validar que el nickname sea único (excluyendo el usuario actual)"""
        user = self.instance
        if Usuario.objects.filter(usua_nickname=value).exclude(usua_id=user.usua_id).exists():
            raise serializers.ValidationError("Este nickname ya está en uso.")
        return value
    
    def validate_usua_email(self, value):
        """Validar que el email sea único (excluyendo el usuario actual)"""
        user = self.instance
        if Usuario.objects.filter(usua_email=value).exclude(usua_id=user.usua_id).exists():
            raise serializers.ValidationError("Este email ya está en uso.")
        return value