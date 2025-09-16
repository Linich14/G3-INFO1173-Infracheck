from django.db import models

class RolUsuario(models.Model):
    rous_id = models.AutoField(primary_key=True)
    rous_nombre = models.CharField(max_length=50, unique=True)
    
    class Meta:
        db_table = 'rol_usuario'
        verbose_name = 'Rol de Usuario'
        verbose_name_plural = 'Roles de Usuario'
    
    def __str__(self):
        return self.rous_nombre