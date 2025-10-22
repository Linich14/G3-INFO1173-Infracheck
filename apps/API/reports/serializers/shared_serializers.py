from rest_framework import serializers
from reports.models import Ciudad, TipoDenuncia, DenunciaEstado


class CiudadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ciudad
        fields = ['id', 'nombre']


class TipoDenunciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoDenuncia
        fields = ['id', 'nombre']


class DenunciaEstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DenunciaEstado
        fields = ['id', 'nombre']
