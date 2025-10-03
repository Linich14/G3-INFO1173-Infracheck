from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
# Cambiar el import de permisos
from interfaces.authentication.permissions import IsAuthenticatedWithSesionToken
from interfaces.authentication.session_token_auth import SesionTokenAuthentication

from reports.services import report_service
from reports.serializers import (
    CreateReportSerializer,
    UpdateReportSerializer, 
    ReportDetailSerializer,
    ReportListSerializer,
    ReportSerializer
)
from reports.exceptions import ReportNotFoundException, ReportValidationException


class CreateReportView(APIView):
    """Crear nuevo reporte"""
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]  # Cambiar aquí
    
    def post(self, request):
        serializer = CreateReportSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Agregar el usuario autenticado al reporte
            validated_data = serializer.validated_data
            validated_data['usuario_id'] = request.user.usua_id
            
            report = report_service.create_report(**validated_data)
            response_serializer = ReportDetailSerializer(report)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except ReportValidationException as e:
            return Response({'errors': e.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReportListView(APIView):
    """Listar todos los reportes"""
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]  # Cambiar aquí
    
    def get(self, request):
        try:
            reports = report_service.get_all_reports()
            serializer = ReportListSerializer(reports, many=True)
            return Response({
                'results': serializer.data,
                'count': len(serializer.data)
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReportDetailView(APIView):
    """Obtener detalle de un reporte"""
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]  # Cambiar aquí
    
    def get(self, request, report_id):
        try:
            report = report_service.get_report_by_id(report_id)
            if not report:
                return Response({'error': 'Reporte no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = ReportDetailSerializer(report)
            return Response(serializer.data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateReportView(APIView):
    """Actualizar reporte"""
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]  # Cambiar aquí
    
    def put(self, request, report_id):
        return self._update_report(request, report_id, partial=False)
    
    def patch(self, request, report_id):
        return self._update_report(request, report_id, partial=True)
    
    def _update_report(self, request, report_id, partial=False):
        serializer = UpdateReportSerializer(data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            report = report_service.update_report(report_id, **serializer.validated_data)
            response_serializer = ReportDetailSerializer(report)
            return Response(response_serializer.data)
            
        except ReportNotFoundException:
            return Response({'error': 'Reporte no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except ReportValidationException as e:
            return Response({'errors': e.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeleteReportView(APIView):
    """Eliminar reporte"""
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]  # Cambiar aquí
    
    def delete(self, request, report_id):
        try:
            result = report_service.delete_report(report_id)
            return Response(result, status=status.HTTP_200_OK)
            
        except ReportNotFoundException:
            return Response({'error': 'Reporte no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserReportsView(APIView):
    """Obtener reportes del usuario autenticado"""
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]  # Cambiar aquí
    
    def get(self, request):
        try:
            # Usar el usuario autenticado en lugar de recibir user_id como parámetro
            reports = report_service.get_reports_by_user(request.user.id)
            serializer = ReportListSerializer(reports, many=True)
            return Response({
                'results': serializer.data,
                'count': len(serializer.data)
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UrgentReportsView(APIView):
    """Obtener reportes urgentes"""
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]  # Cambiar aquí
    
    def get(self, request):
        try:
            reports = report_service.get_urgent_reports()
            serializer = ReportListSerializer(reports, many=True)
            return Response({
                'results': serializer.data,
                'count': len(serializer.data)
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReportStatisticsView(APIView):
    """Obtener estadísticas de reportes"""
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]  # Cambiar aquí
    
    def get(self, request):
        try:
            stats = report_service.get_statistics()
            return Response(stats)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
