from typing import Optional, Dict

class ReportException(Exception):
    pass

class ReportNotFoundException(ReportException):
    def __init__(self, report_id: int):
        self.report_id = report_id
        super().__init__(f"Reporte con ID {report_id} no encontrado")


class ReportValidationException(ReportException):
    def __init__(self, message:Optional[str], errors: Optional[dict] = None):
        self.errors = errors
        super().__init__(f"Errores de validación: {errors}")


class ReportPermissionException(ReportException):
    def __init__(self, message: str = "No tienes permisos"):
        super().__init__(message)
