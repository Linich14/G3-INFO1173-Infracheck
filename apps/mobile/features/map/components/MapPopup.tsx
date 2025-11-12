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

// Mapeo de estados del backend a colores
const STATUS_COLORS: Record<string, string> = {
    Abierto: '#EF4444',
    'En Revisión': '#F59E0B',
    'En Proceso': '#3B82F6',
    Resuelto: '#10B981',
    Cerrado: '#6B7280',
    Rechazado: '#DC2626',
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
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
        }
    }, [visible, annotation, fadeAnim, scaleAnim]);

    if (!visible || !annotation) {
        return null;
    }

    const config = ANNOTATION_CONFIGS[annotation.type];

    // Usar estado del backend directamente
    const statusColor = STATUS_COLORS[annotation.status || 'Abierto'] || '#EF4444';
    const statusLabel = annotation.status || 'Estado desconocido';

    // Formatear fecha al formato solicitado: "12 de noviembre 2025"
    const formatDate = (dateString: string | undefined) => {
        try {
            if (!dateString) return 'Fecha no disponible';

            const date = new Date(dateString);
            const meses = [
                'enero',
                'febrero',
                'marzo',
                'abril',
                'mayo',
                'junio',
                'julio',
                'agosto',
                'septiembre',
                'octubre',
                'noviembre',
                'diciembre',
            ];

            const dia = date.getDate();
            const mes = meses[date.getMonth()];
            const año = date.getFullYear();

            return `${dia} de ${mes} ${año}`;
        } catch {
            return 'Fecha no disponible';
        }
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
                elevation: 1000,
            }}
            pointerEvents="box-none">
            <View style={{ position: 'relative' }}>
                <Pressable
                    onPress={onPress}
                    className="w-72 rounded-xl bg-white shadow-lg"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 8,
                    }}>
                    <View className="p-4">
                        {/* Header con icono y título */}
                        <View className="mb-3 flex-row items-start">
                            <View
                                className="mr-3 rounded-full p-2"
                                style={{
                                    backgroundColor:
                                        (annotation.marker_color || config?.color || '#666') + '20',
                                }}>
                                <MaterialCommunityIcons
                                    name={config?.icon as any}
                                    size={20}
                                    color={annotation.marker_color || config?.color || '#666'}
                                />
                            </View>
                            <View className="flex-1">
                                {/* Título */}
                                <Text
                                    className="text-base font-semibold text-gray-900"
                                    numberOfLines={2}>
                                    {annotation.title}
                                </Text>
                                {/* Categoría */}
                                <Text className="mt-1 text-xs text-gray-500">
                                    {annotation.tipo_denuncia_nombre || 'Categoría no disponible'}
                                </Text>
                            </View>
                            {/* Estado */}
                            <View
                                className="rounded-full px-2 py-1"
                                style={{ backgroundColor: statusColor + '20' }}>
                                <Text
                                    className="text-xs font-medium"
                                    style={{ color: statusColor }}>
                                    {statusLabel}
                                </Text>
                            </View>
                        </View>

                        {/* Información simplificada */}
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
                                    {annotation.direccion || 'Dirección no disponible'}
                                </Text>
                            </View>

                            {/* Fecha formateada */}
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons
                                    name="calendar"
                                    size={14}
                                    color="#6B7280"
                                    style={{ marginRight: 6 }}
                                />
                                <Text className="text-sm text-gray-600">
                                    {formatDate(annotation.fecha_creacion)}
                                </Text>
                            </View>
                        </View>

                        {/* Footer con acción */}
                        <View className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3">
                            <Text className="text-xs text-gray-500">
                                Toca para ver más detalles
                            </Text>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={16}
                                color="#6B7280"
                            />
                        </View>
                    </View>
                </Pressable>

                {/* Flecha hacia abajo - posicionada correctamente */}
                <View
                    style={{
                        position: 'absolute',
                        bottom: -8,
                        left: 144 - 8, // Centrar en el popup (288/2 - 8)
                        width: 16,
                        height: 16,
                        backgroundColor: 'white',
                        transform: [{ rotate: '45deg' }],
                        borderBottomWidth: 1,
                        borderRightWidth: 1,
                        borderColor: '#e0e0e0',
                        zIndex: -1,
                    }}
                />
            </View>
        </Animated.View>
    );
}
