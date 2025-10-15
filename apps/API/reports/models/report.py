from django.db import models
from django.core.exceptions import ValidationError
from domain.entities.usuario import Usuario


class ReportModel(models.Model):
    """Modelo de Django para persistir reportes"""
    
    id = models.AutoField(primary_key=True, editable=False, unique=True)
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(max_length=1000)
    ubicacion = models.CharField(max_length=255)
    visible = models.BooleanField(default=True)
    urgencia = models.IntegerField(choices=[(1, 'Baja'), (2, 'Media'), (3, 'Alta')])
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    latitud = models.DecimalField(
        max_digits=10, 
        decimal_places=7, 
        default=0.0,
        verbose_name="Latitud",
        help_text="Coordenada de latitud (-90 a 90)"
    )
    longitud = models.DecimalField(
        max_digits=10, 
        decimal_places=7,
        default=0.0, 
        verbose_name="Longitud", 
        help_text="Coordenada de longitud (-180 a 180)"
    )
    # Foreign Keys
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='reportes', to_field='usua_id')
    denuncia_estado = models.ForeignKey('DenunciaEstado', on_delete=models.PROTECT)
    tipo_denuncia = models.ForeignKey('TipoDenuncia', on_delete=models.PROTECT)
    ciudad = models.ForeignKey('Ciudad', on_delete=models.PROTECT)
    
    class Meta:
        db_table = 'reportes'
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return f"{self.titulo}"
    
    # ========== MÉTODOS DE CONSULTA (Read-only) ==========
    
    def is_urgent(self) -> bool:
        """Verifica si el reporte es urgente"""
        return self.urgencia == 3
    
    def is_visible(self) -> bool:
        """Verifica si el reporte es visible"""
        return self.visible
    
    def get_days_since_creation(self) -> int:
        """Días desde la creación"""
        from django.utils import timezone
        delta = timezone.now() - self.fecha_creacion
        return delta.days
    
    def belongs_to_user(self, usuario_id: int) -> bool:
        """Verifica si pertenece a un usuario"""
        return self.usuario == usuario_id
    
    # ========== VALIDACIONES ==========
    
    def clean(self):
        """Validaciones a nivel de modelo"""
        errors = {}
        
        if not self.titulo or not self.titulo.strip():
            errors['titulo'] = 'El título no puede estar vacío'
        elif len(self.titulo) > 200:
            errors['titulo'] = 'El título no puede exceder 200 caracteres'
        
        if not self.descripcion or not self.descripcion.strip():
            errors['descripcion'] = 'La descripción no puede estar vacía'
        elif len(self.descripcion) > 1000:
            errors['descripcion'] = 'La descripción no puede exceder 1000 caracteres'
        
        if not self.ubicacion or not self.ubicacion.strip():
            errors['ubicacion'] = 'La ubicación no puede estar vacía'
        
        if self.urgencia not in [1, 2, 3]:
            errors['urgencia'] = 'La urgencia debe ser 1, 2 o 3'
        
        if errors:
            raise ValidationError(errors)