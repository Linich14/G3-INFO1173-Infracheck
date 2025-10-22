from django.db import models
from django.core.exceptions import ValidationError

class ReportStatsModel(models.Model):
    """Modelo de Django para estadísticas de reportes"""
    
    id = models.AutoField(primary_key=True, editable=False, unique=True)
    report = models.ForeignKey('ReportModel', on_delete=models.CASCADE, related_name='stats')
    like_stats = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    class Meta:
        db_table = 'report_stats'
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return f"Stats for Report ID {self.report.id}"
    
    # ========== MÉTODOS DE CONSULTA (Read-only) ==========
    
    def increment_likes(self):
        """Incrementa el contador de likes"""
        self.likes += 1
        self.save(update_fields=['likes', 'fecha_actualizacion'])
   
    
    # ========== VALIDACIONES ==========
    
    def clean(self):
        """Validaciones a nivel de modelo"""
        errors = {}
        
        if self.likes < 0:
            errors['likes'] = 'El contador de likes no puede ser negativo'
        
        if errors:
            raise ValidationError(errors)
