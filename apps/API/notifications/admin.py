from django.contrib import admin
from notifications.models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'titulo', 'usuario', 'tipo', 'leida', 'fecha_creacion']
    list_filter = ['tipo', 'leida', 'fecha_creacion']
    search_fields = ['titulo', 'mensaje', 'usuario__usua_nickname']
    readonly_fields = ['fecha_creacion', 'fecha_lectura']
    date_hierarchy = 'fecha_creacion'
    
    fieldsets = (
        ('Información General', {
            'fields': ('usuario', 'titulo', 'mensaje', 'tipo')
        }),
        ('Estado', {
            'fields': ('leida', 'fecha_creacion', 'fecha_lectura')
        }),
        ('Relaciones', {
            'fields': ('denuncia',),
            'classes': ('collapse',)
        }),
    )
