"""
Ejemplos de uso de las excepciones específicas por módulo.

Este archivo demuestra cómo usar las excepciones personalizadas
en diferentes escenarios de la API de InfraCheck.
"""

from infrastructure.exceptions import (
    # Reportes
    ReportNotFoundError, ReportValidationError, ReportPermissionError,

    # Proyectos
    ProjectNotFoundError, ProjectValidationError,

    # Usuarios
    UserNotFoundError, UserAuthenticationError, UserPermissionError,

    # Notificaciones
    NotificationSendError,

    # Validación general
    ValidationError, RequiredFieldError,

    # Sistema
    DatabaseError, ExternalServiceError, DataIntegrityError,
)
from smtplib import SMTPException
from django.db import IntegrityError, OperationalError
# import requests  # Se importa dentro de la función para evitar errores de linting


# =====================================================
# EJEMPLOS DE USO EN VISTAS
# =====================================================

def ejemplo_vista_reportes():
    """
    Ejemplo de uso de excepciones en una vista de reportes.
    """
    # Variables de ejemplo (en código real vendrían de la request)
    current_user = {"id": 1, "role": "user"}
    report_data = {"title": "Reporte inválido"}

    # Simular búsqueda de reporte
    report_id = 123
    # report = Report.objects.get(id=report_id)  # Esto podría fallar

    # Si no se encuentra el reporte
    if not report_exists(report_id):
        raise ReportNotFoundError(
            message=f"El reporte con ID {report_id} no existe"
        )

    # Validación de permisos
    if not user_can_access_report(current_user, report_id):
        raise ReportPermissionError(
            message="No tienes permisos para acceder a este reporte"
        )

    # Validación de datos
    if not validate_report_data(report_data):
        raise ReportValidationError(
            message="Los datos del reporte contienen errores de validación"
        )


def ejemplo_vista_proyectos():
    """
    Ejemplo de uso de excepciones en una vista de proyectos.
    """
    # Variables de ejemplo (en código real vendrían de la request)
    request_data = {"name": "Proyecto", "location": "Santiago"}  # description faltante

    project_id = 456

    # Verificar existencia del proyecto
    if not project_exists(project_id):
        raise ProjectNotFoundError(
            message=f"El proyecto con ID {project_id} no fue encontrado"
        )

    # Validar datos de entrada
    required_fields = ['name', 'description', 'location']
    missing_fields = [field for field in required_fields if field not in request_data]

    if missing_fields:
        raise RequiredFieldError(
            message=f"Campos requeridos faltantes: {', '.join(missing_fields)}"
        )

    # Validación específica del proyecto
    if not validate_project_data(request_data):
        raise ProjectValidationError(
            message="Los datos del proyecto no cumplen con los requisitos"
        )


def ejemplo_vista_usuarios():
    """
    Ejemplo de uso de excepciones en una vista de usuarios.
    """
    # Variables de ejemplo (en código real vendrían de la request)
    request = {"user": {"id": 1}, "headers": {"authorization": "Bearer token"}}
    current_user = {"id": 1, "role": "user"}

    user_id = 789

    # Verificar existencia del usuario
    if not user_exists(user_id):
        raise UserNotFoundError(
            message=f"El usuario con ID {user_id} no existe"
        )

    # Verificar autenticación
    if not is_authenticated(request):
        raise UserAuthenticationError(
            message="Debes estar autenticado para acceder a esta función"
        )

    # Verificar permisos
    if not has_admin_permissions(current_user):
        raise UserPermissionError(
            message="Se requieren permisos de administrador"
        )


def ejemplo_servicio_notificaciones():
    """
    Ejemplo de uso de excepciones en un servicio de notificaciones.
    """
    # Variables de ejemplo
    user_email = "user@example.com"
    message = "Notificación importante"

    try:
        # Intentar enviar notificación
        send_notification_email(user_email, message)
    except SMTPException as e:
        # Convertir error de sistema a error específico de la aplicación
        raise NotificationSendError(
            message="No se pudo enviar la notificación por email",
            detail=f"Error SMTP: {str(e)}"
        )


