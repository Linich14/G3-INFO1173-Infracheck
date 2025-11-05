"""
Pruebas unitarias para las vistas de comentarios.

Este módulo prueba las funcionalidades de crear, listar y eliminar comentarios.
"""

import pytest
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch, MagicMock

from reports.models import ReportModel, ComentarioReporte
from domain.entities.usuario import Usuario
from domain.entities.rol_usuario import RolUsuario


class ComentarioViewsTestCase(APITestCase):
    """Pruebas para las vistas de comentarios."""

    def setUp(self):
        """Configurar datos de prueba."""
        # Crear rol de usuario
        self.rol_usuario = RolUsuario.objects.create(rous_nombre='Usuario')
        self.rol_admin = RolUsuario.objects.create(rous_nombre='Admin')

        # Crear usuarios
        self.usuario_autor = Usuario.objects.create(
            usua_rut='12345678-9',
            usua_nombre='Juan',
            usua_apellido='Pérez',
            usua_nickname='juanperez',
            usua_email='juan@example.com',
            usua_pass='password123',
            usua_telefono=123456789,
            rous_id=self.rol_usuario
        )

        self.usuario_admin = Usuario.objects.create(
            usua_rut='98765432-1',
            usua_nombre='Admin',
            usua_apellido='Sistema',
            usua_nickname='admin',
            usua_email='admin@example.com',
            usua_pass='password123',
            usua_telefono=987654321,
            rous_id=self.rol_admin
        )

        self.usuario_otro = Usuario.objects.create(
            usua_rut='11111111-1',
            usua_nombre='Otro',
            usua_apellido='Usuario',
            usua_nickname='otrousuario',
            usua_email='otro@example.com',
            usua_pass='password123',
            usua_telefono=111111111,
            rous_id=self.rol_usuario
        )

        # Crear reporte
        self.reporte = ReportModel.objects.create(
            titulo='Reporte de prueba',
            descripcion='Descripción del reporte',
            ubicacion='Santiago',
            usuario=self.usuario_autor
        )

        # Crear comentario
        self.comentario = ComentarioReporte.objects.create(
            usuario=self.usuario_autor,
            reporte=self.reporte,
            comentario='Este es un comentario de prueba'
        )

    @patch('reports.views.comentario_views.getattr')
    def test_crear_comentario_exitoso(self, mock_getattr):
        """Test crear comentario exitosamente."""
        mock_getattr.return_value = self.usuario_autor

        url = reverse('create-comment', kwargs={'report_id': self.reporte.id})
        data = {'comentario': 'Nuevo comentario de prueba'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('comentario', response.data)

    @patch('reports.views.comentario_views.getattr')
    def test_crear_comentario_sin_autenticacion(self, mock_getattr):
        """Test crear comentario sin autenticación."""
        mock_getattr.return_value = None

        url = reverse('create-comment', kwargs={'report_id': self.reporte.id})
        data = {'comentario': 'Comentario sin auth'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('reports.views.comentario_views.getattr')
    def test_crear_comentario_vacio(self, mock_getattr):
        """Test crear comentario vacío."""
        mock_getattr.return_value = self.usuario_autor

        url = reverse('create-comment', kwargs={'report_id': self.reporte.id})
        data = {'comentario': ''}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('reports.views.comentario_views.getattr')
    def test_listar_comentarios_exitoso(self, mock_getattr):
        """Test listar comentarios exitosamente."""
        mock_getattr.return_value = self.usuario_autor

        url = reverse('list-report-comments', kwargs={'report_id': self.reporte.id})

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('results', response.data)

    @patch('reports.views.comentario_views.getattr')
    def test_listar_comentarios_sin_autenticacion(self, mock_getattr):
        """Test listar comentarios sin autenticación."""
        mock_getattr.return_value = None

        url = reverse('list-report-comments', kwargs={'report_id': self.reporte.id})

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('reports.views.comentario_views.getattr')
    def test_eliminar_comentario_por_autor(self, mock_getattr):
        """Test eliminar comentario por su autor."""
        mock_getattr.return_value = self.usuario_autor

        url = reverse('delete-comment', kwargs={'comment_id': self.comentario.id})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

        # Verificar que el comentario esté marcado como no visible
        self.comentario.refresh_from_db()
        self.assertFalse(self.comentario.comment_visible)

    @patch('reports.views.comentario_views.getattr')
    def test_eliminar_comentario_por_admin(self, mock_getattr):
        """Test eliminar comentario por administrador."""
        mock_getattr.return_value = self.usuario_admin

        url = reverse('delete-comment', kwargs={'comment_id': self.comentario.id})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que el comentario esté marcado como no visible
        self.comentario.refresh_from_db()
        self.assertFalse(self.comentario.comment_visible)

    @patch('reports.views.comentario_views.getattr')
    def test_eliminar_comentario_sin_permisos(self, mock_getattr):
        """Test eliminar comentario sin permisos (usuario diferente)."""
        mock_getattr.return_value = self.usuario_otro

        url = reverse('delete-comment', kwargs={'comment_id': self.comentario.id})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @patch('reports.views.comentario_views.getattr')
    def test_eliminar_comentario_sin_autenticacion(self, mock_getattr):
        """Test eliminar comentario sin autenticación."""
        mock_getattr.return_value = None

        url = reverse('delete-comment', kwargs={'comment_id': self.comentario.id})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('reports.views.comentario_views.getattr')
    def test_eliminar_comentario_inexistente(self, mock_getattr):
        """Test eliminar comentario inexistente."""
        mock_getattr.return_value = self.usuario_autor

        url = reverse('delete-comment', kwargs={'comment_id': 99999})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch('reports.views.comentario_views.getattr')
    def test_eliminar_comentario_ya_eliminado(self, mock_getattr):
        """Test eliminar comentario ya eliminado."""
        mock_getattr.return_value = self.usuario_autor

        # Marcar comentario como no visible
        self.comentario.comment_visible = False
        self.comentario.save()

        url = reverse('delete-comment', kwargs={'comment_id': self.comentario.id})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('ya ha sido eliminado', response.data['message'])