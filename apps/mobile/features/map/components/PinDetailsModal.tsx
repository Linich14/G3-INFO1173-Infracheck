import { useState, useEffect } from 'react';
import { View, Modal, ScrollView, ActivityIndicator, Text, Pressable, Image } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PinDetails } from '../types';

interface PinDetailsModalProps {
    cargando: boolean;
    pinDetails: PinDetails | null;
    visible: boolean;
    onClose: () => void;
}

const PinDetailsModal = ({ cargando, pinDetails, visible, onClose }: PinDetailsModalProps) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState<boolean>(false);

    useEffect(() => {
        if (visible && pinDetails) {
            setImageLoading(true);
            setTimeout(() => {
                setImageUrl(pinDetails.imagenes[0] || null);
                setImageLoading(false);
            }, 2000);
        }
    }, [visible, pinDetails]);

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
        console.log('Error loading image');
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-tertiary h-[60%] w-full rounded-t-xl">
                    {/* Header del modal */}
                    <View className="flex-row items-center border-b border-gray-500 px-4 py-3">
                        <Text className="text-lg font-semibold text-white">
                            Detalles del reporte
                        </Text>
                        <View className="ml-auto flex-row space-x-2">
                            <Pressable className="rounded-full p-2">
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
                                    <Text className={styles.title_card}>Descripción</Text>
                                    <Text className={styles.text_card}>
                                        Vehículo estacionado en zona restringida durante más de 30
                                        minutos. Se observa que el conductor no está presente en el
                                        vehículo. Es necesario tomar medidas correctivas inmediatas.
                                    </Text>
                                </View>

                                <View className={styles.container_card}>
                                    <Text className={styles.title_card}>Información básica</Text>
                                    <Text className={styles.text_card}>
                                        Fecha: 8 de septiembre, 2025
                                    </Text>
                                    <Text className={styles.text_card}>Hora: 14:30</Text>
                                    <Text className={styles.text_card}>Estado: Activo</Text>
                                    <Text className={styles.text_card}>Prioridad: Alta</Text>
                                </View>

                                <View className={styles.container_card}>
                                    <Text className={styles.title_card}>Ubicación</Text>
                                    <Text className={styles.text_card}>Latitud: -38.7400</Text>
                                    <Text className={styles.text_card}>Longitud: -72.5910</Text>
                                    <Text className={styles.text_card}>
                                        Dirección: Avenida Alemania 1234, Temuco
                                    </Text>
                                </View>

                                <View className={styles.container_card}>
                                    <Text className={styles.title_card}>Evidencia fotográfica</Text>
                                    <View className="h-48 w-full items-center justify-center rounded-lg bg-gray-800">
                                        {imageLoading ? (
                                            <ActivityIndicator size="large" color="#007AFF" />
                                        ) : imageUrl ? (
                                            <Image
                                                source={{ uri: imageUrl }}
                                                className="h-full w-full rounded-lg"
                                                resizeMode="cover"
                                                onLoad={handleImageLoad}
                                                onError={handleImageError}
                                            />
                                        ) : (
                                            <View className="items-center">
                                                <MaterialCommunityIcons
                                                    name="image-off"
                                                    size={48}
                                                    color="#666"
                                                />
                                                <Text className="mt-2 text-gray-400">
                                                    Imagen no disponible
                                                </Text>
                                            </View>
                                        )}
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
