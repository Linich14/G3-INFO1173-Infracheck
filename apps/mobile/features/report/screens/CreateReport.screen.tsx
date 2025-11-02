import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormReport from '../components/formReport';
import ReportPreview from '../components/ReportPreview';
import ModalFileOption from '../components/modalFileOption';
import { useReportForm } from '../hooks/useReportForm';
import { useUserContext } from '~/contexts/UserContext';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';

const CreateReportScreen = () => {
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
            Alert.alert('Error', 'Debe iniciar sesión para crear un reporte');
            return;
        }

        const result = await handleSubmit();

        if (result.success) {
            Alert.alert('Reporte Creado', 'Su reporte ha sido enviado exitosamente', [
                { text: 'OK' },
            ]);
        } else {
            Alert.alert('Error', result.message);
        }
    };

    const handleBackPress = () => {
        if (
            formData.titulo ||
            formData.descripcion ||
            formData.imagenes.length > 0 ||
            formData.video
        ) {
            Alert.alert(
                'Descartar Cambios',
                '¿Está seguro de que desea salir? Se perderán todos los datos ingresados.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Salir', style: 'destructive', onPress: () => router.back() },
                ]
            );
        } else {
            router.back();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="mx-4 flex-row items-center rounded-lg bg-tertiary px-4 py-3">
                <Text className="flex-1 text-center text-3xl font-semibold text-primary">
                    Nuevo Reporte
                </Text>
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
                            {isSubmitting ? 'Procesando...' : 'Vista Previa del Reporte'}
                        </Text>
                    </Pressable>
                </View>

                {/* Información adicional */}
                <View className="mb-6 rounded-lg bg-tertiary/50 p-4">
                    <Text className="mb-2 text-sm font-semibold text-white">
                        Información Importante:
                    </Text>
                    <Text className="mb-1 text-xs text-gray-300">
                        • Sus datos personales se mantendrán confidenciales
                    </Text>
                    <Text className="mb-1 text-xs text-gray-300">
                        • El reporte será revisado en un plazo de 24-48 horas
                    </Text>
                    <Text className="mb-1 text-xs text-gray-300">
                        • Recibirá notificaciones sobre el estado de su reporte
                    </Text>
                    <Text className="text-xs text-gray-300">
                        • Para emergencias, contacte directamente a los servicios de emergencia
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

            {/* Modal de previsualización */}
            <ReportPreview
                visible={showPreview}
                data={formData}
                onClose={() => setShowPreview(false)}
                onEdit={() => setShowPreview(false)}
                onConfirm={handleSubmitForm}
                loading={isSubmitting}
            />
        </SafeAreaView>
    );
};

export default CreateReportScreen;
