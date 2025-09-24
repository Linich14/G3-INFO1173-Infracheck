from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from interfaces.api.serializers.user_register import UserRegisterSerializer

class RegisterView(APIView):
    def post(self, request):
        print('Datos recibidos:', request.data)  # Para testeo en consola
        
        try:
            serializer = UserRegisterSerializer(data=request.data)
            print('Serializer creado correctamente')
            
            if serializer.is_valid():
                print('Serializer es válido, intentando guardar...')
                user = serializer.save()
                print(f'Usuario creado exitosamente: {user.usua_id}')
                return Response({
                    'success': True,
                    'message': 'Registro exitoso. Usuario creado correctamente.',
                    'data': {
                        'usua_id': user.usua_id,
                        'usua_nickname': user.usua_nickname,
                        'usua_rut': user.usua_rut
                    }
                }, status=status.HTTP_200_OK)
            else:
                print('Errores de validación:', serializer.errors)
                # Construir mensaje de error más claro
                error_messages = []
                for field, errors in serializer.errors.items():
                    if field == 'non_field_errors':
                        error_messages.extend(errors)
                    else:
                        for error in errors:
                            error_messages.append(f"{field}: {error}")
                
                error_message = '; '.join(error_messages) if error_messages else 'Datos de registro inválidos'
                
                return Response({
                    'success': False,
                    'message': error_message,
                    'errors': serializer.errors
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            print(f'Error en registro: {str(e)}')
            import traceback
            print('Traceback completo:', traceback.format_exc())
            return Response({
                'success': False,
                'message': f'Error interno del servidor: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)