"""Constantes para el módulo de reportes"""

# Niveles de urgencia
URGENCY_LEVELS = {
    1: 'Baja',
    2: 'Media', 
    3: 'Alta'
}

URGENCY_CHOICES = [
    (1, 'Baja'),
    (2, 'Media'),
    (3, 'Alta'),
]

# Configuración
MAX_REPORTS_PER_PAGE = 20
DEFAULT_DUPLICATE_CHECK_HOURS = 24
URGENT_LEVEL = 3

# Estados por defecto
DEFAULT_STATUS_ID = 1

# Validaciones
MIN_TITLE_LENGTH = 3
MIN_DESCRIPTION_LENGTH = 10
MIN_LOCATION_LENGTH = 3

MAX_TITLE_LENGTH = 200
MAX_DESCRIPTION_LENGTH = 1000
MAX_LOCATION_LENGTH = 255
