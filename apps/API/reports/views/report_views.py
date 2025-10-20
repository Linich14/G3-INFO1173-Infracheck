import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction
from django.core.files.storage import default_storage
from django.conf import settings
import os

from ..serializers.report_serializers import (
    CreateReportSerializer, 
    ReportSerializer,
    ReportArchivoSerializer
)
from ..services.report_service import ReportService
from ..models import ReportModel, ReportArchivo
from ..exceptions import *
from interfaces.authentication.permissions import IsAuthenticatedWithSesionToken
from interfaces.authentication.session_token_auth import SesionTokenAuthentication

# Configurar logger
logger = logging.getLogger(__name__)

class ReportCreateView(APIView):
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        logger.info("=== INICIO CREACIÓN DE REPORTE ===")
        
        try:
            # Debug completo del request
            logger.info(f"Request user: {getattr(request, 'user', 'No user')}")
            logger.info(f"Request usua_id: {getattr(request, 'usua_id', 'No usua_id')}")
            logger.info(f"Request user_id: {getattr(request, 'user_id', 'No user_id')}")
            logger.info(f"Request auth_user: {getattr(request, 'auth_user', 'No auth_user')}")
            logger.info(f"Request auth_token: {getattr(request, 'auth_token', 'No auth_token')}")
            
            # Intentar obtener usuario_id de diferentes formas
            usuario_id = None
            
            # Opción 1: Desde usua_id (tu convención)
            if hasattr(request, 'usua_id') and request.usua_id:
                usuario_id = request.usua_id
                logger.info(f"Usuario ID obtenido desde usua_id: {usuario_id}")
            
            # Opción 2: Desde user_id
            elif hasattr(request, 'user_id') and request.user_id:
                usuario_id = request.user_id
                logger.info(f"Usuario ID obtenido desde user_id: {usuario_id}")
            
            # Opción 3: Desde auth_user
            elif hasattr(request, 'auth_user') and request.auth_user:
                if hasattr(request.auth_user, 'usua_id'):
                    usuario_id = request.auth_user.usua_id
                    logger.info(f"Usuario ID obtenido desde auth_user.usua_id: {usuario_id}")
                elif hasattr(request.auth_user, 'id'):
                    usuario_id = request.auth_user.id
                    logger.info(f"Usuario ID obtenido desde auth_user.id: {usuario_id}")
            
            # Opción 4: Desde request.user
            elif hasattr(request, 'user') and request.user and str(request.user) != 'AnonymousUser':
                if hasattr(request.user, 'usua_id'):
                    usuario_id = request.user.usua_id
                    logger.info(f"Usuario ID obtenido desde user.usua_id: {usuario_id}")
                elif hasattr(request.user, 'id'):
                    usuario_id = request.user.id
                    logger.info(f"Usuario ID obtenido desde user.id: {usuario_id}")
            
            logger.info(f"Usuario ID final: {usuario_id}")
            
            if not usuario_id:
                logger.error("No se pudo obtener usuario_id")
                return Response({
                    'error': 'Token de autenticación inválido o expirado',
                    'debug': {
                        'has_usua_id': hasattr(request, 'usua_id'),
                        'has_user_id': hasattr(request, 'user_id'),
                        'has_auth_user': hasattr(request, 'auth_user'),
                        'user_type': str(type(getattr(request, 'user', None))),
                        'user_str': str(getattr(request, 'user', 'None'))
                    }
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener los datos del request
            data = request.data.copy()
            logger.info(f"Datos recibidos: {data}")
            
            # Obtener las imágenes del request
            imagenes = request.FILES.getlist('imagenes', [])
            logger.info(f"Imágenes recibidas: {len(imagenes)}")
            
            # Validar que se suban máximo 5 imágenes
            if len(imagenes) > 5:
                return Response({
                    'error': 'No se pueden subir más de 5 imágenes'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validar los datos del reporte
            serializer = CreateReportSerializer(data=data)
            if not serializer.is_valid():
                logger.error(f"Errores de validación: {serializer.errors}")
                return Response({
                    'error': 'Datos inválidos',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Usar transacción para asegurar consistencia
            with transaction.atomic():
                # Crear el reporte usando el serializer que maneja los archivos correctamente
                validated_data = serializer.validated_data
                validated_data['usuario_id'] = usuario_id
                
                logger.info(f"Creando reporte con datos: {validated_data}")
                
                # Usar el método create del serializer en lugar de crear directamente
                report = serializer.create(validated_data)
                logger.info(f"Reporte creado con ID: {report.id}")
                
                # Las imágenes ya se procesan en el método create() del serializer
                # No necesitas procesar las imágenes aquí manualmente
                
                # Serializar la respuesta incluyendo los archivos
                response_serializer = ReportSerializer(report)
                
                logger.info("Reporte creado exitosamente")
                return Response({
                    'message': 'Reporte creado exitosamente',
                    'data': response_serializer.data
                }, status=status.HTTP_201_CREATED)
                
        except ReportValidationException as e:
            logger.error(f"Error de validación: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error inesperado: {str(e)}")
            logger.exception("Detalles del error:")
            return Response({
                'error': 'Error interno del servidor',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReportListView(APIView):
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request):
        logger.info("=== INICIO LISTADO DE REPORTES ===")
        
        try:
            # Obtener usuario_id de la misma forma que en create
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
            
            logger.info(f"Usuario ID: {usuario_id}")
            
            if not usuario_id:
                return Response({
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener reportes del usuario autenticado
            reports = ReportModel.objects.filter(usuario_id=usuario_id).select_related(
                'tipo_denuncia', 'ciudad', 'estado'
            ).prefetch_related('archivos')
            
            # ==================== FILTRO POR URGENCIA ====================
            urgencia = request.GET.get('urgencia')
            if urgencia:
                try:
                    urgencia_int = int(urgencia)
                    if urgencia_int in [1, 2, 3]:
                        reports = reports.filter(urgencia=urgencia_int)
                        logger.info(f"Filtro aplicado: urgencia={urgencia_int}")
                    else:
                        return Response({
                            'error': 'Valor de urgencia inválido. Debe ser 1 (Baja), 2 (Media) o 3 (Alta)'
                        }, status=status.HTTP_400_BAD_REQUEST)
                except ValueError:
                    return Response({
                        'error': 'El parámetro urgencia debe ser un número'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            logger.info(f"Reportes encontrados: {reports.count()}")
            
            serializer = ReportSerializer(reports, many=True)
            
            return Response({
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error al obtener reportes: {str(e)}")
            return Response({
                'error': 'Error al obtener los reportes',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReportDetailView(APIView):
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request, report_id):
        try:
            # Obtener usuario_id consistentemente
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
            
            if not usuario_id:
                return Response({
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener reporte específico del usuario
            report = ReportModel.objects.select_related(
                'tipo_denuncia', 'ciudad', 'estado'
            ).prefetch_related('archivos').get(
                id=report_id, 
                usuario_id=usuario_id
            )
            
            serializer = ReportSerializer(report)
            
            return Response({
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except ReportModel.DoesNotExist:
            return Response({
                'error': 'Reporte no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Error al obtener el reporte',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReportUpdateView(APIView):
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    parser_classes = [MultiPartParser, FormParser]
    
    def put(self, request, report_id):
        try:
            # Obtener usuario_id consistentemente
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
            
            if not usuario_id:
                return Response({
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener el reporte del usuario
            report = ReportModel.objects.get(id=report_id, usuario_id=usuario_id)
            
            # Solo permitir actualización si está en estado "Pendiente"
            if report.estado.nombre != 'Pendiente':
                return Response({
                    'error': 'Solo se pueden modificar reportes en estado Pendiente'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            data = request.data.copy()
            serializer = CreateReportSerializer(report, data=data, partial=True)
            
            if serializer.is_valid():
                with transaction.atomic():
                    serializer.save()
                    
                    # Procesar nuevas imágenes si se enviaron
                    imagenes = request.FILES.getlist('imagenes', [])
                    if imagenes:
                        # Validar límite total de imágenes
                        total_imagenes = report.archivos.count() + len(imagenes)
                        if total_imagenes > 5:
                            return Response({
                                'error': 'El reporte no puede tener más de 5 imágenes en total'
                            }, status=status.HTTP_400_BAD_REQUEST)
                        
                        # Agregar nuevas imágenes
                        for imagen in imagenes:
                            # Validar tipo y tamaño
                            allowed_types = ['image/jpeg', 'image/png', 'image/jpg']
                            if imagen.content_type not in allowed_types:
                                return Response({
                                    'error': f'Tipo de archivo no permitido: {imagen.content_type}'
                                }, status=status.HTTP_400_BAD_REQUEST)
                            
                            if imagen.size > 5 * 1024 * 1024:
                                return Response({
                                    'error': f'El archivo {imagen.name} es muy grande. Máximo: 5MB'
                                }, status=status.HTTP_400_BAD_REQUEST)
                            
                            ReportArchivo.objects.create(
                                report=report,
                                archivo=imagen,
                                nombre_original=imagen.name
                            )
                
                response_serializer = ReportSerializer(report)
                return Response({
                    'message': 'Reporte actualizado exitosamente',
                    'data': response_serializer.data
                }, status=status.HTTP_200_OK)
            
            return Response({
                'error': 'Datos inválidos',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except ReportModel.DoesNotExist:
            return Response({
                'error': 'Reporte no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Error al actualizar el reporte',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReportDeleteView(APIView):
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def delete(self, request, report_id):
        try:
            # Obtener usuario_id consistentemente
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
            
            if not usuario_id:
                return Response({
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener el reporte del usuario
            report = ReportModel.objects.get(id=report_id, usuario_id=usuario_id)
            
            # Solo permitir eliminación si está en estado "Pendiente"
            if report.estado.nombre != 'Pendiente':
                return Response({
                    'error': 'Solo se pueden eliminar reportes en estado Pendiente'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                # Los archivos se eliminan automáticamente por la relación CASCADE
                report.delete()
            
            return Response({
                'message': 'Reporte eliminado exitosamente'
            }, status=status.HTTP_200_OK)
            
        except ReportModel.DoesNotExist:
            return Response({
                'error': 'Reporte no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Error al eliminar el reporte',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReportImageDeleteView(APIView):
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def delete(self, request, report_id, image_id):
        try:
            # Obtener usuario_id consistentemente
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
            
            if not usuario_id:
                return Response({
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener el reporte del usuario
            report = ReportModel.objects.get(id=report_id, usuario_id=usuario_id)
            
            # Solo permitir eliminación si está en estado "Pendiente"
            if report.estado.nombre != 'Pendiente':
                return Response({
                    'error': 'Solo se pueden eliminar imágenes de reportes en estado Pendiente'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Obtener y eliminar la imagen
            imagen = ReportArchivo.objects.get(id=image_id, report=report)
            
            with transaction.atomic():
                # Eliminar el archivo físico si existe
                if imagen.archivo:
                    if default_storage.exists(imagen.archivo.name):
                        default_storage.delete(imagen.archivo.name)
                
                imagen.delete()
            
            return Response({
                'message': 'Imagen eliminada exitosamente'
            }, status=status.HTTP_200_OK)
            
        except ReportModel.DoesNotExist:
            return Response({
                'error': 'Reporte no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except ReportArchivo.DoesNotExist:
            return Response({
                'error': 'Imagen no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Error al eliminar la imagen',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)