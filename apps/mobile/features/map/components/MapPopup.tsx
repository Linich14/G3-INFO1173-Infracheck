import { View, Text, Pressable, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AnnotationData, ANNOTATION_CONFIGS } from '../types';

interface MapPopupProps {
    annotation: AnnotationData | null;
    visible: boolean;
    onPress: () => void;
    position: { x: number; y: number };
}

const FILTER_LABELS: Record<string, string> = {
    '1': 'Calles y Veredas',
    '2': 'Alumbrado Público',
    '3': 'Drenaje y Aguas',
    '4': 'Parques y Árboles',
    '5': 'Basura y Escombros',
    '6': 'Emergencias',
    '7': 'Mobiliario Público',
};

const STATUS_LABELS = {
    active: 'Activo',
    pending: 'Pendiente',
    resolved: 'Resuelto',
};

const STATUS_COLORS = {
    active: '#EF4444',
    pending: '#F59E0B',
    resolved: '#10B981',
};

export default function MapPopup({ annotation, visible, onPress, position }: MapPopupProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (visible && annotation) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, annotation, fadeAnim, scaleAnim]);

    if (!visible || !annotation) {
        return null;
    }

    const config = ANNOTATION_CONFIGS[annotation.type];
    const statusColor = STATUS_COLORS[annotation.status || 'active'];
    const statusLabel = STATUS_LABELS[annotation.status || 'active'];

    // Formatear fecha
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return 'Fecha no disponible';
        }
    };

    // Simular dirección basada en coordenadas
    const getSimulatedAddress = (coordinate: [number, number]) => {
        const [lng, lat] = coordinate;
        return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    };

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                zIndex: 1000,
                width: 288,
            }}>
            <Pressable
                onPress={onPress}
                className="rounded-xl bg-white shadow-lg"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 8,
                }}>
                {/* Flecha hacia abajo - centrada */}
                <View
                    className="absolute -bottom-2 h-4 w-4 rotate-45 transform bg-white"
                    style={{
                        left: '50%',
                        marginLeft: -8,
                        shadowColor: '#000',
                        shadowOffset: { width: 2, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                    }}
                />

                <View className="p-4">
                    {/* Header con icono y título */}
                    <View className="mb-3 flex-row items-start">
                        <View
                            className="mr-3 rounded-full p-2"
                            style={{ backgroundColor: config.color + '20' }}>
                            <MaterialCommunityIcons
                                name={config.icon}
                                size={20}
                                color={config.color}
                            />
                        </View>
                        <View className="flex-1">
                            <Text
                                className="text-base font-semibold text-gray-900"
                                numberOfLines={2}>
                                {annotation.title}
                            </Text>
                            <Text className="mt-1 text-xs text-gray-500">
                                {FILTER_LABELS[annotation.type]}
                            </Text>
                        </View>
                        <View
                            className="rounded-full px-2 py-1"
                            style={{ backgroundColor: statusColor + '20' }}>
                            <Text className="text-xs font-medium" style={{ color: statusColor }}>
                                {statusLabel}
                            </Text>
                        </View>
                    </View>

                    {/* Información adicional */}
                    <View className="space-y-2">
                        {/* Dirección */}
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons
                                name="map-marker"
                                size={14}
                                color="#6B7280"
                                style={{ marginRight: 6 }}
                            />
                            <Text className="flex-1 text-sm text-gray-600" numberOfLines={1}>
                                {getSimulatedAddress(annotation.coordinate)}
                            </Text>
                        </View>

                        {/* Fecha */}
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons
                                name="calendar"
                                size={14}
                                color="#6B7280"
                                style={{ marginRight: 6 }}
                            />
                            <Text className="text-sm text-gray-600">
                                {formatDate(new Date().toISOString())}
                            </Text>
                        </View>
                    </View>

                    {/* Footer con acción */}
                    <View className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3">
                        <Text className="text-xs text-gray-500">Toca para ver más detalles</Text>
                        <MaterialCommunityIcons name="chevron-right" size={16} color="#6B7280" />
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
}
