from rest_framework import serializers
from reports.models.report_history import ReportHistory


class ReportHistorySerializer(serializers.ModelSerializer):
    """Serializer para el historial de reportes"""
    
    accion_display = serializers.CharField(source='get_accion_display', read_only=True)
    usuario_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportHistory
        fields = [
            'id',
            'reporte',
            'usuario',
            'usuario_nombre',
            'accion',
            'accion_display',
            'campo_modificado',
            'valor_anterior',
            'valor_nuevo',
            'descripcion',
            'fecha',
            'ip_address'
        ]
        read_only_fields = fields
    
    def get_usuario_nombre(self, obj):
        """Obtiene el nombre del usuario que realizó la acción"""
        if obj.usuario:
            return f"{obj.usuario.usua_nombre} {obj.usuario.usua_apellido}"
        return "Sistema"
