import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
import json

from ..models import ReportModel
from ..services.report_service import ReportService
from interfaces.authentication.permissions import IsAuthenticatedWithSesionToken
from interfaces.authentication.session_token_auth import SesionTokenAuthentication

# Configurar logger
logger = logging.getLogger(__name__)

class ReportGeoJSONView(APIView):
    """
    Vista para servir reportes en formato GeoJSON compatible con MapLibre/Mapbox
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request):
        logger.info("=== INICIO CONSULTA GEOJSON ===")
        
        try:
            usuario_id = self._get_usuario_id(request)
            
            if not usuario_id:
                return Response({
                    'success': False,
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Obtener parámetros de query
            limit = min(int(request.GET.get('limit', 100)), 500)  # Máximo 500 para mapas
            
            # Filtros de búsqueda
            filters = Q(visible=True)  # Solo reportes visibles por defecto
            
            # Filtro por usuario (opcional - para ver solo mis reportes)
            if request.GET.get('my_reports', '').lower() == 'true':
                filters &= Q(usuario_id=usuario_id)
            
            # Filtro por urgencia
            if request.GET.get('urgencia'):
                try:
                    urgencia = int(request.GET.get('urgencia'))
                    filters &= Q(urgencia=urgencia)
                except ValueError:
                    pass
            
            # Filtro por estado
            if request.GET.get('estado'):
                try:
                    estado = int(request.GET.get('estado'))
                    filters &= Q(denuncia_estado_id=estado)
                except ValueError:
                    pass
            
            # Filtro por tipo de denuncia
            if request.GET.get('tipo'):
                try:
                    tipo = int(request.GET.get('tipo'))
                    filters &= Q(tipo_denuncia_id=tipo)
                except ValueError:
                    pass
            
            # Filtro por ciudad
            if request.GET.get('ciudad'):
                try:
                    ciudad = int(request.GET.get('ciudad'))
                    filters &= Q(ciudad_id=ciudad)
                except ValueError:
                    pass
            
            # Filtro por búsqueda de texto
            search = request.GET.get('search')
            if search:
                filters &= (
                    Q(titulo__icontains=search) |
                    Q(descripcion__icontains=search) |
                    Q(direccion__icontains=search)
                )
            
            # Filtro por rango de fechas
            fecha_desde = request.GET.get('fecha_desde')
            fecha_hasta = request.GET.get('fecha_hasta')
            if fecha_desde:
                try:
                    from datetime import datetime
                    fecha_desde_obj = datetime.fromisoformat(fecha_desde.replace('Z', '+00:00'))
                    filters &= Q(fecha_creacion__gte=fecha_desde_obj)
                except ValueError:
                    pass
            if fecha_hasta:
                try:
                    from datetime import datetime
                    fecha_hasta_obj = datetime.fromisoformat(fecha_hasta.replace('Z', '+00:00'))
                    filters &= Q(fecha_creacion__lte=fecha_hasta_obj)
                except ValueError:
                    pass
            
            # Filtro por área geográfica (bounding box)
            bbox = request.GET.get('bbox')  # formato: "minLng,minLat,maxLng,maxLat"
            if bbox:
                try:
                    coords = [float(x) for x in bbox.split(',')]
                    if len(coords) == 4:
                        min_lng, min_lat, max_lng, max_lat = coords
                        filters &= Q(
                            ubicacion__longitude__gte=min_lng,
                            ubicacion__longitude__lte=max_lng,
                            ubicacion__latitude__gte=min_lat,
                            ubicacion__latitude__lte=max_lat
                        )
                except (ValueError, IndexError):
                    pass
            
            # Filtro por proximidad (centro y radio en metros)
            center_lat = request.GET.get('center_lat')
            center_lng = request.GET.get('center_lng')
            radius = request.GET.get('radius')  # en metros
            
            # Construir queryset base
            queryset = ReportModel.objects.select_related(
                'usuario', 'denuncia_estado', 'tipo_denuncia', 'ciudad'
            ).prefetch_related('archivos').filter(filters)
            
            # Aplicar filtro de proximidad si se especifica
            if center_lat and center_lng and radius:
                try:
                    center_point = Point(float(center_lng), float(center_lat))
                    radius_meters = float(radius)
                    queryset = queryset.annotate(
                        distance=Distance('ubicacion', center_point)
                    ).filter(distance__lte=radius_meters).order_by('distance')
                except (ValueError, TypeError):
                    queryset = queryset.order_by('-fecha_creacion')
            else:
                queryset = queryset.order_by('-fecha_creacion')
            
            # Aplicar límite
            reports = queryset[:limit]
            
            # Construir GeoJSON
            geojson = self._build_geojson(reports, usuario_id)
            
            # Información adicional de metadatos
            metadata = {
                'total_features': len(geojson['features']),
                'limit_applied': limit,
                'filters_applied': self._get_applied_filters(request),
                'generated_at': self._get_current_timestamp()
            }
            
            # Agregar metadatos al GeoJSON
            geojson['metadata'] = metadata
            
            logger.info(f"GeoJSON generado con {len(geojson['features'])} features")
            
            return Response(geojson, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error al generar GeoJSON: {str(e)}")
            logger.exception("Detalles del error:")
            return Response({
                'success': False,
                'error': 'Error interno del servidor',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _build_geojson(self, reports, usuario_id):
        """Construye el objeto GeoJSON a partir de los reportes"""
        features = []
        
        for report in reports:
            # Obtener imagen principal
            imagen_principal = None
            archivos = report.get_archivos_activos()
            for archivo in archivos:
                if archivo.es_principal and archivo.tipo_archivo == 'imagen':
                    imagen_principal = archivo.url
                    break
            
            # Si no hay imagen principal, tomar la primera imagen disponible
            if not imagen_principal:
                for archivo in archivos:
                    if archivo.tipo_archivo == 'imagen':
                        imagen_principal = archivo.url
                        break
            
            # Propiedades del feature
            properties = {
                'id': report.id,
                'titulo': report.titulo,
                'descripcion': report.descripcion,
                'direccion': report.direccion,
                'urgencia': report.urgencia,
                'urgencia_label': report.get_urgencia_display(),
                'estado': report.denuncia_estado.id if report.denuncia_estado else None,
                'estado_nombre': report.denuncia_estado.nombre if report.denuncia_estado else None,
                'tipo_denuncia': report.tipo_denuncia.id if report.tipo_denuncia else None,
                'tipo_denuncia_nombre': report.tipo_denuncia.nombre if report.tipo_denuncia else None,
                'ciudad': report.ciudad.id if report.ciudad else None,
                'ciudad_nombre': report.ciudad.nombre if report.ciudad else None,
                'fecha_creacion': report.fecha_creacion.isoformat() if report.fecha_creacion else None,
                'fecha_actualizacion': report.fecha_actualizacion.isoformat() if report.fecha_actualizacion else None,
                'imagen_principal': imagen_principal,
                'total_archivos': archivos.count(),
                'es_mi_reporte': report.usuario_id == usuario_id,
                'usuario_nombre': getattr(report.usuario, 'nombre', 'Usuario') if report.usuario else 'Usuario',
                
                # Propiedades para styling en el mapa
                'marker_color': self._get_marker_color(report.urgencia),
                'marker_size': self._get_marker_size(report.urgencia),
                'marker_symbol': self._get_marker_symbol(report.tipo_denuncia.nombre if report.tipo_denuncia else None)
            }
            
            # Crear feature GeoJSON
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [
                        float(report.ubicacion.x),  # longitud
                        float(report.ubicacion.y)   # latitud
                    ]
                },
                'properties': properties
            }
            
            features.append(feature)
        
        # Estructura GeoJSON completa
        geojson = {
            'type': 'FeatureCollection',
            'features': features
        }
        
        return geojson
    
    def _get_marker_color(self, urgencia):
        """Obtiene el color del marcador basado en la urgencia"""
        color_map = {
            1: '#28a745',  # Verde - Baja
            2: '#ffc107',  # Amarillo - Media
            3: '#fd7e14',  # Naranja - Alta
            4: '#dc3545',  # Rojo - Crítica
            5: '#6f42c1'   # Púrpura - Emergencia
        }
        return color_map.get(urgencia, '#6c757d')  # Gris por defecto
    
    def _get_marker_size(self, urgencia):
        """Obtiene el tamaño del marcador basado en la urgencia"""
        size_map = {
            1: 'small',
            2: 'medium',
            3: 'medium',
            4: 'large',
            5: 'large'
        }
        return size_map.get(urgencia, 'medium')
    
    def _get_marker_symbol(self, tipo_denuncia_nombre):
        """Obtiene el símbolo del marcador basado en el tipo de denuncia"""
        if not tipo_denuncia_nombre:
            return 'circle'
        
        # Mapeo básico de tipos a símbolos
        tipo_lower = tipo_denuncia_nombre.lower()
        if 'infraestructura' in tipo_lower or 'vial' in tipo_lower:
            return 'road'
        elif 'agua' in tipo_lower or 'alcantarilla' in tipo_lower:
            return 'water'
        elif 'seguridad' in tipo_lower:
            return 'police'
        elif 'ambiente' in tipo_lower or 'basura' in tipo_lower:
            return 'waste-basket'
        elif 'iluminación' in tipo_lower or 'luz' in tipo_lower:
            return 'lamp'
        else:
            return 'marker'
    
    def _get_applied_filters(self, request):
        """Obtiene los filtros aplicados para los metadatos"""
        applied_filters = {}
        
        filter_params = ['urgencia', 'estado', 'tipo', 'ciudad', 'search', 
                        'fecha_desde', 'fecha_hasta', 'bbox', 'center_lat', 
                        'center_lng', 'radius', 'my_reports']
        
        for param in filter_params:
            value = request.GET.get(param)
            if value:
                applied_filters[param] = value
        
        return applied_filters
    
    def _get_current_timestamp(self):
        """Obtiene el timestamp actual en formato ISO"""
        from datetime import datetime
        return datetime.now().isoformat()
    
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

class ReportGeoJSONClusterView(APIView):
    """
    Vista para servir reportes agrupados por clusters en formato GeoJSON
    Útil para mapas con muchos puntos
    """
    authentication_classes = [SesionTokenAuthentication]
    permission_classes = [IsAuthenticatedWithSesionToken]
    
    def get(self, request):
        logger.info("=== INICIO CONSULTA GEOJSON CLUSTERS ===")
        
        try:
            usuario_id = self._get_usuario_id(request)
            
            if not usuario_id:
                return Response({
                    'success': False,
                    'error': 'Token de autenticación inválido o expirado'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Parámetros de clustering
            zoom_level = int(request.GET.get('zoom', 10))
            cluster_radius = float(request.GET.get('cluster_radius', 0.01))  # En grados
            
            # Aplicar los mismos filtros que la vista principal
            filters = Q(visible=True)
            
            if request.GET.get('my_reports', '').lower() == 'true':
                filters &= Q(usuario_id=usuario_id)
            
            # ... (aplicar otros filtros similar a la vista principal)
            
            # Obtener reportes
            queryset = ReportModel.objects.select_related(
                'denuncia_estado', 'tipo_denuncia', 'ciudad'
            ).filter(filters)
            
            # Agrupar por proximidad geográfica
            clusters = self._create_clusters(queryset, cluster_radius)
            
            # Construir GeoJSON de clusters
            geojson = self._build_cluster_geojson(clusters, usuario_id)
            
            return Response(geojson, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error al generar GeoJSON clusters: {str(e)}")
            return Response({
                'success': False,
                'error': 'Error interno del servidor',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _create_clusters(self, queryset, radius):
        """Agrupa reportes en clusters basado en proximidad"""
        clusters = []
        processed_reports = set()
        
        for report in queryset:
            if report.id in processed_reports:
                continue
            
            # Crear nuevo cluster centrado en este reporte
            cluster_reports = [report]
            processed_reports.add(report.id)
            
            # Buscar reportes cercanos
            for other_report in queryset:
                if other_report.id in processed_reports:
                    continue
                
                # Calcular distancia aproximada
                distance = self._calculate_distance(
                    report.ubicacion.y, report.ubicacion.x,
                    other_report.ubicacion.y, other_report.ubicacion.x
                )
                
                if distance <= radius:
                    cluster_reports.append(other_report)
                    processed_reports.add(other_report.id)
            
            clusters.append(cluster_reports)
        
        return clusters
    
    def _calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calcula distancia aproximada entre dos puntos en grados"""
        import math
        return math.sqrt((lat2 - lat1)**2 + (lon2 - lon1)**2)
    
    def _build_cluster_geojson(self, clusters, usuario_id):
        """Construye GeoJSON para clusters"""
        features = []
        
        for cluster in clusters:
            if len(cluster) == 1:
                # Cluster de un solo reporte - usar feature normal
                report = cluster[0]
                feature = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [float(report.ubicacion.x), float(report.ubicacion.y)]
                    },
                    'properties': {
                        'id': report.id,
                        'titulo': report.titulo,
                        'cluster_size': 1,
                        'is_cluster': False,
                        'urgencia_max': report.urgencia,
                        'marker_color': self._get_marker_color(report.urgencia)
                    }
                }
            else:
                # Cluster múltiple
                # Calcular centro del cluster
                avg_lat = sum(r.ubicacion.y for r in cluster) / len(cluster)
                avg_lng = sum(r.ubicacion.x for r in cluster) / len(cluster)
                
                # Obtener urgencia máxima
                max_urgencia = max(r.urgencia for r in cluster)
                
                feature = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [avg_lng, avg_lat]
                    },
                    'properties': {
                        'cluster_size': len(cluster),
                        'is_cluster': True,
                        'urgencia_max': max_urgencia,
                        'marker_color': self._get_marker_color(max_urgencia),
                        'report_ids': [r.id for r in cluster]
                    }
                }
            
            features.append(feature)
        
        return {
            'type': 'FeatureCollection',
            'features': features
        }
    
    def _get_marker_color(self, urgencia):
        """Obtiene el color del marcador basado en la urgencia"""
        color_map = {
            1: '#28a745',  # Verde - Baja
            2: '#ffc107',  # Amarillo - Media
            3: '#fd7e14',  # Naranja - Alta
            4: '#dc3545',  # Rojo - Crítica
            5: '#6f42c1'   # Púrpura - Emergencia
        }
        return color_map.get(urgencia, '#6c757d')
    
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