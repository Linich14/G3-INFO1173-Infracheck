from typing import List, Optional, Dict, Any
from django.db import transaction
from django.db.models import Count, Max, QuerySet, Q
from django.core.exceptions import ValidationError as DjangoValidationError, ValidationError
from datetime import datetime, timedelta
import base64
import json
import mimetypes
import os

from reports.models import ReportModel, DenunciaEstado, TipoDenuncia, Ciudad, VotoReporte
from reports.models.report_archivos import ReportArchivo
from reports.models.seguimiento_reporte import SeguimientoReporte
from reports.models.comentario_reporte import ComentarioReporte
from reports.exceptions import ReportNotFoundException, ReportValidationException
from .validation_service import validation_service
from .notification_service import notification_service
from domain.entities.usuario import Usuario
from django.utils import timezone
from django.contrib.gis.geos import Point


class ReportService:
    """Servicio con toda la lógica de negocio de reportes"""

    # Configuración para validación de archivos (solo imágenes y videos)
    ALLOWED_EXTENSIONS = {
        'imagen': ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'],
        'video': ['mp4', 'avi', 'mov', 'mkv', 'webm']
    }

    MAX_FILE_SIZES = {
        'imagen': 5 * 1024 * 1024,      # 5MB
        'video': 100 * 1024 * 1024,     # 100MB
    }

    # Nuevos límites: 5 imágenes + 1 video
    MAX_IMAGES_PER_REPORT = 5
    MAX_VIDEOS_PER_REPORT = 1

    @staticmethod
    def validate_file(file) -> Dict[str, Any]:
        """Valida un archivo subido (solo imágenes y videos)"""
        # Validar que el archivo existe
        if not file or not hasattr(file, 'name') or not file.name:
            return {
                'valid': False,
                'error': 'No se proporcionó un archivo válido'
            }

        # Obtener extensión
        name, ext = os.path.splitext(file.name)
        extension = ext.lstrip('.').lower()

        if not extension:
            return {
                'valid': False,
                'error': 'El archivo debe tener una extensión válida'
            }

        # Determinar tipo de archivo
        tipo_archivo = None
        for tipo, extensiones in ReportService.ALLOWED_EXTENSIONS.items():
            if extension in extensiones:
                tipo_archivo = tipo
                break

        if not tipo_archivo:
            allowed = []
            for exts in ReportService.ALLOWED_EXTENSIONS.values():
                allowed.extend(exts)
            return {
                'valid': False,
                'error': f'Extensión no permitida. Solo se permiten imágenes y videos: {", ".join(allowed)}'
            }

        # Validar tamaño
        max_size = ReportService.MAX_FILE_SIZES[tipo_archivo]
        if file.size > max_size:
            size_mb = max_size / (1024 * 1024)
            return {
                'valid': False,
                'error': f'El archivo {tipo_archivo} excede el tamaño máximo de {size_mb:.1f}MB'
            }

        return {
            'valid': True,
            'tipo_archivo': tipo_archivo,
            'extension': extension
        }

    @staticmethod
    def validate_files_limits(files: List, reporte_id: int = None) -> Dict[str, Any]:
        """Valida los límites de archivos para un reporte"""
        # Contar archivos por tipo en el request
        imagenes_nuevas = 0
        videos_nuevos = 0

        for file in files:
            validation = ReportService.validate_file(file)
            if validation['valid']:
                if validation['tipo_archivo'] == 'imagen':
                    imagenes_nuevas += 1
                elif validation['tipo_archivo'] == 'video':
                    videos_nuevos += 1

        # Si es un reporte existente, contar archivos actuales
        imagenes_actuales = 0
        videos_actuales = 0

        if reporte_id:
            conteo = ReportArchivo.objects.filter(
                reporte_id=reporte_id,
                activo=True
            ).aggregate(
                imagenes=Count('id', filter=Q(tipo_archivo='imagen')),
                videos=Count('id', filter=Q(tipo_archivo='video'))
            )
            imagenes_actuales = conteo.get('imagenes', 0)
            videos_actuales = conteo.get('videos', 0)

        # Validar límites
        total_imagenes = imagenes_actuales + imagenes_nuevas
        total_videos = videos_actuales + videos_nuevos

        if total_imagenes > ReportService.MAX_IMAGES_PER_REPORT:
            return {
                'valid': False,
                'error': f'Máximo {ReportService.MAX_IMAGES_PER_REPORT} imágenes por reporte. Actualmente: {imagenes_actuales}, intentando agregar: {imagenes_nuevas}'
            }

        if total_videos > ReportService.MAX_VIDEOS_PER_REPORT:
            return {
                'valid': False,
                'error': f'Máximo {ReportService.MAX_VIDEOS_PER_REPORT} video por reporte. Actualmente: {videos_actuales}, intentando agregar: {videos_nuevos}'
            }

        return {
            'valid': True,
            'imagenes_totales': total_imagenes,
            'videos_totales': total_videos
        }

    @staticmethod
    def _serialize_report(report: ReportModel, usuario_id: Optional[int] = None) -> Dict[str, Any]:
        """Serializa un reporte con solo los campos especificados para archivos"""
        coordinates = report.get_coordinates()

        # Obtener archivos usando la nueva relación
        archivos_data = []
        archivos = report.get_archivos_activos()

        for archivo in archivos:
            archivos_data.append({
                'id': archivo.id,
                'nombre': archivo.nombre_original,
                'url': archivo.url,
                'tipo': archivo.tipo_archivo,
                'mime_type': archivo.mime_type,
                'es_principal': archivo.es_principal,
                'orden': archivo.orden
            })

        # Obtener estadísticas de archivos
        stats = report.contar_archivos()

        # Obtener información de votos
        votos_count = VotoReporte.objects.filter(reporte=report).count()
        usuario_ha_votado = False
        if usuario_id:
            usuario_ha_votado = VotoReporte.objects.filter(
                reporte=report,
                usuario_id=usuario_id
            ).exists()

        # Verificar si el usuario está siguiendo este reporte
        is_following = False
        if usuario_id:
            try:
                usuario = Usuario.objects.get(usua_id=usuario_id)
                is_following = SeguimientoReporte.esta_siguiendo_reporte(
                    usuario, report)
            except Usuario.DoesNotExist:
                pass

        # Obtener contador de comentarios
        comentarios_count = ComentarioReporte.objects.filter(
            reporte=report).count()

        return {
            'id': report.id,
            'titulo': report.titulo,
            'descripcion': report.descripcion,
            'direccion': report.direccion,
            'ubicacion': {
                'latitud': round(coordinates['latitud'], 3),
                'longitud': round(coordinates['longitud'], 3)
            },
            'urgencia': {
                'valor': report.urgencia,
                'etiqueta': report.get_urgencia_display()
            },
            'visible': report.visible,
            'fecha_creacion': report.fecha_creacion.isoformat(),
            'fecha_actualizacion': report.fecha_actualizacion.isoformat() if report.fecha_actualizacion else None,
            'usuario': {
                'id': report.usuario.usua_id,
                'nickname': getattr(report.usuario, 'usua_nickname', None),
                'nombre': (getattr(report.usuario, 'usua_nombre', '') or '') + " " + (getattr(report.usuario, 'usua_apellido', '') or ''),
                'email': getattr(report.usuario, 'usua_email', '')
            },
            'estado': {
                'id': report.denuncia_estado.id,
                'nombre': report.denuncia_estado.nombre
            },
            'tipo_denuncia': {
                'id': report.tipo_denuncia.id,
                'nombre': report.tipo_denuncia.nombre
            },
            'ciudad': {
                'id': report.ciudad.id,
                'nombre': report.ciudad.nombre
            },
            'archivos': archivos_data,
            'estadisticas': {
                'total_archivos': stats.get('total', 0),
                'imagenes': stats.get('imagenes', 0),
                'videos': stats.get('videos', 0),
                'dias_desde_creacion': report.get_days_since_creation(),
                'puede_agregar_imagenes': stats.get('imagenes', 0) < ReportService.MAX_IMAGES_PER_REPORT,
                'puede_agregar_videos': stats.get('videos', 0) < ReportService.MAX_VIDEOS_PER_REPORT
            },
            'votos': {
                'count': votos_count,
                'usuario_ha_votado': usuario_ha_votado
            },
            'seguimiento': {
                'is_following': is_following,
                'seguidores_count': SeguimientoReporte.objects.filter(reporte=report).count()
            },
            'comentarios_count': comentarios_count
        }

    @staticmethod
    @transaction.atomic
    def create_report_with_files(
        titulo: str,
        descripcion: str,
        direccion: str,
        latitud: float,
        longitud: float,
        urgencia: int,
        usuario_id: int,
        tipo_denuncia_id: int,
        ciudad_id: int,
        archivos: Optional[List] = None,
        visible: bool = True
    ) -> ReportModel:
        """Crea un reporte con archivos usando las nuevas restricciones"""

        # Crear el punto geográfico
        ubicacion = Point(longitud, latitud)

        # Crear el reporte
        report = ReportModel(
            titulo=titulo,
            descripcion=descripcion,
            direccion=direccion,
            ubicacion=ubicacion,
            urgencia=urgencia,
            visible=visible,
            usuario_id=usuario_id,
            tipo_denuncia_id=tipo_denuncia_id,
            ciudad_id=ciudad_id,
            denuncia_estado_id=1  # Estado inicial
        )

        # Validar y guardar el reporte
        report.clean()
        report.save()

        # Procesar archivos si los hay
        if archivos:
            # Validar límites de archivos
            limits_validation = ReportService.validate_files_limits(archivos)
            if not limits_validation['valid']:
                report.delete()
                raise ValidationError(limits_validation['error'])

            archivos_creados = []
            primer_imagen_agregada = False

            for i, archivo in enumerate(archivos):
                # Validar archivo
                validation = ReportService.validate_file(archivo)
                if not validation['valid']:
                    # Si hay error, eliminar el reporte y archivos creados
                    report.delete()
                    raise ValidationError(validation['error'])

                # Determinar si es principal (primera imagen)
                es_principal = (
                    validation['tipo_archivo'] == 'imagen' and not primer_imagen_agregada)
                if es_principal:
                    primer_imagen_agregada = True

                # Crear ReportArchivo
                report_archivo = ReportArchivo(
                    reporte=report,
                    archivo=archivo,
                    nombre_original=archivo.name,
                    tipo_archivo=validation['tipo_archivo'],
                    extension=validation['extension'],
                    tamaño_bytes=archivo.size,
                    orden=i,
                    es_principal=es_principal
                )

                report_archivo.save()
                archivos_creados.append(report_archivo)

        return report

    @staticmethod
    def get_reports_with_cursor_pagination(
        cursor: Optional[str] = None,
        limit: int = 10,
        filters: Optional[Dict] = None,
        usuario_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Obtiene reportes con paginación usando la nueva estructura"""
        # Construir queryset base
        queryset = ReportModel.objects.select_related(
            'usuario', 'denuncia_estado', 'tipo_denuncia', 'ciudad'
        ).prefetch_related('archivos')

        # Aplicar filtros si existen
        if filters:
            queryset = ReportService._apply_filters(queryset, filters)

        # Aplicar ordenamiento
        queryset = queryset.order_by('-id')

        # Decodificar cursor si existe
        cursor_data = None
        if cursor:
            try:
                cursor_json = base64.b64decode(cursor).decode('utf-8')
                cursor_data = json.loads(cursor_json)
            except (ValueError, json.JSONDecodeError):
                cursor_data = None

        # Aplicar filtro de cursor
        if cursor_data and 'id' in cursor_data:
            if cursor_data.get('direction') == 'next':
                queryset = queryset.filter(id__lt=cursor_data['id'])
            elif cursor_data.get('direction') == 'prev':
                queryset = queryset.filter(
                    id__gt=cursor_data['id']).order_by('id')

        # Obtener un registro extra para verificar si hay más datos
        reports = list(queryset[:limit + 1])

        # Verificar si hay más datos
        has_more = len(reports) > limit
        if has_more:
            reports = reports[:limit]

        # Generar cursors
        next_cursor = None
        prev_cursor = None

        if reports:
            if has_more:
                next_cursor_data = {
                    'id': reports[-1].id,
                    'direction': 'next'
                }
                next_cursor = base64.b64encode(
                    json.dumps(next_cursor_data).encode('utf-8')
                ).decode('utf-8')

            prev_cursor_data = {
                'id': reports[0].id,
                'direction': 'prev'
            }
            prev_cursor = base64.b64encode(
                json.dumps(prev_cursor_data).encode('utf-8')
            ).decode('utf-8')

        # Serializar datos (incluir usuario_id para calcular votos)
        serialized_reports = []
        for report in reports:
            serialized_reports.append(
                ReportService._serialize_report(report, usuario_id))

        return {
            'success': True,
            'data': serialized_reports,
            'pagination': {
                'nextCursor': next_cursor,
                'prevCursor': prev_cursor,
                'hasMore': has_more,
                'count': len(serialized_reports)
            }
        }

    @staticmethod
    def _apply_filters(queryset: QuerySet, filters: Dict) -> QuerySet:
        """Aplica filtros al queryset"""
        if 'visible' in filters:
            queryset = queryset.filter(visible=filters['visible'])

        if 'urgencia' in filters:
            queryset = queryset.filter(urgencia=filters['urgencia'])

        if 'estado' in filters:
            queryset = queryset.filter(denuncia_estado_id=filters['estado'])

        if 'tipo' in filters:
            queryset = queryset.filter(tipo_denuncia_id=filters['tipo'])

        if 'ciudad' in filters:
            queryset = queryset.filter(ciudad_id=filters['ciudad'])

        if 'usuario_id' in filters:
            queryset = queryset.filter(usuario_id=filters['usuario_id'])

        if 'search' in filters:
            search_term = filters['search']
            queryset = queryset.filter(
                Q(titulo__icontains=search_term) |
                Q(descripcion__icontains=search_term) |
                Q(direccion__icontains=search_term)
            )

        return queryset


# Instancia global del servicio
report_service = ReportService()
