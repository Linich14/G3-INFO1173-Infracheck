import { useState } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormReport from '../components/formReport';
import ModalFileOption from '../components/modalFileOption';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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
            <ScrollView className="relative w-full flex-1 p-4" showsVerticalScrollIndicator={false}>
                <View className="mb-4 flex-row items-center rounded-lg bg-secondary p-4">
                    <View className="flex-1 items-center">
                        <Text className="text-3xl font-bold text-primary">Nuevo Reporte</Text>
                    </View>
                </View>

                <FormReport onOpenImageModal={handleOpenImageModal} />

                <ModalFileOption
                    visible={modalVisible}
                    onClose={handleCloseModal}
                    onTakePhoto={handleTakePhoto}
                    onSelectFromGallery={handleSelectFromGallery}
                />
            </ScrollView>
            <Pressable
                onPress={() => Alert.alert('Funcionalidad', 'Enviar reporte - Por implementar')}
                className="absolute bottom-0 right-0 m-6 aspect-square rounded-full bg-primary p-4">
                <MaterialIcons className="m-auto" name="send" size={30} color="white" />
            </Pressable>
        </SafeAreaView>
    );
};

export default CreateReportScreen;
