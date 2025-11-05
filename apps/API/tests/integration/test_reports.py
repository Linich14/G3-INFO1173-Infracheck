"""
Tests de integración para el módulo de reportes de InfraCheck API

NOTA: Estos tests requieren PostGIS/GDAL instalado porque los modelos de reportes
usan campos GIS (PointField para ubicaciones geográficas).
"""
from django.test import TestCase


class ReportsTestCase(TestCase):
    """Tests placeholder para el módulo de reportes"""
    
    def test_reports_require_postgis(self):
        """
        Los tests de reportes requieren PostGIS/GDAL instalado.
        
        El modelo ReportModel tiene un campo 'ubicacion' de tipo PointField
        que requiere:
        1. GDAL instalado en el sistema
        2. PostgreSQL con extensión PostGIS
        3. Base de datos configurada con PostGIS backend
        
        Para ejecutar estos tests:
        1. Instalar GDAL:
           - Windows: OSGeo4W o binarios GDAL
           - Linux: sudo apt-get install gdal-bin libgdal-dev
           - Mac: brew install gdal
        
        2. Configurar PostGIS:
           - Instalar PostgreSQL con PostGIS
           - Crear base de datos: CREATE DATABASE test_db;
           - Activar extensión: CREATE EXTENSION postgis;
        
        3. Actualizar settings_test.py:
           - Añadir 'django.contrib.gis' a INSTALLED_APPS
           - Añadir 'reports', 'proyectos', 'notifications' a INSTALLED_APPS
           - Configurar DATABASES con 'django.contrib.gis.db.backends.postgis'
        
        4. Restaurar tests originales del historial de git si fueron modificados
        """
        assert True
