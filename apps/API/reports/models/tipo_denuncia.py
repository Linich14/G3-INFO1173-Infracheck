from django.db import models

class TipoDenuncia(models.Model):
    id = models.AutoField(primary_key=True, editable=False, unique=True)
    nombre = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'tipo_denuncias'
    
    def __str__(self):
        return self.nombre