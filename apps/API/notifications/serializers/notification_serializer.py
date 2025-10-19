from rest_framework import serializers
from notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer para listar notificaciones"""
    
    denuncia_id = serializers.IntegerField(source='denuncia.id', read_only=True, allow_null=True)
    tiempo_transcurrido = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'titulo',
            'mensaje',
            'tipo',
            'leida',
            'denuncia_id',
            'fecha_creacion',
            'fecha_lectura',
            'tiempo_transcurrido'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_lectura']
    
    def get_tiempo_transcurrido(self, obj):
        """Calcula el tiempo transcurrido desde la creación"""
        from django.utils import timezone
        from datetime import timedelta
        
        ahora = timezone.now()
        diferencia = ahora - obj.fecha_creacion
        
        if diferencia < timedelta(minutes=1):
            return "Hace un momento"
        elif diferencia < timedelta(hours=1):
            minutos = int(diferencia.total_seconds() / 60)
            return f"Hace {minutos} minuto{'s' if minutos > 1 else ''}"
        elif diferencia < timedelta(days=1):
            horas = int(diferencia.total_seconds() / 3600)
            return f"Hace {horas} hora{'s' if horas > 1 else ''}"
        elif diferencia < timedelta(days=7):
            dias = diferencia.days
            return f"Hace {dias} día{'s' if dias > 1 else ''}"
        else:
            return obj.fecha_creacion.strftime("%d/%m/%Y")


class NotificationReadSerializer(serializers.Serializer):
    """Serializer para marcar notificación como leída"""
    
    success = serializers.BooleanField(read_only=True)
    message = serializers.CharField(read_only=True)


class NotificationAdminSerializer(serializers.ModelSerializer):
    """Serializer extendido para administradores con información del usuario"""
    
    denuncia_id = serializers.IntegerField(source='denuncia.id', read_only=True, allow_null=True)
    denuncia_titulo = serializers.CharField(source='denuncia.titulo', read_only=True, allow_null=True)
    tiempo_transcurrido = serializers.SerializerMethodField()
    
    # Información del usuario
    usuario_id = serializers.IntegerField(source='usuario.usua_id', read_only=True)
    usuario_nickname = serializers.CharField(source='usuario.usua_nickname', read_only=True)
    usuario_email = serializers.EmailField(source='usuario.email', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'titulo',
            'mensaje',
            'tipo',
            'leida',
            'denuncia_id',
            'denuncia_titulo',
            'fecha_creacion',
            'fecha_lectura',
            'tiempo_transcurrido',
            'usuario_id',
            'usuario_nickname',
            'usuario_email',
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_lectura']
    
    def get_tiempo_transcurrido(self, obj):
        """Calcula el tiempo transcurrido desde la creación"""
        from django.utils import timezone
        from datetime import timedelta
        
        ahora = timezone.now()
        diferencia = ahora - obj.fecha_creacion
        
        if diferencia < timedelta(minutes=1):
            return "Hace un momento"
        elif diferencia < timedelta(hours=1):
            minutos = int(diferencia.total_seconds() / 60)
            return f"Hace {minutos} minuto{'s' if minutos > 1 else ''}"
        elif diferencia < timedelta(days=1):
            horas = int(diferencia.total_seconds() / 3600)
            return f"Hace {horas} hora{'s' if horas > 1 else ''}"
        elif diferencia < timedelta(days=7):
            dias = diferencia.days
            return f"Hace {dias} día{'s' if dias > 1 else ''}"
        else:
            return obj.fecha_creacion.strftime("%d/%m/%Y")

class NotificationCreateSerializer(serializers.Serializer):
    """Serializer para crear notificaciones desde el panel admin"""
    
    usuario_id = serializers.IntegerField(
        required=True,
        help_text="ID del usuario que recibirá la notificación"
    )
    titulo = serializers.CharField(
        required=True,
        max_length=200,
        help_text="Título de la notificación"
    )
    mensaje = serializers.CharField(
        required=True,
        help_text="Mensaje de la notificación"
    )
    tipo = serializers.ChoiceField(
        required=True,
        choices=['info', 'success', 'warning', 'error'],
        help_text="Tipo de notificación"
    )
    denuncia_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="ID del reporte relacionado (opcional)"
    )
    
    def validate_usuario_id(self, value):
        """Valida que el usuario exista"""
        from domain.entities.usuario import Usuario
        try:
            Usuario.objects.get(usua_id=value)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError(f"Usuario con ID {value} no existe")
        return value
    
    def validate_denuncia_id(self, value):
        """Valida que el reporte exista si se proporciona"""
        if value is not None:
            from reports.models import ReportModel
            try:
                ReportModel.objects.get(id=value)
            except ReportModel.DoesNotExist:
                raise serializers.ValidationError(f"Reporte con ID {value} no existe")
        return value
    
    def create(self, validated_data):
        """Crea la notificación"""
        from domain.entities.usuario import Usuario
        from reports.models import ReportModel
        
        usuario = Usuario.objects.get(usua_id=validated_data['usuario_id'])
        denuncia = None
        if validated_data.get('denuncia_id'):
            denuncia = ReportModel.objects.get(id=validated_data['denuncia_id'])
        
        notificacion = Notification.objects.create(
            usuario=usuario,
            titulo=validated_data['titulo'],
            mensaje=validated_data['mensaje'],
            tipo=validated_data['tipo'],
            denuncia=denuncia
        )
        
        return notificacion