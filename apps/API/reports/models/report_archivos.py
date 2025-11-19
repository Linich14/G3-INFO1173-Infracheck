from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings
import os
import uuid
from datetime import datetime

def upload_to_report_files(instance, filename):
    """Genera la ruta de subida para archivos de reportes con nombre único"""
    # Obtener la fecha actual en formato DD-MM-YYYY
    fecha_actual = datetime.now().strftime('%d-%m-%Y')
    
    # Obtener el ID del reporte
    reporte_id = instance.reporte.id if instance.reporte else 'temp'
    
    # Extraer la extensión del archivo original
    _, ext = os.path.splitext(filename)
    
    # Generar un ID único para el archivo
    archivo_id = uuid.uuid4().hex
    
    # Crear el nuevo nombre: {uuid}.{extension}
    nuevo_nombre = f"{archivo_id}{ext}"
    
    # Estructura: reports/20-10-2025/123/abc123def456.jpg
    return f"reports/{fecha_actual}/{reporte_id}/{nuevo_nombre}"



class ReportArchivoManager(models.Manager):
    """Manager personalizado para archivos de reportes"""
    
    def activos(self):
        """Filtrar solo archivos activos"""
        return self.filter(activo=True)
    
    def imagenes(self):
        """Filtrar solo imágenes activas"""
        return self.filter(tipo_archivo='imagen', activo=True)
    
    def videos(self):
        """Filtrar solo videos activos"""
        return self.filter(tipo_archivo='video', activo=True)
    
    def principales(self):
        """Filtrar solo archivos principales"""
        return self.filter(es_principal=True, activo=True)
    
    def por_reporte(self, reporte_id):
        """Obtener archivos activos por reporte"""
        return self.filter(reporte_id=reporte_id, activo=True).order_by('orden', 'fecha_subida')
    
    def contar_por_tipo(self, reporte_id):
        """Contar archivos por tipo para un reporte"""
        from django.db.models import Count, Case, When, IntegerField
        
        return self.filter(reporte_id=reporte_id, activo=True).aggregate(
            total=Count('id'),
            imagenes=Count(Case(When(tipo_archivo='imagen', then=1), output_field=IntegerField())),
            videos=Count(Case(When(tipo_archivo='video', then=1), output_field=IntegerField()))
        )


