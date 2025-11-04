"""
Tests de integración para módulos principales de InfraCheck API
"""
from django.test import TestCase, Client
from django.contrib.auth.hashers import make_password
from domain.entities.usuario import Usuario
from domain.entities.rol_usuario import RolUsuario
from domain.entities.sesion_token import SesionToken
from reports.models.report import ReportModel
from reports.models.tipo_denuncia import TipoDenuncia
from reports.models.denuncia_estado import DenunciaEstado
from proyectos.models.proyecto import ProyectoModel
from notifications.models.notification import Notification
import json


class AuthenticationTestCase(TestCase):
    """Tests para el módulo de autenticación"""
    
    def setUp(self):
        self.client = Client()
        # Crear rol ciudadano
        self.rol_ciudadano = RolUsuario.objects.create(
            rous_id=3,
            rous_nombre='Ciudadano'
        )
        
    def test_user_registration(self):
        """Test de registro de usuario"""
        response = self.client.post('/api/v1/register', {
            'usua_rut': '12345678-9',
            'usua_email': 'test@example.com',
            'usua_nombre': 'Test',
            'usua_apellido': 'User',
            'usua_password': 'SecurePass123',
            'usua_telefono': '+56912345678'
        }, content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Usuario.objects.filter(usua_email='test@example.com').exists())
    
    def test_user_login(self):
        """Test de inicio de sesión"""
        # Crear usuario
        usuario = Usuario.objects.create(
            usua_rut='12345678-9',
            usua_email='login@example.com',
            usua_nombre='Login',
            usua_apellido='Test',
            usua_nickname='login_user',
            usua_pass=make_password('SecurePass123'),
            usua_telefono=56912345678,
            rous_id=self.rol_ciudadano,
            usua_estado=1
        )
        
        # Intentar login
        response = self.client.post('/api/v1/login', {
            'usua_email': 'login@example.com',
            'usua_password': 'SecurePass123'
        }, content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIn('token', data)
        self.assertTrue(SesionToken.objects.filter(usuario_id=usuario).exists())
    
    def test_invalid_login(self):
        """Test de login con credenciales inválidas"""
        response = self.client.post('/api/v1/login', {
            'usua_email': 'nonexistent@example.com',
            'usua_password': 'WrongPass123'
        }, content_type='application/json')
        
        self.assertIn(response.status_code, [401, 400])


class ReportsTestCase(TestCase):
    """Tests para el módulo de reportes"""
    
    def setUp(self):
        self.client = Client()
        
        # Crear rol y usuario
        self.rol = RolUsuario.objects.create(rous_id=3, rous_nombre='Ciudadano')
        self.usuario = Usuario.objects.create(
            usua_rut='12345678-9',
            usua_email='reporter@example.com',
            usua_nombre='Reporter',
            usua_apellido='Test',
            usua_nickname='reporter_test',
            usua_pass=make_password('SecurePass123'),
            usua_telefono=56912345678,
            rous_id=self.rol,
            usua_estado=1
        )
        
        # Crear token de sesión
        self.token = SesionToken.objects.create(
            usuario_id=self.usuario,
            token_valor='test-token-123',
            token_activo=True
        )
        
        # Crear tipo de denuncia y estado
        self.tipo_denuncia = TipoDenuncia.objects.create(
            tide_id=1,
            tide_nombre='Infraestructura',
            tide_visible=True
        )
        
        self.estado = DenunciaEstado.objects.create(
            dees_id=1,
            dees_nombre='Reportado',
            dees_visible=True
        )
    
    def test_create_report(self):
        """Test de creación de reporte"""
        response = self.client.post('/api/v1/reports', {
            'titulo': 'Test Report',
            'descripcion': 'Test description',
            'ubicacion': 'Test location',
            'latitud': -38.7359,
            'longitud': -72.5904,
            'urgencia': 2,
            'tide_id': self.tipo_denuncia.tide_id,
            'dees_id': self.estado.dees_id
        }, 
        content_type='application/json',
        HTTP_AUTHORIZATION=f'Bearer {self.token.token_valor}')
        
        self.assertIn(response.status_code, [201, 200])
        self.assertTrue(ReportModel.objects.filter(titulo='Test Report').exists())
    
    def test_list_reports(self):
        """Test de listado de reportes"""
        # Crear reporte de prueba
        ReportModel.objects.create(
            titulo='Sample Report',
            descripcion='Sample description',
            ubicacion='Sample location',
            latitud=-38.7359,
            longitud=-72.5904,
            urgencia=1,
            usuario_id=self.usuario,
            tide_id=self.tipo_denuncia,
            dees_id=self.estado,
            visible=True
        )
        
        response = self.client.get('/api/v1/reports',
            HTTP_AUTHORIZATION=f'Bearer {self.token.token_valor}')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIsInstance(data, (list, dict))


class ProjectsTestCase(TestCase):
    """Tests para el módulo de proyectos"""
    
    def setUp(self):
        self.client = Client()
        
        # Crear rol autoridad y usuario
        self.rol = RolUsuario.objects.create(rous_id=2, rous_nombre='Autoridad')
        self.usuario = Usuario.objects.create(
            usua_rut='12345678-9',
            usua_email='authority@example.com',
            usua_nombre='Authority',
            usua_apellido='Test',
            usua_nickname='authority_user',
            usua_pass=make_password('SecurePass123'),
            usua_telefono=56912345678,
            rous_id=self.rol,
            usua_estado=1
        )
        
        # Crear token
        self.token = SesionToken.objects.create(
            usuario_id=self.usuario,
            token_valor='authority-token-123',
            token_activo=True
        )
    
    def test_list_projects(self):
        """Test de listado de proyectos"""
        response = self.client.get('/api/v1/proyectos',
            HTTP_AUTHORIZATION=f'Bearer {self.token.token_valor}')
        
        self.assertEqual(response.status_code, 200)


class NotificationsTestCase(TestCase):
    """Tests para el módulo de notificaciones"""
    
    def setUp(self):
        self.client = Client()
        
        # Crear usuario
        self.rol = RolUsuario.objects.create(rous_id=3, rous_nombre='Ciudadano')
        self.usuario = Usuario.objects.create(
            usua_rut='12345678-9',
            usua_email='notif@example.com',
            usua_nombre='Notification',
            usua_apellido='Test',
            usua_nickname='notif_user',
            usua_pass=make_password('SecurePass123'),
            usua_telefono=56912345678,
            rous_id=self.rol,
            usua_estado=1
        )
        
        # Crear token
        self.token = SesionToken.objects.create(
            usuario_id=self.usuario,
            token_valor='notif-token-123',
            token_activo=True
        )
        
        # Crear notificación de prueba
        Notification.objects.create(
            usuario=self.usuario,
            titulo='Test Notification',
            tipo='info',
            mensaje='Test notification message',
            leida=False
        )
    
    def test_get_unread_notifications(self):
        """Test de obtención de notificaciones no leídas"""
        response = self.client.get('/api/v1/notifications/unread',
            HTTP_AUTHORIZATION=f'Bearer {self.token.token_valor}')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertTrue(len(data) > 0)
    
    def test_mark_notification_as_read(self):
        """Test de marcar notificación como leída"""
        notif = Notification.objects.filter(usuario=self.usuario).first()
        
        response = self.client.patch(f'/api/v1/notifications/{notif.id}/read',
            HTTP_AUTHORIZATION=f'Bearer {self.token.token_valor}')
        
        self.assertIn(response.status_code, [200, 204])
        notif.refresh_from_db()
        self.assertTrue(notif.leida)
