from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List
from ..value_object.Urgencia import Urgencia

@dataclass
class Report:
    id: int
    titulo: str
    descripcion: str
    ubicacion: str
    visible: bool
    urgencia: Urgencia
    usuario_id: int
    denuncia_estado_id: int
    tipo_denuncia_id: int
    ciudad_id: int
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None
    
    @staticmethod
    def create(
        titulo: str,
        descripcion: str,
        ubicacion: str,
        urgencia: int,
        usuario_id: int,
        denuncia_estado_id: int,
        tipo_denuncia_id: int,
        ciudad_id: int
    ) -> 'Report':
        return Report(
            id=None,  # Se asignará al persistir
            titulo=titulo,
            descripcion=descripcion,
            ubicacion=ubicacion,
            visible=True,  # Por defecto visible
            urgencia=Urgencia.from_int(urgencia),
            usuario_id=usuario_id,
            denuncia_estado_id=denuncia_estado_id,
            tipo_denuncia_id=tipo_denuncia_id,
            ciudad_id=ciudad_id,
            fecha_creacion=datetime.now(),
            fecha_actualizacion=None
        )
    
    def update(
        self,
        titulo: Optional[str] = None,
        descripcion: Optional[str] = None,
        ubicacion: Optional[str] = None,
        urgencia: Optional[int] = None,
        denuncia_estado_id: Optional[int] = None,
        tipo_denuncia_id: Optional[int] = None
    ) -> None:
        """Actualiza el reporte manteniendo las invariantes"""
        if titulo is not None:
            self.titulo = titulo
        if descripcion is not None:
            self.descripcion = descripcion
        if ubicacion is not None:
            self.ubicacion = ubicacion
        if urgencia is not None:
            self.urgencia = Urgencia.from_int(urgencia)
        if denuncia_estado_id is not None:
            self.denuncia_estado_id = denuncia_estado_id
        if tipo_denuncia_id is not None:
            self.tipo_denuncia_id = tipo_denuncia_id
        
        self.fecha_actualizacion = datetime.now()
    
    def hide(self) -> None:
        self.visible = False
        self.fecha_actualizacion = datetime.now()
    
    def show(self) -> None:
        self.visible = True
        self.fecha_actualizacion = datetime.now()
    
    def is_visible(self) -> bool:
        """Verifica si el reporte es visible"""
        return self.visible
    
    