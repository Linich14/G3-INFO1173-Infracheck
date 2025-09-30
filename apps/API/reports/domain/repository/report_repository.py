from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.reports import Report


class ReportRepository(ABC):

    @abstractmethod
    def save(self, report: Report) -> Report:
        pass
    
    @abstractmethod
    def update(self, report: Report) -> Report:
        pass
    
    @abstractmethod
    def delete(self, report_id: int) -> None:
        pass
    
    @abstractmethod
    def find_by_id(self, report_id: int) -> Optional[Report]:
        pass
    
    @abstractmethod
    def find_all(self) -> List[Report]:
        pass
    
    @abstractmethod
    def find_visible(self) -> List[Report]:
        pass
    
    @abstractmethod
    def find_by_user(self, usuario_id: int) -> List[Report]:
        pass
    
    @abstractmethod
    def exists(self, report_id: int ) -> bool:
        pass 