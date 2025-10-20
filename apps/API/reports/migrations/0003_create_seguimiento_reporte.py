# Generated manually for SeguimientoReporte model

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reports', '0002_delete_notification'),
        ('entities', '0002_alter_usuario_usua_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='SeguimientoReporte',
            fields=[
                ('id', models.AutoField(editable=False, primary_key=True, serialize=False, unique=True)),
                ('fecha_seguimiento', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de seguimiento')),
                ('reporte', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='seguidores', to='reports.reportmodel', verbose_name='Reporte')),
                ('usuario', models.ForeignKey(db_column='usuario_id', on_delete=django.db.models.deletion.CASCADE, related_name='reportes_seguidos', to='entities.usuario', verbose_name='Usuario')),
            ],
            options={
                'verbose_name': 'Seguimiento de Reporte',
                'verbose_name_plural': 'Seguimientos de Reportes',
                'ordering': ['-fecha_seguimiento'],
                'unique_together': {('usuario', 'reporte')},
                'db_table': 'seguimiento_reporte',
            },
        ),
        migrations.AddIndex(
            model_name='seguimientoreporte',
            index=models.Index(fields=['usuario', 'fecha_seguimiento'], name='seguimiento_usuario_fecha_idx'),
        ),
        migrations.AddIndex(
            model_name='seguimientoreporte',
            index=models.Index(fields=['reporte'], name='seguimiento_reporte_idx'),
        ),
    ]