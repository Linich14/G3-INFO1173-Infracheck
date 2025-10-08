from django.db import models

class DenunciaEstado(models.Model):
    id = models.AutoField(primary_key=True, editable=False, unique=True)
    nombre = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'denuncia_estados'
    
    def __str__(self):
        return self.nombre