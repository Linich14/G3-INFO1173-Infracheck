from dataclasses import dataclass
from typing import Optional
from ...domain.entities.reports import Report

@dataclass
class CreateReportDTO:
    """DTO para crear un reporte"""
    titulo: str
    descripcion: str
    ubicacion: str
    urgencia: int
    usuario_id: int
    denuncia_estado_id: int
    tipo_denuncia_id: int
    ciudad_id: int


@dataclass
class UpdateReportDTO:
    """DTO para actualizar un reporte"""
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    ubicacion: Optional[str] = None
    urgencia: Optional[int] = None
    denuncia_estado_id: Optional[int] = None
    tipo_denuncia_id: Optional[int] = None


@dataclass
class ReportResponseDTO:
    """DTO para la respuesta de un reporte"""
    id: int
    titulo: str
    descripcion: str
    ubicacion: str
    visible: bool
    urgencia: int
    usuario_id: int
    denuncia_estado_id: int
    tipo_denuncia_id: int
    ciudad_id: int
    fecha_creacion: str
    fecha_actualizacion: Optional[str]
    
    @staticmethod
    def from_entity(report: 'Report') -> 'ReportResponseDTO':
        """Convierte una entidad Report a DTO"""
        return ReportResponseDTO(
            id=report.id if report.id else 0,
            titulo=report.titulo,
            descripcion=report.descripcion,
            ubicacion=report.ubicacion,
            visible=report.visible,
            urgencia=report.urgencia.to_int(),
            usuario_id=report.usuario_id,
            denuncia_estado_id=report.denuncia_estado_id,
            tipo_denuncia_id=report.tipo_denuncia_id,
            ciudad_id=report.ciudad_id,
            fecha_creacion=report.fecha_creacion.isoformat(),
            fecha_actualizacion=report.fecha_actualizacion.isoformat() if report.fecha_actualizacion else None
        )