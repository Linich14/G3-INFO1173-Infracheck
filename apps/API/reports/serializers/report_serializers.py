import os
from rest_framework import serializers
from reports.models import ReportModel, DenunciaEstado
from reports.models.report_archivos import ReportArchivo
from .shared_serializers import CiudadSerializer, TipoDenunciaSerializer, DenunciaEstadoSerializer


class ReportListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listados"""
    usuario_nombre = serializers.CharField(source='usuario.usua_nombre', read_only=True)
    urgencia_display = serializers.SerializerMethodField()
    denuncia_estado_nombre = serializers.CharField(source='denuncia_estado.nombre', read_only=True)
    ciudad_nombre = serializers.CharField(source='ciudad.nombre', read_only=True)
    
    class Meta:
        model = ReportModel
        fields = [
            'id', 'titulo', 'ubicacion', 'urgencia', 'urgencia_display',
            'visible', 'fecha_creacion', 'usuario_nombre', 
            'denuncia_estado_nombre', 'ciudad_nombre'
        ]
    
    def get_urgencia_display(self, obj):
        choices = {1: 'Baja', 2: 'Media', 3: 'Alta'}
        return choices.get(obj.urgencia, 'N/A')


class ReportArchivoSerializer(serializers.ModelSerializer):
    """Serializer para archivos de reportes"""
    url_archivo = serializers.ReadOnlyField()
    tipo_archivo = serializers.ReadOnlyField()
    es_imagen = serializers.ReadOnlyField()
    es_video = serializers.ReadOnlyField()
    
    class Meta:
        model = ReportArchivo
        fields = [
            'dear_id', 'dear_nombre', 'dear_extension', 'dear_es_principal', 
            'dear_orden', 'tipo_archivo', 'url_archivo', 'es_imagen', 'es_video',
            'dear_creado'
        ]


class ReportDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para detalles con estructura estándar"""
    tipoDenuncia = serializers.CharField(source='tipo_denuncia.nombre', read_only=True)
    ubicacion = serializers.SerializerMethodField()
    nivelUrgencia = serializers.SerializerMethodField()
    fecha = serializers.DateTimeField(source='fecha_creacion', read_only=True)
    imagenes = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()
    autor = serializers.CharField(source='usuario.usua_nombre', read_only=True)
    estado = serializers.CharField(source='denuncia_estado.nombre', read_only=True)
    
    class Meta:
        model = ReportModel
        fields = [
            'id', 'titulo', 'descripcion', 'tipoDenuncia', 'ubicacion',
            'nivelUrgencia', 'fecha', 'imagenes', 'video', 'autor', 'estado'
        ]
    
    def get_ubicacion(self, obj):
        """Estructura de ubicación estándar"""
        return {
            'latitud': getattr(obj, 'latitud', -38.7408),
            'longitud': getattr(obj, 'longitud', -72.5987),
            'direccion': obj.ubicacion
        }
    
    def get_nivelUrgencia(self, obj):
        """Mapeo estándar de urgencia"""
        choices = {1: 'Bajo', 2: 'Medio', 3: 'Alto'}
        return choices.get(obj.urgencia, 'Medio')
    
    def get_imagenes(self, obj):
        """Array de información de imágenes ordenadas"""
        extensiones_imagen = ['jpg', 'jpeg', 'png', 'webp']
        imagenes = obj.archivos.filter(
            dear_extension__in=extensiones_imagen
        ).order_by('dear_orden')
        return ReportArchivoSerializer(imagenes, many=True).data
    
    def get_video(self, obj):
        """Información del video"""
        try:
            extensiones_video = ['mp4', 'avi', 'mov', 'mkv', 'webm']
            video = obj.archivos.filter(dear_extension__in=extensiones_video).first()
            if video:
                return ReportArchivoSerializer(video).data
            return None
        except:
            return None


