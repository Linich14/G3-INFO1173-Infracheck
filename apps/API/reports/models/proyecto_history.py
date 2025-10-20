from django.db import models
from domain.entities.usuario import Usuario


class ProyectoHistory(models.Model):
    """Modelo para registrar el historial de cambios en proyectos"""
    
    ACCIONES = [
        ('CREATE', 'Creado'),
        ('UPDATE', 'Actualizado'),
        ('DELETE', 'Eliminado'),
        ('STATUS_CHANGE', 'Cambio de Estado'),
        ('PRIORITY_CHANGE', 'Cambio de Prioridad'),
        ('FILE_ADD', 'Archivo Agregado'),
        ('FILE_DELETE', 'Archivo Eliminado'),
        ('PROBLEM_REPORT', 'Problema Reportado'),
    ]
    
    id = models.AutoField(primary_key=True)
    # Referencia a ProyectoModel que está en la app proyectos
    proyecto = models.ForeignKey(
        'proyectos.ProyectoModel',
        on_delete=models.CASCADE,
        related_name='historial',
        verbose_name='Proyecto',
        db_column='proyecto_id'
    )
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='acciones_proyectos',
        verbose_name='Usuario que realizó la acción',
        to_field='usua_id',
        db_column='usuario_id'
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
        db_table = 'proyecto_history'
        verbose_name = 'Historial de Proyecto'
        verbose_name_plural = 'Historial de Proyectos'
        ordering = ['-fecha']
        indexes = [
            models.Index(fields=['proyecto', '-fecha']),
            models.Index(fields=['usuario']),
        ]
    
    def __str__(self):
        return f"{self.get_accion_display()} - {self.proyecto.proy_titulo} - {self.fecha.strftime('%Y-%m-%d %H:%M')}"
    
    @staticmethod
    def registrar(proyecto, usuario, accion, campo=None, valor_ant=None, valor_nuevo=None, descripcion=None, ip=None):
        """
        Método auxiliar para registrar cambios en el historial
        """
        return ProyectoHistory.objects.create(
            proyecto=proyecto,
            usuario=usuario,
            accion=accion,
            campo_modificado=campo,
            valor_anterior=str(valor_ant) if valor_ant is not None else None,
            valor_nuevo=str(valor_nuevo) if valor_nuevo is not None else None,
            descripcion=descripcion,
            ip_address=ip
        )
