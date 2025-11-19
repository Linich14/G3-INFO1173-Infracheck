import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLanguage } from '~/contexts/LanguageContext';
import { useCamera } from '../hooks/useCamera';
import { useReportImages } from '../hooks/useReportImages';
import ModalFileOption from '../components/modalFileOption';

type Props = {
    reportId: string;
    images: Array<{ id: number; url: string; tipo?: string }> | string[]; // Acepta ambos formatos
    onBack: () => void;
    onSuccess?: () => void;
};

const { width: screenWidth } = Dimensions.get('window');
const imageSize = (screenWidth - 48) / 3; // 3 columnas con padding

export default function ManageImagesScreen({ reportId, images, onBack, onSuccess }: Props) {
    const { t } = useLanguage();
    const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
    const [showFileModal, setShowFileModal] = useState(false);

    // Hook de cámara usando métodos correctos
    const {
        selectedImages: newImages,
        openImageModal,
        takePhoto,
        pickImageFromGallery,
        removeImage,
        resetMedia,
    } = useCamera();

    const { uploadImages, deleteMultipleImages, loading, error, setError } = useReportImages();

    // Normalizar las imágenes a formato consistente
    const normalizedImages = useMemo(() => {
        if (!images || images.length === 0) return [];

        // Si es un array de strings, convertir a objetos
        if (typeof images[0] === 'string') {
            return (images as string[]).map((url, index) => ({
                id: index + 1, // Generar IDs secuenciales empezando desde 1
                url: url,
            }));
        }

        // Si ya es un array de objetos, validar y usar tal como está
        return (images as Array<{ id: number; url: string; tipo?: string }>).filter(
            (image) =>
                image &&
                image.id !== undefined &&
                image.id !== null &&
                typeof image.id === 'number' &&
                image.url &&
                typeof image.url === 'string'
        );
    }, [images]);

    console.log('Raw images received:', images);
    console.log('Normalized images:', normalizedImages);

    // Función para manejar selección de imagen para eliminar
    const toggleImageSelection = (imageId: number) => {
        console.log('Toggling selection for image ID:', imageId);
        setSelectedImages((prev) => {
            const newSelected = new Set(prev);
            if (newSelected.has(imageId)) {
                newSelected.delete(imageId);
            } else {
                newSelected.add(imageId);
            }
            console.log('Updated selected images:', Array.from(newSelected));
            return newSelected;
        });
    };

    // Función para subir nuevas imágenes usando el hook useCamera
    const handleUploadImages = async () => {
        if (newImages.length === 0) {
            Alert.alert(
                t('error') || 'Error',
                t('manageImagesSelectFirst') || 'Selecciona al menos una imagen para subir',
                [{ text: t('ok') || 'OK' }]
            );
            return;
        }

        try {
            setError(null);

            // Convertir las URIs del useCamera a objetos compatibles con la API
            const imageObjects = newImages.map((uri) => ({ uri }));

            const result = await uploadImages(reportId, imageObjects);

            if (result.success) {
                Alert.alert(
                    t('success') || 'Éxito',
                    result.message ||
                        t('manageImagesUploadSuccess') ||
                        'Imágenes subidas exitosamente',
                    [
                        {
                            text: t('ok') || 'OK',
                            onPress: () => {
                                resetMedia();
                                onSuccess?.();
                                onBack();
                            },
                        },
                    ]
                );
            } else {
                Alert.alert(
                    t('error') || 'Error',
                    result.message || t('manageImagesUploadError') || 'Error al subir las imágenes',
                    [{ text: t('ok') || 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            Alert.alert(
                t('error') || 'Error',
                t('manageImagesUploadError') || 'Error al subir las imágenes',
                [{ text: t('ok') || 'OK' }]
            );
        }
    };

    // Función para eliminar imágenes seleccionadas
    const handleDeleteImages = async () => {
        if (selectedImages.size === 0) {
            Alert.alert(
                t('error') || 'Error',
                t('manageImagesSelectToDelete') || 'Selecciona al menos una imagen para eliminar',
                [{ text: t('ok') || 'OK' }]
            );
            return;
        }

        // Si las imágenes originalmente eran strings, mostrar advertencia
        if (images.length > 0 && typeof images[0] === 'string') {
            Alert.alert(
                t('warning') || 'Advertencia',
                'Las imágenes no tienen IDs reales de la base de datos. Esta operación podría no funcionar correctamente.',
                [
                    { text: t('cancel') || 'Cancelar', style: 'cancel' },
                    { text: t('continue') || 'Continuar', onPress: showDeleteConfirmation },
                ]
            );
        } else {
            showDeleteConfirmation();
        }
    };

    const showDeleteConfirmation = () => {
        Alert.alert(
            t('manageImagesDeleteConfirmTitle') || 'Eliminar Imágenes',
            t('manageImagesDeleteConfirmMessage') ||
                `¿Estás seguro de que quieres eliminar ${selectedImages.size} imagen(es)?`,
            [
                {
                    text: t('cancel') || 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: t('delete') || 'Eliminar',
                    style: 'destructive',
                    onPress: performDeleteImages,
                },
            ]
        );
    };

    // Función que ejecuta la eliminación usando IDs
    const performDeleteImages = async () => {
        try {
            setError(null);

            const imageIdsArray = Array.from(selectedImages);
            console.log('Deleting images with IDs:', imageIdsArray);

            if (imageIdsArray.length === 0) {
                Alert.alert(t('error') || 'Error', 'No hay IDs válidos para eliminar', [
                    { text: t('ok') || 'OK' },
                ]);
                return;
            }

            const result = await deleteMultipleImages(reportId, imageIdsArray);

            if (result.success) {
                Alert.alert(
                    t('success') || 'Éxito',
                    result.message ||
                        t('manageImagesDeleteSuccess') ||
                        'Imágenes eliminadas exitosamente',
                    [
                        {
                            text: t('ok') || 'OK',
                            onPress: () => {
                                setSelectedImages(new Set());
                                onSuccess?.();
                                onBack();
                            },
                        },
                    ]
                );
            } else {
                Alert.alert(
                    t('error') || 'Error',
                    result.message ||
                        t('manageImagesDeleteError') ||
                        'Error al eliminar las imágenes',
                    [{ text: t('ok') || 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error in delete process:', error);
            Alert.alert(
                t('error') || 'Error',
                t('manageImagesDeleteError') || 'Error al eliminar las imágenes',
                [{ text: t('ok') || 'OK' }]
            );
        }
    };

    // Funciones para manejar el modal usando el hook useCamera
    const handleAddImage = () => {
        setShowFileModal(true);
    };

    const handleCameraPress = () => {
        setShowFileModal(false);
        takePhoto();
    };

    const handleGalleryPress = () => {
        setShowFileModal(false);
        pickImageFromGallery();
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="bg-secondary px-4 py-3">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={onBack} className="flex-row items-center">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="mr-6 flex-1 text-center text-2xl font-bold text-white">
                        {t('manageImagesTitle') || 'Gestionar Imágenes'}
                    </Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Instrucciones */}
                <View className="mt-6 rounded-lg bg-[#537CF2]/20 p-4">
                    <Text className="text-center text-sm text-[#537CF2]">
                        {t('manageImagesInstructions') ||
                            'Toca las imágenes para seleccionar las que deseas eliminar, o agrega nuevas imágenes'}
                    </Text>
                </View>

                {/* Mostrar errores */}
                {error && (
                    <View className="mt-4 rounded-lg bg-red-500/20 p-4">
                        <Text className="text-center text-red-400">{error}</Text>
                        <TouchableOpacity onPress={() => setError(null)} className="mt-2">
                            <Text className="text-center text-sm text-red-300 underline">
                                Cerrar
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Imágenes actuales */}
                {normalizedImages.length > 0 && (
                    <View className="mt-6">
                        <Text className="mb-4 text-lg font-semibold text-white">
                            {t('manageImagesCurrentTitle') || 'Imágenes Actuales'} (
                            {normalizedImages.length})
                        </Text>

                        <View className="flex-row flex-wrap justify-between">
                            {normalizedImages.map((image, index) => {
                                const uniqueKey = `image-${image.id}-${index}`;

                                return (
                                    <TouchableOpacity
                                        key={uniqueKey}
                                        style={{
                                            width: imageSize,
                                            height: imageSize,
                                            marginBottom: 12,
                                        }}
                                        onPress={() => toggleImageSelection(image.id)}
                                        className="relative overflow-hidden rounded-lg border-2 border-transparent"
                                        activeOpacity={0.7}>
                                        <Image
                                            source={{ uri: image.url }}
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode="cover"
                                            onError={(error) => {
                                                console.log('Error loading image:', {
                                                    imageId: image.id,
                                                    url: image.url,
                                                    error: error.nativeEvent.error,
                                                });
                                            }}
                                            onLoad={() => {
                                                console.log('Successfully loaded image:', image.id);
                                            }}
                                        />

                                        {/* Overlay de selección */}
                                        {selectedImages.has(image.id) && (
                                            <View className="absolute inset-0 items-center justify-center bg-red-500/60">
                                                <View className="rounded-full bg-red-600 p-2">
                                                    <Ionicons
                                                        name="checkmark"
                                                        size={20}
                                                        color="white"
                                                    />
                                                </View>
                                            </View>
                                        )}

                                        {/* Indicador de selección en esquina */}
                                        <View className="absolute right-2 top-2">
                                            <View
                                                className={`h-6 w-6 rounded-full border-2 border-white ${
                                                    selectedImages.has(image.id)
                                                        ? 'bg-red-500'
                                                        : 'bg-black/50'
                                                } items-center justify-center`}>
                                                {selectedImages.has(image.id) && (
                                                    <Ionicons
                                                        name="checkmark"
                                                        size={12}
                                                        color="white"
                                                    />
                                                )}
                                            </View>
                                        </View>

                                        {/* Debug info - mostrar ID */}
                                        {__DEV__ && (
                                            <View className="absolute bottom-1 left-1 rounded bg-blue-500 px-1">
                                                <Text className="text-xs text-white">
                                                    ID: {image.id}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Nuevas imágenes usando useCamera */}
                {newImages.length > 0 && (
                    <View className="mt-6">
                        <Text className="mb-4 text-lg font-semibold text-white">
                            {t('manageImagesNewTitle') || 'Nuevas Imágenes'} ({newImages.length})
                        </Text>

                        <View className="flex-row flex-wrap justify-between">
                            {newImages.map((uri, index) => (
                                <View
                                    key={`new-${index}-${Date.now()}`}
                                    style={{
                                        width: imageSize,
                                        height: imageSize,
                                        marginBottom: 12,
                                    }}
                                    className="relative overflow-hidden rounded-lg border-2 border-green-500">
                                    <Image
                                        source={{ uri }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="cover"
                                        onError={(error) => {
                                            console.log('Error loading new image:', {
                                                index,
                                                uri,
                                                error: error.nativeEvent.error,
                                            });
                                        }}
                                    />

                                    {/* Botón para eliminar nueva imagen */}
                                    <TouchableOpacity
                                        onPress={() => removeImage(index)}
                                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1"
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <Ionicons name="close" size={14} color="white" />
                                    </TouchableOpacity>

                                    {/* Indicador de nueva imagen */}
                                    <View className="absolute bottom-1 left-1 rounded bg-green-500 px-2 py-0.5">
                                        <Text className="text-xs font-semibold text-white">
                                            {t('manageImagesNewLabel') || 'Nueva'}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Mensaje si no hay imágenes */}
                {normalizedImages.length === 0 && newImages.length === 0 && (
                    <View className="mt-20 items-center">
                        <Ionicons name="image-outline" size={64} color="#6b7280" />
                        <Text className="mt-4 text-lg text-gray-400">
                            {t('manageImagesEmpty') || 'No hay imágenes en este reporte'}
                        </Text>
                    </View>
                )}

                {/* Botón para agregar imágenes */}
                <TouchableOpacity
                    onPress={handleAddImage}
                    className="mt-6 rounded-lg border-2 border-dashed border-[#537CF2] bg-[#537CF2]/10 p-6"
                    activeOpacity={0.7}>
                    <View className="items-center">
                        <Ionicons name="add-circle-outline" size={48} color="#537CF2" />
                        <Text className="mt-2 text-lg font-semibold text-[#537CF2]">
                            {t('manageImagesAddButton') || 'Agregar Imágenes'}
                        </Text>
                        <Text className="mt-1 text-center text-sm text-gray-400">
                            {t('manageImagesAddDescription') ||
                                'Toca para seleccionar desde cámara o galería'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            {/* Botones de acción */}
            <View className="border-t border-gray-600 bg-secondary px-4 py-4">
                {/* Información de selección */}
                {(selectedImages.size > 0 || newImages.length > 0) && (
                    <View className="mb-4 rounded-lg bg-[#1A1F2E] p-3">
                        {selectedImages.size > 0 && (
                            <Text className="text-center text-red-400">
                                {t('manageImagesSelectedToDelete') || 'Seleccionadas para eliminar'}
                                : {selectedImages.size}
                            </Text>
                        )}
                        {newImages.length > 0 && (
                            <Text className="text-center text-green-400">
                                {t('manageImagesSelectedToUpload') || 'Nuevas para subir'}:{' '}
                                {newImages.length}
                            </Text>
                        )}
                    </View>
                )}

                <View className="flex-row gap-3">
                    {/* Botón cancelar */}
                    <TouchableOpacity
                        onPress={onBack}
                        className="flex-1 rounded-lg bg-gray-600 p-4"
                        activeOpacity={0.7}>
                        <Text className="text-center font-semibold text-white">
                            {t('cancel') || 'Cancelar'}
                        </Text>
                    </TouchableOpacity>

                    {/* Botón eliminar */}
                    {selectedImages.size > 0 && (
                        <TouchableOpacity
                            onPress={handleDeleteImages}
                            disabled={loading}
                            className="flex-1 rounded-lg bg-red-600 p-4"
                            activeOpacity={0.7}>
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-center font-semibold text-white">
                                    {t('delete') || 'Eliminar'} ({selectedImages.size})
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Botón subir */}
                    {newImages.length > 0 && (
                        <TouchableOpacity
                            onPress={handleUploadImages}
                            disabled={loading}
                            className="flex-1 rounded-lg bg-green-600 p-4"
                            activeOpacity={0.7}>
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-center font-semibold text-white">
                                    {t('upload') || 'Subir'} ({newImages.length})
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Modal de opciones usando el hook useCamera */}
            <ModalFileOption
                visible={showFileModal}
                onClose={() => setShowFileModal(false)}
                onTakePhoto={handleCameraPress}
                onSelectFromGallery={handleGalleryPress}
                type="image"
            />
        </SafeAreaView>
    );
}
