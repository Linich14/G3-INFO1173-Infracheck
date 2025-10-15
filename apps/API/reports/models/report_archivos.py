from django.db import models
from reports.models.report import ReportModel


class ReportArchivo(models.Model):
    """Modelo para almacenar archivos multimedia de reportes"""
    
    # Campos principales
    dear_id = models.AutoField(primary_key=True)
    denu = models.ForeignKey(
        ReportModel, 
        on_delete=models.CASCADE, 
        related_name='archivos',
        db_column='denu_id'  # Especifica explícitamente el nombre de la columna en la BD
    )
    
    # Información del archivo
    dear_nombre = models.CharField(
        max_length=255,
        help_text="Nombre del archivo: foto_001.jpg"
    )
    dear_extension = models.CharField(
        max_length=10,
        help_text="Extensión del archivo: jpg, png, mp4"
    )
    dear_es_principal = models.BooleanField(
        default=False,
        help_text="1 = principal, 0 = no"
    )
    dear_orden = models.IntegerField(
        default=0,
        help_text="Orden de visualización: 0, 1, 2, 3..."
    )
    
    # Timestamps
    dear_creado = models.DateTimeField(auto_now_add=True)
    dear_actualizado = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reportes_archivos'
        verbose_name = 'Archivo de Reporte'
        verbose_name_plural = 'Archivos de Reportes'
        ordering = ['dear_orden', 'dear_creado']
        indexes = [
            models.Index(fields=['denu_id']),
            models.Index(fields=['dear_extension']),
            models.Index(fields=['dear_es_principal']),
        ]
    
    def __str__(self):
        return f"{self.dear_nombre} - Reporte #{self.denu_id.id}"
    
    @property
    def es_imagen(self):
        """Verifica si el archivo es una imagen"""
        extensiones_imagen = ['jpg', 'jpeg', 'png', 'webp']
        return self.dear_extension.lower() in extensiones_imagen
    
    @property
    def es_video(self):
        """Verifica si el archivo es un video"""
        extensiones_video = ['mp4', 'avi', 'mov', 'mkv', 'webm']
        return self.dear_extension.lower() in extensiones_video
    
    @property
    def tipo_archivo(self):
        """Retorna el tipo de archivo basado en la extensión"""
        return 'imagen' if self.es_imagen else 'video'
    
    @property
    def url_archivo(self):
        """Genera la URL del archivo"""
        from django.conf import settings
        
        # Generar URL basada en la estructura de carpetas
        fecha_creacion = self.dear_creado.strftime("%d-%m-%Y") if self.dear_creado else "01-01-2024"
        reporte_id = self.denu_id.id
        tipo_carpeta = "images" if self.es_imagen else "videos"
        
        url_path = f"uploads/{fecha_creacion}/id_{reporte_id}/{tipo_carpeta}/{self.dear_nombre}"
        
        if hasattr(settings, 'MEDIA_URL'):
            return f"{settings.MEDIA_URL}{url_path}"
        return f"/media/{url_path}"
    
    @property
    def ruta_completa(self):
        """Genera la ruta completa del archivo en el servidor"""
        from django.conf import settings
        
        fecha_creacion = self.dear_creado.strftime("%d-%m-%Y") if self.dear_creado else "01-01-2024"
        reporte_id = self.denu_id.id
        tipo_carpeta = "images" if self.es_imagen else "videos"
        
        return f"uploads/{fecha_creacion}/id_{reporte_id}/{tipo_carpeta}/{self.dear_nombre}"


class ReportArchivoManager(models.Manager):
    """Manager personalizado para archivos de reportes"""
    
    def imagenes(self):
        """Filtrar solo imágenes"""
        extensiones_imagen = ['jpg', 'jpeg', 'png', 'webp']
        return self.filter(dear_extension__in=extensiones_imagen)
    
    def videos(self):
        """Filtrar solo videos"""
        extensiones_video = ['mp4', 'avi', 'mov', 'mkv', 'webm']
        return self.filter(dear_extension__in=extensiones_video)
    
    def por_reporte(self, reporte_id):
        """Obtener archivos por reporte"""
        return self.filter(denu_id=reporte_id)
    
    def contar_imagenes_por_reporte(self, reporte_id):
        """Contar imágenes de un reporte"""
        extensiones_imagen = ['jpg', 'jpeg', 'png', 'webp']
        return self.filter(
            denu_id=reporte_id, 
            dear_extension__in=extensiones_imagen
        ).count()
    
    def contar_videos_por_reporte(self, reporte_id):
        """Contar videos de un reporte"""
        extensiones_video = ['mp4', 'avi', 'mov', 'mkv', 'webm']
        return self.filter(
            denu_id=reporte_id, 
            dear_extension__in=extensiones_video
        ).count()

# Agregar el manager personalizado
ReportArchivo.objects = ReportArchivoManager()
