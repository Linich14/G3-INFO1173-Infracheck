import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormReport from '../components/formReport';
import ReportPreview from '../components/ReportPreview';
import ModalFileOption from '../components/modalFileOption';
import { useReportForm } from '../hooks/useReportForm';
import { useUserContext } from '~/contexts/UserContext';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { useLanguage } from '~/contexts/LanguageContext';
import { useToast } from '~/features/posts/contexts/ToastContext';

export default function CreateReportScreen() {
    const { t } = useLanguage();
    const { showSuccess, showError } = useToast();
    const { user } = useUserContext();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'image' | 'video'>('image');
    const [showMapModal, setShowMapModal] = useState(false);
    const {
        formData,
        errors,
        loading,
        mediaStats,
        showPreview,
        isSubmitting,
        showImageModal,
        showVideoModal,
        setShowImageModal,
        setShowVideoModal,
        updateField,
        takePhoto,
        pickImageFromGallery,
        recordVideo,
        pickVideoFromGallery,
        removeImage,
        removeVideo,
        openImageModal,
        openVideoModal,
        getMediaStats,
        handlePreview,
        handleSubmit,
        setShowPreview, // Asegúrate de que esta función esté disponible en el hook
    } = useReportForm();

    const handleOpenImageModal = () => {
        setModalType('image');
        setModalVisible(true);
    };

    const handleOpenVideoModal = () => {
        setModalType('video');
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const handleTakePhoto = () => {
        if (modalType === 'image') {
            takePhoto();
        } else {
            recordVideo();
        }
        handleCloseModal();
    };

    const handleSelectFromGallery = () => {
        if (modalType === 'image') {
            pickImageFromGallery();
        } else {
            pickVideoFromGallery();
        }
        handleCloseModal();
    };

    const onSelectLocation = (location: {
        latitude: number;
        longitude: number;
        address?: string;
    }) => {
        updateField('latitud', location.latitude);
        updateField('longitud', location.longitude);
        if (location.address) {
            updateField('direccion', location.address);
        }
        setShowMapModal(false);
    };

    const handleSubmitForm = async () => {
        if (!user) {
            showError(t('reportCreateErrorAuth'));
            return;
        }

        const result = await handleSubmit();

        if (result.success) {
            showSuccess(t('reportCreateSuccessMessage'));
            setTimeout(() => {
                router.back();
            }, 1500);
        } else {
            showError(result.message);
        }
    };

    const handleBackPress = () => {
        if (
            formData.titulo ||
            formData.descripcion ||
            formData.imagenes.length > 0 ||
            formData.video
        ) {
            // Show warning Toast and allow user to decide
            showError(t('reportCreateDiscardMessage'));
            // Give user a moment to see the toast before going back
            setTimeout(() => {
                router.back();
            }, 1500);
        } else {
            router.back();
        }
    };

    // Función mejorada para cerrar el preview
    const handleClosePreview = () => {
        if (isSubmitting) {
            showError(t('reportCreateSubmittingMessage'));
            return;
        }

        setShowPreview(false);
    };

    // Función para editar el reporte desde el preview
    const handleEditFromPreview = () => {
        if (isSubmitting) {
            showError(t('reportCreateSubmittingMessage'));
            return;
        }

        // Cerrar el preview para volver al formulario
        setShowPreview(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="mx-4 flex-row items-center rounded-lg bg-tertiary px-4 py-3">
                {/* Botón para volver atrás */}
                <Pressable
                    onPress={handleBackPress}
                    className="mr-3 rounded-full p-2 active:bg-gray-700">
                    <X size={24} color="white" />
                </Pressable>

                <Text className="flex-1 text-center text-3xl font-semibold text-primary">
                    {t('reportCreateScreenTitle')}
                </Text>

                {/* Espacio para mantener el título centrado */}
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
                <FormReport
                    formData={formData}
                    errors={errors}
                    onUpdateField={updateField}
                    onOpenImageModal={openImageModal}
                    onOpenVideoModal={openVideoModal}
                    onRemoveImage={removeImage}
                    onRemoveVideo={removeVideo}
                    onSelectLocation={onSelectLocation}
                    showMapModal={showMapModal}
                    onSetShowMapModal={setShowMapModal}
                    mediaStats={getMediaStats()}
                />

                {/* Botón de previsualización */}
                <View className="my-6">
                    <Pressable
                        onPress={handlePreview}
                        className="items-center rounded-lg bg-blue-600 p-4 active:bg-blue-700"
                        disabled={isSubmitting}>
                        <Text className="text-lg font-semibold text-white">
                            {isSubmitting
                                ? t('reportCreateProcessing')
                                : t('reportCreatePreviewTitle')}
                        </Text>
                    </Pressable>
                </View>

                {/* Información adicional */}
                <View className="mb-6 rounded-lg bg-tertiary/50 p-4">
                    <Text className="mb-2 text-sm font-semibold text-white">
                        {t('reportCreateInfoTitle')}
                    </Text>
                    <Text className="mb-1 text-xs text-gray-300">
                        • {t('reportCreateInfoConfidential')}
                    </Text>
                    <Text className="mb-1 text-xs text-gray-300">
                        • {t('reportCreateInfoReviewTime')}
                    </Text>
                    <Text className="mb-1 text-xs text-gray-300">
                        • {t('reportCreateInfoNotifications')}
                    </Text>
                    <Text className="text-xs text-gray-300">
                        • {t('reportCreateInfoEmergencies')}
                    </Text>
                </View>
            </ScrollView>

            {/* Modal para seleccionar imágenes */}
            <ModalFileOption
                visible={showImageModal}
                onClose={() => setShowImageModal(false)}
                onTakePhoto={takePhoto}
                onSelectFromGallery={pickImageFromGallery}
                type="image"
            />

            {/* Modal para seleccionar videos */}
            <ModalFileOption
                visible={showVideoModal}
                onClose={() => setShowVideoModal(false)}
                onRecordVideo={recordVideo}
                onSelectVideoFromGallery={pickVideoFromGallery}
                type="video"
            />

            {/* Modal de previsualización con funciones mejoradas */}
            <ReportPreview
                visible={showPreview}
                data={formData}
                onClose={handleClosePreview}
                onEdit={handleEditFromPreview}
                onConfirm={handleSubmitForm}
                loading={isSubmitting}
            />
        </SafeAreaView>
    );
}
