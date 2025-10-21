from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.gis.db import models
from domain.entities.usuario import Usuario


class ReportModel(models.Model):
    """Modelo de Django para persistir reportes"""
    
    id = models.AutoField(primary_key=True, editable=False, unique=True)
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(max_length=1000)
    direccion = models.CharField(max_length=255, verbose_name="Dirección", default="Dirección no especificada")
    ubicacion = models.PointField(
        geography=True,
        verbose_name="Ubicación geográfica",
        help_text="Coordenadas geográficas del reporte"
    )
    visible = models.BooleanField(default=True)
    urgencia = models.IntegerField(choices=[(1, 'Baja'), (2, 'Media'), (3, 'Alta')])
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    # Foreign Keys
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='reportes', to_field='usua_id')
    denuncia_estado = models.ForeignKey('DenunciaEstado', on_delete=models.PROTECT)
    tipo_denuncia = models.ForeignKey('TipoDenuncia', on_delete=models.PROTECT)
    ciudad = models.ForeignKey('Ciudad', on_delete=models.PROTECT)
    
    class Meta:
        db_table = 'reportes'
        verbose_name = 'Reporte'
        verbose_name_plural = 'Reportes'
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['usuario', 'visible']),
            models.Index(fields=['fecha_creacion']),
            models.Index(fields=['urgencia']),
            models.Index(fields=['denuncia_estado']),
        ]
    
    def __str__(self):
        return f"{self.titulo} - {self.usuario}"
    
    # ========== MÉTODOS DE CONSULTA (Read-only) ==========
    
    def is_urgent(self) -> bool:
        """Verifica si el reporte es urgente"""
        return self.urgencia == 3
    
    def is_visible(self) -> bool:
        """Verifica si el reporte es visible"""
        return self.visible
    
    def get_days_since_creation(self) -> int:
        """Obtiene los días transcurridos desde la creación"""
        from django.utils import timezone
        return (timezone.now() - self.fecha_creacion).days
    
    def belongs_to_user(self, usuario_id: int) -> bool:
        """Verifica si el reporte pertenece al usuario"""
        return self.usuario.usua_id == usuario_id
    
    def get_coordinates(self) -> dict:
        """Obtiene las coordenadas del reporte"""
        if self.ubicacion:
            return {
                'latitud': self.ubicacion.y,
                'longitud': self.ubicacion.x
            }
        return {'latitud': None, 'longitud': None}
    
    # ========== MÉTODOS PARA ARCHIVOS ==========
    
    def get_archivos_activos(self):
        """Obtiene todos los archivos activos del reporte"""
        from .report_archivos import ReportArchivo
        return ReportArchivo.objects.filter(reporte=self, activo=True).order_by('orden', 'fecha_subida')
    
    def get_imagenes(self):
        """Obtiene todas las imágenes activas del reporte"""
        from .report_archivos import ReportArchivo
        return ReportArchivo.objects.filter(reporte=self, activo=True, tipo_archivo='imagen').order_by('orden', 'fecha_subida')
    
    def get_videos(self):
        """Obtiene todos los videos activos del reporte"""
        from .report_archivos import ReportArchivo
        return ReportArchivo.objects.filter(reporte=self, activo=True, tipo_archivo='video').order_by('orden', 'fecha_subida')
    
    def get_documentos(self):
        """Obtiene todos los documentos activos del reporte"""
        from .report_archivos import ReportArchivo
        return ReportArchivo.objects.filter(reporte=self, activo=True, tipo_archivo='documento').order_by('orden', 'fecha_subida')
    
    def get_archivo_principal(self):
        """Obtiene el archivo principal del reporte"""
        from .report_archivos import ReportArchivo
        return ReportArchivo.objects.filter(reporte=self, es_principal=True, activo=True).first()
    
    def contar_archivos(self):
        """Cuenta los archivos por tipo"""
        from .report_archivos import ReportArchivo
        return ReportArchivo.objects.contar_por_tipo(self.id)
    
    def puede_agregar_archivos(self):
        """Verifica si se pueden agregar más archivos (máximo 5)"""
        from .report_archivos import ReportArchivo
        return ReportArchivo.objects.filter(reporte=self, activo=True).count() < 5
    
    def establecer_archivo_principal(self, archivo_id):
        """Establece un archivo como principal"""
        from .report_archivos import ReportArchivo
        
        # Quitar principal a todos los archivos
        ReportArchivo.objects.filter(reporte=self, es_principal=True).update(es_principal=False)
        
        # Establecer el nuevo principal
        archivo = ReportArchivo.objects.filter(id=archivo_id, reporte=self, activo=True).first()
        if archivo:
            archivo.es_principal = True
            archivo.save()
            return True
        return False
    
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
        
        if not self.direccion or not self.direccion.strip():
            errors['direccion'] = 'La dirección no puede estar vacía'
        
        if self.urgencia not in [1, 2, 3]:
            errors['urgencia'] = 'La urgencia debe ser 1, 2 o 3'
        
        if errors:
            raise ValidationError(errors)