import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, QrCode } from 'lucide-react-native';
import { UserStats } from '../components/UserStats';
import { FollowButton } from '../components/FollowButton';
import { QRSection } from '../components/QRSection';
import { ContactField } from '../components/ContactField';
import { getUserPublicStats, UserPublicStats } from '../services/profileService';
import { useLanguage } from '~/contexts/LanguageContext';

interface PublicProfileScreenProps {
    userId: string | number;
    nickname?: string;
}

export default function PublicProfileScreen({ userId, nickname }: PublicProfileScreenProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState<UserPublicStats | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const userIdNumber = typeof userId === 'string' ? parseInt(userId, 10) : userId;

    const loadUserStats = useCallback(
        async (isRefresh = false) => {
            try {
                if (!isRefresh) setLoading(true);
                const data = await getUserPublicStats(userIdNumber);
                setProfileData(data);
            } catch (error) {
                console.error('Error loading user public stats:', error);
                Alert.alert(t('error'), t('profileLoadError') || 'Error al cargar el perfil');
            } finally {
                setLoading(false);
                if (isRefresh) setRefreshing(false);
            }
        },
        [userIdNumber, t]
    );

    useEffect(() => {
        loadUserStats();
    }, [loadUserStats]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadUserStats(true);
    }, [loadUserStats]);

    const handleFollow = async () => {
        // TODO: Implementar lógica de seguir/dejar de seguir usuario
        setIsFollowing(!isFollowing);
        Alert.alert(
            t('profileInfoTitle'),
            isFollowing ? t('profileUnfollowSuccess') : t('profileFollowSuccess')
        );
    };

    const handleQRPress = () => {
        setShowQR(true);
    };

    if (loading) {
        return (
            <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#537CF2" />
                    <Text className="mt-4 text-white">
                        {t('profileLoadingLabel') || 'Cargando perfil...'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!profileData) {
        return (
            <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
                <View className="flex-1 items-center justify-center px-4">
                    <Text className="mb-4 text-center text-lg text-red-500">
                        {t('profileLoadError') || 'Error al cargar el perfil'}
                    </Text>
                    <View className="flex-row space-x-4">
                        <TouchableOpacity
                            onPress={() => loadUserStats()}
                            className="rounded-lg bg-[#537CF2] px-6 py-3">
                            <Text className="font-bold text-white">
                                {t('retry') || 'Reintentar'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="rounded-lg bg-gray-600 px-6 py-3">
                            <Text className="font-bold text-white">{t('back') || 'Volver'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    const displayName = profileData?.user_info?.nickname || nickname || t('profileUserLabel');
    const fullName = profileData?.user_info
        ? `${profileData.user_info.nombre} ${profileData.user_info.apellido}`.trim()
        : '';

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
            {/* Header */}
            <View className="flex-row items-center justify-between bg-[#13161E] p-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={t('back')}
                    activeOpacity={0.6}>
                    <ArrowLeft size={26} color="white" />
                </TouchableOpacity>

                <Text className="text-2xl font-bold text-[#537CF2]">
                    {t('profilePublicTitle') || 'Perfil Público'}
                </Text>

                <View style={{ width: 26 }} />
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#537CF2"
                        colors={['#537CF2']}
                    />
                }>
                {/* Avatar y información del usuario */}
                <View className="mx-4 mt-4 rounded-xl bg-[#13161E] p-6">
                    <View className="items-center">
                        <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-[#537CF2]">
                            <Text className="text-3xl font-bold text-white">
                                {displayName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <Text className="mb-2 text-2xl font-bold text-white">{displayName}</Text>
                        {fullName && <Text className="mb-2 text-lg text-gray-300">{fullName}</Text>}
                        <Text className="mb-4 text-gray-400">ID: {userId}</Text>

                        {/* Botón de seguir */}
                        <FollowButton
                            isFollowing={isFollowing}
                            onPress={handleFollow}
                            loading={false}
                        />
                    </View>
                </View>

                {/* Estadísticas */}
                <View className="mx-4 mt-4">
                    <UserStats
                        reportes_creados={profileData.reportes_creados}
                        reportes_seguidos={profileData.reportes_seguidos}
                        votos_recibidos={profileData.votos_recibidos}
                        votos_realizados={profileData.votos_realizados}
                    />
                </View>

                {/* Sección QR */}
                <View className="mx-4 mb-6 mt-4 overflow-hidden rounded-xl bg-[#13161E]">
                    <TouchableOpacity onPress={handleQRPress} activeOpacity={0.7}>
                        <View className="flex-row items-center p-4">
                            <View className="mr-4 rounded-lg bg-[#537CF2] p-2">
                                <QrCode size={24} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-semibold text-white">
                                    {t('profileQRViewLabel') || 'Ver código QR'}
                                </Text>
                                <Text className="text-sm text-gray-400">
                                    {t('profileQRDescription') || 'Compartir perfil'}
                                </Text>
                            </View>
                            <View className="h-2 w-2 rounded-full bg-[#537CF2]" />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal QR */}
            <QRSection visible={showQR} onClose={() => setShowQR(false)} userId={userIdNumber} />
        </SafeAreaView>
    );
}
