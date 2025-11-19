"""
Pruebas unitarias para excepciones específicas por módulo.

Este módulo prueba todas las excepciones específicas que heredan
de CustomAPIException, verificando códigos únicos, status codes
y mensajes apropiados.
"""

import pytest
from infrastructure.exceptions import (
    # Base
    CustomAPIException,

    # Reportes
    ReportError, ReportNotFoundError, ReportValidationError,
    ReportPermissionError, ReportCreationError, ReportUpdateError,
    ReportDeleteError,

    # Proyectos
    ProjectError, ProjectNotFoundError, ProjectValidationError,
    ProjectPermissionError, ProjectCreationError, ProjectUpdateError,

    # Usuarios
    UserError, UserNotFoundError, UserValidationError,
    UserAuthenticationError, UserPermissionError, UserRegistrationError,
    UserProfileError,

    # Notificaciones
    NotificationError, NotificationNotFoundError, NotificationValidationError,
    NotificationSendError, NotificationPermissionError,

    # Autenticación
    AuthenticationError, TokenExpiredError, TokenInvalidError,
    LoginError, PasswordResetError,

    # Validación general
    ValidationError, RequiredFieldError, InvalidFormatError,
    DataIntegrityError,

    # Sistema
    SystemError, DatabaseError, ExternalServiceError, ConfigurationError,
)


class TestReportExceptions:
    """Pruebas para excepciones de reportes."""

    def test_report_error_base(self):
        """Test ReportError base class."""
        error = ReportError()
        assert error.default_code == "REP_ERROR"
        assert error.default_detail == "Error en la gestión de reportes"
        assert error.status_code == 400  # Default from base

    def test_report_not_found(self):
        """Test ReportNotFoundError."""
        error = ReportNotFoundError()
        assert error.status_code == 404
        assert error.default_code == "REP404"
        assert error.default_detail == "El reporte solicitado no existe"

    def test_report_validation(self):
        """Test ReportValidationError."""
        error = ReportValidationError()
        assert error.status_code == 400
        assert error.default_code == "REP_VAL"
        assert error.default_detail == "Los datos del reporte no son válidos"

    def test_report_permission(self):
        """Test ReportPermissionError."""
        error = ReportPermissionError()
        assert error.status_code == 403
        assert error.default_code == "REP_PERM"
        assert error.default_detail == "No tienes permisos para esta operación en el reporte"

    def test_report_crud_operations(self):
        """Test CRUD operation errors for reports."""
        create_error = ReportCreationError()
        assert create_error.status_code == 400
        assert create_error.default_code == "REP_CREATE"

        update_error = ReportUpdateError()
        assert update_error.status_code == 400
        assert update_error.default_code == "REP_UPDATE"

        delete_error = ReportDeleteError()
        assert delete_error.status_code == 400
        assert delete_error.default_code == "REP_DELETE"


class TestProjectExceptions:
    """Pruebas para excepciones de proyectos."""

    def test_project_error_base(self):
        """Test ProjectError base class."""
        error = ProjectError()
        assert error.default_code == "PROJ_ERROR"
        assert error.default_detail == "Error en la gestión de proyectos"

    def test_project_not_found(self):
        """Test ProjectNotFoundError."""
        error = ProjectNotFoundError()
        assert error.status_code == 404
        assert error.default_code == "PROJ404"
        assert error.default_detail == "El proyecto solicitado no existe"

    def test_project_validation(self):
        """Test ProjectValidationError."""
        error = ProjectValidationError()
        assert error.status_code == 400
        assert error.default_code == "PROJ_VAL"

    def test_project_permission(self):
        """Test ProjectPermissionError."""
        error = ProjectPermissionError()
        assert error.status_code == 403
        assert error.default_code == "PROJ_PERM"

    def test_project_crud_operations(self):
        """Test CRUD operation errors for projects."""
        create_error = ProjectCreationError()
        assert create_error.status_code == 400
        assert create_error.default_code == "PROJ_CREATE"

        update_error = ProjectUpdateError()
        assert update_error.status_code == 400
        assert update_error.default_code == "PROJ_UPDATE"


