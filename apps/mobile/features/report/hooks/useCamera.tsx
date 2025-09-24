import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const MAX_IMAGES = 10;
const IMAGE_QUALITY = 0.8;
const VIDEO_MAX_DURATION = 60;

export function useImagePicker() {
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    // Función reutilizable para verificar permisos de cámara
    const requestCameraPermission = useCallback(async (): Promise<boolean> => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permisos', 'Se necesitan permisos de cámara para continuar');
            return false;
        }
        return true;
    }, []);

    // Función reutilizable para verificar permisos de galería
    const requestGalleryPermission = useCallback(async (): Promise<boolean> => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permisos', 'Se necesitan permisos de galería para continuar');
            return false;
        }
        return true;
    }, []);

    // Verificar si se pueden agregar más imágenes
    const canAddMoreImages = useCallback(
        (count: number = 1): boolean => {
            if (selectedImages.length + count > MAX_IMAGES) {
                Alert.alert(
                    'Límite alcanzado',
                    `Solo puedes seleccionar un máximo de ${MAX_IMAGES} imágenes`
                );
                return false;
            }
            return true;
        },
        [selectedImages.length]
    );

    const takePhoto = useCallback(async (): Promise<void> => {
        try {
            if (!canAddMoreImages()) return;

            const hasPermission = await requestCameraPermission();
            if (!hasPermission) return;

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: IMAGE_QUALITY,
                allowsEditing: false,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedImages((prev) => [...prev, result.assets[0].uri]);
                Alert.alert('Éxito', 'Foto tomada correctamente');
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'No se pudo tomar la foto. Intenta nuevamente.');
        }
    }, [canAddMoreImages, requestCameraPermission]);

    const takeVideo = useCallback(async (): Promise<void> => {
        try {
            if (selectedVideo) {
                Alert.alert('Límite alcanzado', 'Solo puedes agregar un video por reporte');
                return;
            }

            const hasPermission = await requestCameraPermission();
            if (!hasPermission) return;

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['videos'],
                quality: IMAGE_QUALITY,
                videoMaxDuration: VIDEO_MAX_DURATION,
                allowsEditing: false,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedVideo(result.assets[0].uri);
                Alert.alert('Éxito', 'Video grabado correctamente');
            }
        } catch (error) {
            console.error('Error taking video:', error);
            Alert.alert('Error', 'No se pudo grabar el video. Intenta nuevamente.');
        }
    }, [selectedVideo, requestCameraPermission]);

    const pickFromGallery = useCallback(async (): Promise<void> => {
        try {
            const remainingSlots = MAX_IMAGES - selectedImages.length;
            if (remainingSlots <= 0) {
                Alert.alert('Límite alcanzado', `Ya tienes ${MAX_IMAGES} imágenes seleccionadas`);
                return;
            }

            const hasPermission = await requestGalleryPermission();
            if (!hasPermission) return;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                allowsMultipleSelection: true,
                selectionLimit: remainingSlots,
                quality: IMAGE_QUALITY,
            });

            if (!result.canceled && result.assets.length > 0) {
                const newImageUris = result.assets.map((asset) => asset.uri);

                // Validación adicional por si acaso
                const totalImages = selectedImages.length + newImageUris.length;
                if (totalImages > MAX_IMAGES) {
                    const allowedImages = newImageUris.slice(0, remainingSlots);
                    setSelectedImages((prev) => [...prev, ...allowedImages]);
                    Alert.alert(
                        'Límite alcanzado',
                        `Solo se agregaron ${allowedImages.length} imágenes para no exceder el límite de ${MAX_IMAGES}`
                    );
                } else {
                    setSelectedImages((prev) => [...prev, ...newImageUris]);
                    const message =
                        newImageUris.length === 1
                            ? 'Imagen seleccionada correctamente'
                            : `${newImageUris.length} imágenes seleccionadas correctamente`;
                    Alert.alert('Éxito', message);
                }
            }
        } catch (error) {
            console.error('Error picking images from gallery:', error);
            Alert.alert('Error', 'No se pudieron seleccionar las imágenes. Intenta nuevamente.');
        }
    }, [selectedImages.length, requestGalleryPermission]);

    const pickVideoFromGallery = useCallback(async (): Promise<void> => {
        try {
            if (selectedVideo) {
                Alert.alert(
                    'Límite alcanzado',
                    'Ya tienes un video seleccionado. Elimínalo para agregar otro.'
                );
                return;
            }

            const hasPermission = await requestGalleryPermission();
            if (!hasPermission) return;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['videos'],
                allowsEditing: false,
                quality: IMAGE_QUALITY,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedVideo(result.assets[0].uri);
                Alert.alert('Éxito', 'Video seleccionado correctamente');
            }
        } catch (error) {
            console.error('Error picking video from gallery:', error);
            Alert.alert('Error', 'No se pudo seleccionar el video. Intenta nuevamente.');
        }
    }, [selectedVideo, requestGalleryPermission]);

    const removeImage = useCallback(
        (index: number): void => {
            if (index < 0 || index >= selectedImages.length) {
                console.warn('Index out of bounds when removing image');
                return;
            }
            setSelectedImages((prev) => prev.filter((_, i) => i !== index));
        },
        [selectedImages.length]
    );

    const removeVideo = useCallback((): void => {
        setSelectedVideo(null);
    }, []);

    const removeAllImages = useCallback((): void => {
        setSelectedImages([]);
    }, []);

    const removeAllMedia = useCallback((): void => {
        setSelectedImages([]);
        setSelectedVideo(null);
    }, []);

    // Estado derivado para mejor rendimiento
    const mediaStats = {
        imageCount: selectedImages.length,
        hasVideo: !!selectedVideo,
        canAddImages: selectedImages.length < MAX_IMAGES,
        canAddVideo: !selectedVideo,
        remainingImageSlots: MAX_IMAGES - selectedImages.length,
    };

    return {
        // Estado
        selectedImages,
        selectedVideo,
        mediaStats,

        // Acciones principales
        takePhoto,
        takeVideo,
        pickFromGallery,
        pickVideoFromGallery,

        // Acciones de eliminación
        removeImage,
        removeVideo,
        removeAllImages,
        removeAllMedia,

        // Constantes útiles
        MAX_IMAGES,
    };
}
