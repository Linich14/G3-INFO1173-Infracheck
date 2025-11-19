from django.db import models
from domain.entities.usuario import Usuario
from .report import ReportModel


class ReportHistory(models.Model):
    """Modelo para registrar el historial de cambios en reportes"""
    
    ACCIONES = [
        ('CREATE', 'Creado'),
        ('UPDATE', 'Actualizado'),
        ('DELETE', 'Eliminado'),
        ('STATUS_CHANGE', 'Cambio de Estado'),
        ('URGENCY_CHANGE', 'Cambio de Urgencia'),
        ('IMAGE_ADD', 'Imagen Agregada'),
        ('IMAGE_DELETE', 'Imagen Eliminada'),
    ]
    
    id = models.AutoField(primary_key=True)
    reporte = models.ForeignKey(
        ReportModel,
        on_delete=models.DO_NOTHING,  # Cambiado de CASCADE a DO_NOTHING para evitar errores si la tabla no existe
        related_name='historial',
        verbose_name='Reporte',
        db_constraint=False  # Deshabilitar constraint de FK a nivel de BD
    )
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='acciones_reportes',
        verbose_name='Usuario que realizó la acción',
        to_field='usua_id'
    )
    accion = models.CharField(
        max_length=20,
        choices=ACCIONES,
        verbose_name='Acción'
    )
    campo_modificado = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Campo modificado'
    )
    valor_anterior = models.TextField(
        blank=True,
        null=True,
        verbose_name='Valor anterior'
    )
    valor_nuevo = models.TextField(
        blank=True,
        null=True,
        verbose_name='Valor nuevo'
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name='Descripción del cambio'
    )
    fecha = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha del cambio'
    )
    ip_address = models.GenericIPAddressField(
        blank=True,
        null=True,
        verbose_name='Dirección IP'
    )
    
    class Meta:
        db_table = 'report_history'
        ordering = ['-fecha']
        verbose_name = 'Historial de Reporte'
        verbose_name_plural = 'Historial de Reportes'
        indexes = [
            models.Index(fields=['reporte', '-fecha']),
            models.Index(fields=['usuario']),
        ]
    
    def __str__(self):
        return f"{self.get_accion_display()} - {self.reporte.titulo} - {self.fecha}"