class TestUserExceptions:
    """Pruebas para excepciones de usuarios."""

    def test_user_error_base(self):
        """Test UserError base class."""
        error = UserError()
        assert error.default_code == "USER_ERROR"
        assert error.default_detail == "Error en la gestión de usuarios"

    def test_user_not_found(self):
        """Test UserNotFoundError."""
        error = UserNotFoundError()
        assert error.status_code == 404
        assert error.default_code == "USER404"

    def test_user_authentication(self):
        """Test UserAuthenticationError."""
        error = UserAuthenticationError()
        assert error.status_code == 401
        assert error.default_code == "USER_AUTH"

    def test_user_permission(self):
        """Test UserPermissionError."""
        error = UserPermissionError()
        assert error.status_code == 403
        assert error.default_code == "USER_PERM"

    def test_user_registration(self):
        """Test UserRegistrationError."""
        error = UserRegistrationError()
        assert error.status_code == 400
        assert error.default_code == "USER_REG"

    def test_user_profile(self):
        """Test UserProfileError."""
        error = UserProfileError()
        assert error.status_code == 400
        assert error.default_code == "USER_PROFILE"


class TestNotificationExceptions:
    """Pruebas para excepciones de notificaciones."""

    def test_notification_error_base(self):
        """Test NotificationError base class."""
        error = NotificationError()
        assert error.default_code == "NOTIF_ERROR"
        assert error.default_detail == "Error en la gestión de notificaciones"

    def test_notification_not_found(self):
        """Test NotificationNotFoundError."""
        error = NotificationNotFoundError()
        assert error.status_code == 404
        assert error.default_code == "NOTIF404"

    def test_notification_validation(self):
        """Test NotificationValidationError."""
        error = NotificationValidationError()
        assert error.status_code == 400
        assert error.default_code == "NOTIF_VAL"

    def test_notification_send(self):
        """Test NotificationSendError."""
        error = NotificationSendError()
        assert error.status_code == 500
        assert error.default_code == "NOTIF_SEND"

    def test_notification_permission(self):
        """Test NotificationPermissionError."""
        error = NotificationPermissionError()
        assert error.status_code == 403
        assert error.default_code == "NOTIF_PERM"


class TestAuthenticationExceptions:
    """Pruebas para excepciones de autenticación."""

    def test_authentication_error_base(self):
        """Test AuthenticationError base class."""
        error = AuthenticationError()
        assert error.default_code == "AUTH_ERROR"
        assert error.default_detail == "Error de autenticación"

    def test_token_expired(self):
        """Test TokenExpiredError."""
        error = TokenExpiredError()
        assert error.status_code == 401
        assert error.default_code == "AUTH_TOKEN_EXP"

    def test_token_invalid(self):
        """Test TokenInvalidError."""
        error = TokenInvalidError()
        assert error.status_code == 401
        assert error.default_code == "AUTH_TOKEN_INV"

    def test_login_error(self):
        """Test LoginError."""
        error = LoginError()
        assert error.status_code == 401
        assert error.default_code == "AUTH_LOGIN"

    def test_password_reset(self):
        """Test PasswordResetError."""
        error = PasswordResetError()
        assert error.status_code == 400
        assert error.default_code == "AUTH_PASS_RESET"


class TestValidationExceptions:
    """Pruebas para excepciones de validación."""

    def test_validation_error_base(self):
        """Test ValidationError."""
        error = ValidationError()
        assert error.status_code == 400
        assert error.default_code == "VALIDATION_ERROR"

    def test_required_field(self):
        """Test RequiredFieldError."""
        error = RequiredFieldError()
        assert error.status_code == 400
        assert error.default_code == "VALIDATION_REQ"

    def test_invalid_format(self):
        """Test InvalidFormatError."""
        error = InvalidFormatError()
        assert error.status_code == 400
        assert error.default_code == "VALIDATION_FMT"

    def test_data_integrity(self):
        """Test DataIntegrityError."""
        error = DataIntegrityError()
        assert error.status_code == 400
        assert error.default_code == "DATA_INTEGRITY"


class TestSystemExceptions:
    """Pruebas para excepciones del sistema."""

    def test_system_error_base(self):
        """Test SystemError."""
        error = SystemError()
        assert error.status_code == 500
        assert error.default_code == "SYSTEM_ERROR"

    def test_database_error(self):
        """Test DatabaseError."""
        error = DatabaseError()
        assert error.status_code == 500
        assert error.default_code == "DB_ERROR"

    def test_external_service_error(self):
        """Test ExternalServiceError."""
        error = ExternalServiceError()
        assert error.status_code == 500
        assert error.default_code == "EXT_SERVICE_ERROR"

    def test_configuration_error(self):
        """Test ConfigurationError."""
        error = ConfigurationError()
        assert error.status_code == 500
        assert error.default_code == "CONFIG_ERROR"


