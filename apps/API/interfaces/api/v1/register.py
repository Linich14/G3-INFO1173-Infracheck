from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from interfaces.api.serializers.user_register import UserRegisterSerializer

class RegisterView(APIView):
    def post(self, request):
        print('Datos recibidos:', request.data)  # Para testeo en consola
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'Usuario registrado correctamente.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)