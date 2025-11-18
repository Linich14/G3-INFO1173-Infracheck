import React, { useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Settings, FileText } from 'lucide-react-native';
import { UserInfo } from '~/features/profile/components/UserInfo';
import { ChangePasswordSection } from '~/features/profile/components/ChangePasswordSection';
import { DeleteAccountSection } from '~/features/profile/components/DeleteAccountSection';
import { useUser } from '~/features/profile/hooks/useUser';
import { useLanguage } from '~/contexts/LanguageContext';
import { getUserId } from '~/features/auth/services/authService';

function ProfileScreen() {
    const { user, loading, error, refreshUser } = useUser();
    const { t } = useLanguage();

    // Al volver a la pantalla de perfil, refrescamos el usuario para que
    // los contadores de reportes seguidos/creados se mantengan actualizados.
    useFocusEffect(
        useCallback(() => {
            refreshUser();
        }, [refreshUser])
    );

    const handleViewMyReports = async () => {
        try {
            const userId = await getUserId();
            if (userId) {
                router.push(`/profile/my-reports`);
            } else {
                console.error('No se pudo obtener el ID del usuario');
            }
        } catch (error) {
            console.error('Error al obtener el ID del usuario:', error);
        }
    };

    if (loading) {
        return (
            <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#537CF2" />
                    <Text className="mt-4 text-white">{t('profileTitle')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !user) {
        return (
            <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
                <View className="flex-1 items-center justify-center px-4">
                    <Text className="mb-4 text-center text-lg text-red-500">
                        {error || t('profileLoadError')}
                    </Text>
                    <View className="flex-row space-x-4">
                        <TouchableOpacity
                            onPress={refreshUser}
                            className="rounded-lg bg-[#537CF2] px-6 py-3">
                            <Text className="font-bold text-white">{t('retry')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="rounded-lg bg-gray-600 px-6 py-3">
                            <Text className="font-bold text-white">{t('back')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

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

                <Text className="text-2xl font-bold text-[#537CF2]">{t('profileTitle')}</Text>

                <TouchableOpacity
                    onPress={() => console.log('Configuración')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={t('profileSettingsAccessibility')}
                    activeOpacity={0.6}>
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
                        colors={['#537CF2']}
                    />
                }>
                {/* User Information */}
                <UserInfo user={user} />

                {/* My Reports Section */}
                <View className="mb-4 px-4">
                    <View className="rounded-xl bg-[#13161E] p-4">
                        <TouchableOpacity
                            onPress={handleViewMyReports}
                            className="flex-row items-center justify-between"
                            activeOpacity={0.7}>
                            <View className="flex-1 flex-row items-center">
                                <View className="mr-4 rounded-lg bg-[#537CF2] p-2">
                                    <FileText size={24} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-white">
                                        {t('profileMyReportsTitle') || 'Mis Reportes'}
                                    </Text>
                                    <Text className="text-sm text-gray-400">
                                        {t('profileMyReportsDescription') ||
                                            'Ver todos los reportes que he creado'}
                                    </Text>
                                </View>
                            </View>
                            <View className="h-2 w-2 rounded-full bg-[#537CF2]" />
                        </TouchableOpacity>
                    </View>
                </View>

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
