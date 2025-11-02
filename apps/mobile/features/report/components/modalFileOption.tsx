import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface ModalFileOptionProps {
    visible: boolean;
    onClose: () => void;
    onTakePhoto?: () => void;
    onSelectFromGallery?: () => void;
    onRecordVideo?: () => void;
    onSelectVideoFromGallery?: () => void;
    type: 'image' | 'video';
}

const ModalFileOption: React.FC<ModalFileOptionProps> = ({
    visible,
    onClose,
    onTakePhoto,
    onSelectFromGallery,
    onRecordVideo,
    onSelectVideoFromGallery,
    type,
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable className="flex-1 bg-black/50" onPress={onClose}>
                <View className="flex-1 items-center justify-center px-8">
                    <Pressable
                        onPress={() => {}}
                        className="w-full max-w-sm rounded-2xl bg-tertiary p-6">
                        <Text className="mb-6 text-center text-xl font-semibold text-white">
                            {type === 'image' ? 'Agregar Imagen' : 'Agregar Video'}
                        </Text>

                        {type === 'image' ? (
                            <>
                                <Pressable
                                    onPress={onTakePhoto}
                                    className="mb-4 flex-row items-center rounded-lg bg-secondary p-4 active:bg-slate-600">
                                    <MaterialCommunityIcons name="camera" size={24} color="white" />
                                    <Text className="ml-3 text-white">Tomar foto</Text>
                                </Pressable>

                                <Pressable
                                    onPress={onSelectFromGallery}
                                    className="mb-6 flex-row items-center rounded-lg bg-secondary p-4 active:bg-slate-600">
                                    <MaterialCommunityIcons name="image" size={24} color="white" />
                                    <Text className="ml-3 text-white">Seleccionar de galería</Text>
                                </Pressable>
                            </>
                        ) : (
                            <>
                                <Pressable
                                    onPress={onRecordVideo}
                                    className="mb-4 flex-row items-center rounded-lg bg-secondary p-4 active:bg-slate-600">
                                    <MaterialCommunityIcons name="video" size={24} color="white" />
                                    <Text className="ml-3 text-white">Grabar video</Text>
                                </Pressable>

                                <Pressable
                                    onPress={onSelectVideoFromGallery}
                                    className="mb-6 flex-row items-center rounded-lg bg-secondary p-4 active:bg-slate-600">
                                    <MaterialCommunityIcons
                                        name="video-outline"
                                        size={24}
                                        color="white"
                                    />
                                    <Text className="ml-3 text-white">Seleccionar de galería</Text>
                                </Pressable>
                            </>
                        )}

                        <Pressable
                            onPress={onClose}
                            className="items-center rounded-lg bg-gray-600 p-4 active:bg-gray-700">
                            <Text className="font-semibold text-white">Cancelar</Text>
                        </Pressable>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
};

export default ModalFileOption;
