import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Edit3 } from 'lucide-react-native';
import { UserInfo } from '~/features/profile/components/UserInfo';
import { useUser } from '~/features/profile/hooks/useUser';

function ProfileScreen() {
  const { user, loading, error, refreshUser } = useUser();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

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
          onPress={() => setIsEditModalVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Editar perfil"
          activeOpacity={0.6}
        >
          <Edit3 size={26} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Information */}
        <UserInfo 
          user={user}
          isEditModalVisible={isEditModalVisible}
          setIsEditModalVisible={setIsEditModalVisible}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProfileScreen;