def ejemplo_middleware_base_datos():
    """
    Ejemplo de manejo de errores de base de datos.
    """
    # Variable de ejemplo
    data = {"name": "Proyecto", "status": "active"}

    try:
        # Operación de base de datos
        save_to_database(data)
    except IntegrityError as e:
        raise DataIntegrityError(
            message="Error de integridad en la base de datos",
            detail=f"Violación de restricción: {str(e)}"
        )
    except OperationalError as e:
        raise DatabaseError(
            message="Error de conexión con la base de datos",
            detail=f"Error operativo: {str(e)}"
        )


def ejemplo_servicio_externo():
    """
    Ejemplo de manejo de errores en servicios externos.
    """
    # Variables de ejemplo (en código real vendrían de parámetros)
    endpoint = "https://api.example.com/data"
    data = {"key": "value"}

    try:
        import requests  # Importar aquí para evitar errores de linting
    except ImportError:
        # Fallback si requests no está disponible
        requests = None

    try:
        # Llamada a API externa
        response = call_external_api(endpoint, data)
        return response
    except Exception as e:  # Usar Exception genérica si requests no está disponible
        if requests and isinstance(e, requests.exceptions.Timeout):
            raise ExternalServiceError(
                message="El servicio externo no responde",
                detail="Timeout en la conexión al servicio externo"
            )
        elif requests and isinstance(e, requests.exceptions.ConnectionError):
            raise ExternalServiceError(
                message="No se puede conectar al servicio externo",
                detail="Error de conexión de red"
            )
        else:
            # Fallback para cuando requests no está disponible
            raise ExternalServiceError(
                message="Error en servicio externo",
                detail=f"Error desconocido: {str(e)}"
            )


# =====================================================
# FUNCIONES AUXILIARES (SIMULADAS)
# =====================================================

def report_exists(report_id):
    """Simula verificación de existencia de reporte."""
    return False  # Simular que no existe

def user_can_access_report(user, report_id):
    """Simula verificación de permisos."""
    return False  # Simular falta de permisos

def validate_report_data(data):
    """Simula validación de datos."""
    return False  # Simular datos inválidos

def project_exists(project_id):
    """Simula verificación de existencia de proyecto."""
    return False

def validate_project_data(data):
    """Simula validación de datos de proyecto."""
    return False

def user_exists(user_id):
    """Simula verificación de existencia de usuario."""
    return False

def is_authenticated(request):
    """Simula verificación de autenticación."""
    return False

def has_admin_permissions(user):
    """Simula verificación de permisos de admin."""
    return False

def send_notification_email(email, message):
    """Simula envío de email."""
    from smtplib import SMTPException
    raise SMTPException("Error de SMTP simulado")

def save_to_database(data):
    """Simula guardado en base de datos."""
    from django.db import IntegrityError
    raise IntegrityError("Violación de restricción única")

def call_external_api(endpoint, data):
    """Simula llamada a API externa."""
    import requests
    raise requests.exceptions.Timeout("Timeout simulado")


# =====================================================
# EJEMPLO DE RESPUESTA JSON GENERADA
# =====================================================

def ejemplo_respuesta_json():
    """
    Muestra cómo se vería una respuesta JSON de error.
    """
    try:
        ejemplo_vista_reportes()
    except ReportNotFoundError as e:
        # La respuesta JSON se vería así:
        response = e.get_error_response()
        print("Respuesta JSON de error:")
        print(response)
        """
        {
            "error": {
                "code": "REP404",
                "message": "El reporte con ID 123 no existe",
                "detail": "El reporte solicitado no existe",
                "timestamp": "2024-01-15T10:30:45.123456+00:00",
                "trace_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                "status_code": 404
            }
        }
        """


if __name__ == "__main__":
    # Ejecutar ejemplo de respuesta JSON
    ejemplo_respuesta_json()