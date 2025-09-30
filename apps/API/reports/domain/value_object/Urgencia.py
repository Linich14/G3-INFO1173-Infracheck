from enum import Enum

class NivelUrgencia(Enum):
    BAJA = 1
    MEDIA = 2
    ALTA = 3


class Urgencia:
    """Value Object para representar la urgencia de un reporte"""
    
    BAJA: 'Urgencia' = None
    MEDIA: 'Urgencia' = None
    ALTA: 'Urgencia' = None
    
    def __init__(self, level: NivelUrgencia):
        self._level = level
    
    @classmethod
    def from_int(cls, value: int) -> 'Urgencia':
        """Crea una instancia desde un entero"""
        if value not in [1, 2, 3]:
            raise Exception(f"Urgencia inválida: {value}. Debe ser 1, 2 o 3")
        
        return cls(NivelUrgencia(value))
    
    def to_int(self) -> int:
        return self._level.value
    
    def es_baja(self) -> bool:
        return self._level == NivelUrgencia.BAJA
    
    def es_media(self) -> bool:
        return self._level == NivelUrgencia.MEDIA
    
    def es_alta(self) -> bool:
        return self._level == NivelUrgencia.ALTA
    
    def __eq__(self, other):
        if not isinstance(other, Urgencia):
            return False
        return self._level == other._level
    
    def __str__(self):
        return self._level.name


# Constantes estáticas
Urgencia.BAJA = Urgencia(NivelUrgencia.BAJA)
Urgencia.MEDIA = Urgencia(NivelUrgencia.MEDIA)
Urgencia.ALTA = Urgencia(NivelUrgencia.ALTA)

