from django.db import models
from .usuario import Usuario
from django.utils import timezone
import random
import secrets

class RecuperarUsuario(models.Model):
    reus_id = models.AutoField(primary_key=True)
    usua_id = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='usua_id')
    reus_token = models.CharField(max_length=6)  # Código de 6 dígitos
    reus_expira_en = models.DateTimeField()
    reus_creado_en = models.DateTimeField(auto_now_add=True)
    reus_usado = models.BooleanField(default=False)  # Para marcar si ya fue utilizado
    
    class Meta:
        db_table = 'recuperar_usuario'
        verbose_name = 'Recuperación de Usuario'
        verbose_name_plural = 'Recuperaciones de Usuario'
    
    def __str__(self):
        return f"Reset {self.reus_id} - Usuario: {self.usua_id.usua_nickname} - Código: {self.reus_token}"
    
    def is_valid(self):
        """Verifica si el código está activo y no ha expirado"""
        if self.reus_usado:
            return False
        
        now = timezone.now()
        
        # Manejar timezone-naive vs timezone-aware
        if timezone.is_naive(self.reus_expira_en):
            expira_en_aware = timezone.make_aware(self.reus_expira_en)
        else:
            expira_en_aware = self.reus_expira_en
        
        return expira_en_aware > now
    
    def marcar_como_usado(self):
        """Marca el código como usado"""
        self.reus_usado = True
        self.save()
    
    @classmethod
    def generate_reset_code(cls, usuario, minutes=10):
        """Genera un nuevo código de reset para un usuario"""
        # Eliminar códigos anteriores del mismo usuario
        cls.objects.filter(usua_id=usuario).delete()
        
        # Generar código de 6 dígitos criptográficamente seguro
        codigo = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
        
        # Calcular fecha de expiración (10 minutos por defecto)
        now = timezone.now()
        expira_en = now + timezone.timedelta(minutes=minutes)
        
        # Crear el código de reset
        reset_code = cls.objects.create(
            usua_id=usuario,
            reus_token=codigo,
            reus_expira_en=expira_en
        )
        
        return reset_code
    
    @classmethod
    def verificar_codigo(cls, usuario, codigo):
        """Verifica si un código es válido para un usuario"""
        try:
            reset_record = cls.objects.get(
                usua_id=usuario,
                reus_token=codigo,
                reus_usado=False
            )
            
            if reset_record.is_valid():
                return reset_record
            else:
                # Código expirado - eliminarlo
                reset_record.delete()
                return None
        
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def limpiar_codigos_expirados(cls):
        """Elimina todos los códigos expirados"""
        now = timezone.now()
        expired_codes = cls.objects.filter(reus_expira_en__lt=now)
        count = expired_codes.count()
        expired_codes.delete()
        return count