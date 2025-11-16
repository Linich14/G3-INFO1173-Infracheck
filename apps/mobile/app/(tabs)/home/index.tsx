import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { isAuthenticated, getUserRole } from '~/features/auth/services/authService';
import { useLanguage } from '~/contexts/LanguageContext';

// Importar todos los screens directamente
import AdminHomeScreen from '~/features/home/screens/Homeadminscreen';
import AuthorityHomeScreen from '~/features/home/screens/Homeauthoscreen';
import ClientHomeScreen from '~/features/home/screens/Homeclientescreen';

export default function HomeRouter() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<number | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const checkUserRoleAndAuth = async () => {
      try {
        // 1. Verificar autenticación
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          router.replace('/(auth)/sign-in');
          return;
        }

        // 2. Obtener rol del usuario
        const roleData = await getUserRole();
        if (!roleData) {
          router.replace('/(auth)/sign-in');
          return;
        }

        // 3. Establecer el rol para renderizar el componente correcto
        setUserRole(roleData.rous_id);
      } catch (error) {

        router.replace('/(auth)/sign-in');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRoleAndAuth();
  }, []);

  // Efecto para manejar rol inválido
  useEffect(() => {
    if (!isLoading && userRole !== null && userRole !== 1 && userRole !== 2 && userRole !== 3) {

      router.replace('/(auth)/sign-in');
    }
  }, [isLoading, userRole]);

  // Loading mientras se verifica el rol
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090A0D' }}>
        <ActivityIndicator size="large" color="#537CF2" />
        <Text style={{ color: '#fff', marginTop: 16 }}>{t('loading')}</Text>
      </View>
    );
  }

  // Renderizar el componente correcto según el rol
  switch (userRole) {
    case 1: // Administrador
      return <AdminHomeScreen />;
    case 2: // Municipal
      return <AuthorityHomeScreen />;
    case 3: // Usuario normal
      return <ClientHomeScreen />;
    default:
      // Rol no válido - mostrar loading mientras se redirige
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090A0D' }}>
          <ActivityIndicator size="large" color="#537CF2" />
          <Text style={{ color: '#fff', marginTop: 16 }}>{t('redirecting')}</Text>
        </View>
      );
  }
}