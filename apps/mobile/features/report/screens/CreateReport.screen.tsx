import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormReport from '../components/formReport';
import ModalFileOption from '../components/modalFileOption';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useReportForm } from '../hooks/useReportForm';

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

    return (
        <SafeAreaView className="flex-1 items-center justify-center bg-background">
            <ScrollView className="relative w-full flex-1 p-4" showsVerticalScrollIndicator={false}>
                <View className="mb-4 flex-row items-center rounded-lg bg-secondary p-4">
                    <View className="flex-1 items-center">
                        <Text className="text-3xl font-bold text-primary">Nuevo Reporte</Text>
                    </View>
                </View>

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

                <ModalFileOption
                    visible={modalVisible}
                    onClose={handleCloseModal}
                    onTakePhoto={handleTakePhoto}
                    onSelectFromGallery={handleSelectFromGallery}
                />
            </ScrollView>
            <Pressable
                onPress={handleSubmit}
                disabled={loading}
                className={`absolute bottom-0 right-0 m-6 aspect-square rounded-full p-4 ${
                    loading ? 'bg-gray-500' : 'bg-primary'
                }`}>
                <MaterialIcons
                    className="m-auto"
                    name={loading ? 'hourglass-empty' : 'send'}
                    size={30}
                    color="white"
                />
            </Pressable>
        </SafeAreaView>
    );
};

export default CreateReportScreen;
