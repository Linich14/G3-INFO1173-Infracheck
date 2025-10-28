import '../global.css';

import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '~/contexts/AuthContext';
import { UserProvider } from '~/contexts/UserContext';
import { View, ActivityIndicator } from 'react-native';
import { useNavigationBreadcrumb } from '~/hooks/useNavigationBreadcrumb';

function RootLayoutNav() {
  const { isLoggedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useNavigationBreadcrumb();

  useEffect(() => {
    console.log('Layout navigation check:', { isLoading, isLoggedIn, segments }); // Debug log
    
    if (isLoading) return; // Esperar a que termine de verificar la autenticación

    const inAuthGroup = segments[0] === '(auth)';
    const inWelcomeScreen = segments[0] === undefined || segments.join('/') === ''; // Usuario en la raíz (welcome screen)

    if (!isLoggedIn && !inAuthGroup && !inWelcomeScreen) {
      // Usuario no autenticado, no está en auth ni en welcome -> redirigir al login
      console.log('Redirecting to login'); // Debug log
      router.replace('/(auth)/sign-in');
    } else if (isLoggedIn && inAuthGroup) {
      // Usuario autenticado pero está en páginas de auth -> redirigir al home del cliente
      console.log('Redirecting to home from auth'); // Debug log
      router.replace('/(tabs)/home');
    } else if (isLoggedIn && inWelcomeScreen) {
      // Usuario autenticado en la raíz -> redirigir al home del cliente
      console.log('Redirecting to home from root'); // Debug log
      router.replace('/(tabs)/home');
    }
  }, [isLoggedIn, isLoading, segments, router]);

  if (isLoading) {
    // Mostrar loading mientras verifica la autenticación
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#537CF2" />
      </View>
    );
  }

  return (
    <Slot
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <UserProvider>
        <RootLayoutNav />
      </UserProvider>
    </AuthProvider>
  );
}
