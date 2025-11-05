"""
Excepciones personalizadas por módulo para InfraCheck API.

Este módulo define clases de excepciones específicas para cada módulo
del sistema, heredando de CustomAPIException con códigos únicos
y mensajes apropiados por dominio.
"""

from infrastructure.exceptions.base import CustomAPIException


# =====================================================
# EXCEPCIONES DE REPORTES
# =====================================================

class ReportError(CustomAPIException):
    """Excepciones relacionadas con reportes/denuncias."""
    default_code = "REP_ERROR"
    default_detail = "Error en la gestión de reportes"


class ReportNotFoundError(ReportError):
    """Error cuando un reporte no existe."""
    status_code = 404
    default_code = "REP404"
    default_detail = "El reporte solicitado no existe"


class ReportValidationError(ReportError):
    """Error de validación en datos de reporte."""
    status_code = 400
    default_code = "REP_VAL"
    default_detail = "Los datos del reporte no son válidos"


class ReportPermissionError(ReportError):
    """Error de permisos en operaciones de reporte."""
    status_code = 403
    default_code = "REP_PERM"
    default_detail = "No tienes permisos para esta operación en el reporte"


class ReportCreationError(ReportError):
    """Error al crear un reporte."""
    status_code = 400
    default_code = "REP_CREATE"
    default_detail = "No se pudo crear el reporte"


class ReportUpdateError(ReportError):
    """Error al actualizar un reporte."""
    status_code = 400
    default_code = "REP_UPDATE"
    default_detail = "No se pudo actualizar el reporte"


class ReportDeleteError(ReportError):
    """Error al eliminar un reporte."""
    status_code = 400
    default_code = "REP_DELETE"
    default_detail = "No se pudo eliminar el reporte"


# =====================================================
# EXCEPCIONES DE PROYECTOS
# =====================================================

class ProjectError(CustomAPIException):
    """Excepciones relacionadas con proyectos."""
    default_code = "PROJ_ERROR"
    default_detail = "Error en la gestión de proyectos"


class ProjectNotFoundError(ProjectError):
    """Error cuando un proyecto no existe."""
    status_code = 404
    default_code = "PROJ404"
    default_detail = "El proyecto solicitado no existe"


class ProjectValidationError(ProjectError):
    """Error de validación en datos de proyecto."""
    status_code = 400
    default_code = "PROJ_VAL"
    default_detail = "Los datos del proyecto no son válidos"


class ProjectPermissionError(ProjectError):
    """Error de permisos en operaciones de proyecto."""
    status_code = 403
    default_code = "PROJ_PERM"
    default_detail = "No tienes permisos para esta operación en el proyecto"


class ProjectCreationError(ProjectError):
    """Error al crear un proyecto."""
    status_code = 400
    default_code = "PROJ_CREATE"
    default_detail = "No se pudo crear el proyecto"


class ProjectUpdateError(ProjectError):
    """Error al actualizar un proyecto."""
    status_code = 400
    default_code = "PROJ_UPDATE"
    default_detail = "No se pudo actualizar el proyecto"


# =====================================================
# EXCEPCIONES DE USUARIOS
# =====================================================

class UserError(CustomAPIException):
    """Excepciones relacionadas con usuarios."""
    default_code = "USER_ERROR"
    default_detail = "Error en la gestión de usuarios"


class UserNotFoundError(UserError):
    """Error cuando un usuario no existe."""
    status_code = 404
    default_code = "USER404"
    default_detail = "El usuario solicitado no existe"


class UserValidationError(UserError):
    """Error de validación en datos de usuario."""
    status_code = 400
    default_code = "USER_VAL"
    default_detail = "Los datos del usuario no son válidos"


class UserAuthenticationError(UserError):
    """Error de autenticación."""
    status_code = 401
    default_code = "USER_AUTH"
    default_detail = "Error de autenticación"


class UserPermissionError(UserError):
    """Error de permisos de usuario."""
    status_code = 403
    default_code = "USER_PERM"
    default_detail = "No tienes permisos para esta operación"


class UserRegistrationError(UserError):
    """Error en registro de usuario."""
    status_code = 400
    default_code = "USER_REG"
    default_detail = "No se pudo registrar el usuario"


