from rest_framework import serializers
from domain.entities.usuario import Usuario

class AdminUserSerializer(serializers.ModelSerializer):
    """
    Serializer para usuarios en panel admin.
    Incluye campos básicos y estado, excluye contraseña.
    """
    rous_nombre = serializers.CharField(source='rous_id.rous_nombre', read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'usua_id', 'usua_rut', 'usua_nombre', 'usua_apellido',
            'usua_nickname', 'usua_email', 'usua_creado', 'usua_actualizado',
            'usua_telefono', 'usua_estado', 'rous_nombre'
        ]
        read_only_fields = ['usua_id', 'usua_creado', 'usua_actualizado']

class AdminUserUpdateSerializer(serializers.Serializer):
    """
    Serializer para actualizar estado de usuario por admin.
    """
    usua_estado = serializers.ChoiceField(choices=[(0, 'Deshabilitado'), (1, 'Habilitado')])