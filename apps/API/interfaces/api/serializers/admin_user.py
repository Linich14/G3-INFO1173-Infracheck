from rest_framework import serializers
from domain.entities.usuario import Usuario

class AdminUserSerializer(serializers.ModelSerializer):
    """
    Serializer para usuarios en panel admin.
    Incluye campos básicos y estado, excluye contraseña.
    """

    class Meta:
        model = Usuario
        fields = [
            'usua_id', 'usua_rut', 'usua_nickname', 'usua_email',
            'usua_telefono', 'rous_id', 'usua_estado', 'usua_creado'
        ]
        read_only_fields = ['usua_id', 'usua_creado']

class AdminUserUpdateSerializer(serializers.Serializer):
    """
    Serializer para actualizar estado de usuario por admin.
    """
    usua_estado = serializers.ChoiceField(choices=[(0, 'Deshabilitado'), (1, 'Habilitado')])