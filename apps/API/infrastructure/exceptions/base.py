"""
Clase base para excepciones personalizadas de InfraCheck API.

Esta clase proporciona una estructura consistente para todos los errores de la API,
con información detallada para debugging y tracking mejorado.
"""

from rest_framework.exceptions import APIException
from datetime import datetime, timezone
import uuid
from typing import Dict, Any, Union, Optional


class CustomAPIException(APIException):
    """
    Clase base para todas las excepciones personalizadas de la API.

    Proporciona estructura consistente con tracking y logging mejorado,
    facilitando el debugging y monitoreo de errores en producción.

    Ejemplos de uso:

    # Uso básico
    raise CustomAPIException(
        message="El reporte no pudo ser creado",
        code="REP001",
        detail="El campo 'ubicacion' es requerido",
        status_code=400
    )

    # Uso en vista
    @api_view(['GET'])
    def get_report(request, report_id):
        try:
            report = Report.objects.get(id=report_id)
            return Response(data)
        except Report.DoesNotExist:
            raise CustomAPIException(
                message="Reporte no encontrado",
                code="REP404",
                detail=f"No existe reporte con ID {report_id}",
                status_code=404
            )

    # Herencia para excepciones específicas
    class ReportNotFoundError(CustomAPIException):
        status_code = 404
        default_code = "REP404"
        default_detail = "El reporte solicitado no existe"
    """

    # Valores por defecto
    status_code = 400
    default_code = "API_ERROR"
    default_detail = "Ha ocurrido un error en la API"

    def __init__(
        self,
        message: Optional[str] = None,
        code: Optional[str] = None,
        detail: Optional[Union[str, Dict[str, Any]]] = None,
        status_code: Optional[int] = None
    ) -> None:
        """
        Inicializa la excepción personalizada.

        Args:
            message: Mensaje legible para humanos en español
            code: Código único de error (ej: "AUTH001", "REP001")
            detail: Información adicional del error (string o dict)
            status_code: Código HTTP (400, 404, 500, etc.)
        """
        # Generar timestamp y trace_id automáticamente
        self.timestamp = datetime.now(timezone.utc)
        self.trace_id = str(uuid.uuid4())

        # Asignar valores con defaults
        self.code = code or self.default_code

        # El message se pasa como detail a la clase padre
        # y también se guarda en self.message para compatibilidad
        self.message = message or self.default_detail

        # Llamar al constructor padre con los parámetros estándar de DRF
        super().__init__(detail=self.message, code=self.code)

        # Guardar el detail original después de llamar al padre
        # para evitar conflictos con el atributo detail de DRF
        self._custom_detail = detail or self.default_detail

        # Sobrescribir status_code si se proporciona
        if status_code is not None:
            self.status_code = status_code

    def get_full_details(self) -> Dict[str, Any]:
        """
        Retorna un diccionario completo con toda la información del error.

        Returns:
            Dict con todos los campos del error formateados para JSON
        """
        return {
            "code": self.code,
            "message": self.message,
            "detail": self._custom_detail,  # Usar el detail personalizado
            "timestamp": self.timestamp.isoformat(),
            "trace_id": self.trace_id,
            "status_code": self.status_code
        }

    def get_error_response(self) -> Dict[str, Any]:
        """
        Retorna la estructura de respuesta JSON estándar para errores.

        Returns:
            Dict con estructura {"error": {...}} para respuestas API
        """
        return {
            "error": self.get_full_details()
        }

    def __str__(self) -> str:
        """
        Representación legible del error para logging y debugging.

        Returns:
            String con información esencial del error
        """
        return f"[{self.code}] {self.message} (Trace: {self.trace_id})"

    def __repr__(self) -> str:
        """
        Representación detallada para desarrollo y debugging.

        Returns:
            String con toda la información del error
        """
        return (
            f"CustomAPIException("
            f"code='{self.code}', "
            f"message='{self.message}', "
            f"status_code={self.status_code}, "
            f"trace_id='{self.trace_id}'"
            f")"
        )