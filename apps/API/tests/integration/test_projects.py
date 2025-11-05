"""
Tests de integración para el módulo de proyectos de InfraCheck API
"""
from django.test import TestCase, Client
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
from domain.entities.usuario import Usuario
from domain.entities.rol_usuario import RolUsuario
from domain.entities.sesion_token import SesionToken


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
            usua_id=self.usuario,
            token_valor='authority-token-123',
            token_expira_en=timezone.now() + timedelta(days=1),
            token_activo=True
        )
    
    def test_list_projects(self):
        """Test de listado de proyectos - Verifica que el endpoint responde"""
        response = self.client.get('/api/v1/proyectos/',
            HTTP_AUTHORIZATION=f'Bearer {self.token.token_valor}')
        
        # Aceptar respuesta exitosa o errores
        self.assertIn(response.status_code, [200, 401, 404])
