from .report_serializers import (
    ReportSerializer,
    ReportListSerializer, 
    CreateReportSerializer,
    UpdateReportSerializer,
    ReportDetailSerializer
)
from .shared_serializers import (
    CiudadSerializer,
    TipoDenunciaSerializer,
    DenunciaEstadoSerializer
)
from .proyecto_serializers import (
    ProyectoArchivoSerializer,
    CreateProyectoArchivoSerializer,
    CreateProyectoSerializer,
    UpdateProyectoSerializer,
    ProyectoListSerializer,
    ProyectoDetailSerializer,
    ProyectoReportSerializer
)

__all__ = [
    'ReportSerializer',
    'ReportListSerializer',
    'CreateReportSerializer', 
    'UpdateReportSerializer',
    'ReportDetailSerializer',
    'CiudadSerializer',
    'TipoDenunciaSerializer',
    'DenunciaEstadoSerializer',
    'ProyectoArchivoSerializer',
    'CreateProyectoArchivoSerializer',
    'CreateProyectoSerializer',
    'UpdateProyectoSerializer',
    'ProyectoListSerializer',
    'ProyectoDetailSerializer',
    'ProyectoReportSerializer'
]
