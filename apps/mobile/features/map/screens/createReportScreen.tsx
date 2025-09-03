import { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormReport from '../components/formReport';
import ModalFileOption from '../components/modalFileOption';

const CreateReportScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleOpenImageModal = () => {
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const handleTakePhoto = () => {
        setModalVisible(false);
        Alert.alert('Funcionalidad', 'Tomar foto - Por implementar');
    };

    const handleSelectFromGallery = () => {
        setModalVisible(false);
        Alert.alert('Funcionalidad', 'Seleccionar de galería - Por implementar');
    };

    return (
        <SafeAreaView className="flex-1 items-center justify-center bg-background">
            <ScrollView className="w-full flex-1 p-4" showsVerticalScrollIndicator={false}>
                <View className={style.items}>
                    <Text className="text-center text-3xl font-bold text-primary">
                        Nuevo Reporte
                    </Text>
                </View>

                <FormReport onOpenImageModal={handleOpenImageModal} />

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

const style = {
    items: 'bg-secondary p-4 rounded-lg flex-1 items-center justify-center mb-4',
};

export default CreateReportScreen;
