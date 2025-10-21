# Generated manually for ComentarioReporte model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('reports', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ComentarioReporte',
            fields=[
                ('id', models.AutoField(editable=False, primary_key=True, serialize=False, unique=True)),
                ('comentario', models.TextField(help_text='Texto del comentario', verbose_name='Comentario')),
                ('fecha_comentario', models.DateTimeField(auto_now_add=True, verbose_name='Fecha del comentario')),
                ('reporte', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comentarios', to='reports.reportmodel', verbose_name='Reporte')),
                ('usuario', models.ForeignKey(db_column='usuario_id', on_delete=django.db.models.deletion.CASCADE, related_name='comentarios_reportes', to='entities.usuario', verbose_name='Usuario')),
            ],
            options={
                'verbose_name': 'Comentario de Reporte',
                'verbose_name_plural': 'Comentarios de Reportes',
                'ordering': ['-fecha_comentario'],
                'db_table': 'comentario_reporte',
                'indexes': [
                    models.Index(fields=['usuario', 'fecha_comentario']),
                    models.Index(fields=['reporte', 'fecha_comentario']),
                ],
            },
        ),
    ]