from rest_framework import serializers
from reports.models import Notification


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
