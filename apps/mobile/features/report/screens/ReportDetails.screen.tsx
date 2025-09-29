import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReportDetails } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

// Mock de datos
const mockReports: ReportDetails[] = [
    {
        id: '1',
        titulo: 'Calle en mal estado',
        descripcion:
            'La calle presenta múltiples baches y grietas que dificultan el tránsito vehicular y peatonal. La situación se ha agravado después de las últimas lluvias, creando charcos de agua que permanecen durante días.',
        tipoDenuncia: 'Infraestructura',
        ubicacion: {
            latitud: -38.7359,
            longitud: -72.5904,
            direccion: 'Av. Alemania 1234, Temuco',
        },
        nivelUrgencia: 'Alto',
        fecha: '2024-09-13T10:30:00Z',
        imagenes: [
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
            'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
        ],
        video: 'https://example.com/video1.mp4',
        autor: 'Juan Gomez',
        estado: 'En proceso',
    },
    {
        id: '2',
        titulo: 'Semáforo apagado',
        descripcion:
            'El semáforo del cruce principal lleva 3 días sin funcionar, causando problemas de tráfico y riesgo de accidentes. Se necesita reparación urgente.',
        tipoDenuncia: 'Seguridad Vial',
        ubicacion: {
            latitud: -38.7408,
            longitud: -72.5987,
            direccion: 'Cruce Av. Balmaceda con Bulnes, Temuco',
        },
        nivelUrgencia: 'Crítico',
        fecha: '2024-09-14T08:15:00Z',
        imagenes: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400'],
        video: '',
        autor: 'Ana Pérez',
        estado: 'Nuevo',
    },
    {
        id: '3',
        titulo: 'Basura acumulada',
        descripcion:
            'Se ha acumulado basura en la esquina durante más de una semana. El mal olor y la presencia de roedores está afectando a los vecinos del sector.',
        tipoDenuncia: 'Limpieza',
        ubicacion: {
            latitud: -38.7325,
            longitud: -72.6021,
            direccion: 'Calle Portales 567, Temuco',
        },
        nivelUrgencia: 'Medio',
        fecha: '2024-09-12T16:45:00Z',
        imagenes: [
            'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        ],
        video: 'https://example.com/video3.mp4',
        autor: 'Carlos Mendez',
        estado: 'En proceso',
    },
];

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getUrgencyColor(nivel: string): string {
    switch (nivel.toLowerCase()) {
        case 'crítico':
            return '#ef4444'; // red-500
        case 'alto':
            return '#f97316'; // orange-500
        case 'medio':
            return '#eab308'; // yellow-500
        case 'bajo':
            return '#22c55e'; // green-500
        default:
            return '#6b7280'; // gray-500
    }
}

export default function ReportDetailsScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const reportId = typeof params.id === 'string' ? params.id : params.id?.[0] || '';
    
    // Estados para el carrusel
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { width: screenWidth } = Dimensions.get('window');

    // Buscar el reporte en el mock
    const report = mockReports.find((r) => r.id === reportId);

    if (!report) {
        return (
            <SafeAreaView className="flex-1 bg-[#0A0E1A]">
                <View className="flex-1 items-center justify-center px-4">
                    <Ionicons name="document-text-outline" size={64} color="#6b7280" />
                    <Text className="mt-4 text-xl font-semibold text-white">
                        Reporte no encontrado
                    </Text>
                    <Text className="mt-2 text-gray-400">ID: {reportId}</Text>
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
                    <Text className="text-2xl font-bold text-white flex-1 text-center mr-6">
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
                                const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
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
                                        <View className="flex-row justify-between items-end">
                                            <View className="flex-1">
                                                <View className="flex-row items-center mb-1">
                                                    <Ionicons name="images-outline" size={16} color="#537CF2" />
                                                    <Text className="ml-2 text-sm text-white font-medium">
                                                        Evidencia fotográfica
                                                    </Text>
                                                </View>
                                            </View>
                                            <View className="bg-black/50 rounded-full px-3 py-1">
                                                <Text className="text-sm text-white font-medium">
                                                    {index + 1}/{report.imagenes.length}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    
                                    {/* Icono de expandir */}
                                    <View className="absolute right-4 top-4">
                                        <View className="bg-black/50 rounded-full p-2">
                                            <Ionicons name="expand-outline" size={20} color="white" />
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
                                                        ? 'bg-[#537CF2] w-8' 
                                                        : 'bg-white/60 w-4'
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
                            <View className="rounded-full bg-yellow-500 bg-opacity-20 px-3 py-1">
                                <Text className="font-medium text-black">En proceso</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center justify-between py-2">
                            <Text className="text-gray-300">Fecha de creación</Text>
                            <Text className="text-white">{formatDate(report.fecha)}</Text>
                        </View>
                    </View>
                </View>

                {/* Acciones */}
                <View className="mx-4 mt-4 space-y-3">
                    <TouchableOpacity className="rounded-xl bg-[#537CF2] p-4">
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


