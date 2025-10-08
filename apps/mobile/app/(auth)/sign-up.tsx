import React from 'react';
import { Stack } from 'expo-router';
import RegisterScreen from '~/features/auth/screens/RegisterScreen';

export default function SignUp() {
  return (
    <>
      <Stack.Screen options={{ animation: 'fade' }} />
      <RegisterScreen />
    </>
  );
}
