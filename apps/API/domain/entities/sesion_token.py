from django.db import models
from .usuario import Usuario
from django.utils import timezone
import secrets
import string

class SesionToken(models.Model):
    token_id = models.AutoField(primary_key=True)
    usua_id = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='usua_id')
    token_valor = models.CharField(max_length=255, unique=True)
    token_creado_en = models.DateTimeField(auto_now_add=True)
    token_expira_en = models.DateTimeField()
    token_activo = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'sesion_token'
        verbose_name = 'Token de Sesión'
        verbose_name_plural = 'Tokens de Sesión'
    
    def __str__(self):
        return f"Token {self.token_id} - Usuario: {self.usua_id.usua_nickname}"
    
    def is_valid(self):
        """Verifica si el token está activo y no ha expirado"""
        if not self.token_activo:
            return False
        
        now = timezone.now()
        
        # Manejar el caso donde token_expira_en puede ser naive o aware
        if timezone.is_naive(self.token_expira_en):
            # Si el datetime es naive, convertirlo a aware usando la zona horaria por defecto
            expira_en_aware = timezone.make_aware(self.token_expira_en)
        else:
            expira_en_aware = self.token_expira_en
        
        return expira_en_aware > now
    
    def deactivate(self):
        """Desactiva el token"""
        self.token_activo = False
        self.save()
    
    @classmethod
    def generate_token(cls, usuario, hours=24):
        """Genera un nuevo token para un usuario con duración específica"""
        # Generar token aleatorio seguro
        token_valor = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
        
        # Calcular fecha de expiración usando timezone-aware datetime
        now = timezone.now()
        expira_en = now + timezone.timedelta(hours=hours)
        
        # Crear el token
        token = cls.objects.create(
            usua_id=usuario,
            token_valor=token_valor,
            token_expira_en=expira_en
        )
        
        return token
    
    @classmethod
    def get_user_by_token(cls, token_valor):
        """Obtiene el usuario asociado a un token válido"""
        try:
            token = cls.objects.get(token_valor=token_valor)
            if token.is_valid():
                return token.usua_id
            return None
        except cls.DoesNotExist:
            return None