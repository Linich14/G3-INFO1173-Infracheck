import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useReportDetails } from '../hooks/useReportDetails';
import { useState, useCallback, useRef } from 'react';
import { useUserContext } from '../../../contexts/UserContext'; // Cambiar a UserContext
import { useLanguage } from '~/contexts/LanguageContext';
import ModalMap from '../components/modalMap'; // Importar ModalMap

type Props = {
    reportId: string;
    onBack: () => void;
};

// Funciones de utilidad
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getUrgencyColor = (urgency: string): string => {
    switch (urgency.toLowerCase()) {
        case 'alta':
            return '#ef4444';
        case 'media':
            return '#f59e0b';
        case 'baja':
            return '#10b981';
        default:
            return '#6b7280';
    }
};

export default function ReportDetailsScreen({ reportId, onBack }: Props) {
    const { t } = useLanguage();
    const { report, loading, error, refetch } = useReportDetails(reportId);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { width: screenWidth } = Dimensions.get('window');
    const scrollViewRef = useRef<ScrollView>(null);

    // Estado para controlar el modal del mapa
    const [showMapModal, setShowMapModal] = useState(false);

    // Obtener el usuario actual del UserContext
    const { user } = useUserContext();

    // Función para verificar si el usuario actual es el propietario del reporte
    const isOwner = report && user && report.usuario.id === user.usua_id;

    // Función para manejar la navegación hacia atrás de forma segura
    const handleGoBack = useCallback(() => {
        try {
            onBack();
        } catch (e) {
            console.error('Error en navegación:', e);
            onBack();
        }
    }, [onBack]);

    // Función para manejar el cambio de imagen de forma segura
    const handleImageScroll = useCallback(
        (event: any) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            // Usar requestAnimationFrame para evitar el warning de Reanimated
            requestAnimationFrame(() => {
                setCurrentImageIndex(newIndex);
            });
        },
        [screenWidth]
    );

    // Función para mostrar el mapa
    const handleShowMap = () => {
        setShowMapModal(true);
    };

    // Función para cerrar el modal del mapa
    const handleCloseMap = () => {
        setShowMapModal(false);
    };

    // Validación del reportId
    if (!reportId || reportId.trim() === '') {
        return (
            <SafeAreaView className="flex-1 bg-[#0A0E1A]">
                <View className="flex-1 items-center justify-center px-4">
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text className="mt-4 text-xl font-semibold text-white">
                        ID de reporte requerido
                    </Text>
                    <Text className="mt-2 text-center text-gray-400">
                        No se proporcionó un ID de reporte válido
                    </Text>
                    <TouchableOpacity
                        onPress={handleGoBack}
                        className="mt-4 rounded-lg bg-[#537CF2] px-4 py-2">
                        <Text className="text-white">Volver</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Mostrar loading
    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#0A0E1A]">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-white">{t('reportDetailsLoading')}</Text>
                    <Text className="mt-2 text-sm text-gray-400">
                        {t('reportDetailsIdLabel')}: {reportId}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Mostrar error
    if (error || !report) {
        return (
            <SafeAreaView className="flex-1 bg-[#0A0E1A]">
                <View className="flex-1 items-center justify-center px-4">
                    <Ionicons name="document-text-outline" size={64} color="#6b7280" />
                    <Text className="mt-4 text-xl font-semibold text-white">
                        {error || t('reportDetailsNotFound')}
                    </Text>
                    <Text className="mt-2 text-center text-gray-400">
                        {t('reportDetailsIdLabel')}: {reportId}
                    </Text>
                    <View className="mt-4 flex-row space-x-4">
                        <TouchableOpacity
                            onPress={refetch}
                            className="rounded-lg bg-[#537CF2] px-4 py-2">
                            <Text className="text-white">{t('reportDetailsRetry')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleGoBack}
                            className="rounded-lg bg-gray-600 px-4 py-2">
                            <Text className="text-white">{t('reportDetailsBack')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="bg-secondary px-4 py-3 ">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={handleGoBack} className="flex-row items-center">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="mr-6 flex-1 text-center text-2xl font-bold text-white">
                        {t('reportDetailsTitle')}
                    </Text>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Carrusel de imágenes */}
                {report.imagenes.length > 0 && (
                    <View className="relative bg-black">
                        <ScrollView
                            ref={scrollViewRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={handleImageScroll}
                            className="h-64">
                            {report.imagenes.map((imagen: string, index: number) => (
                                <TouchableOpacity
                                    key={`image-${index}`}
                                    style={{ width: screenWidth }}
                                    activeOpacity={0.9}>
                                    <Image
                                        source={{
                                            uri: imagen,
                                            cache: 'force-cache',
                                        }}
                                        className="h-full w-full"
                                        resizeMode="cover"
                                        onError={(error) => {
                                            console.log(
                                                'Error loading image:',
                                                error.nativeEvent.error
                                            );
                                        }}
                                    />
                                    {/* Overlay con gradiente */}
                                    <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 py-6">
                                        <View className="flex-row items-end justify-between">
                                            <View className="flex-1">
                                                <View className="mb-1 flex-row items-center">
                                                    <Ionicons
                                                        name="images-outline"
                                                        size={16}
                                                        color="#537CF2"
                                                    />
                                                    <Text className="ml-2 text-sm font-medium text-white">
                                                        Evidencia fotográfica
                                                    </Text>
                                                </View>
                                            </View>
                                            <View className="rounded-full bg-black/50 px-3 py-1">
                                                <Text className="text-sm font-medium text-white">
                                                    {index + 1}/{report.imagenes.length}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Icono de expandir */}
                                    <View className="absolute right-4 top-4">
                                        <View className="rounded-full bg-black/50 p-2">
                                            <Ionicons
                                                name="expand-outline"
                                                size={20}
                                                color="white"
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Indicadores de paginación mejorados */}
                        {report.imagenes.length > 1 && (
                            <View className="absolute bottom-4 left-4">
                                <View className="flex-row space-x-2">
                                    {report.imagenes.map((_: string, index: number) => (
                                        <TouchableOpacity key={`indicator-${index}`}>
                                            <View
                                                className={`h-1 rounded-full transition-all duration-300 ${
                                                    index === currentImageIndex
                                                        ? 'w-8 bg-[#537CF2]'
                                                        : 'w-4 bg-white/60'
                                                }`}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Título del reporte */}
                <View className="mx-4 mt-4 rounded-xl bg-gradient-to-r from-[#537CF2] to-[#6366f1] p-4 shadow-lg">
                    <Text className="text-center text-xl font-bold text-white">
                        {report.titulo}
                    </Text>
                </View>

                {/* Información rápida */}
                <View className="mx-4 mt-4 flex-row justify-between">
                    <View className="mr-2 flex-1 rounded-xl bg-secondary p-4">
                        <View className="flex-row items-center">
                            <Ionicons name="calendar-outline" size={20} color="#537CF2" />
                            <Text className="ml-2 text-sm font-medium text-gray-300">Fecha</Text>
                        </View>
                        <Text className="mt-1 font-semibold text-white">
                            {formatDate(report.fecha)}
                        </Text>
                    </View>

                    <View className="ml-2 flex-1 rounded-xl bg-secondary p-4">
                        <View className="mb-1 flex-row items-center">
                            <Ionicons
                                name="alert-circle-outline"
                                size={20}
                                color={getUrgencyColor(report.nivelUrgencia)}
                            />
                            <Text className="ml-2 text-sm font-medium text-gray-300">Urgencia</Text>
                        </View>
                        <View
                            className="mt-1 self-start rounded-full px-3 py-1"
                            style={{
                                backgroundColor: getUrgencyColor(report.nivelUrgencia) + '20',
                            }}>
                            <Text
                                className="text-sm font-bold"
                                style={{ color: getUrgencyColor(report.nivelUrgencia) }}>
                                {report.nivelUrgencia}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Tipo de denuncia */}
                <View className="mx-4 mt-4 rounded-xl bg-secondary p-4">
                    <View className="mb-2 flex-row items-center">
                        <Ionicons name="list-outline" size={20} color="#537CF2" />
                        <Text className="ml-2 text-lg font-semibold text-white">
                            Tipo de Denuncia
                        </Text>
                    </View>
                    <View className="rounded-lg bg-[#537CF2] bg-opacity-20 p-3">
                        <Text className="text-center text-lg font-medium text-white">
                            {report.tipoDenuncia}
                        </Text>
                    </View>
                </View>

                {/* Descripción */}
                <View className="mx-4 mt-4 rounded-xl bg-secondary p-4">
                    <View className="mb-3 flex-row items-center">
                        <Ionicons name="document-text-outline" size={20} color="#537CF2" />
                        <Text className="ml-2 text-lg font-semibold text-white">Descripción</Text>
                    </View>
                    <Text className="leading-6 text-gray-200">{report.descripcion}</Text>
                </View>

                {/* Ubicación */}
                <View className="mx-4 mt-4 rounded-xl bg-secondary p-4">
                    <View className="mb-3 flex-row items-center">
                        <Ionicons name="location-outline" size={20} color="#537CF2" />
                        <Text className="ml-2 text-lg font-semibold text-white">Ubicación</Text>
                    </View>

                    <View className="mb-3 rounded-lg p-3">
                        <Text className="mb-2 font-medium text-white">
                            {report.ubicacion.direccion}
                        </Text>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-400">Lat: {report.ubicacion.latitud}</Text>
                            <Text className="text-gray-400">Lng: {report.ubicacion.longitud}</Text>
                        </View>
                        <Text className="mt-1 text-sm text-gray-400">Ciudad: {report.ciudad}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleShowMap}
                        className="rounded-lg bg-[#537CF2] p-3">
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="map-outline" size={18} color="white" />
                            <Text className="ml-2 font-medium text-white">Ver en mapa</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Video */}
                {report.video && (
                    <View className="mx-4 mt-4 rounded-xl bg-secondary p-4">
                        <View className="mb-3 flex-row items-center">
                            <Ionicons name="videocam-outline" size={20} color="#537CF2" />
                            <Text className="ml-2 text-lg font-semibold text-white">Video</Text>
                        </View>

                        <TouchableOpacity className="rounded-lg border border-gray-400 border-opacity-30 bg-tertiary p-4">
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="play-circle-outline" size={24} color="#537CF2" />
                                <Text className="ml-2 font-medium text-[#537CF2]">
                                    Reproducir video
                                </Text>
                            </View>
                            <Text className="mt-2 text-center text-sm text-white">
                                {report.video}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Estadísticas */}
                <View className="mx-4 mt-4 rounded-xl bg-secondary p-4">
                    <View className="mb-3 flex-row items-center">
                        <Ionicons name="stats-chart-outline" size={20} color="#537CF2" />
                        <Text className="ml-2 text-lg font-semibold text-white">Estadísticas</Text>
                    </View>

                    <View className="space-y-2">
                        <View className="flex-row items-center justify-between border-b border-gray-600 py-2">
                            <Text className="text-gray-300">Total de archivos</Text>
                            <Text className="font-semibold text-white">
                                {report.estadisticas.total_archivos}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between border-b border-gray-600 py-2">
                            <Text className="text-gray-300">Imágenes</Text>
                            <Text className="font-semibold text-white">
                                {report.estadisticas.imagenes}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between border-b border-gray-600 py-2">
                            <Text className="text-gray-300">Videos</Text>
                            <Text className="font-semibold text-white">
                                {report.estadisticas.videos}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between py-2">
                            <Text className="text-gray-300">Días desde creación</Text>
                            <Text className="font-semibold text-white">
                                {report.estadisticas.dias_desde_creacion}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Información del sistema */}
                <View className="mx-4 mt-4 rounded-xl bg-secondary p-4">
                    <View className="mb-3 flex-row items-center">
                        <Ionicons name="information-circle-outline" size={20} color="#537CF2" />
                        <Text className="ml-2 text-lg font-semibold text-white">
                            Información del Sistema
                        </Text>
                    </View>

                    <View className="space-y-2">
                        <View className="flex-row items-center justify-between border-b border-gray-600 py-2">
                            <Text className="text-gray-300">ID del reporte</Text>
                            <Text className="font-mono text-white">{report.id}</Text>
                        </View>
                        <View className="flex-row items-center justify-between border-b border-gray-600 py-2">
                            <Text className="text-gray-300">Estado</Text>
                            <View className="rounded-full bg-yellow-500/20 px-3 py-1">
                                <Text className="font-medium text-yellow-500">{report.estado}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center justify-between border-b border-gray-600 py-2">
                            <Text className="text-gray-300">Usuario</Text>
                            <Text className="font-semibold text-white">
                                {report.usuario.nombre || report.usuario.email}
                            </Text>
                        </View>
                        <View className="flex-row items-start justify-between py-2">
                            <Text className="text-gray-300">Fecha de creación</Text>
                            <Text className="ml-4 flex-1 text-right text-white">
                                {formatDate(report.fecha)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Acciones - Solo mostrar si el usuario es el propietario del reporte */}
                {isOwner && (
                    <View className="mx-4 mb-6 mt-4">
                        {report.estadisticas.puede_agregar_imagenes && (
                            <TouchableOpacity className="mb-3 rounded-xl bg-green-600 p-4">
                                <View className="flex-row items-center justify-center">
                                    <Ionicons name="camera-outline" size={20} color="white" />
                                    <Text className="ml-2 font-semibold text-white">
                                        Agregar imágenes
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity className="mb-3 rounded-xl bg-[#537CF2] p-4">
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="create-outline" size={20} color="white" />
                                <Text className="ml-2 font-semibold text-white">
                                    Actualizar reporte
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity className="rounded-xl bg-red-600 p-4">
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="trash-outline" size={20} color="white" />
                                <Text className="ml-2 font-semibold text-white">
                                    Eliminar reporte
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Modal del mapa - Solo mostrar si hay datos de ubicación */}
            {report && (
                <ModalMap
                    visible={showMapModal}
                    onClose={handleCloseMap}
                    mode="view"
                    viewLocation={{
                        latitude: report.ubicacion.latitud,
                        longitude: report.ubicacion.longitud,
                        address: report.ubicacion.direccion,
                    }}
                    title="Ubicación del Reporte"
                />
            )}
        </SafeAreaView>
    );
}