class UserProfileError(UserError):
    """Error en gestión de perfil de usuario."""
    status_code = 400
    default_code = "USER_PROFILE"
    default_detail = "Error en la gestión del perfil de usuario"


# =====================================================
# EXCEPCIONES DE NOTIFICACIONES
# =====================================================

class NotificationError(CustomAPIException):
    """Excepciones relacionadas con notificaciones."""
    default_code = "NOTIF_ERROR"
    default_detail = "Error en la gestión de notificaciones"


class NotificationNotFoundError(NotificationError):
    """Error cuando una notificación no existe."""
    status_code = 404
    default_code = "NOTIF404"
    default_detail = "La notificación solicitada no existe"


class NotificationValidationError(NotificationError):
    """Error de validación en datos de notificación."""
    status_code = 400
    default_code = "NOTIF_VAL"
    default_detail = "Los datos de la notificación no son válidos"


class NotificationSendError(NotificationError):
    """Error al enviar una notificación."""
    status_code = 500
    default_code = "NOTIF_SEND"
    default_detail = "No se pudo enviar la notificación"


class NotificationPermissionError(NotificationError):
    """Error de permisos en operaciones de notificación."""
    status_code = 403
    default_code = "NOTIF_PERM"
    default_detail = "No tienes permisos para esta operación con la notificación"


# =====================================================
# EXCEPCIONES DE AUTENTICACIÓN
# =====================================================

class AuthenticationError(CustomAPIException):
    """Excepciones relacionadas con autenticación."""
    default_code = "AUTH_ERROR"
    default_detail = "Error de autenticación"


class TokenExpiredError(AuthenticationError):
    """Error cuando un token ha expirado."""
    status_code = 401
    default_code = "AUTH_TOKEN_EXP"
    default_detail = "El token de autenticación ha expirado"


class TokenInvalidError(AuthenticationError):
    """Error cuando un token es inválido."""
    status_code = 401
    default_code = "AUTH_TOKEN_INV"
    default_detail = "El token de autenticación es inválido"


class LoginError(AuthenticationError):
    """Error en proceso de login."""
    status_code = 401
    default_code = "AUTH_LOGIN"
    default_detail = "Credenciales de acceso incorrectas"


class PasswordResetError(AuthenticationError):
    """Error en restablecimiento de contraseña."""
    status_code = 400
    default_code = "AUTH_PASS_RESET"
    default_detail = "Error en el restablecimiento de contraseña"


# =====================================================
# EXCEPCIONES DE VALIDACIÓN GENERAL
# =====================================================

class ValidationError(CustomAPIException):
    """Excepciones de validación general."""
    status_code = 400
    default_code = "VALIDATION_ERROR"
    default_detail = "Los datos proporcionados no son válidos"


class RequiredFieldError(ValidationError):
    """Error cuando un campo requerido falta."""
    default_code = "VALIDATION_REQ"
    default_detail = "Campo requerido faltante"


class InvalidFormatError(ValidationError):
    """Error cuando un campo tiene formato inválido."""
    default_code = "VALIDATION_FMT"
    default_detail = "Formato de campo inválido"


class DataIntegrityError(CustomAPIException):
    """Error de integridad de datos."""
    status_code = 400
    default_code = "DATA_INTEGRITY"
    default_detail = "Error de integridad de datos"


# =====================================================
# EXCEPCIONES DE SISTEMA
# =====================================================

class SystemError(CustomAPIException):
    """Excepciones del sistema."""
    status_code = 500
    default_code = "SYSTEM_ERROR"
    default_detail = "Error interno del sistema"


class DatabaseError(SystemError):
    """Error de base de datos."""
    default_code = "DB_ERROR"
    default_detail = "Error en la base de datos"


class ExternalServiceError(SystemError):
    """Error en servicios externos."""
    default_code = "EXT_SERVICE_ERROR"
    default_detail = "Error en servicio externo"


class ConfigurationError(SystemError):
    """Error de configuración."""
    status_code = 500
    default_code = "CONFIG_ERROR"
    default_detail = "Error de configuración del sistema"