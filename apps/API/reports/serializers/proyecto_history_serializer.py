from rest_framework import serializers
from reports.models.proyecto_history import ProyectoHistory
from domain.entities.usuario import Usuario


class ProyectoHistorySerializer(serializers.ModelSerializer):
    """Serializer para el historial de cambios en proyectos"""
    
    usuario_nombre = serializers.SerializerMethodField()
    accion_display = serializers.CharField(source='get_accion_display', read_only=True)
    proyecto_titulo = serializers.CharField(source='proyecto.proy_titulo', read_only=True)
    
    class Meta:
        model = ProyectoHistory
        fields = [
            'id',
            'proyecto',
            'proyecto_titulo',
            'usuario',
            'usuario_nombre',
            'accion',
            'accion_display',
            'campo_modificado',
            'valor_anterior',
            'valor_nuevo',
            'descripcion',
            'fecha',
            'ip_address',
        ]
        read_only_fields = ['id', 'fecha']
    
    def get_usuario_nombre(self, obj):
        """Retorna el nombre completo del usuario que realizó la acción"""
        if obj.usuario:
            return f"{obj.usuario.usua_nombre} {obj.usuario.usua_apellido}"
        return "Sistema"
