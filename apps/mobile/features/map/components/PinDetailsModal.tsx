import { useState, useEffect } from 'react';
import { View, Modal, ScrollView, ActivityIndicator, Text, Pressable, Image } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PinDetails } from '../types';

interface PinDetailsModalProps {
    cargando: boolean;
    pinDetails: PinDetails | null;
    visible: boolean;
    onClose: () => void;
    onOpenFullScreen: () => void;
}

const PinDetailsModal = ({
    cargando,
    pinDetails,
    visible,
    onClose,
    onOpenFullScreen,
}: PinDetailsModalProps) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState<boolean>(false);
    const [imageError, setImageError] = useState<boolean>(false);

    // Función para construir URL completa de imagen
    const buildCompleteImageUrl = (imagePath: string): string => {
        if (!imagePath) return '';

        // Si ya es una URL completa, devolverla tal como está
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        // Obtener la URL base de la API
        const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

        // Construir URL completa
        return `${baseURL}${imagePath}`;
    };

    useEffect(() => {
        if (visible && pinDetails) {
            setImageLoading(true);
            setImageError(false);
            const primeraImagen = pinDetails.imagenes[0] || null;

            setTimeout(() => {
                // Verificar si hay imagen disponible
                if (!primeraImagen || primeraImagen.trim() === '') {
                    setImageUrl(null);
                    setImageError(false);
                    setImageLoading(false);
                } else {
                    // Construir URL completa
                    const imagenCompleta = buildCompleteImageUrl(primeraImagen);
                    setImageUrl(imagenCompleta);
                    setImageLoading(false);
                }
            }, 1000);
        } else {
            setImageUrl(null);
            setImageError(false);
            setImageLoading(false);
        }
    }, [visible, pinDetails]);

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
    };

    // Función para formatear fecha
    const formatDate = (dateString: string | undefined) => {
        try {
            if (!dateString) return { fecha: 'Fecha no disponible', hora: 'Hora no disponible' };

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
            const hora = date.getHours().toString().padStart(2, '0');
            const minutos = date.getMinutes().toString().padStart(2, '0');

            return {
                fecha: `${dia} de ${mes}, ${año}`,
                hora: `${hora}:${minutos}`,
            };
        } catch {
            return {
                fecha: 'Fecha no disponible',
                hora: 'Hora no disponible',
            };
        }
    };

    // Función para renderizar el contenido de la imagen
    const renderImageContent = () => {
        if (imageLoading) {
            return (
                <View className="items-center justify-center">
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text className="mt-2 text-gray-400">Cargando imagen...</Text>
                </View>
            );
        }

        if (!imageUrl || imageError) {
            return (
                <View className="items-center justify-center">
                    <MaterialCommunityIcons name="image-off" size={48} color="#666" />
                    <Text className="mt-2 text-gray-400">Imagen no disponible</Text>
                </View>
            );
        }

        return (
            <Image
                source={{ uri: imageUrl }}
                className="h-full w-full rounded-lg"
                resizeMode="cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
            />
        );
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/50">
                <View className="h-[60%] w-full rounded-t-xl bg-tertiary">
                    {/* Header del modal */}
                    <View className="flex-row items-center border-b border-gray-500 px-4 py-3">
                        <Text className="text-lg font-semibold text-white">
                            Detalles del reporte
                        </Text>
                        <View className="ml-auto flex-row space-x-2">
                            {/* Botón para abrir en pantalla completa */}
                            <Pressable onPress={onOpenFullScreen} className="rounded-full p-2">
                                <MaterialCommunityIcons
                                    name="open-in-new"
                                    size={24}
                                    color="#FFFFFF"
                                />
                            </Pressable>
                            <Pressable onPress={onClose} className="rounded-full p-2">
                                <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                            </Pressable>
                        </View>
                    </View>

                    {cargando ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text className="mt-2 text-gray-600">Cargando detalles...</Text>
                        </View>
                    ) : pinDetails ? (
                        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={true}>
                            <View className="py-4">
                                <Text className="mb-4 text-2xl font-bold text-white">
                                    {pinDetails.titulo}
                                </Text>

                                <View className={styles.container_card}>
                                    <Text className={styles.title_card}>Categoría</Text>
                                    <Text className={styles.text_card}>
                                        {pinDetails.tipoDenuncia}
                                    </Text>
                                </View>

                                <View className={styles.container_card}>
                                    <Text className={styles.title_card}>Descripción</Text>
                                    <Text className={styles.text_card}>
                                        {pinDetails.descripcion}
                                    </Text>
                                </View>

                                <View className={styles.container_card}>
                                    <Text className={styles.title_card}>Información básica</Text>
                                    <Text className={styles.text_card}>
                                        Fecha: {formatDate(pinDetails.fecha).fecha}
                                    </Text>
                                    <Text className={styles.text_card}>
                                        Hora: {formatDate(pinDetails.fecha).hora}
                                    </Text>
                                    <Text className={styles.text_card}>
                                        Urgencia: {pinDetails.nivelUrgencia}
                                    </Text>
                                </View>

                                <View className={styles.container_card}>
                                    <Text className={styles.title_card}>Ubicación</Text>
                                    <Text className={styles.text_card}>
                                        Latitud: {pinDetails.ubicacion.latitud}
                                    </Text>
                                    <Text className={styles.text_card}>
                                        Longitud: {pinDetails.ubicacion.longitud}
                                    </Text>
                                    <Text className={styles.text_card}>
                                        Dirección: {pinDetails.ubicacion.direccion}
                                    </Text>
                                </View>

                                <View className={styles.container_card}>
                                    <Text className={styles.title_card}>Evidencia fotográfica</Text>
                                    <View className="h-48 w-full items-center justify-center rounded-lg bg-gray-800">
                                        {renderImageContent()}
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-gray-600">No hay detalles disponibles</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = {
    title_card: 'mb-2 text-lg font-semibold text-white',
    text_card: 'mb-1 text-gray-200',
    container_card: 'mb-4 rounded-xl bg-secondary p-4',
};

export default PinDetailsModal;
