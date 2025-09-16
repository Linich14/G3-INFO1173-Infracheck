from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from interfaces.api.serializers.user_login import UserLoginSerializer

class LoginView(APIView):
    def post(self, request):
        print('Datos de login recibidos:', request.data)  # Para testeo en consola
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.validated_data['usuario']
            token = serializer.validated_data['token']
            token_expira_en = serializer.validated_data['token_expira_en']
            
            return Response({
                'message': 'Login exitoso',
                'token': token,
                'token_expira_en': token_expira_en,
                'usuario': {
                    'usua_id': usuario.usua_id,
                    'usua_nickname': usuario.usua_nickname,
                    'usua_rut': usuario.usua_rut,
                    'usua_telefono': usuario.usua_telefono,
                    'rous_id': usuario.rous_id.rous_id
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)