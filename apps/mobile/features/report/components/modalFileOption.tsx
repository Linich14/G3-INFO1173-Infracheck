import { View, Text, Pressable, Modal } from 'react-native';

interface ModalFileOptionProps {
    visible: boolean;
    onClose: () => void;
    onTakePhoto: () => void;
    onSelectFromGallery: () => void;
}

const ModalFileOption = ({
    visible,
    onClose,
    onTakePhoto,
    onSelectFromGallery,
}: ModalFileOptionProps) => {
    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
                <Pressable
                    className="rounded-t-xl bg-secondary p-6"
                    onPress={(e) => e.stopPropagation()}>
                    <Text className="mb-4 text-lg font-bold text-white">Seleccionar archivo</Text>

                    <Pressable
                        className="mb-3 rounded-lg bg-background p-4"
                        onPress={() => {
                            onTakePhoto();
                            onClose();
                        }}>
                        <Text className="text-center text-white">Tomar foto</Text>
                    </Pressable>

                    <Pressable
                        className="rounded-lg bg-background p-4"
                        onPress={() => {
                            onSelectFromGallery();
                            onClose();
                        }}>
                        <Text className="text-center text-white">Seleccionar de la galería</Text>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default ModalFileOption;
