from typing import Dict, List
from reports.models import DenunciaEstado, TipoDenuncia, Ciudad
from reports.exceptions import ReportValidationException


class ValidationService:
    """Servicio para validaciones de negocio"""
    
    def validate_report_data(self, data: Dict) -> Dict:
        """Valida datos de reporte"""
        errors = {}
        
        # Validar urgencia
        urgencia = data.get('urgencia')
        if urgencia and urgencia not in [1, 2, 3]:
            errors['urgencia'] = "Debe ser 1 (Baja), 2 (Media) o 3 (Alta)"
        
        # Validar longitudes
        titulo = data.get('titulo', '')
        if titulo and len(titulo.strip()) < 3:
            errors['titulo'] = "Debe tener al menos 3 caracteres"
        
        descripcion = data.get('descripcion', '')
        if descripcion and len(descripcion.strip()) < 10:
            errors['descripcion'] = "Debe tener al menos 10 caracteres"
        
        return errors
    
    def validate_foreign_keys(self, data: Dict) -> Dict:
        """Valida que existan las claves foráneas"""
        errors = {}
        
        # Validar denuncia_estado_id
        denuncia_estado_id = data.get('denuncia_estado_id')
        if denuncia_estado_id:
            if not DenunciaEstado.objects.filter(id=denuncia_estado_id).exists():
                errors['denuncia_estado_id'] = "El estado de denuncia no existe"
        
        # Validar tipo_denuncia_id
        tipo_denuncia_id = data.get('tipo_denuncia_id')
        if tipo_denuncia_id:
            if not TipoDenuncia.objects.filter(id=tipo_denuncia_id).exists():
                errors['tipo_denuncia_id'] = "El tipo de denuncia no existe"
        
        # Validar ciudad_id
        ciudad_id = data.get('ciudad_id')
        if ciudad_id:
            if not Ciudad.objects.filter(id=ciudad_id).exists():
                errors['ciudad_id'] = "La ciudad no existe"
        
        return errors
    
    def validate_user_exists(self, usuario_id: int) -> bool:
        """Valida que el usuario exista"""
        try:
            from domain.entities.usuario import Usuario
            return Usuario.objects.filter(usua_id=usuario_id).exists()
        except ImportError:
            # Si no tienes el modelo Usuario importado de esa forma
            return True  # Por ahora asumimos que existe
    
    def check_duplicate_report(self, usuario_id: int, titulo: str, ubicacion: str) -> bool:
        """Verifica si existe un reporte duplicado reciente"""
        from datetime import timedelta
        from django.utils import timezone
        from reports.models import ReportModel
        
        cutoff = timezone.now() - timedelta(hours=24)
        
        return ReportModel.objects.filter(
            usuario__usua_id=usuario_id,
            titulo__iexact=titulo.strip(),
            ubicacion__iexact=ubicacion.strip(),
            fecha_creacion__gte=cutoff
        ).exists()


# Instancia del servicio
validation_service = ValidationService()
