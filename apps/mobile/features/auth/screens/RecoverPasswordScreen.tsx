import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

const RecoverPasswordScreen: React.FC = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 24 }}>Recuperar contraseña</Text>
      <Text style={{ marginBottom: 24 }}>
        Aquí irá el formulario para recuperar la contraseña.
      </Text>
      <Button title="Volver a Iniciar Sesión" onPress={() => router.replace('/(auth)/sign-in')} />
    </View>
  );
};

export default RecoverPasswordScreen;
