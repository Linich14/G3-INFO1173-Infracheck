"""
Sistema de excepciones personalizadas para InfraCheck API.

Este módulo proporciona una estructura consistente para el manejo de errores
en toda la aplicación, facilitando el debugging y tracking de problemas.
"""

# Excepción base
from .base import CustomAPIException

# Excepciones específicas por módulo
from .specific import (
    # Reportes
    ReportError,
    ReportNotFoundError,
    ReportValidationError,
    ReportPermissionError,
    ReportCreationError,
    ReportUpdateError,
    ReportDeleteError,

    # Proyectos
    ProjectError,
    ProjectNotFoundError,
    ProjectValidationError,
    ProjectPermissionError,
    ProjectCreationError,
    ProjectUpdateError,

    # Usuarios
    UserError,
    UserNotFoundError,
    UserValidationError,
    UserAuthenticationError,
    UserPermissionError,
    UserRegistrationError,
    UserProfileError,

    # Notificaciones
    NotificationError,
    NotificationNotFoundError,
    NotificationValidationError,
    NotificationSendError,
    NotificationPermissionError,

    # Autenticación
    AuthenticationError,
    TokenExpiredError,
    TokenInvalidError,
    LoginError,
    PasswordResetError,

    # Validación general
    ValidationError,
    RequiredFieldError,
    InvalidFormatError,
    DataIntegrityError,

    # Sistema
    SystemError,
    DatabaseError,
    ExternalServiceError,
    ConfigurationError,
)

__all__ = [
    # Base
    "CustomAPIException",

    # Reportes
    "ReportError",
    "ReportNotFoundError",
    "ReportValidationError",
    "ReportPermissionError",
    "ReportCreationError",
    "ReportUpdateError",
    "ReportDeleteError",

    # Proyectos
    "ProjectError",
    "ProjectNotFoundError",
    "ProjectValidationError",
    "ProjectPermissionError",
    "ProjectCreationError",
    "ProjectUpdateError",

    # Usuarios
    "UserError",
    "UserNotFoundError",
    "UserValidationError",
    "UserAuthenticationError",
    "UserPermissionError",
    "UserRegistrationError",
    "UserProfileError",

    # Notificaciones
    "NotificationError",
    "NotificationNotFoundError",
    "NotificationValidationError",
    "NotificationSendError",
    "NotificationPermissionError",

    # Autenticación
    "AuthenticationError",
    "TokenExpiredError",
    "TokenInvalidError",
    "LoginError",
    "PasswordResetError",

    # Validación general
    "ValidationError",
    "RequiredFieldError",
    "InvalidFormatError",
    "DataIntegrityError",

    # Sistema
    "SystemError",
    "DatabaseError",
    "ExternalServiceError",
    "ConfigurationError",
]