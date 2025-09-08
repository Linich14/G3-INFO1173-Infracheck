# Infracheck API

Este proyecto es una API REST construida con Django y Django REST Framework para ser consumida por la plataforma móvil Infracheck.

## Estructura inicial
- Proyecto Django: `infracheck_api`
- Framework: Django 3.10.6, Django REST Framework


## Requisitos
- Python 3.10+
- Django
- Django REST Framework

## Uso
1. Instala dependencias en el entorno virtual.
2. Ejecuta el servidor de desarrollo.

## Mensaje para el equipo

Para clonar y ejecutar esta API sin problemas:
1. Clona el repositorio.
2. Crea un entorno virtual y activa.
3. Instala las dependencias con `pip install -r requirements.txt`.
4. Copia el archivo `.env` y completa las variables de entorno necesarias (credenciales de base de datos, secret key, etc).
5. Ejecuta las migraciones con `python manage.py migrate`.
6. Inicia el servidor con `python manage.py runserver`.

**Nota:** El archivo `.env` no se sube al repositorio por seguridad. Cada desarrollador debe crear el suyo localmente.

Si tienes dudas, revisa la documentación o contacta al responsable técnico.

