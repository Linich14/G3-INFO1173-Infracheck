import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormReport from '../components/formReport';
import ModalFileOption from '../components/modalFileOption';
import { useReportForm } from '../hooks/useReportForm';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';

const CreateReportScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'image' | 'video'>('image');
    const [showMapModal, setShowMapModal] = useState(false);

    const {
        formData,
        errors,
        loading,
        mediaStats,
        updateField,
        takePhoto,
        takeVideo,
        pickFromGallery,
        pickVideoFromGallery,
        removeImage,
        removeVideo,
        selectLocation,
        submitForm,
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
            takeVideo();
        }
        handleCloseModal();
    };

    const handleSelectFromGallery = () => {
        if (modalType === 'image') {
            pickFromGallery();
        } else {
            pickVideoFromGallery();
        }
        handleCloseModal();
    };

    const handleSubmit = async () => {
        await submitForm();
    };

    const handleClose = () => {
        router.replace('/(map)/');
    };

    return (
        <SafeAreaView className="flex-1 bg-[#090A0D]" edges={['top', 'left', 'right']}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Título "Crear Reporte" arriba */}
                <View className="mx-4 mb-3 mt-2 flex-row items-center rounded-lg bg-secondary p-3">
                    <View className="flex-1 items-center">
                        <Text className="text-2xl font-bold text-primary">Crear Reporte</Text>
                    </View>
                </View>

                {/* Header con botones donde estaba "Crear Reporte" */}
                <View className="mx-4 flex-row items-center justify-between rounded-t-lg border-b border-gray-700 bg-[#13161E] px-4 py-3">
                    {/* Botón Cerrar */}
                    <TouchableOpacity
                        onPress={handleClose}
                        className="h-10 w-10 items-center justify-center rounded-full bg-white"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <X size={20} color="#000" />
                    </TouchableOpacity>

                    {/* Espacio vacío para mantener el centrado */}
                    <View />

                    {/* Botón Publicar */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        className={`rounded-[12px] px-6 py-2 ${loading ? 'bg-gray-500' : 'bg-[#537CF2]'}`}>
                        <Text className="font-medium text-white">
                            {loading ? 'Publicando...' : 'Publicar'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="px-4">
                    <FormReport
                        formData={formData}
                        errors={errors}
                        onUpdateField={updateField}
                        onOpenImageModal={handleOpenImageModal}
                        onOpenVideoModal={handleOpenVideoModal}
                        onRemoveImage={removeImage}
                        onRemoveVideo={removeVideo}
                        onSelectLocation={selectLocation}
                        showMapModal={showMapModal}
                        onSetShowMapModal={setShowMapModal}
                        mediaStats={mediaStats}
                    />
                </View>

                <ModalFileOption
                    visible={modalVisible}
                    onClose={handleCloseModal}
                    onTakePhoto={handleTakePhoto}
                    onSelectFromGallery={handleSelectFromGallery}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreateReportScreen;
