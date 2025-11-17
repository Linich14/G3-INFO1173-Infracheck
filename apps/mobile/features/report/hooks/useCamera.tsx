import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useLanguage } from '~/contexts/LanguageContext';

export interface MediaStats {
    imageCount: number;
    hasVideo: boolean;
    canAddImages: boolean;
    canAddVideo: boolean;
    remainingImageSlots: number;
}

export const useCamera = () => {
    const { t } = useLanguage();
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<string | undefined>();
    const [showImageModal, setShowImageModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);

    const MAX_IMAGES = 5;

    const getMediaStats = (): MediaStats => {
        return {
            imageCount: selectedImages.length,
            hasVideo: !!selectedVideo,
            canAddImages: selectedImages.length < MAX_IMAGES,
            canAddVideo: !selectedVideo,
            remainingImageSlots: MAX_IMAGES - selectedImages.length,
        };
    };

    const requestPermissions = async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
            Alert.alert(
                t('reportMediaPermissionsTitle'),
                t('reportMediaPermissionsMessage'),
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const takePhoto = async () => {
        if (selectedImages.length >= MAX_IMAGES) {
            Alert.alert(t('reportMediaLimitImages').replace('{max}', MAX_IMAGES.toString()));
            return;
        }

        const hasPermissions = await requestPermissions();
        if (!hasPermissions) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedImages((prev) => [...prev, result.assets[0].uri]);
                setShowImageModal(false);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert(t('reportMediaErrorPhoto'));
        }
    };

    const pickImageFromGallery = async () => {
        if (selectedImages.length >= MAX_IMAGES) {
            Alert.alert(t('reportMediaLimitImages').replace('{max}', MAX_IMAGES.toString()));
            return;
        }

        const hasPermissions = await requestPermissions();
        if (!hasPermissions) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedImages((prev) => [...prev, result.assets[0].uri]);
                setShowImageModal(false);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert(t('reportMediaErrorImage'));
        }
    };

    const recordVideo = async () => {
        if (selectedVideo) {
            Alert.alert(t('reportMediaLimitVideo'));
            return;
        }

        const hasPermissions = await requestPermissions();
        if (!hasPermissions) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                videoMaxDuration: 60, // 60 segundos máximo
                quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedVideo(result.assets[0].uri);
                setShowVideoModal(false);
            }
        } catch (error) {
            console.error('Error recording video:', error);
            Alert.alert(t('reportMediaErrorVideo'));
        }
    };

    const pickVideoFromGallery = async () => {
        if (selectedVideo) {
            Alert.alert(t('reportMediaLimitVideo'));
            return;
        }

        const hasPermissions = await requestPermissions();
        if (!hasPermissions) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                videoMaxDuration: 60,
                quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedVideo(result.assets[0].uri);
                setShowVideoModal(false);
            }
        } catch (error) {
            console.error('Error picking video:', error);
            Alert.alert(t('reportMediaErrorVideo'));
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeVideo = () => {
        setSelectedVideo(undefined);
    };

    const openImageModal = () => {
        if (selectedImages.length >= MAX_IMAGES) {
            Alert.alert(t('reportMediaLimitImages').replace('{max}', MAX_IMAGES.toString()));
            return;
        }
        setShowImageModal(true);
    };

    const openVideoModal = () => {
        if (selectedVideo) {
            Alert.alert(t('reportMediaLimitVideo'));
            return;
        }
        setShowVideoModal(true);
    };

    const resetMedia = () => {
        setSelectedImages([]);
        setSelectedVideo(undefined);
    };

    return {
        selectedImages,
        selectedVideo,
        showImageModal,
        showVideoModal,
        setShowImageModal,
        setShowVideoModal,
        takePhoto,
        pickImageFromGallery,
        recordVideo,
        pickVideoFromGallery,
        removeImage,
        removeVideo,
        openImageModal,
        openVideoModal,
        resetMedia,
        getMediaStats,
    };
};
