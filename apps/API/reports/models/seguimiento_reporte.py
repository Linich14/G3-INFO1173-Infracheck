from django.db import models
from domain.entities.usuario import Usuario
from reports.models.report import ReportModel


class SeguimientoReporte(models.Model):
    """Modelo para seguimiento de reportes por usuarios"""

    id = models.AutoField(primary_key=True, editable=False, unique=True)
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='reportes_seguidos',
        verbose_name='Usuario',
        db_column='usuario_id'
    )
    reporte = models.ForeignKey(
        ReportModel,
        on_delete=models.CASCADE,
        related_name='seguidores',
        verbose_name='Reporte'
    )
    fecha_seguimiento = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de seguimiento')

    class Meta:
        db_table = 'seguimiento_reporte'
        unique_together = ('usuario', 'reporte')  # Un usuario no puede seguir el mismo reporte dos veces
        ordering = ['-fecha_seguimiento']
        verbose_name = 'Seguimiento de Reporte'
        verbose_name_plural = 'Seguimientos de Reportes'
        indexes = [
            models.Index(fields=['usuario', 'fecha_seguimiento']),
            models.Index(fields=['reporte']),
        ]

    def __str__(self):
        return f"{self.usuario.usua_nickname} sigue reporte #{self.reporte.id}"

    @staticmethod
    def puede_seguir_mas_reportes(usuario):
        """Verifica si el usuario puede seguir más reportes (máximo 15)"""
        return SeguimientoReporte.objects.filter(usuario=usuario).count() < 15

    @staticmethod
    def esta_siguiendo_reporte(usuario, reporte):
        """Verifica si el usuario ya está siguiendo un reporte específico"""
        return SeguimientoReporte.objects.filter(usuario=usuario, reporte=reporte).exists()