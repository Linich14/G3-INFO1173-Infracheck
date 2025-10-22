from django.db import models
from django.core.exceptions import ValidationError
from reports.models import ReportModel


class ProyectoModel(models.Model):
    """Modelo para proyectos municipales vinculados a denuncias"""
    
    proy_id = models.AutoField(primary_key=True, db_column='proy_id')
    proy_titulo = models.CharField(max_length=50, db_column='proy_titulo')
    proy_descripcion = models.TextField(db_column='proy_descripcion')
    proy_estado = models.IntegerField(
        db_column='proy_estado',
        choices=[
            (1, 'Planificación'),
            (2, 'En Progreso'),
            (3, 'Completado'),
            (4, 'Cancelado'),
            (5, 'Pendiente'),
            (6, 'Aprobado'),
            (7, 'Rechazado')
        ],
        default=1
    )
    proy_visible = models.IntegerField(default=1, db_column='proy_visible')
    proy_creado = models.DateTimeField(auto_now_add=True, db_column='proy_creado')
    proy_actualizado = models.DateTimeField(auto_now=True, db_column='proy_actualizado')
    
    # Relación con Denuncia (ReportModel) - Un proyecto está vinculado a UNA denuncia principal
    denu_id = models.ForeignKey(
        ReportModel, 
        on_delete=models.CASCADE, 
        db_column='denu_id',
        related_name='proyectos'
    )
    
    # Campos adicionales
    proy_lugar = models.CharField(max_length=255, db_column='proy_lugar', blank=True, null=True)
    proy_prioridad = models.IntegerField(
        db_column='proy_prioridad',
        choices=[(1, 'Normal'), (2, 'Importante'), (3, 'Muy Importante')],
        default=1
    )
    proy_fecha_inicio_estimada = models.DateField(
        db_column='proy_fecha_inicio_estimada',
        null=True,
        blank=True
    )
    proy_tipo_denuncia = models.CharField(
        max_length=100,
        db_column='proy_tipo_denuncia',
        blank=True,
        null=True
    )
    
    class Meta:
        db_table = 'Proyecto'
        ordering = ['-proy_creado']
        verbose_name = 'Proyecto'
        verbose_name_plural = 'Proyectos'
    
    def __str__(self):
        return f"{self.proy_titulo}"
    
    # ========== MÉTODOS DE CONSULTA (Read-only) ==========
    
    def get_estado_display_custom(self) -> str:
        """Retorna el estado en español"""
        estados = {
            1: 'Planificación',
            2: 'En Progreso',
            3: 'Completado',
            4: 'Cancelado',
            5: 'Pendiente',
            6: 'Aprobado',
            7: 'Rechazado'
        }
        return estados.get(self.proy_estado, 'Desconocido')
    
    def get_prioridad_display(self) -> str:
        """Retorna la prioridad en español"""
        prioridades = {
            1: 'Normal',
            2: 'Importante',
            3: 'Muy Importante'
        }
        return prioridades.get(self.proy_prioridad, 'Normal')
    
    def get_color_estado(self) -> str:
        """Retorna el color CSS según el estado"""
        colores = {
            1: 'bg-blue-700',      # Planificación
            2: 'bg-purple-700',    # En Progreso
            3: 'bg-green-800',     # Completado
            4: 'bg-red-700',       # Cancelado
            5: 'bg-blue-700',      # Pendiente
            6: 'bg-yellow-700',    # Aprobado
            7: 'bg-gray-700'       # Rechazado
        }
        return colores.get(self.proy_estado, 'bg-gray-700')
    
    def get_total_archivos(self) -> int:
        """Retorna el total de archivos asociados"""
        return self.archivos.filter(proar_visible=1).count()
    
    def get_reportes_asociados_count(self) -> int:
        """Retorna el total de reportes asociados al proyecto"""
        # Por ahora es 1 (la denuncia principal), pero puede extenderse
        return 1
    
    def get_votos_a_favor(self) -> int:
        """Retorna la suma de votos de los reportes asociados"""
        # Asumiendo que ReportModel no tiene campo votos, retornamos 0
        # Puedes ajustar esto según tu lógica
        return 0
    
    def is_visible(self) -> bool:
        """Verifica si el proyecto es visible"""
        return self.proy_visible == 1
    
    def is_completado(self) -> bool:
        """Verifica si el proyecto está completado"""
        return self.proy_estado == 3
    
    def get_days_since_creation(self) -> int:
        """Días desde la creación"""
        from django.utils import timezone
        delta = timezone.now() - self.proy_creado
        return delta.days
    
    # ========== VALIDACIONES ==========
    
    def clean(self):
        """Validaciones a nivel de modelo"""
        errors = {}
        
        if not self.proy_titulo or not self.proy_titulo.strip():
            errors['proy_titulo'] = 'El título no puede estar vacío'
        elif len(self.proy_titulo) > 50:
            errors['proy_titulo'] = 'El título no puede exceder 50 caracteres'
        
        if not self.proy_descripcion or not self.proy_descripcion.strip():
            errors['proy_descripcion'] = 'La descripción no puede estar vacía'
        elif len(self.proy_descripcion) < 20:
            errors['proy_descripcion'] = 'La descripción debe tener al menos 20 caracteres'
        
        if self.proy_estado not in [1, 2, 3, 4, 5, 6, 7]:
            errors['proy_estado'] = 'Estado inválido'
        
        if self.proy_prioridad not in [1, 2, 3]:
            errors['proy_prioridad'] = 'Prioridad inválida'
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """Override save para ejecutar validaciones"""
        self.full_clean()
        super().save(*args, **kwargs)
