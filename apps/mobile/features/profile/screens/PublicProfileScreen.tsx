import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { QrCode } from 'lucide-react-native';
import { UserStats } from '../components/UserStats';
import { FollowButton } from '../components/FollowButton';
import { QRSection } from '../components/QRSection';
import { ContactField } from '../components/ContactField';
import { getUserStats } from '../services/profileService';

interface PublicProfileScreenProps {
  userId: string | number;
  nickname?: string;
}

export default function PublicProfileScreen({ userId, nickname }: PublicProfileScreenProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ reportCount: 0, upVotes: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const userIdNumber = typeof userId === 'string' ? parseInt(userId, 10) : userId;

  const loadUserStats = useCallback(async () => {
    try {
      const data = await getUserStats(userIdNumber);
      setStats(data);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  }, [userIdNumber]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  const handleFollow = async () => {
    // TODO: Implementar lógica de seguir/dejar de seguir usuario
    setIsFollowing(!isFollowing);
    Alert.alert(
      'Información',
      isFollowing ? 'Has dejado de seguir a este usuario' : 'Ahora sigues a este usuario'
    );
  };

  const handleQRPress = () => {
    setShowQR(true);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        {/* Avatar y nombre */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-blue-500 items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">
              {nickname ? nickname.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {nickname || 'Usuario'}
          </Text>
          <Text className="text-gray-500 mb-4">ID: {userId}</Text>
          
          {/* Botón de seguir */}
          <FollowButton
            isFollowing={isFollowing}
            onPress={handleFollow}
            loading={false}
          />
        </View>

        {/* Estadísticas */}
        <UserStats reportCount={stats.reportCount} upVotes={stats.upVotes} />

        {/* Botón QR */}
        <View className="mt-6">
          <ContactField
            icon={QrCode}
            label="Código QR"
            value="Ver código QR del usuario"
            onPress={handleQRPress}
          />
        </View>

        {/* Información de contacto (opcional, solo si está disponible públicamente) */}
        {/* <View className="mt-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Información de contacto
          </Text>
          <ContactField
            icon={Mail}
            label="Email"
            value="No disponible públicamente"
            onPress={() => {}}
          />
          <ContactField
            icon={Phone}
            label="Teléfono"
            value="No disponible públicamente"
            onPress={() => {}}
          />
        </View> */}
      </View>

      {/* Modal QR */}
      <QRSection
        visible={showQR}
        onClose={() => setShowQR(false)}
        userId={userIdNumber}
      />
    </ScrollView>
  );
}
