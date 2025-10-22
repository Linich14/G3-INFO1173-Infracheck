from django.db import models
from .models.report import ReportModel
from .models.ciudad import Ciudad
from .models.denuncia_estado import DenunciaEstado
from .models.tipo_denuncia import TipoDenuncia
from .models.report_archivos import ReportArchivo

__all__ = [
    'ReportModel',
    'Ciudad',
    'DenunciaEstado',
    'TipoDenuncia',
    'ReportArchivo',
]