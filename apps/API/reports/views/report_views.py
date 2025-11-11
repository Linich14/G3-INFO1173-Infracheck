import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction
from django.contrib.gis.geos import Point
from django.db.models import Q
import os
import base64
import json

from ..services.report_service import ReportService
from ..models import ReportModel, ReportArchivo
from ..exceptions import *
from interfaces.authentication.permissions import IsAuthenticatedWithSesionToken
from interfaces.authentication.session_token_auth import SesionTokenAuthentication
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError

# Configurar logger
logger = logging.getLogger(__name__)

class ReportCreateView(APIView):
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def post(self, request):
        logger.info("=== INICIO CREACIÓN DE REPORTE ===")
        
        try:
            # Obtener usuario_id usando el método existente
            usuario_id = self._get_usuario_id(request)
            
            if not usuario_id:
                logger.error("No se pudo obtener usuario_id")
                return Response({
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener los datos del request
            data = request.data.copy()
            logger.info(f"Datos recibidos: {data}")
            
            # Validar campos requeridos
            required_fields = ['titulo', 'descripcion', 'direccion', 'latitud', 'longitud', 'urgencia', 'tipo_denuncia', 'ciudad']
            missing_fields = [field for field in required_fields if not data.get(field)]
            
            if missing_fields:
                return Response({
                    'error': 'Campos requeridos faltantes',
                    'missing_fields': missing_fields
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Obtener los archivos del request (solo imágenes y videos)
            archivos = request.FILES.getlist('imagenes', [])  # Mantenemos el nombre 'imagenes' por compatibilidad
            logger.info(f"Archivos recibidos: {len(archivos)}")
            
            # Validar límites de archivos
            if archivos:
                limits_validation = ReportService.validate_files_limits(archivos)
                if not limits_validation['valid']:
                    return Response({
                        'error': limits_validation['error']
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear el punto geográfico
            try:
                latitud = float(data['latitud'])
                longitud = float(data['longitud'])
                ubicacion_point = Point(longitud, latitud)
            except (ValueError, TypeError):
                return Response({
                    'error': 'Coordenadas inválidas',
                    'details': 'Latitud y longitud deben ser números válidos'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Convertir campo visible a booleano correctamente
            visible_str = data.get('visible', 'true')
            visible = visible_str.lower() == 'true' if isinstance(visible_str, str) else bool(visible_str)
            
            # Usar transacción para asegurar consistencia
            with transaction.atomic():
                # Crear el reporte
                report_data = {
                    'titulo': data['titulo'],
                    'descripcion': data['descripcion'],
                    'direccion': data['direccion'],
                    'ubicacion': ubicacion_point,
                    'urgencia': int(data['urgencia']),
                    'visible': visible,
                    'usuario_id': usuario_id,
                    'tipo_denuncia_id': int(data['tipo_denuncia']),
                    'ciudad_id': int(data['ciudad']),
                    'denuncia_estado_id': 1  # Estado inicial (pendiente)
                }
                
                # Crear instancia del reporte
                report = ReportModel(**report_data)
                report.clean()
                report.save()
                
                logger.info(f"Reporte creado con ID: {report.id}")
                
                # Procesar archivos
                uploaded_files = []
                primer_imagen_agregada = False
                
                for archivo in archivos:
                    # Validar archivo
                    validation_result = ReportService.validate_file(archivo)
                    if not validation_result['valid']:
                        # Si hay un error, eliminar el reporte creado
                        report.delete()
                        return Response({
                            'error': 'Archivo inválido',
                            'details': validation_result['error']
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Determinar si es principal (primera imagen)
                    es_principal = (validation_result['tipo_archivo'] == 'imagen' and not primer_imagen_agregada)
                    if es_principal:
                        primer_imagen_agregada = True
                    
                    # Crear archivo asociado
                    report_archivo = ReportArchivo(
                        reporte=report,
                        archivo=archivo,
                        nombre_original=archivo.name,
                        tipo_archivo=validation_result['tipo_archivo'],
                        extension=validation_result['extension'],
                        tamaño_bytes=archivo.size,
                        orden=len(uploaded_files),
                        es_principal=es_principal
                    )
                    report_archivo.save()
                    
                    uploaded_files.append({
                        'id': report_archivo.id,
                        'nombre': report_archivo.nombre_original,
                        'url': report_archivo.url,
                        'tipo': report_archivo.tipo_archivo,
                        'mime_type': report_archivo.mime_type,
                        'es_principal': report_archivo.es_principal,
                        'orden': report_archivo.orden
                    })
                
                # Serializar respuesta
                response_data = ReportService._serialize_report(report)
                
                logger.info("Reporte creado exitosamente")
                return Response({
                    'success': True,
                    'message': 'Reporte creado exitosamente',
                    'data': response_data
                }, status=status.HTTP_201_CREATED)
                
        except ValidationError as e:
            logger.error(f"Error de validación: {str(e)}")
            return Response({
                'success': False,
                'error': 'Errores de validación',
                'details': e.message_dict if hasattr(e, 'message_dict') else str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error inesperado: {str(e)}")
            logger.exception("Detalles del error:")
            return Response({
                'success': False,
                'error': 'Error interno del servidor',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_usuario_id(self, request):
        """Método helper para obtener usuario_id de forma consistente"""
        usuario_id = None
        
        if hasattr(request, 'usua_id') and request.usua_id:
            usuario_id = request.usua_id
        elif hasattr(request, 'user_id') and request.user_id:
            usuario_id = request.user_id
        elif hasattr(request, 'auth_user') and request.auth_user:
            if hasattr(request.auth_user, 'usua_id'):
                usuario_id = request.auth_user.usua_id
            elif hasattr(request.auth_user, 'id'):
                usuario_id = request.auth_user.id
        elif hasattr(request, 'user') and request.user and str(request.user) != 'AnonymousUser':
            if hasattr(request.user, 'usua_id'):
                usuario_id = request.user.usua_id
            elif hasattr(request.user, 'id'):
                usuario_id = request.user.id
        
        return usuario_id

class ReportListView(APIView):
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request):
        logger.info("=== INICIO LISTADO DE REPORTES CON CURSOR PAGINATION ===")
        
        try:
            usuario_id = self._get_usuario_id(request)
            
            if not usuario_id:
                return Response({
                    'success': False,
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener parámetros de query
            cursor = request.GET.get('cursor')
            limit = min(int(request.GET.get('limit', 10)), 50)  # Máximo 50
            
            # Construir filtros - removido el filtro automático por usuario autenticado
            filters = {}
            
            # Agregar filtro por usuario solo si se especifica en los parámetros
            if request.GET.get('usuario_id'):
                filters['usuario_id'] = int(request.GET.get('usuario_id'))
            
            # Agregar filtro para solo mostrar reportes visibles (a menos que sea el propietario)
            # Si se especifica un usuario_id y coincide con el autenticado, mostrar todos (visibles e invisibles)
            if request.GET.get('usuario_id') and int(request.GET.get('usuario_id')) == usuario_id:
                # Mostrar todos los reportes del usuario autenticado (incluidos los no visibles)
                pass
            else:
                # Solo mostrar reportes visibles para otros usuarios
                filters['visible'] = True
            
            # Permitir override del filtro visible si se especifica explícitamente
            if request.GET.get('visible'):
                visible_str = request.GET.get('visible')
                filters['visible'] = visible_str.lower() == 'true' if isinstance(visible_str, str) else bool(visible_str)
            
            if request.GET.get('urgencia'):
                filters['urgencia'] = int(request.GET.get('urgencia'))
            
            if request.GET.get('estado'):
                filters['estado'] = int(request.GET.get('estado'))
            
            if request.GET.get('tipo'):
                filters['tipo'] = int(request.GET.get('tipo'))
            
            if request.GET.get('ciudad'):
                filters['ciudad'] = int(request.GET.get('ciudad'))
            
            if request.GET.get('search'):
                filters['search'] = request.GET.get('search')
            
            # Obtener reportes con paginación
            result = ReportService.get_reports_with_cursor_pagination(
                cursor=cursor,
                limit=limit,
                filters=filters
            )
            
            return Response(result, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response({
                'success': False,
                'error': 'Parámetros inválidos',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error al obtener reportes: {str(e)}")
            return Response({
                'success': False,
                'error': 'Error interno del servidor',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_usuario_id(self, request):
        """Método helper para obtener usuario_id de forma consistente"""
        usuario_id = None
        
        if hasattr(request, 'usua_id') and request.usua_id:
            usuario_id = request.usua_id
        elif hasattr(request, 'user_id') and request.user_id:
            usuario_id = request.user_id
        elif hasattr(request, 'auth_user') and request.auth_user:
            if hasattr(request.auth_user, 'usua_id'):
                usuario_id = request.auth_user.usua_id
            elif hasattr(request.auth_user, 'id'):
                usuario_id = request.auth_user.id
        elif hasattr(request, 'user') and request.user and str(request.user) != 'AnonymousUser':
            if hasattr(request.user, 'usua_id'):
                usuario_id = request.user.usua_id
            elif hasattr(request.user, 'id'):
                usuario_id = request.user.id
        
        return usuario_id

class ReportDetailView(APIView):
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request, report_id):
        try:
            usuario_id = self._get_usuario_id(request)
            
            if not usuario_id:
                return Response({
                    'success': False,
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener reporte sin filtrar por usuario (permite ver reportes de otros)
            report = ReportModel.objects.select_related(
                'usuario', 'denuncia_estado', 'tipo_denuncia', 'ciudad'
            ).prefetch_related('archivos').get(
                id=report_id
            )
            
            # Verificar visibilidad (solo si el reporte no es visible y no pertenece al usuario)
            if not report.visible and report.usuario_id != usuario_id:
                return Response({
                    'success': False,
                    'error': 'Reporte no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Serializar y retornar
            response_data = ReportService._serialize_report(report)
            
            return Response({
                'success': True,
                'data': response_data
            }, status=status.HTTP_200_OK)
            
        except ReportModel.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Reporte no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Error interno del servidor',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_usuario_id(self, request):
        """Método helper para obtener usuario_id de forma consistente"""
        usuario_id = None
        
        if hasattr(request, 'usua_id') and request.usua_id:
            usuario_id = request.usua_id
        elif hasattr(request, 'user_id') and request.user_id:
            usuario_id = request.user_id
        elif hasattr(request, 'auth_user') and request.auth_user:
            if hasattr(request.auth_user, 'usua_id'):
                usuario_id = request.auth_user.usua_id
            elif hasattr(request.auth_user, 'id'):
                usuario_id = request.auth_user.id
        elif hasattr(request, 'user') and request.user and str(request.user) != 'AnonymousUser':
            if hasattr(request.user, 'usua_id'):
                usuario_id = request.user.usua_id
            elif hasattr(request.user, 'id'):
                usuario_id = request.user.id
        
        return usuario_id

class ReportUpdateView(APIView):
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def put(self, request, report_id):
        return self._update_report(request, report_id, partial=False)
    
    def patch(self, request, report_id):
        return self._update_report(request, report_id, partial=True)
    
    def _update_report(self, request, report_id, partial=False):
        try:
            usuario_id = self._get_usuario_id(request)
            
            if not usuario_id:
                return Response({
                    'success': False,
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener el reporte del usuario
            try:
                report = ReportModel.objects.get(id=report_id, usuario_id=usuario_id)
            except ReportModel.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Reporte no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Verificar permisos
            if not report.belongs_to_user(usuario_id):
                return Response({
                    'success': False,
                    'error': 'No tienes permisos para actualizar este reporte'
                }, status=status.HTTP_403_FORBIDDEN)
            
            with transaction.atomic():
                data = request.data.copy()
                
                # Actualizar campos básicos
                if 'titulo' in data:
                    report.titulo = data['titulo']
                if 'descripcion' in data:
                    report.descripcion = data['descripcion']
                if 'direccion' in data:
                    report.direccion = data['direccion']
                if 'urgencia' in data:
                    report.urgencia = int(data['urgencia'])
                
                # Convertir campo visible a booleano correctamente
                if 'visible' in data:
                    visible_str = data['visible']
                    report.visible = visible_str.lower() == 'true' if isinstance(visible_str, str) else bool(visible_str)
                
                if 'tipo_denuncia' in data:
                    report.tipo_denuncia_id = int(data['tipo_denuncia'])
                if 'ciudad' in data:
                    report.ciudad_id = int(data['ciudad'])
                
                # Actualizar ubicación si se proporcionan coordenadas
                if 'latitud' in data and 'longitud' in data:
                    try:
                        latitud = float(data['latitud'])
                        longitud = float(data['longitud'])
                        report.ubicacion = Point(longitud, latitud)
                    except (ValueError, TypeError):
                        return Response({
                            'success': False,
                            'error': 'Coordenadas inválidas'
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                # Validar y guardar
                report.clean()
                report.save()
                
                # Eliminar archivos si se especifica
                if 'archivos_eliminar' in data:
                    archivos_ids = data.getlist('archivos_eliminar')
                    ReportArchivo.objects.filter(
                        id__in=archivos_ids, 
                        reporte=report
                    ).delete()
                
                # Agregar nuevos archivos
                uploaded_files = []
                files = request.FILES.getlist('imagenes', [])
                
                # Validar límite total de archivos
                if files:
                    total_archivos = report.get_archivos_activos().count() + len(files)
                    if total_archivos > 5:
                        return Response({
                            'success': False,
                            'error': 'El reporte no puede tener más de 5 archivos en total'
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                for file in files:
                    validation_result = ReportService.validate_file(file)
                    if not validation_result['valid']:
                        return Response({
                            'success': False,
                            'error': 'Archivo inválido',
                            'details': validation_result['error']
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    report_archivo = ReportArchivo(
                        reporte=report,
                        archivo=file,
                        nombre_original=file.name,
                        tipo_archivo=validation_result['tipo_archivo'],
                        extension=validation_result['extension'],
                        tamaño_bytes=file.size,
                        orden=report.get_archivos_activos().count() + len(uploaded_files),
                        es_principal=False  # Los archivos agregados después no son principales
                    )
                    report_archivo.save()
                    uploaded_files.append({
                        'id': report_archivo.id,
                        'nombre': report_archivo.nombre_original,
                        'tipo': report_archivo.tipo_archivo,
                        'tamaño': report_archivo.tamaño_bytes,
                        'tamaño_formateado': report_archivo.tamaño_formateado,
                        'url': report_archivo.url
                    })
                
                # Serializar respuesta
                response_data = ReportService._serialize_report(report)
                
                return Response({
                    'success': True,
                    'message': 'Reporte actualizado exitosamente',
                    'data': response_data,
                    'archivos_agregados': uploaded_files
                }, status=status.HTTP_200_OK)
                
        except ValidationError as e:
            return Response({
                'success': False,
                'error': 'Errores de validación',
                'details': e.message_dict if hasattr(e, 'message_dict') else str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Error interno del servidor',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_usuario_id(self, request):
        """Método helper para obtener usuario_id de forma consistente"""
        usuario_id = None
        
        if hasattr(request, 'usua_id') and request.usua_id:
            usuario_id = request.usua_id
        elif hasattr(request, 'user_id') and request.user_id:
            usuario_id = request.user_id
        elif hasattr(request, 'auth_user') and request.auth_user:
            if hasattr(request.auth_user, 'usua_id'):
                usuario_id = request.auth_user.usua_id
            elif hasattr(request.auth_user, 'id'):
                usuario_id = request.auth_user.id
        elif hasattr(request, 'user') and request.user and str(request.user) != 'AnonymousUser':
            if hasattr(request.user, 'usua_id'):
                usuario_id = request.user.usua_id
            elif hasattr(request.user, 'id'):
                usuario_id = request.user.id
        
        return usuario_id

class ReportDeleteView(APIView):
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def delete(self, request, report_id):
        try:
            usuario_id = self._get_usuario_id(request)
            
            if not usuario_id:
                return Response({
                    'success': False,
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener el reporte
            try:
                report = ReportModel.objects.get(id=report_id, usuario_id=usuario_id)
            except ReportModel.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Reporte no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Verificar permisos
            if not report.belongs_to_user(usuario_id):
                return Response({
                    'success': False,
                    'error': 'No tienes permisos para eliminar este reporte'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Determinar tipo de eliminación
            hard_delete = request.GET.get('hard_delete', '').lower() == 'true'
            is_admin = getattr(request.user, 'is_staff', False) if hasattr(request, 'user') else False
            
            if hard_delete and not is_admin:
                return Response({
                    'success': False,
                    'error': 'Solo los administradores pueden realizar eliminación física'
                }, status=status.HTTP_403_FORBIDDEN)
            
            with transaction.atomic():
                if hard_delete:
                    # Eliminación física
                    report_title = report.titulo
                    report.delete()
                    return Response({
                        'success': True,
                        'message': f'Reporte "{report_title}" eliminado permanentemente'
                    }, status=status.HTTP_200_OK)
                else:
                    # Soft delete
                    report.visible = False
                    report.save()
                    return Response({
                        'success': True,
                        'message': 'Reporte ocultado exitosamente'
                    }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Error interno del servidor',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_usuario_id(self, request):
        """Método helper para obtener usuario_id de forma consistente"""
        usuario_id = None
        
        if hasattr(request, 'usua_id') and request.usua_id:
            usuario_id = request.usua_id
        elif hasattr(request, 'user_id') and request.user_id:
            usuario_id = request.user_id
        elif hasattr(request, 'auth_user') and request.auth_user:
            if hasattr(request.auth_user, 'usua_id'):
                usuario_id = request.auth_user.usua_id
            elif hasattr(request.auth_user, 'id'):
                usuario_id = request.auth_user.id
        elif hasattr(request, 'user') and request.user and str(request.user) != 'AnonymousUser':
            if hasattr(request.user, 'usua_id'):
                usuario_id = request.user.usua_id
            elif hasattr(request.user, 'id'):
                usuario_id = request.user.id
        
        return usuario_id

# Vistas específicas para manejo de archivos/imágenes

class ReportMediaUploadView(APIView):
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    parser_classes = [MultiPartParser]
    
    def post(self, request, report_id):
        """Sube archivos/imágenes a un reporte existente"""
        try:
            usuario_id = self._get_usuario_id(request)
            
            if not usuario_id:
                return Response({
                    'success': False,
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener el reporte
            try:
                report = ReportModel.objects.get(id=report_id, usuario_id=usuario_id)
            except ReportModel.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Reporte no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Verificar permisos
            if not report.belongs_to_user(usuario_id):
                return Response({
                    'success': False,
                    'error': 'No tienes permisos para subir archivos a este reporte'
                }, status=status.HTTP_403_FORBIDDEN)
            
            files = request.FILES.getlist('imagenes', [])
            if not files:
                return Response({
                    'success': False,
                    'error': 'No se proporcionaron archivos'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validar límite total
            total_archivos = report.get_archivos_activos().count() + len(files)
            if total_archivos > 5:
                return Response({
                    'success': False,
                    'error': 'El reporte no puede tener más de 5 archivos en total'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            uploaded_files = []
            
            for file in files:
                validation_result = ReportService.validate_file(file)
                if not validation_result['valid']:
                    return Response({
                        'success': False,
                        'error': 'Archivo inválido',
                        'details': validation_result['error']
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                report_archivo = ReportArchivo(
                    reporte=report,
                    archivo=file,
                    nombre_original=file.name,
                    tipo_archivo=validation_result['tipo_archivo'],
                    extension=validation_result['extension'],
                    tamaño_bytes=file.size,
                    orden=report.get_archivos_activos().count() + len(uploaded_files),
                    es_principal=False
                )
                report_archivo.save()
                uploaded_files.append({
                    'id': report_archivo.id,
                    'nombre': report_archivo.nombre_original,
                    'tipo': report_archivo.tipo_archivo,
                    'tamaño': report_archivo.tamaño_bytes,
                    'tamaño_formateado': report_archivo.tamaño_formateado,
                    'url': report_archivo.url
                })
            
            return Response({
                'success': True,
                'message': f'{len(uploaded_files)} archivo(s) subido(s) exitosamente',
                'data': uploaded_files
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Error interno del servidor',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_usuario_id(self, request):
        """Método helper para obtener usuario_id de forma consistente"""
        usuario_id = None
        
        if hasattr(request, 'usua_id') and request.usua_id:
            usuario_id = request.usua_id
        elif hasattr(request, 'user_id') and request.user_id:
            usuario_id = request.user_id
        elif hasattr(request, 'auth_user') and request.auth_user:
            if hasattr(request.auth_user, 'usua_id'):
                usuario_id = request.auth_user.usua_id
            elif hasattr(request.auth_user, 'id'):
                usuario_id = request.auth_user.id
        elif hasattr(request, 'user') and request.user and str(request.user) != 'AnonymousUser':
            if hasattr(request.user, 'usua_id'):
                usuario_id = request.user.usua_id
            elif hasattr(request.user, 'id'):
                usuario_id = request.user.id
        
        return usuario_id

class ReportMediaListView(APIView):
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request, report_id):
        """Lista todos los archivos/imágenes de un reporte"""
        try:
            usuario_id = self._get_usuario_id(request)
            
            if not usuario_id:
                return Response({
                    'success': False,
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener el reporte
            try:
                report = ReportModel.objects.get(id=report_id, usuario_id=usuario_id)
            except ReportModel.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Reporte no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Obtener archivos
            archivos = report.get_archivos_activos()
            
            files_data = []
            for archivo in archivos:
                files_data.append({
                    'id': archivo.id,
                    'nombre': archivo.nombre_original,
                    'tipo': archivo.tipo_archivo,
                    'tamaño': archivo.tamaño_bytes,
                    'tamaño_formateado': archivo.tamaño_formateado,
                    'url': archivo.url,
                    'es_principal': archivo.es_principal,
                    'orden': archivo.orden,
                    'fecha_subida': archivo.fecha_subida.isoformat() if archivo.fecha_subida else None
                })
            
            return Response({
                'success': True,
                'data': files_data,
                'count': len(files_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Error interno del servidor',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_usuario_id(self, request):
        """Método helper para obtener usuario_id de forma consistente"""
        usuario_id = None
        
        if hasattr(request, 'usua_id') and request.usua_id:
            usuario_id = request.usua_id
        elif hasattr(request, 'user_id') and request.user_id:
            usuario_id = request.user_id
        elif hasattr(request, 'auth_user') and request.auth_user:
            if hasattr(request.auth_user, 'usua_id'):
                usuario_id = request.auth_user.usua_id
            elif hasattr(request.auth_user, 'id'):
                usuario_id = request.auth_user.id
        elif hasattr(request, 'user') and request.user and str(request.user) != 'AnonymousUser':
            if hasattr(request.user, 'usua_id'):
                usuario_id = request.user.usua_id
            elif hasattr(request.user, 'id'):
                usuario_id = request.user.id
        
        return usuario_id

class ReportMediaDeleteView(APIView):
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def delete(self, request, report_id, archivo_id):
        """Elimina un archivo específico de un reporte"""
        try:
            usuario_id = self._get_usuario_id(request)
            
            if not usuario_id:
                return Response({
                    'success': False,
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener el reporte y archivo
            try:
                report = ReportModel.objects.get(id=report_id, usuario_id=usuario_id)
                archivo = ReportArchivo.objects.get(id=archivo_id, reporte=report, activo=True)
            except (ReportModel.DoesNotExist, ReportArchivo.DoesNotExist):
                return Response({
                    'success': False,
                    'error': 'Reporte o archivo no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Verificar permisos
            if not report.belongs_to_user(usuario_id):
                return Response({
                    'success': False,
                    'error': 'No tienes permisos para eliminar este archivo'
                }, status=status.HTTP_403_FORBIDDEN)
            
            archivo_nombre = archivo.nombre_original
            
            with transaction.atomic():
                # Soft delete del archivo
                archivo.activo = False
                archivo.save()
            
            return Response({
                'success': True,
                'message': f'Archivo "{archivo_nombre}" eliminado exitosamente'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Error interno del servidor',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_usuario_id(self, request):
        """Método helper para obtener usuario_id de forma consistente"""
        usuario_id = None
        
        if hasattr(request, 'usua_id') and request.usua_id:
            usuario_id = request.usua_id
        elif hasattr(request, 'user_id') and request.user_id:
            usuario_id = request.user_id
        elif hasattr(request, 'auth_user') and request.auth_user:
            if hasattr(request.auth_user, 'usua_id'):
                usuario_id = request.auth_user.usua_id
            elif hasattr(request.auth_user, 'id'):
                usuario_id = request.auth_user.id
        elif hasattr(request, 'user') and request.user and str(request.user) != 'AnonymousUser':
            if hasattr(request.user, 'usua_id'):
                usuario_id = request.user.usua_id
            elif hasattr(request.user, 'id'):
                usuario_id = request.user.id
        
        return usuario_id

# Vista heredada para compatibilidad con decoradores
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reports(request):
    """Vista con decorador para compatibilidad"""
    view = ReportListView()
    return view.get(request)