class ReportArchivo(models.Model):
    """Modelo para archivos multimedia de reportes (solo imágenes y videos)"""
    
    # Campo principal
    id = models.AutoField(primary_key=True)
    
    # Relación con reporte
    reporte = models.ForeignKey(
        'reports.ReportModel',
        on_delete=models.CASCADE,
        related_name='archivos',
        verbose_name='Reporte',
        help_text='Reporte al que pertenece este archivo'
    )
    
    # Archivo principal
    archivo = models.FileField(
        upload_to=upload_to_report_files,
        max_length=200,
        verbose_name='Archivo',
        help_text='Archivo subido (imagen o video únicamente)'
    )
    
    # Metadatos del archivo
    nombre_original = models.CharField(
        max_length=255,
        verbose_name='Nombre original',
        help_text='Nombre original del archivo al momento de la subida'
    )
    
    tipo_archivo = models.CharField(
        max_length=20,
        choices=[
            ('imagen', 'Imagen'),
            ('video', 'Video')
        ],
        default='imagen',
        verbose_name='Tipo de archivo'
    )
    
    tamaño_bytes = models.PositiveBigIntegerField(
        default=0,
        verbose_name='Tamaño en bytes',
        help_text='Tamaño del archivo en bytes'
    )
    
    extension = models.CharField(
        max_length=10,
        verbose_name='Extensión',
        help_text='Extensión del archivo sin el punto (jpg, png, mp4, etc.)'
    )
    
    # Metadatos adicionales
    mime_type = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Tipo MIME',
        help_text='Tipo MIME del archivo (image/jpeg, video/mp4, etc.)'
    )
    
    # Control de orden y visibilidad
    orden = models.PositiveIntegerField(
        default=0,
        verbose_name='Orden',
        help_text='Orden de visualización del archivo'
    )
    
    es_principal = models.BooleanField(
        default=False,
        verbose_name='Es principal',
        help_text='Indica si este es el archivo principal del reporte'
    )
    
    activo = models.BooleanField(
        default=True,
        verbose_name='Activo',
        help_text='Indica si el archivo está activo'
    )
    
    # Timestamps
    fecha_subida = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de subida'
    )
    fecha_actualizada = models.DateTimeField(
        auto_now=True,
        verbose_name='Fecha de actualización'
    )
    
    # Asignar el manager personalizado ANTES de la clase Meta
    objects = ReportArchivoManager()
    
    class Meta:
        db_table = 'report_archivos'
        verbose_name = 'Archivo de Reporte'
        verbose_name_plural = 'Archivos de Reportes'
        ordering = ['orden', 'fecha_subida']
        indexes = [
            models.Index(fields=['reporte', 'activo']),
            models.Index(fields=['tipo_archivo']),
            models.Index(fields=['es_principal']),
            models.Index(fields=['fecha_subida']),
        ]
        constraints = [
            # Solo un archivo principal por reporte
            models.UniqueConstraint(
                fields=['reporte'],
                condition=models.Q(es_principal=True),
                name='unique_principal_per_reporte'
            )
        ]
    
    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        if self.archivo:
            # Validar tamaño según tipo
            max_sizes = {
                'imagen': 5 * 1024 * 1024,      # 5MB
                'video': 100 * 1024 * 1024,     # 100MB
            }
            
            if self.tamaño_bytes > max_sizes.get(self.tipo_archivo, 5 * 1024 * 1024):
                raise ValidationError(f'El archivo {self.tipo_archivo} excede el tamaño máximo permitido')
            
            # Validar extensión según tipo
            extensiones_validas = {
                'imagen': ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'],
                'video': ['mp4', 'avi', 'mov', 'mkv', 'webm']
            }
            
            if self.extension.lower() not in extensiones_validas.get(self.tipo_archivo, []):
                raise ValidationError(f'Extensión {self.extension} no válida para tipo {self.tipo_archivo}')
        
        # Validar límites por reporte
        if hasattr(self, 'reporte') and self.reporte:
            self._validar_limites_archivos()
    
    def _validar_limites_archivos(self):
        """Valida que no se excedan los límites de archivos por reporte"""
        from django.db.models import Count
        
        # Contar archivos existentes del reporte (excluyendo el actual si ya existe)
        queryset = ReportArchivo.objects.filter(reporte=self.reporte, activo=True)
        if self.pk:
            queryset = queryset.exclude(pk=self.pk)
        
        conteo = queryset.aggregate(
            imagenes=Count('id', filter=models.Q(tipo_archivo='imagen')),
            videos=Count('id', filter=models.Q(tipo_archivo='video'))
        )
        
        # Validar límites
        if self.tipo_archivo == 'imagen':
            if conteo['imagenes'] >= 5:
                raise ValidationError('No se pueden agregar más de 5 imágenes por reporte')
        elif self.tipo_archivo == 'video':
            if conteo['videos'] >= 1:
                raise ValidationError('Solo se permite 1 video por reporte')
    
    def save(self, *args, **kwargs):
        """Override save para poblar metadatos automáticamente"""
        if self.archivo and self.archivo.file:
            # Poblar nombre original si no existe
            if not self.nombre_original:
                self.nombre_original = self.archivo.name
            
            # Poblar tamaño
            if not self.tamaño_bytes:
                self.tamaño_bytes = self.archivo.size
            
            # Extraer y poblar extensión
            if not self.extension:
                name, ext = os.path.splitext(self.archivo.name)
                self.extension = ext.lstrip('.').lower() if ext else ''
            
            # Determinar tipo de archivo automáticamente
            if not self.tipo_archivo:
                self.tipo_archivo = self._determinar_tipo_archivo()
            
            # Poblar MIME type
            if not self.mime_type:
                self.mime_type = self._get_mime_type()
        
        # Validar antes de guardar
        self.clean()
        
        super().save(*args, **kwargs)
    
    def _determinar_tipo_archivo(self):
        """Determina el tipo de archivo basado en la extensión"""
        extensiones_imagen = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']
        extensiones_video = ['mp4', 'avi', 'mov', 'mkv', 'webm']
        
        ext = self.extension.lower()
        
        if ext in extensiones_imagen:
            return 'imagen'
        elif ext in extensiones_video:
            return 'video'
        else:
            raise ValidationError(f'Tipo de archivo no permitido: {ext}. Solo se permiten imágenes y videos.')
    
    def _get_mime_type(self):
        """Obtiene el tipo MIME basado en la extensión"""
        mime_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'mp4': 'video/mp4',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            'mkv': 'video/x-matroska',
            'webm': 'video/webm'
        }
        
        return mime_types.get(self.extension.lower(), 'application/octet-stream')
    
    def __str__(self):
        return f"{self.nombre_original} - Reporte #{self.reporte.id}"
    
    @property
    def url(self):
        """Retorna la URL del archivo"""
        if self.archivo:
            return self.archivo.url
        return None
    
    @property
    def tamaño_formateado(self):
        """Retorna el tamaño formateado en KB/MB"""
        if self.tamaño_bytes < 1024:
            return f"{self.tamaño_bytes} B"
        elif self.tamaño_bytes < 1024 * 1024:
            return f"{self.tamaño_bytes / 1024:.1f} KB"
        else:
            return f"{self.tamaño_bytes / (1024 * 1024):.1f} MB"
    
    @property
    def es_imagen(self):
        """Verifica si el archivo es una imagen"""
        return self.tipo_archivo == 'imagen'
    
    @property
    def es_video(self):
        """Verifica si el archivo es un video"""
        return self.tipo_archivo == 'video'
    
    def delete(self, *args, **kwargs):
        """Override delete para eliminar archivo físico"""
        # Nota: La eliminación de archivos físicos se maneja en la vista
        # para mejor control de errores dentro de transacciones
        # Solo eliminamos el registro de BD aquí
        super().delete(*args, **kwargs)


# Alias para compatibilidad con código existente
ReportArchivosModel = ReportArchivo