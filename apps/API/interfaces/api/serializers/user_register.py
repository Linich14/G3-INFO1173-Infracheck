from rest_framework import serializers
from domain.entities.usuario import Usuario
from domain.entities.rol_usuario import RolUsuario
from django.contrib.auth.hashers import make_password

class UserRegisterSerializer(serializers.ModelSerializer):
    # Campos que vienen del frontend
    rut = serializers.CharField(source='usua_rut')
    username = serializers.CharField(source='usua_nickname')
    email = serializers.EmailField(source='usua_email', required=True)
    phone = serializers.CharField(source='usua_telefono')
    password = serializers.CharField(source='usua_pass', write_only=True)
    confirmPassword = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['rut', 'username', 'email', 'phone', 'password', 'confirmPassword']

    def validate(self, data):
        if data['usua_pass'] != data['confirmPassword']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        
        # Limpiar el teléfono (quitar + y espacios)
        phone = data.get('usua_telefono', '')
        if isinstance(phone, str):
            cleaned_phone = phone.replace('+', '').replace(' ', '').replace('-', '')
            try:
                data['usua_telefono'] = int(cleaned_phone)
            except ValueError:
                raise serializers.ValidationError("Formato de teléfono inválido.")
        
        return data

    def create(self, validated_data):
        validated_data.pop('confirmPassword')
        
        # Asignar rol de usuario común por defecto (ID 3 = Usuario común)
        try:
            rol_usuario = RolUsuario.objects.get(rous_id=3)
        except RolUsuario.DoesNotExist:
            raise serializers.ValidationError("El rol de usuario común no existe en la base de datos.")
        
        # Encriptar contraseña
        validated_data['usua_pass'] = make_password(validated_data['usua_pass'])
        
        # Asignar valores por defecto
        validated_data['rous_id'] = rol_usuario
        validated_data['usua_estado'] = 1  # Habilitado por defecto
        
        user = Usuario.objects.create(**validated_data)
        return user