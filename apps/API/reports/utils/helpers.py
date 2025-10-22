"""Funciones de utilidad para reportes"""

from datetime import datetime, timedelta
from django.utils import timezone
from .constants import URGENCY_LEVELS


def calculate_days_since(date):
    """Calcular días desde una fecha"""
    if not date:
        return 0
    now = timezone.now()
    return (now - date).days


def format_urgency(urgency):
    """Formatear nivel de urgencia"""
    return URGENCY_LEVELS.get(urgency, 'Desconocido')


def is_recent(date, days=7):
    """Verificar si una fecha es reciente"""
    if not date:
        return False
    cutoff = timezone.now() - timedelta(days=days)
    return date >= cutoff


def is_urgent(urgency):
    """Verificar si un reporte es urgente"""
    from .constants import URGENT_LEVEL
    return urgency == URGENT_LEVEL


def clean_text(text):
    """Limpiar y normalizar texto"""
    if not text:
        return ""
    return text.strip()


def paginate_queryset(queryset, page_size=None):
    """Paginar un queryset"""
    from .constants import MAX_REPORTS_PER_PAGE
    if page_size is None:
        page_size = MAX_REPORTS_PER_PAGE
    return queryset[:page_size]


def build_search_query(query_text):
    """Construir consulta de búsqueda"""
    from django.db.models import Q
    
    if not query_text:
        return Q()
    
    return (
        Q(titulo__icontains=query_text) |
        Q(descripcion__icontains=query_text) |
        Q(ubicacion__icontains=query_text)
    )