class ReportSerializer(serializers.ModelSerializer):
    """Serializer general para respuestas API"""
    usuario_id = serializers.IntegerField(source='usuario.usua_id', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.usua_nombre', read_only=True)
    denuncia_estado_nombre = serializers.CharField(source='denuncia_estado.nombre', read_only=True)
    tipo_denuncia_nombre = serializers.CharField(source='tipo_denuncia.nombre', read_only=True)
    ciudad_nombre = serializers.CharField(source='ciudad.nombre', read_only=True)
    urgencia_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportModel
        fields = [
            'id', 'titulo', 'descripcion', 'ubicacion', 'visible',
            'urgencia', 'urgencia_display', 'fecha_creacion', 'fecha_actualizacion',
            'usuario_id', 'usuario_nombre', 'denuncia_estado', 'denuncia_estado_nombre',
            'tipo_denuncia', 'tipo_denuncia_nombre', 'ciudad', 'ciudad_nombre'
        ]
    
    def get_urgencia_display(self, obj):
        choices = {1: 'Baja', 2: 'Media', 3: 'Alta'}
        return choices.get(obj.urgencia, 'N/A')


class CreateReportSerializer(serializers.Serializer):
    """Serializer para crear reportes con archivos multimedia"""
    # Datos básicos del reporte
    titulo = serializers.CharField(max_length=200, min_length=3)
    descripcion = serializers.CharField(max_length=1000, min_length=10)
    ubicacion = serializers.CharField(max_length=255, min_length=3)
    urgencia = serializers.ChoiceField(choices=[1, 2, 3])
    denuncia_estado_id = serializers.IntegerField(required=False, default=1)
    tipo_denuncia_id = serializers.IntegerField(min_value=1)
    ciudad_id = serializers.IntegerField(min_value=1)
    
    # Coordenadas geográficas (opcional)
    latitud = serializers.DecimalField(max_digits=10, decimal_places=8, required=False, allow_null=True)
    longitud = serializers.DecimalField(max_digits=11, decimal_places=8, required=False, allow_null=True)
    
    # Archivos multimedia
    imagenes = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        allow_empty=True,
        write_only=True,
        max_length=10,  # Máximo 10 imágenes
        help_text="Máximo 10 imágenes (JPEG, PNG, WebP) de hasta 10MB cada una"
    )
    video = serializers.FileField(
        required=False, 
        allow_null=True,
        help_text="Un video (MP4, AVI, MOV, MKV, WebM) de hasta 100MB"
    )

    class Meta:
        exclude = ['usuario', "usua_id"]

        extra_kwargs = {
            'imagenes': {'write_only': True},
        }
    
    def validate_titulo(self, value):
        """Validar título"""
        if not value.strip():
            raise serializers.ValidationError("El título no puede estar vacío")
        return value.strip()
    
    def validate_descripcion(self, value):
        """Validar descripción"""
        if not value.strip():
            raise serializers.ValidationError("La descripción no puede estar vacía")
        return value.strip()
    
    def validate_ubicacion(self, value):
        """Validar ubicación"""
        if not value.strip():
            raise serializers.ValidationError("La ubicación no puede estar vacía")
        return value.strip()
    
    def validate_denuncia_estado_id(self, value):
        """Validar que el estado existe"""
        if not DenunciaEstado.objects.filter(id=value).exists():
            raise serializers.ValidationError("El estado de denuncia no existe")
        return value
    
    def validate_imagenes(self, value):
        """Validar imágenes con límite de 10"""
        if not value:
            return value
        
        # Validar número máximo de imágenes
        if len(value) > 10:
            raise serializers.ValidationError("Máximo 10 imágenes permitidas")
        
        # Validar cada imagen
        for i, imagen in enumerate(value):
            # Validar tamaño de archivo (máximo 10MB)
            if imagen.size > 10 * 1024 * 1024:
                raise serializers.ValidationError(
                    f"La imagen {i+1} ({imagen.name}) es muy grande. Máximo 10MB permitido."
                )
            
            # Validar tipo de archivo
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp']
            file_extension = os.path.splitext(imagen.name)[1].lower()
            
            if file_extension not in allowed_extensions:
                raise serializers.ValidationError(
                    f"Formato de imagen no válido en archivo {i+1}: {file_extension}. "
                    f"Formatos permitidos: {', '.join(allowed_extensions)}"
                )
        
        return value
    
    def validate_video(self, value):
        """Validar video (máximo 1)"""
        if not value:
            return value
        
        # Validar tamaño de archivo (máximo 100MB)
        if value.size > 100 * 1024 * 1024:
            raise serializers.ValidationError("El video es muy grande. Máximo 100MB permitido.")
        
        # Validar tipo de archivo
        allowed_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
        file_extension = os.path.splitext(value.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"Formato de video no válido: {file_extension}. "
                f"Formatos permitidos: {', '.join(allowed_extensions)}"
            )
        
        return value
    
    def validate(self, attrs):
        """Validaciones generales"""
        # Validar coordenadas
        latitud = attrs.get('latitud')
        longitud = attrs.get('longitud')
        
        if latitud is not None and longitud is not None:
            # Validar rangos de coordenadas
            if not (-90 <= float(latitud) <= 90):
                raise serializers.ValidationError("La latitud debe estar entre -90 y 90")
            if not (-180 <= float(longitud) <= 180):
                raise serializers.ValidationError("La longitud debe estar entre -180 y 180")
        elif latitud is not None or longitud is not None:
            raise serializers.ValidationError("Debe proporcionar tanto latitud como longitud")
        
        return attrs
    
    def create(self, validated_data):
        """Crear reporte con archivos usando la nueva estructura"""
        from reports.services.report_service import ReportService
        
        # Extraer archivos del validated_data
        imagenes = validated_data.pop('imagenes', [])
        video = validated_data.pop('video', None)
        
        # Crear el reporte usando el servicio actualizado
        report_service = ReportService()
        reporte = report_service.create_report_with_files(
            data=validated_data,
            imagenes=imagenes,
            video=video
        )
        
        return reporte


