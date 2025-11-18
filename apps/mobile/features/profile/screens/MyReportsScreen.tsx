import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { UserReportsGrid } from '../components/UserReportsGrid';
import { useLanguage } from '~/contexts/LanguageContext';
import { getUserId } from '~/features/auth/services/authService';

export default function MyReportsScreen() {
    const { t } = useLanguage();
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        const loadUserId = async () => {
            try {
                const userId = await getUserId();
                if (userId) {
                    setCurrentUserId(parseInt(userId, 10));
                }
            } catch (error) {
                console.error('Error al obtener el ID del usuario:', error);
                // Si no se puede obtener el ID, volver atrás
                router.back();
            }
        };

        loadUserId();
    }, []);

    if (!currentUserId) {
        return (
            <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
                {/* Header fijo */}
                <View className="flex-row items-center bg-[#13161E] p-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityRole="button"
                        accessibilityLabel={t('back')}
                        activeOpacity={0.6}>
                        <ArrowLeft size={26} color="white" />
                    </TouchableOpacity>

                    <Text className="ml-4 text-2xl font-bold text-[#537CF2]">
                        {t('profileMyReportsTitle') || 'Mis Reportes'}
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center">
                    <Text className="text-lg text-white">
                        {t('profileLoadingReports') || 'Cargando...'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
            {/* Header fijo */}
            <View className="flex-row items-center bg-[#13161E] p-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={t('back')}
                    activeOpacity={0.6}>
                    <ArrowLeft size={26} color="white" />
                </TouchableOpacity>

                <Text className="ml-4 text-2xl font-bold text-[#537CF2]">
                    {t('profileMyReportsTitle') || 'Mis Reportes'}
                </Text>
            </View>

            {/* Descripción fija */}
            <View className="bg-[#090A0D] px-4 py-2">
                <Text className="text-sm text-gray-400">
                    {t('profileMyReportsDescription') ||
                        'Aquí puedes ver todos los reportes que has creado'}
                </Text>
            </View>

            {/* Contenido scrolleable */}
            <View className="flex-1 px-4">
                <UserReportsGrid
                    authorId={currentUserId}
                    showHeader={true}
                    onReportPress={(report) => {
                        router.push(`/report/${report.id}`);
                    }}
                />
            </View>
        </SafeAreaView>
    );
}