class TestExceptionInheritance:
    """Pruebas de herencia de excepciones específicas."""

    def test_all_exceptions_inherit_from_custom_api_exception(self):
        """Verificar que todas las excepciones heredan de CustomAPIException."""
        exceptions = [
            # Reportes
            ReportError(), ReportNotFoundError(), ReportValidationError(),
            ReportPermissionError(), ReportCreationError(), ReportUpdateError(),
            ReportDeleteError(),

            # Proyectos
            ProjectError(), ProjectNotFoundError(), ProjectValidationError(),
            ProjectPermissionError(), ProjectCreationError(), ProjectUpdateError(),

            # Usuarios
            UserError(), UserNotFoundError(), UserValidationError(),
            UserAuthenticationError(), UserPermissionError(), UserRegistrationError(),
            UserProfileError(),

            # Notificaciones
            NotificationError(), NotificationNotFoundError(), NotificationValidationError(),
            NotificationSendError(), NotificationPermissionError(),

            # Autenticación
            AuthenticationError(), TokenExpiredError(), TokenInvalidError(),
            LoginError(), PasswordResetError(),

            # Validación
            ValidationError(), RequiredFieldError(), InvalidFormatError(),
            DataIntegrityError(),

            # Sistema
            SystemError(), DatabaseError(), ExternalServiceError(), ConfigurationError(),
        ]

        for exception in exceptions:
            assert isinstance(exception, CustomAPIException), f"{type(exception).__name__} no hereda de CustomAPIException"

    def test_exception_codes_are_unique(self):
        """Verificar que todos los códigos de error son únicos."""
        exceptions = [
            # Reportes
            ReportError(), ReportNotFoundError(), ReportValidationError(),
            ReportPermissionError(), ReportCreationError(), ReportUpdateError(),
            ReportDeleteError(),

            # Proyectos
            ProjectError(), ProjectNotFoundError(), ProjectValidationError(),
            ProjectPermissionError(), ProjectCreationError(), ProjectUpdateError(),

            # Usuarios
            UserError(), UserNotFoundError(), UserValidationError(),
            UserAuthenticationError(), UserPermissionError(), UserRegistrationError(),
            UserProfileError(),

            # Notificaciones
            NotificationError(), NotificationNotFoundError(), NotificationValidationError(),
            NotificationSendError(), NotificationPermissionError(),

            # Autenticación
            AuthenticationError(), TokenExpiredError(), TokenInvalidError(),
            LoginError(), PasswordResetError(),

            # Validación
            ValidationError(), RequiredFieldError(), InvalidFormatError(),
            DataIntegrityError(),

            # Sistema
            SystemError(), DatabaseError(), ExternalServiceError(), ConfigurationError(),
        ]

        codes = [exc.default_code for exc in exceptions]
        unique_codes = set(codes)

        assert len(codes) == len(unique_codes), f"Códigos duplicados encontrados: {[code for code in codes if codes.count(code) > 1]}"


class TestExceptionResponses:
    """Pruebas de respuestas JSON de excepciones específicas."""

    def test_exception_response_structure(self):
        """Verificar que las excepciones generan respuestas JSON correctas."""
        error = ReportNotFoundError(message="Reporte con ID 123 no encontrado")

        response_data = error.get_error_response()

        # Verificar estructura básica
        assert "error" in response_data
        assert "code" in response_data["error"]
        assert "message" in response_data["error"]
        assert "trace_id" in response_data["error"]
        assert "timestamp" in response_data["error"]

        # Verificar valores específicos
        assert response_data["error"]["code"] == "REP404"
        assert response_data["error"]["message"] == "Reporte con ID 123 no encontrado"
        assert error.status_code == 404

    def test_custom_detail_override(self):
        """Verificar que se puede sobrescribir el detalle."""
        error = UserValidationError(message="El email ya está registrado")

        response_data = error.get_error_response()

        assert response_data["error"]["code"] == "USER_VAL"
        assert response_data["error"]["message"] == "El email ya está registrado"
        assert error.status_code == 400