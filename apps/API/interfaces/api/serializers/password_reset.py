from rest_framework import serializers
from domain.entities.usuario import Usuario
from domain.entities.recuperar_usuario import RecuperarUsuario
from domain.entities.sesion_token import SesionToken
import re
import logging

logger = logging.getLogger(__name__)

class RequestPasswordResetSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=100, required=True)
    
    def validate_identifier(self, value):
        """Valida que el identificador sea un RUT o email válido"""
        value = value.strip()
        
        # Verificar si es un email válido
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if re.match(email_pattern, value):
            return value
        
        # Verificar si es un RUT válido (formato básico)
        rut_pattern = r'^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$'
        if re.match(rut_pattern, value):
            return value
        
        # También permitir RUT sin puntos ni guión
        rut_simple_pattern = r'^\d{7,8}[\dkK]$'
        if re.match(rut_simple_pattern, value):
            return value
        
        raise serializers.ValidationError("Formato inválido. Use email o RUT válido.")
    
    def validate(self, data):
        identifier = data.get('identifier')
        
        try:
            # Buscar usuario por RUT o email
            if '@' in identifier:
                usuario = Usuario.objects.get(usua_email=identifier, usua_estado=1)
            else:
                # Limpiar RUT (remover puntos y guión para búsqueda)
                rut_limpio = re.sub(r'[.-]', '', identifier)
                usuario = Usuario.objects.get(usua_rut=identifier, usua_estado=1)
            
            data['usuario'] = usuario
            return data
            
        except Usuario.DoesNotExist:
            # Por seguridad, no revelamos si el usuario existe o no
            logger.warning(f"Intento de reset para usuario inexistente: {identifier}")
            raise serializers.ValidationError("Si el usuario existe, se enviará un código a su email.")
        
        return data


class VerifyResetCodeSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=100, required=True)
    code = serializers.CharField(max_length=6, min_length=6, required=True)
    
    def validate_code(self, value):
        """Valida que el código sea numérico de 6 dígitos"""
        if not value.isdigit():
            raise serializers.ValidationError("El código debe ser numérico.")
        
        if len(value) != 6:
            raise serializers.ValidationError("El código debe tener exactamente 6 dígitos.")
        
        return value
    
    def validate_identifier(self, value):
        """Valida que el identificador sea un RUT o email válido"""
        value = value.strip()
        
        # Usar la misma validación que RequestPasswordResetSerializer
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if re.match(email_pattern, value):
            return value
        
        rut_pattern = r'^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$'
        if re.match(rut_pattern, value):
            return value
        
        rut_simple_pattern = r'^\d{7,8}[\dkK]$'
        if re.match(rut_simple_pattern, value):
            return value
        
        raise serializers.ValidationError("Formato inválido. Use email o RUT válido.")
    
    def validate(self, data):
        identifier = data.get('identifier')
        code = data.get('code')
        
        try:
            # Buscar usuario por RUT o email
            if '@' in identifier:
                usuario = Usuario.objects.get(usua_email=identifier, usua_estado=1)
            else:
                usuario = Usuario.objects.get(usua_rut=identifier, usua_estado=1)
            
            # Verificar el código
            reset_record = RecuperarUsuario.verificar_codigo(usuario, code)
            
            if not reset_record:
                raise serializers.ValidationError("Código inválido o expirado.")
            
            data['usuario'] = usuario
            data['reset_record'] = reset_record
            return data
            
        except Usuario.DoesNotExist:
            logger.warning(f"Intento de verificación para usuario inexistente: {identifier}")
            raise serializers.ValidationError("Código inválido o expirado.")
        
        return data


class ResetPasswordSerializer(serializers.Serializer):
    reset_token = serializers.CharField(max_length=255, required=True)
    new_password = serializers.CharField(min_length=8, max_length=128, required=True, write_only=True)
    confirm_password = serializers.CharField(min_length=8, max_length=128, required=True, write_only=True)
    
    def validate_new_password(self, value):
        """Valida que la contraseña cumpla con las políticas de seguridad"""
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        
        # Verificar que tenga al menos una letra y un número
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra.")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un número.")
        
        return value
    
    def validate(self, data):
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
        
        # Verificar que las contraseñas coincidan
        if new_password != confirm_password:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        
        # Por ahora, el reset_token será validado en la vista
        # ya que necesitamos más lógica para manejar tokens temporales
        
        return data


class TemporaryResetToken:
    """Clase helper para generar y validar tokens temporales de reset"""
    
    @staticmethod
    def generate_token(reset_record):
        """Genera un token temporal para reset de contraseña"""
        import secrets
        import hashlib
        
        # Crear token basado en el registro de reset y timestamp
        raw_data = f"{reset_record.reus_id}_{reset_record.usua_id.usua_id}_{reset_record.reus_token}"
        token = hashlib.sha256(raw_data.encode()).hexdigest()[:32]
        
        return token
    
    @staticmethod
    def validate_token(token, reset_record):
        """Valida si un token temporal es válido para un registro de reset"""
        expected_token = TemporaryResetToken.generate_token(reset_record)
        return token == expected_token