from rest_framework import serializers
from reports.models import ReportModel, DenunciaEstado
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


class ReportDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para detalles"""
    usuario_id = serializers.IntegerField(source='usuario.usua_id', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.usua_nombre', read_only=True)
    usuario_email = serializers.CharField(source='usuario.usua_email', read_only=True)
    
    denuncia_estado = DenunciaEstadoSerializer(read_only=True)
    tipo_denuncia = TipoDenunciaSerializer(read_only=True)
    ciudad = CiudadSerializer(read_only=True)
    
    urgencia_display = serializers.SerializerMethodField()
    dias_creacion = serializers.SerializerMethodField()
    es_urgente = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportModel
        fields = [
            'id', 'titulo', 'descripcion', 'ubicacion', 'visible',
            'urgencia', 'urgencia_display', 'fecha_creacion', 'fecha_actualizacion',
            'usuario_id', 'usuario_nombre', 'usuario_email',
            'denuncia_estado', 'tipo_denuncia', 'ciudad',
            'dias_creacion', 'es_urgente'
        ]
    
    def get_urgencia_display(self, obj):
        choices = {1: 'Baja', 2: 'Media', 3: 'Alta'}
        return choices.get(obj.urgencia, 'N/A')
    
    def get_dias_creacion(self, obj):
        if hasattr(obj, 'get_days_since_creation'):
            return obj.get_days_since_creation()
        return 0
    
    def get_es_urgente(self, obj):
        if hasattr(obj, 'is_urgent'):
            return obj.is_urgent()
        return obj.urgencia == 3


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
    """Serializer para crear reportes"""
    titulo = serializers.CharField(max_length=200, min_length=3)
    descripcion = serializers.CharField(max_length=1000, min_length=10)
    ubicacion = serializers.CharField(max_length=255, min_length=3)
    urgencia = serializers.ChoiceField(choices=[1, 2, 3])
    denuncia_estado_id = serializers.IntegerField(required=False, default=1)
    tipo_denuncia_id = serializers.IntegerField(min_value=1)
    ciudad_id = serializers.IntegerField(min_value=1)

    class Meta:
        exclude = ['usuario', "usua_id"]  
    
    def validate_titulo(self, value):
        if not value.strip():
            raise serializers.ValidationError("El título no puede estar vacío")
        return value.strip()
    
    def validate_descripcion(self, value):
        if not value.strip():
            raise serializers.ValidationError("La descripción no puede estar vacía")
        return value.strip()
    
    def validate_ubicacion(self, value):
        if not value.strip():
            raise serializers.ValidationError("La ubicación no puede estar vacía")
        return value.strip()
    
    def validate_denuncia_estado_id(self, value):
        """Validar que el estado existe"""
        if not DenunciaEstado.objects.filter(id=value).exists():
            raise serializers.ValidationError("El estado de denuncia no existe")
        return value


class UpdateReportSerializer(serializers.Serializer):
    """Serializer para actualizar reportes"""
    titulo = serializers.CharField(max_length=200, min_length=3, required=False)
    descripcion = serializers.CharField(max_length=1000, min_length=10, required=False)
    ubicacion = serializers.CharField(max_length=255, min_length=3, required=False)
    urgencia = serializers.ChoiceField(choices=[1, 2, 3], required=False)
    denuncia_estado_id = serializers.IntegerField(min_value=1, required=False)
    tipo_denuncia_id = serializers.IntegerField(min_value=1, required=False)
    
    def validate_titulo(self, value):
        if value is not None and not value.strip():
            raise serializers.ValidationError("El título no puede estar vacío")
        return value.strip() if value else value
    
    def validate_descripcion(self, value):
        if value is not None and not value.strip():
            raise serializers.ValidationError("La descripción no puede estar vacía")
        return value.strip() if value else value
    
    def validate_ubicacion(self, value):
        if value is not None and not value.strip():
            raise serializers.ValidationError("La ubicación no puede estar vacía")
        return value.strip() if value else value
