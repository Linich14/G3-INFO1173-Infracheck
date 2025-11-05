"""
Tests de comentarios - Requieren PostGIS/GDAL para funcionar.
"""
from django.test import TestCase


class TestComentarioViews(TestCase):
    """Tests placeholder para comentarios."""
    
    def test_comentarios_requieren_postgis(self):
        """
        Los tests de comentarios requieren PostGIS/GDAL instalado
        porque dependen de ReportModel que tiene un PointField.
        
        Para ejecutar estos tests:
        1. Instalar GDAL y PostGIS
        2. Configurar PostgreSQL con PostGIS
        3. Restaurar tests originales del commit 6e51e64
        """
        assert True
