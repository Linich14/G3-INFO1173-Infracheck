from rest_framework import serializers
from reports.models import ProyectoModel, ProyectoArchivosModel, ReportModel
from datetime import date


# ==================== SERIALIZERS DE ARCHIVOS ====================

class ProyectoArchivoSerializer(serializers.ModelSerializer):
    """Serializer para archivos del proyecto"""
    
    tipo_display = serializers.CharField(source='get_proar_tipo_display', read_only=True)
    extension = serializers.SerializerMethodField()
    
    class Meta:
        model = ProyectoArchivosModel
        fields = [
            'proar_id', 'proar_tipo', 'tipo_display', 'proar_contenido_tipo', 
            'proar_mime', 'proar_nombre_archivo', 'proar_ruta',
            'proar_visible', 'proar_creado', 'extension'
        ]
        read_only_fields = ['proar_id', 'proar_creado']
    
    def get_extension(self, obj):
        return obj.get_extension()


class CreateProyectoArchivoSerializer(serializers.Serializer):
    """Serializer para crear archivos"""
    
    proar_tipo = serializers.ChoiceField(
        choices=['imagen', 'documento', 'video', 'plano', 'otro']
    )
    proar_contenido_tipo = serializers.CharField(max_length=100)
    proar_mime = serializers.CharField(max_length=100)
    proar_nombre_archivo = serializers.CharField(max_length=255)
    proar_ruta = serializers.CharField(max_length=500)
    proar_visible = serializers.IntegerField(default=1, required=False)
    
    def validate_proar_nombre_archivo(self, value):
        if not value.strip():
            raise serializers.ValidationError("El nombre del archivo no puede estar vacío")
        return value.strip()
    
    def validate_proar_ruta(self, value):
        if not value.strip():
            raise serializers.ValidationError("La ruta no puede estar vacía")
        return value.strip()


# ==================== SERIALIZERS DE PROYECTOS ====================

class CreateProyectoSerializer(serializers.Serializer):
    """Serializer para crear proyectos"""
    
    proy_titulo = serializers.CharField(max_length=50, min_length=3)
    proy_descripcion = serializers.CharField(min_length=20)
    proy_estado = serializers.ChoiceField(
        choices=[1, 2, 3, 4, 5, 6, 7],
        default=1,
        required=False
    )
    denu_id = serializers.IntegerField(min_value=1)
    
    # Campos adicionales del frontend
    proy_lugar = serializers.CharField(max_length=255, required=False, allow_blank=True)
    proy_prioridad = serializers.ChoiceField(
        choices=[1, 2, 3],
        default=1,
        required=False
    )
    proy_fecha_inicio_estimada = serializers.DateField(required=False, allow_null=True)
    proy_tipo_denuncia = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )
    
    # Archivos opcionales
    archivos = CreateProyectoArchivoSerializer(many=True, required=False)
    
    def validate_proy_titulo(self, value):
        if not value.strip():
            raise serializers.ValidationError("El título no puede estar vacío")
        if len(value) > 50:
            raise serializers.ValidationError("El título no puede exceder 50 caracteres")
        return value.strip()
    
    def validate_proy_descripcion(self, value):
        if not value.strip():
            raise serializers.ValidationError("La descripción no puede estar vacía")
        if len(value) < 20:
            raise serializers.ValidationError("La descripción debe tener al menos 20 caracteres")
        return value.strip()
    
    def validate_denu_id(self, value):
        """Validar que la denuncia existe"""
        if not ReportModel.objects.filter(id=value).exists():
            raise serializers.ValidationError("La denuncia no existe")
        return value
    
    def validate_proy_fecha_inicio_estimada(self, value):
        """Validar que la fecha no sea pasada"""
        if value and value < date.today():
            raise serializers.ValidationError("La fecha de inicio no puede ser anterior a hoy")
        return value


class UpdateProyectoSerializer(serializers.Serializer):
    """Serializer para actualizar proyectos"""
    
    proy_titulo = serializers.CharField(max_length=50, min_length=3, required=False)
    proy_descripcion = serializers.CharField(min_length=20, required=False)
    proy_estado = serializers.ChoiceField(
        choices=[1, 2, 3, 4, 5, 6, 7],
        required=False
    )
    proy_lugar = serializers.CharField(max_length=255, required=False)
    proy_prioridad = serializers.ChoiceField(choices=[1, 2, 3], required=False)
    proy_fecha_inicio_estimada = serializers.DateField(required=False, allow_null=True)
    proy_tipo_denuncia = serializers.CharField(max_length=100, required=False)
    proy_visible = serializers.IntegerField(required=False)
    
    def validate_proy_titulo(self, value):
        if value is not None and not value.strip():
            raise serializers.ValidationError("El título no puede estar vacío")
        return value.strip() if value else value
    
    def validate_proy_descripcion(self, value):
        if value is not None:
            if not value.strip():
                raise serializers.ValidationError("La descripción no puede estar vacía")
            if len(value.strip()) < 20:
                raise serializers.ValidationError("La descripción debe tener al menos 20 caracteres")
        return value.strip() if value else value


class ProyectoListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listados"""
    
    lugar = serializers.CharField(source='proy_lugar', read_only=True)
    estado = serializers.CharField(source='get_estado_display_custom', read_only=True)
    color = serializers.CharField(source='get_color_estado', read_only=True)
    prioridad = serializers.CharField(source='get_prioridad_display', read_only=True)
    reportesAsociados = serializers.IntegerField(source='get_reportes_asociados_count', read_only=True)
    votosAFavor = serializers.IntegerField(source='get_votos_a_favor', read_only=True)
    tipoDenuncia = serializers.CharField(source='proy_tipo_denuncia', read_only=True)
    fechaCreacion = serializers.DateTimeField(source='proy_creado', read_only=True)
    
    # Campos originales
    id = serializers.IntegerField(source='proy_id', read_only=True)
    titulo = serializers.CharField(source='proy_titulo', read_only=True)
    descripcion = serializers.CharField(source='proy_descripcion', read_only=True)
    
    class Meta:
        model = ProyectoModel
        fields = [
            'id', 'lugar', 'estado', 'color', 'prioridad',
            'reportesAsociados', 'votosAFavor', 'tipoDenuncia',
            'fechaCreacion', 'titulo', 'descripcion'
        ]


class ProyectoDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para detalles de proyectos"""
    
    archivos = ProyectoArchivoSerializer(many=True, read_only=True)
    
    # Campos para el frontend (formato camelCase)
    id = serializers.IntegerField(source='proy_id', read_only=True)
    lugar = serializers.CharField(source='proy_lugar', read_only=True)
    estado = serializers.CharField(source='get_estado_display_custom', read_only=True)
    color = serializers.CharField(source='get_color_estado', read_only=True)
    prioridad = serializers.CharField(source='get_prioridad_display', read_only=True)
    reportesAsociados = serializers.IntegerField(source='get_reportes_asociados_count', read_only=True)
    votosAFavor = serializers.IntegerField(source='get_votos_a_favor', read_only=True)
    tipoDenuncia = serializers.CharField(source='proy_tipo_denuncia', read_only=True)
    fechaCreacion = serializers.DateTimeField(source='proy_creado', read_only=True)
    nombreProyecto = serializers.CharField(source='proy_titulo', read_only=True)
    descripcion = serializers.CharField(source='proy_descripcion', read_only=True)
    fechaInicioEstimada = serializers.DateField(source='proy_fecha_inicio_estimada', read_only=True)
    
    # Información de la denuncia asociada
    denuncia_id = serializers.IntegerField(source='denu_id.id', read_only=True)
    denuncia_titulo = serializers.CharField(source='denu_id.titulo', read_only=True)
    denuncia_ubicacion = serializers.CharField(source='denu_id.ubicacion', read_only=True)
    
    # Campos adicionales
    dias_desde_creacion = serializers.SerializerMethodField()
    es_completado = serializers.SerializerMethodField()
    total_archivos = serializers.IntegerField(source='get_total_archivos', read_only=True)
    
    class Meta:
        model = ProyectoModel
        fields = [
            'id', 'lugar', 'estado', 'color', 'prioridad',
            'reportesAsociados', 'votosAFavor', 'tipoDenuncia',
            'fechaCreacion', 'nombreProyecto', 'descripcion',
            'fechaInicioEstimada', 'denuncia_id', 'denuncia_titulo',
            'denuncia_ubicacion', 'archivos', 'dias_desde_creacion',
            'es_completado', 'total_archivos'
        ]
    
    def get_dias_desde_creacion(self, obj):
        return obj.get_days_since_creation()
    
    def get_es_completado(self, obj):
        return obj.is_completado()


class ProyectoReportSerializer(serializers.ModelSerializer):
    """Serializer para reportes asociados a un proyecto"""
    
    id = serializers.IntegerField(read_only=True)
    titulo = serializers.CharField(read_only=True)
    descripcion = serializers.CharField(read_only=True)
    fecha = serializers.DateTimeField(source='fecha_creacion', read_only=True)
    usuario = serializers.CharField(source='usuario.usua_nombre', read_only=True)
    votos = serializers.SerializerMethodField()
    ubicacionEspecifica = serializers.CharField(source='ubicacion', read_only=True)
    fechaCreacion = serializers.DateTimeField(source='fecha_creacion', read_only=True)
    
    class Meta:
        model = ReportModel
        fields = [
            'id', 'titulo', 'descripcion', 'fecha', 'usuario',
            'votos', 'ubicacionEspecifica', 'fechaCreacion'
        ]
    
    def get_votos(self, obj):
        # Placeholder: implementar lógica de votos si existe
        return 0
