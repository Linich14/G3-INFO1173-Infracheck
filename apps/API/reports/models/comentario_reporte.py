from django.db import models
from domain.entities.usuario import Usuario
from reports.models.report import ReportModel


class ComentarioReporte(models.Model):
    """Modelo para comentarios de usuarios en reportes"""

    id = models.AutoField(primary_key=True, editable=False, unique=True)
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='comentarios_reportes',
        verbose_name='Usuario',
        db_column='usuario_id'
    )
    reporte = models.ForeignKey(
        ReportModel,
        on_delete=models.CASCADE,
        related_name='comentarios',
        verbose_name='Reporte'
    )
    comentario = models.TextField(verbose_name='Comentario', help_text='Texto del comentario')
    fecha_comentario = models.DateTimeField(auto_now_add=True, verbose_name='Fecha del comentario')

    class Meta:
        db_table = 'comentario_reporte'
        ordering = ['-fecha_comentario']
        verbose_name = 'Comentario de Reporte'
        verbose_name_plural = 'Comentarios de Reportes'
        indexes = [
            models.Index(fields=['usuario', 'fecha_comentario'], name='comentario_usuario_fecha_idx'),
            models.Index(fields=['reporte', 'fecha_comentario'], name='comentario_reporte_fecha_idx'),
        ]

    def __str__(self):
        return f"{self.usuario.usua_nickname} comentó en reporte #{self.reporte.id}"

    @staticmethod
    def contar_comentarios_reporte(reporte):
        """Cuenta el total de comentarios de un reporte"""
        return ComentarioReporte.objects.filter(reporte=reporte).count()