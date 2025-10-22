from django.db import models
from domain.entities.usuario import Usuario
from reports.models.report import ReportModel


class VotoReporte(models.Model):
    """Modelo para votos de usuarios en reportes"""

    id = models.AutoField(primary_key=True, editable=False, unique=True)
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='votos_reportes',
        verbose_name='Usuario',
        db_column='usuario_id'
    )
    reporte = models.ForeignKey(
        ReportModel,
        on_delete=models.CASCADE,
        related_name='votos',
        verbose_name='Reporte'
    )
    fecha_voto = models.DateTimeField(auto_now_add=True, verbose_name='Fecha del voto')

    class Meta:
        db_table = 'voto_reporte'
        unique_together = ('usuario', 'reporte')  # Un usuario no puede votar dos veces por el mismo reporte
        ordering = ['-fecha_voto']
        verbose_name = 'Voto de Reporte'
        verbose_name_plural = 'Votos de Reportes'
        indexes = [
            models.Index(fields=['usuario', 'fecha_voto']),
            models.Index(fields=['reporte']),
        ]

    def __str__(self):
        return f"{self.usuario.usua_nickname} votó por reporte #{self.reporte.id}"

    @staticmethod
    def ha_votado_reporte(usuario, reporte):
        """Verifica si el usuario ya ha votado por un reporte específico"""
        return VotoReporte.objects.filter(usuario=usuario, reporte=reporte).exists()

    @staticmethod
    def contar_votos_reporte(reporte):
        """Cuenta el total de votos de un reporte"""
        return VotoReporte.objects.filter(reporte=reporte).count()