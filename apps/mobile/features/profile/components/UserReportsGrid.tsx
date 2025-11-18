import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useUserReports } from '../hooks/useUserReports';
import { useLanguage } from '~/contexts/LanguageContext';
import ReportCard from '~/features/posts/components/ReportCard';
import { ReportForHome } from '~/features/report/types';

interface UserReportsGridProps {
    authorId?: number;
    showHeader?: boolean;
    onReportPress?: (report: ReportForHome) => void;
}

export const UserReportsGrid: React.FC<UserReportsGridProps> = ({
    authorId,
    showHeader = true,
    onReportPress,
}) => {
    const { t } = useLanguage();
    const { reports, loading, refreshing, error, refresh, updateAuthorId, reportsCount } =
        useUserReports({
            authorId,
            autoLoad: !!authorId,
        });

    // Actualizar cuando cambie el authorId
    useEffect(() => {
        if (authorId && authorId !== 0) {
            updateAuthorId(authorId);
        }
    }, [authorId, updateAuthorId]);

    const handleReportPress = (report: ReportForHome) => {
        if (onReportPress) {
            onReportPress(report);
        } else {
            router.push(`/report/${report.id}`);
        }
    };

    const renderReportCard = ({ item }: { item: ReportForHome }) => (
        <View className="mb-2">
            <ReportCard
                id={parseInt(item.id)}
                title={item.title}
                author={item.author}
                authorId={item.authorId ? parseInt(item.authorId) : undefined}
                timeAgo={item.timeAgo}
                image={item.image}
                upvotes={item.upvotes}
                commentsCount={item.commentsCount || 0}
                votos={item.votos}
                seguimiento={item.seguimiento}
                ubicacion={item.ubicacion}
                onComment={() => handleReportPress(item)}
                onShare={() => {
                    Alert.alert('Compartir', 'Funcionalidad de compartir próximamente');
                }}
                onLocation={() => {
                    if (item.ubicacion) {
                        console.log('Ver ubicación:', item.ubicacion);
                    }
                }}
            />
        </View>
    );

    const renderHeader = () => {
        if (!showHeader) return null;

        return (
            <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-white">
                    {t('profileReportsTitle') || 'Reportes'}
                </Text>
                {reportsCount > 0 && (
                    <Text className="text-sm text-gray-400">
                        {reportsCount} {reportsCount === 1 ? 'reporte' : 'reportes'}
                    </Text>
                )}
            </View>
        );
    };

    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center py-12">
            <Text className="mb-2 text-lg font-semibold text-white">
                {t('profileNoReports') || 'No hay reportes'}
            </Text>
            <Text className="text-center text-gray-400">
                {authorId
                    ? t('profileNoReportsUser') || 'Este usuario no ha creado reportes aún'
                    : t('profileNoReportsOwn') || 'No has creado ningún reporte aún'}
            </Text>
        </View>
    );

    const renderErrorState = () => (
        <View className="flex-1 items-center justify-center py-12">
            <Text className="mb-4 text-center text-lg text-red-500">
                {error || t('profileErrorLoadingReports') || 'Error al cargar los reportes'}
            </Text>
            <TouchableOpacity className="rounded-lg bg-[#537CF2] px-6 py-3" onPress={refresh}>
                <Text className="font-semibold text-white">{t('retry') || 'Reintentar'}</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && reports.length === 0) {
        return (
            <View className="flex-1 items-center justify-center py-12">
                <ActivityIndicator size="large" color="#537CF2" />
                <Text className="mt-4 text-white">
                    {t('profileLoadingReports') || 'Cargando reportes...'}
                </Text>
            </View>
        );
    }

    if (error && reports.length === 0) {
        return renderErrorState();
    }

    if (!loading && reports.length === 0) {
        return renderEmptyState();
    }

    // Renderizar como lista simple de componentes para evitar VirtualizedList anidadas
    return (
        <View className="flex-1">
            {renderHeader()}
            {reports.map((report, index) => (
                <View key={report.id}>{renderReportCard({ item: report })}</View>
            ))}
        </View>
    );
};
