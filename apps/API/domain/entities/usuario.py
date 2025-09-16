from django.db import models
from .rol_usuario import RolUsuario
import random

class Usuario(models.Model):
    usua_id = models.IntegerField(primary_key=True, default=lambda: random.randint(100000, 999999))
    usua_rut = models.CharField(max_length=12, unique=True)
    usua_nombre = models.CharField(max_length=50, blank=True, null=True)
    usua_apellido = models.CharField(max_length=50, blank=True, null=True)
    usua_nickname = models.CharField(max_length=50, unique=True)
    usua_email = models.EmailField()
    usua_pass = models.CharField(max_length=128)
    usua_creado = models.DateTimeField(auto_now_add=True)
    usua_actualizado = models.DateTimeField(blank=True, null=True)
    usua_telefono = models.BigIntegerField()
    usua_estado = models.IntegerField(default=1, choices=[(0, 'Deshabilitado'), (1, 'Habilitado')])
    rous_id = models.ForeignKey(RolUsuario, on_delete=models.CASCADE, db_column='rous_id')
    
    class Meta:
        db_table = 'usuario'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
    
    def __str__(self):
        return self.usua_nickname
    
    def check_password(self, raw_password):
        """Verifica si la contraseña ingresada coincide con la almacenada"""
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.usua_pass)
    
    def save(self, *args, **kwargs):
        # Verificar si es una creación (no actualización)
        is_new = self._state.adding
        
        # Generar ID aleatorio si no existe
        if not self.usua_id:
            self.usua_id = random.randint(100000, 999999)
        
        # Cifrar contraseña si no está ya cifrada
        if not self.usua_pass.startswith('pbkdf2_'):
            from django.contrib.auth.hashers import make_password
            self.usua_pass = make_password(self.usua_pass)
        
        # Solo actualizar usua_actualizado si NO es una creación
        if not is_new:
            from django.utils import timezone
            self.usua_actualizado = timezone.now()
        # Si es creación, asegurar que usua_actualizado sea None
        elif is_new and not hasattr(self, '_updating'):
            self.usua_actualizado = None
            
        super().save(*args, **kwargs)