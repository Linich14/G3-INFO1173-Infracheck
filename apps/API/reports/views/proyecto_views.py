from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from interfaces.authentication.permissions import IsAuthenticatedWithSesionToken
from interfaces.authentication.session_token_auth import SesionTokenAuthentication

from reports.services import proyecto_service, ProyectoNotFoundException, ProyectoValidationException
from reports.serializers import (
    CreateProyectoSerializer,
    UpdateProyectoSerializer,
    ProyectoDetailSerializer,
    ProyectoListSerializer,
    ProyectoReportSerializer,
    ProyectoArchivoSerializer,
    CreateProyectoArchivoSerializer
)


# ==================== CRUD BÁSICO ====================

class CreateProyectoView(APIView):
    """
    POST /api/projects/create/
    Crear nuevo proyecto vinculado a una denuncia
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def post(self, request):
        serializer = CreateProyectoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            proyecto = proyecto_service.create_proyecto(**serializer.validated_data)
            response_serializer = ProyectoDetailSerializer(proyecto)
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )
            
        except ProyectoValidationException as e:
            return Response(
                {'errors': e.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error interno: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProyectoListView(APIView):
    """
    GET /api/projects/
    Listar todos los proyectos con filtros opcionales
    Query params: estado, prioridad, search
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request):
        try:
            # Obtener parámetros de filtrado
            estado = request.query_params.get('estado')
            prioridad = request.query_params.get('prioridad')
            search = request.query_params.get('search')
            
            # Convertir a int si existen
            estado = int(estado) if estado else None
            prioridad = int(prioridad) if prioridad else None
            
            proyectos = proyecto_service.get_all_proyectos(
                estado=estado,
                prioridad=prioridad,
                search=search
            )
            
            serializer = ProyectoListSerializer(proyectos, many=True)
            return Response({
                'results': serializer.data,
                'count': len(serializer.data)
            })
            
        except ValueError:
            return Response(
                {'error': 'Parámetros de filtro inválidos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProyectoDetailView(APIView):
    """
    GET /api/projects/<id>/
    Obtener detalle completo de un proyecto
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request, proyecto_id):
        try:
            proyecto = proyecto_service.get_proyecto_by_id(proyecto_id)
            if not proyecto:
                return Response(
                    {'error': 'Proyecto no encontrado'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = ProyectoDetailSerializer(proyecto)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UpdateProyectoView(APIView):
    """
    PUT/PATCH /api/projects/<id>/update/
    Actualizar información de un proyecto
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def put(self, request, proyecto_id):
        return self._update_proyecto(request, proyecto_id, partial=False)
    
    def patch(self, request, proyecto_id):
        return self._update_proyecto(request, proyecto_id, partial=True)
    
    def _update_proyecto(self, request, proyecto_id, partial=False):
        serializer = UpdateProyectoSerializer(data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response(
                {'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            proyecto = proyecto_service.update_proyecto(
                proyecto_id,
                **serializer.validated_data
            )
            response_serializer = ProyectoDetailSerializer(proyecto)
            return Response(response_serializer.data)
            
        except ProyectoNotFoundException:
            return Response(
                {'error': 'Proyecto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ProyectoValidationException as e:
            return Response(
                {'errors': e.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DeleteProyectoView(APIView):
    """
    DELETE /api/projects/<id>/delete/
    Eliminar un proyecto (soft delete)
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def delete(self, request, proyecto_id):
        try:
            result = proyecto_service.delete_proyecto(proyecto_id)
            return Response(result, status=status.HTTP_200_OK)
            
        except ProyectoNotFoundException:
            return Response(
                {'error': 'Proyecto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==================== CONSULTAS ESPECIALIZADAS ====================

class ProyectosByDenunciaView(APIView):
    """
    GET /api/projects/denuncia/<denuncia_id>/
    Obtener proyectos vinculados a una denuncia específica
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request, denuncia_id):
        try:
            proyectos = proyecto_service.get_proyectos_by_denuncia(denuncia_id)
            serializer = ProyectoListSerializer(proyectos, many=True)
            return Response({
                'results': serializer.data,
                'count': len(serializer.data)
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProyectosUrgentesView(APIView):
    """
    GET /api/projects/urgent/
    Obtener proyectos con prioridad alta (Muy Importante)
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request):
        try:
            proyectos = proyecto_service.get_proyectos_urgentes()
            serializer = ProyectoListSerializer(proyectos, many=True)
            return Response({
                'results': serializer.data,
                'count': len(serializer.data)
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProyectosActivosView(APIView):
    """
    GET /api/projects/active/
    Obtener proyectos activos (En Progreso o Pendientes)
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request):
        try:
            proyectos = proyecto_service.get_proyectos_activos()
            serializer = ProyectoListSerializer(proyectos, many=True)
            return Response({
                'results': serializer.data,
                'count': len(serializer.data)
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==================== REPORTES ASOCIADOS ====================

class ProyectoReportsView(APIView):
    """
    GET /api/projects/<id>/reports/
    Obtener reportes/denuncias asociadas a un proyecto
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request, proyecto_id):
        try:
            reportes = proyecto_service.get_reportes_asociados(proyecto_id)
            serializer = ProyectoReportSerializer(reportes, many=True)
            return Response({
                'results': serializer.data,
                'count': len(serializer.data)
            })
            
        except ProyectoNotFoundException:
            return Response(
                {'error': 'Proyecto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ReportProblemaView(APIView):
    """
    POST /api/projects/<id>/report-problem/
    Reportar un problema en un proyecto existente
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def post(self, request, proyecto_id):
        descripcion = request.data.get('descripcion', '').strip()
        
        if not descripcion:
            return Response(
                {'error': 'La descripción es obligatoria'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(descripcion) < 10:
            return Response(
                {'error': 'La descripción debe tener al menos 10 caracteres'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            result = proyecto_service.add_reporte_problema(
                proyecto_id=proyecto_id,
                descripcion=descripcion,
                usuario_id=request.user.usua_id
            )
            return Response(result, status=status.HTTP_201_CREATED)
            
        except ProyectoNotFoundException:
            return Response(
                {'error': 'Proyecto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==================== ESTADÍSTICAS ====================

class ProyectoStatisticsView(APIView):
    """
    GET /api/projects/statistics/
    Obtener estadísticas generales de todos los proyectos
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request):
        try:
            stats = proyecto_service.get_statistics()
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProyectoDetailStatisticsView(APIView):
    """
    GET /api/projects/<id>/statistics/
    Obtener estadísticas específicas de un proyecto
    Incluye gráficos de distribución y evolución temporal
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request, proyecto_id):
        try:
            stats = proyecto_service.get_proyecto_statistics(proyecto_id)
            return Response(stats)
            
        except ProyectoNotFoundException:
            return Response(
                {'error': 'Proyecto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==================== ARCHIVOS ====================

class ProyectoArchivosView(APIView):
    """
    GET /api/projects/<id>/archivos/
    Obtener todos los archivos de un proyecto
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request, proyecto_id):
        try:
            archivos = proyecto_service.get_archivos_proyecto(proyecto_id)
            serializer = ProyectoArchivoSerializer(archivos, many=True)
            return Response({
                'results': serializer.data,
                'count': len(serializer.data)
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AddArchivoProyectoView(APIView):
    """
    POST /api/projects/<id>/archivos/add/
    Añadir un archivo a un proyecto
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def post(self, request, proyecto_id):
        serializer = CreateProyectoArchivoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            archivo = proyecto_service.add_archivo(
                proyecto_id,
                serializer.validated_data
            )
            response_serializer = ProyectoArchivoSerializer(archivo)
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )
            
        except ProyectoNotFoundException:
            return Response(
                {'error': 'Proyecto no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ProyectoValidationException as e:
            return Response(
                {'errors': e.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DeleteArchivoView(APIView):
    """
    DELETE /api/projects/archivos/<archivo_id>/delete/
    Eliminar un archivo (soft delete)
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def delete(self, request, archivo_id):
        try:
            result = proyecto_service.delete_archivo(archivo_id)
            return Response(result, status=status.HTTP_200_OK)
            
        except ProyectoValidationException as e:
            return Response(
                {'errors': e.errors},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
