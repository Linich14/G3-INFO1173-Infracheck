from django.db import models
from domain.entities.usuario import Usuario


class PushToken(models.Model):
    """Modelo para almacenar tokens de push notifications"""
    
    PLATFORM_CHOICES = [
        ('ios', 'iOS'),
        ('android', 'Android'),
    ]
    
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='push_tokens',
        verbose_name='Usuario'
    )
    push_token = models.CharField(
        max_length=500,
        verbose_name='Token de Push',
        unique=True
    )
    platform = models.CharField(
        max_length=10,
        choices=PLATFORM_CHOICES,
        verbose_name='Plataforma'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Activo'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de creación'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Última actualización'
    )
    
    class Meta:
        db_table = 'push_tokens'
        verbose_name = 'Token de Push'
        verbose_name_plural = 'Tokens de Push'
        indexes = [
            models.Index(fields=['usuario', 'is_active']),
            models.Index(fields=['push_token']),
        ]
    
    def __str__(self):
        return f"{self.usuario.usua_nickname} - {self.platform} - {self.push_token[:20]}..."
