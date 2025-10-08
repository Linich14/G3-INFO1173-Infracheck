from rest_framework import serializers

class DeleteAccountSerializer(serializers.Serializer):
    """
    Serializador para la eliminación de cuenta de usuario.
    No requiere campos adicionales, ya que la autenticación se maneja por token.
    """
    pass