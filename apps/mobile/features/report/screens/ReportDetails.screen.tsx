import { useReportDetail } from '../hooks/useReportDetail';

export default function ReportDetailsScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const reportId = typeof params.id === 'string' ? params.id : params.id?.[0] || '';

    // Usar el hook específico para details
    const { report, loading, error, refetch } = useReportDetail(reportId);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { width: screenWidth } = Dimensions.get('window');

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#0A0E1A]">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-white">Cargando reporte...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !report) {
        return (
            <SafeAreaView className="flex-1 bg-[#0A0E1A]">
                <View className="flex-1 items-center justify-center px-4">
                    <Ionicons name="document-text-outline" size={64} color="#6b7280" />
                    <Text className="mt-4 text-xl font-semibold text-white">
                        {error || 'Reporte no encontrado'}
                    </Text>
                    <TouchableOpacity
                        onPress={refetch}
                        className="mt-4 rounded-lg bg-[#537CF2] px-4 py-2">
                        <Text className="text-white">Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="bg-secondary px-4 py-3 shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="mr-6 flex-1 text-center text-2xl font-bold text-white">
                        Detalle del Reporte
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
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(event) => {
                                const newIndex = Math.round(
                                    event.nativeEvent.contentOffset.x / screenWidth
                                );
                                setCurrentImageIndex(newIndex);
                            }}
                            className="h-64">
                            {report.imagenes.map((imagen, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{ width: screenWidth }}
                                    activeOpacity={0.9}>
                                    <Image
                                        source={{ uri: imagen }}
                                        className="h-full w-full"
                                        resizeMode="cover"
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
                                    {report.imagenes.map((_, index) => (
                                        <TouchableOpacity key={index}>
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
                    </View>

                    <TouchableOpacity className="rounded-lg bg-[#537CF2] p-3">
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
                        <View className="flex-row items-start justify-between py-2">
                            <Text className="text-gray-300">Fecha de creación</Text>
                            <Text className="flex-1 text-right text-white ml-4">
                                {formatDate(report.fecha)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Acciones */}
                <View className="mx-4 mt-4 mb-6">
                    <TouchableOpacity className="rounded-xl bg-[#537CF2] p-4 mb-3">
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
                            <Text className="ml-2 font-semibold text-white">Eliminar reporte</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
