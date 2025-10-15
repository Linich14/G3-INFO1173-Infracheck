from django.db import models
from domain.entities.usuario import Usuario


class Notification(models.Model):
    """Modelo para notificaciones de usuarios"""
    
    TIPO_CHOICES = [
        ('info', 'Información'),
        ('success', 'Éxito'),
        ('warning', 'Advertencia'),
        ('error', 'Error'),
    ]
    
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='notificaciones',
        verbose_name='Usuario',
        db_column='usuario_id'
    )
    titulo = models.CharField(max_length=200, verbose_name='Título')
    mensaje = models.TextField(verbose_name='Mensaje')
    tipo = models.CharField(
        max_length=10,
        choices=TIPO_CHOICES,
        default='info',
        verbose_name='Tipo'
    )
    leida = models.BooleanField(default=False, verbose_name='Leída')
    denuncia = models.ForeignKey(
        'ReportModel',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notificaciones',
        verbose_name='Reporte relacionado'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    fecha_lectura = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de lectura')
    
    class Meta:
        db_table = 'notificaciones'
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['usuario', 'leida']),
            models.Index(fields=['-fecha_creacion']),
        ]
    
    def __str__(self):
        return f"{self.titulo} - {self.usuario.usua_nickname}"
    
    def marcar_como_leida(self):
        """Marca la notificación como leída"""
        if not self.leida:
            from django.utils import timezone
            self.leida = True
            self.fecha_lectura = timezone.now()
            self.save(update_fields=['leida', 'fecha_lectura'])
