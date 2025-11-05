import os
from config.settings import *

# Configuración para pruebas que evita problemas con GIS
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Usar URLs de prueba que excluyen vistas dependientes de GIS
ROOT_URLCONF = 'config.urls_test'

# Excluir apps que requieren GIS para evitar problemas de GDAL
INSTALLED_APPS = [
    app for app in INSTALLED_APPS
    if app not in ['django.contrib.gis', 'reports', 'proyectos', 'notifications']
]

# Configuración de logging para pruebas
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'WARNING',
        },
    },
}