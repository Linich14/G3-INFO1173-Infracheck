from django.db import models
from django.core.exceptions import ValidationError


class ProyectoArchivosModel(models.Model):
    """Modelo para archivos asociados a proyectos municipales"""
    
    proar_id = models.AutoField(primary_key=True, db_column='proar_id')
    proy_id = models.ForeignKey(
        'ProyectoModel',
        on_delete=models.CASCADE,
        db_column='proy_id',
        related_name='archivos'
    )
    proar_tipo = models.CharField(
        max_length=50,
        db_column='proar_tipo',
        choices=[
            ('imagen', 'Imagen'),
            ('documento', 'Documento'),
            ('video', 'Video'),
            ('plano', 'Plano'),
            ('otro', 'Otro')
        ]
    )
    proar_contenido_tipo = models.CharField(
        max_length=100,
        db_column='proar_contenido_tipo'
    )
    proar_mime = models.CharField(max_length=100, db_column='proar_mime')
    proar_nombre_archivo = models.CharField(
        max_length=255,
        db_column='proar_nombre_archivo'
    )
    proar_ruta = models.CharField(max_length=500, db_column='proar_ruta')
    proar_visible = models.IntegerField(default=1, db_column='proar_visible')
    proar_creado = models.DateTimeField(auto_now_add=True, db_column='proar_creado')
    proar_actualizado = models.DateTimeField(auto_now=True, db_column='proar_actualizado')
    
    class Meta:
        db_table = 'Proyecto_archivos'
        ordering = ['-proar_creado']
        verbose_name = 'Archivo de Proyecto'
        verbose_name_plural = 'Archivos de Proyectos'
    
    def __str__(self):
        return f"{self.proar_nombre_archivo} ({self.get_proar_tipo_display()})"
    
    # ========== MÉTODOS DE CONSULTA ==========
    
    def is_visible(self) -> bool:
        """Verifica si el archivo es visible"""
        return self.proar_visible == 1
    
    def is_imagen(self) -> bool:
        """Verifica si es una imagen"""
        return self.proar_tipo == 'imagen'
    
    def is_documento(self) -> bool:
        """Verifica si es un documento"""
        return self.proar_tipo == 'documento'
    
    def get_extension(self) -> str:
        """Obtiene la extensión del archivo"""
        if '.' in self.proar_nombre_archivo:
            return self.proar_nombre_archivo.split('.')[-1].lower()
        return ''
    
    def get_size_display(self) -> str:
        """Retorna el tamaño formateado (placeholder)"""
        # Implementar si guardas el tamaño del archivo
        return "N/A"
    
    # ========== VALIDACIONES ==========
    
    def clean(self):
        """Validaciones a nivel de modelo"""
        errors = {}
        
        if not self.proar_tipo:
            errors['proar_tipo'] = 'El tipo de archivo es obligatorio'
        
        if not self.proar_nombre_archivo or not self.proar_nombre_archivo.strip():
            errors['proar_nombre_archivo'] = 'El nombre del archivo no puede estar vacío'
        
        if not self.proar_ruta or not self.proar_ruta.strip():
            errors['proar_ruta'] = 'La ruta del archivo no puede estar vacía'
        
        # Validar tipos MIME comunes
        valid_mime_prefixes = ['image/', 'video/', 'application/', 'text/']
        if self.proar_mime and not any(self.proar_mime.startswith(prefix) for prefix in valid_mime_prefixes):
            errors['proar_mime'] = 'Tipo MIME no válido'
        
        if errors:
            raise ValidationError(errors)
