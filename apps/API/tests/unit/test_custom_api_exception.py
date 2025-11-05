"""
Tests unitarios para CustomAPIException.

Verifica el funcionamiento correcto de la clase base de excepciones personalizadas.
"""

import pytest
from datetime import datetime, timezone
import uuid
from unittest.mock import patch

from infrastructure.exceptions.base import CustomAPIException


class TestCustomAPIException:
    """Suite de tests para CustomAPIException."""

    def test_exception_creation_with_all_parameters(self):
        """Test creación de excepción con todos los parámetros."""
        message = "Error de prueba"
        code = "TEST001"
        detail = "Detalle del error"
        status_code = 404

        exc = CustomAPIException(
            message=message,
            code=code,
            detail=detail,
            status_code=status_code
        )

        assert exc.message == message
        assert exc.code == code
        assert exc.detail == detail
        assert exc.status_code == status_code
        assert exc.trace_id is not None
        assert exc.timestamp is not None
        assert isinstance(exc.timestamp, datetime)
        assert exc.timestamp.tzinfo == timezone.utc

    def test_exception_creation_with_defaults(self):
        """Test creación de excepción con valores por defecto."""
        exc = CustomAPIException()

        assert exc.message == "Ha ocurrido un error en la API"
        assert exc.code == "API_ERROR"
        assert exc.detail == "Ha ocurrido un error en la API"
        assert exc.status_code == 400
        assert exc.trace_id is not None
        assert exc.timestamp is not None

    def test_exception_creation_partial_parameters(self):
        """Test creación de excepción con algunos parámetros."""
        message = "Mensaje personalizado"
        code = "CUSTOM001"

        exc = CustomAPIException(message=message, code=code)

        assert exc.message == message
        assert exc.code == code
        assert exc.detail == "Ha ocurrido un error en la API"  # default
        assert exc.status_code == 400  # default

    def test_trace_id_is_unique(self):
        """Test que cada excepción tenga un trace_id único."""
        exc1 = CustomAPIException()
        exc2 = CustomAPIException()

        assert exc1.trace_id != exc2.trace_id
        assert isinstance(uuid.UUID(exc1.trace_id), uuid.UUID)
        assert isinstance(uuid.UUID(exc2.trace_id), uuid.UUID)

    def test_timestamp_is_utc(self):
        """Test que el timestamp esté en zona horaria UTC."""
        exc = CustomAPIException()

        assert exc.timestamp.tzinfo == timezone.utc

    @patch('infrastructure.exceptions.base.datetime')
    def test_timestamp_can_be_mocked(self, mock_datetime):
        """Test que el timestamp puede ser mockeado para testing."""
        fixed_time = datetime(2025, 11, 4, 15, 30, 45, tzinfo=timezone.utc)
        mock_datetime.now.return_value = fixed_time

        exc = CustomAPIException()

        assert exc.timestamp == fixed_time

    def test_get_full_details_structure(self):
        """Test que get_full_details retorna estructura correcta."""
        exc = CustomAPIException(
            message="Test message",
            code="TEST001",
            detail="Test detail",
            status_code=404
        )

        details = exc.get_full_details()

        assert isinstance(details, dict)
        assert "code" in details
        assert "message" in details
        assert "detail" in details
        assert "timestamp" in details
        assert "trace_id" in details
        assert "status_code" in details

        assert details["code"] == "TEST001"
        assert details["message"] == "Test message"
        assert details["detail"] == "Test detail"
        assert details["status_code"] == 404

        # Verificar formato ISO del timestamp
        assert "T" in details["timestamp"]
        assert "Z" in details["timestamp"]

    def test_get_error_response_structure(self):
        """Test que get_error_response retorna estructura JSON correcta."""
        exc = CustomAPIException(
            message="Error de prueba",
            code="TEST001"
        )

        response = exc.get_error_response()

        assert isinstance(response, dict)
        assert "error" in response
        assert isinstance(response["error"], dict)

        error_data = response["error"]
        assert "code" in error_data
        assert "message" in error_data
        assert "timestamp" in error_data
        assert "trace_id" in error_data

    def test_str_representation(self):
        """Test representación string del error."""
        exc = CustomAPIException(
            message="Error de prueba",
            code="TEST001"
        )

        str_repr = str(exc)

        assert "[TEST001]" in str_repr
        assert "Error de prueba" in str_repr
        assert exc.trace_id in str_repr

    def test_repr_representation(self):
        """Test representación detallada del error."""
        exc = CustomAPIException(
            message="Test",
            code="TEST001",
            status_code=404
        )

        repr_str = repr(exc)

        assert "CustomAPIException" in repr_str
        assert "TEST001" in repr_str
        assert "404" in repr_str
        assert exc.trace_id in repr_str

    def test_inheritance_preserves_defaults(self):
        """Test que la herencia funciona correctamente."""
        class TestException(CustomAPIException):
            status_code = 404
            default_code = "TEST_ERROR"
            default_detail = "Error de prueba heredado"

        exc = TestException()

        assert exc.status_code == 404
        assert exc.code == "TEST_ERROR"
        assert exc.detail == "Error de prueba heredado"

    def test_inheritance_with_custom_values(self):
        """Test que la herencia permite sobrescribir valores."""
        class TestException(CustomAPIException):
            status_code = 404
            default_code = "TEST_ERROR"

        exc = TestException(
            message="Mensaje personalizado",
            code="CUSTOM001"
        )

        assert exc.status_code == 404
        assert exc.code == "CUSTOM001"  # Sobrescribe el default
        assert exc.message == "Mensaje personalizado"

    def test_detail_accepts_dict(self):
        """Test que detail puede ser un diccionario."""
        detail_dict = {"field": "ubicacion", "error": "required"}
        exc = CustomAPIException(detail=detail_dict)

        assert exc.detail == detail_dict

        details = exc.get_full_details()
        assert details["detail"] == detail_dict

    def test_detail_accepts_string(self):
        """Test que detail puede ser un string."""
        detail_str = "Campo requerido faltante"
        exc = CustomAPIException(detail=detail_str)

        assert exc.detail == detail_str

    def test_drf_compatibility(self):
        """Test compatibilidad con Django REST Framework."""
        exc = CustomAPIException(
            message="Error DRF",
            code="DRF001",
            status_code=422
        )

        # Verificar que tiene los atributos estándar de APIException
        assert hasattr(exc, 'status_code')
        assert hasattr(exc, 'detail')
        assert hasattr(exc, 'default_detail')
        assert hasattr(exc, 'default_code')

        # Verificar que funciona con str()
        assert str(exc) is not None