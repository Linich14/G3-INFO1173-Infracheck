import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Settings } from 'lucide-react-native';
import { UserInfo } from '~/features/profile/components/UserInfo';
import { ChangePasswordSection } from '~/features/profile/components/ChangePasswordSection';
import { DeleteAccountSection } from '~/features/profile/components/DeleteAccountSection';
import { useUser } from '~/features/profile/hooks/useUser';

function ProfileScreen() {
  const { user, loading, error, refreshUser } = useUser();

  // Al volver a la pantalla de perfil, refrescamos el usuario para que
  // los contadores de reportes seguidos/creados se mantengan actualizados.
  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [refreshUser])
  );

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#537CF2" />
          <Text className="text-white mt-4">Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-500 text-center text-lg mb-4">
            {error || 'Error al cargar el perfil'}
          </Text>
          <View className="flex-row space-x-4">
            <TouchableOpacity 
              onPress={refreshUser}
              className="bg-[#537CF2] px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-bold">Reintentar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.back()}
              className="bg-gray-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-bold">Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
      {/* Header */}
      <View className="bg-[#13161E] flex-row justify-between items-center p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          activeOpacity={0.6}
        >
          <ArrowLeft size={26} color="white" />
        </TouchableOpacity>
        
        <Text className="text-[#537CF2] font-bold text-2xl">Perfil de usuario</Text>
        
        <TouchableOpacity
          onPress={() => console.log('Configuración')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Configuración"
          activeOpacity={0.6}
        >
          <Settings size={26} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshUser}
            tintColor="#537CF2"
            colors={["#537CF2"]}
          />
        }
      >
        {/* User Information */}
        <UserInfo user={user} />

        {/* Change Password Section */}
        <View className="px-4">
          <ChangePasswordSection />
        </View>

        {/* Delete Account Section */}
        <View className="px-4 pb-8">
          <DeleteAccountSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProfileScreen;
