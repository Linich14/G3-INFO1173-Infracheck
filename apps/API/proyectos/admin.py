from django.contrib import admin
from proyectos.models import ProyectoModel, ProyectoArchivosModel


@admin.register(ProyectoModel)
class ProyectoModelAdmin(admin.ModelAdmin):
    list_display = ('proy_id', 'proy_titulo', 'proy_estado', 'proy_prioridad', 'proy_lugar', 'proy_visible', 'proy_creado')
    list_filter = ('proy_estado', 'proy_prioridad', 'proy_visible', 'proy_creado')
    search_fields = ('proy_titulo', 'proy_descripcion', 'proy_lugar')
    readonly_fields = ('proy_creado', 'proy_actualizado')
    ordering = ('-proy_creado',)
    
    fieldsets = (
        ('Información Principal', {
            'fields': ('proy_titulo', 'proy_descripcion', 'proy_estado', 'proy_visible')
        }),
        ('Detalles del Proyecto', {
            'fields': ('proy_lugar', 'proy_prioridad', 'proy_fecha_inicio_estimada', 'proy_tipo_denuncia')
        }),
        ('Relaciones', {
            'fields': ('denu_id',)
        }),
        ('Metadatos', {
            'fields': ('proy_creado', 'proy_actualizado'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProyectoArchivosModel)
class ProyectoArchivosModelAdmin(admin.ModelAdmin):
    list_display = ('proar_id', 'proy_id', 'proar_tipo', 'proar_nombre_archivo', 'proar_visible', 'proar_creado')
    list_filter = ('proar_tipo', 'proar_visible', 'proar_creado')
    search_fields = ('proar_nombre_archivo', 'proar_ruta')
    readonly_fields = ('proar_creado', 'proar_actualizado')
    ordering = ('-proar_creado',)
    
    fieldsets = (
        ('Información del Archivo', {
            'fields': ('proy_id', 'proar_tipo', 'proar_nombre_archivo', 'proar_visible')
        }),
        ('Detalles Técnicos', {
            'fields': ('proar_contenido_tipo', 'proar_mime', 'proar_ruta')
        }),
        ('Metadatos', {
            'fields': ('proar_creado', 'proar_actualizado'),
            'classes': ('collapse',)
        }),
    )