class UpdateReportSerializer(serializers.Serializer):
    """Serializer para actualizar reportes"""
    titulo = serializers.CharField(max_length=200, min_length=3, required=False)
    descripcion = serializers.CharField(max_length=1000, min_length=10, required=False)
    ubicacion = serializers.CharField(max_length=255, min_length=3, required=False)
    urgencia = serializers.ChoiceField(choices=[1, 2, 3], required=False)
    denuncia_estado_id = serializers.IntegerField(min_value=1, required=False)
    tipo_denuncia_id = serializers.IntegerField(min_value=1, required=False)
    
    # Coordenadas geográficas
    latitud = serializers.DecimalField(max_digits=10, decimal_places=8, required=False, allow_null=True)
    longitud = serializers.DecimalField(max_digits=11, decimal_places=8, required=False, allow_null=True)
    
    # Archivos multimedia para agregar
    nuevas_imagenes = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        allow_empty=True,
        max_length=10
    )
    nuevo_video = serializers.FileField(required=False, allow_null=True)
    
    # IDs de archivos a eliminar
    eliminar_imagenes = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True
    )
    eliminar_video = serializers.BooleanField(required=False, default=False)
    
    def validate_nuevas_imagenes(self, value):
        """Validar nuevas imágenes (reutilizar lógica del CreateReportSerializer)"""
        if not value:
            return value
        
        if len(value) > 10:
            raise serializers.ValidationError("Máximo 10 imágenes permitidas")
        
        for imagen in value:
            if imagen.size > 10 * 1024 * 1024:
                raise serializers.ValidationError(
                    f"La imagen {imagen.name} es muy grande. Máximo 10MB permitido."
                )
            
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp']
            file_extension = os.path.splitext(imagen.name)[1].lower()
            
            if file_extension not in allowed_extensions:
                raise serializers.ValidationError(
                    f"Formato de imagen no válido: {file_extension}. "
                    f"Formatos permitidos: {', '.join(allowed_extensions)}"
                )
        
        return value
    
    def validate_nuevo_video(self, value):
        """Validar nuevo video"""
        if not value:
            return value
        
        if value.size > 100 * 1024 * 1024:
            raise serializers.ValidationError("El video es muy grande. Máximo 100MB permitido.")
        
        allowed_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
        file_extension = os.path.splitext(value.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"Formato de video no válido: {file_extension}. "
                f"Formatos permitidos: {', '.join(allowed_extensions)}"
            )
        
        return value


class ManageReportFilesSerializer(serializers.Serializer):
    """Serializer para gestionar archivos individualmente"""
    archivo_id = serializers.IntegerField()
    accion = serializers.ChoiceField(choices=['eliminar', 'principal'])
    
    def validate_archivo_id(self, value):
        """Validar que el archivo existe"""
        if not ReportArchivo.objects.filter(dear_id=value).exists():
            raise serializers.ValidationError("El archivo no existe")
        return value
