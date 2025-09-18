import { View, Text, ScrollView, Image, Pressable, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

const MediaSection = ({
    selectedImages,
    selectedVideo,
    onOpenImageModal,
    onOpenVideoModal,
    onRemoveImage,
    onRemoveVideo,
    mediaStats,
}: {
    selectedImages: string[];
    selectedVideo: string | null;
    onOpenImageModal: () => void;
    onOpenVideoModal: () => void;
    onRemoveImage: (index: number) => void;
    onRemoveVideo: () => void;
    mediaStats?: {
        imageCount: number;
        hasVideo: boolean;
        canAddImages: boolean;
        canAddVideo: boolean;
        remainingImageSlots: number;
    };
}) => {
    return (
        <View className="gap-4">
            {/* Sección de Imágenes */}
            <View>
                <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Ionicons name="images-outline" size={20} color="#537CF2" />
                        <Text className="ml-2 text-lg font-semibold text-white">
                            Imágenes ({selectedImages.length}/10)
                        </Text>
                    </View>
                    <Pressable
                        onPress={onOpenImageModal}
                        disabled={!mediaStats?.canAddImages}
                        className={`rounded-lg px-3 py-1 ${
                            mediaStats?.canAddImages ? 'bg-primary' : 'bg-gray-500'
                        }`}>
                        <Text className="text-sm text-white">
                            {mediaStats?.canAddImages ? 'Agregar' : 'Límite'}
                        </Text>
                    </Pressable>
                </View>

                {selectedImages.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-3">
                            {selectedImages.map((imagen, index) => (
                                <View key={`${imagen}-${index}`} className="relative">
                                    <TouchableOpacity className="overflow-hidden rounded-lg">
                                        <Image
                                            source={{ uri: imagen }}
                                            className="h-32 w-32"
                                            resizeMode="cover"
                                        />
                                        <View className="absolute right-2 top-2 rounded-full bg-black bg-opacity-50 p-1">
                                            <Ionicons
                                                name="expand-outline"
                                                size={16}
                                                color="white"
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    <Pressable
                                        onPress={() => onRemoveImage(index)}
                                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1">
                                        <Ionicons name="close" size={16} color="white" />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                ) : (
                    <Pressable
                        onPress={onOpenImageModal}
                        className="h-[100px] w-full items-center justify-center rounded-lg bg-secondary p-3 active:bg-slate-500">
                        <MaterialCommunityIcons name="file-image" size={40} color="white" />
                        <Text className="mt-2 text-sm text-white">Agregar imágenes (máx. 10)</Text>
                    </Pressable>
                )}
            </View>

            {/* Sección de Video */}
            <View>
                <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Ionicons name="videocam-outline" size={20} color="#537CF2" />
                        <Text className="ml-2 text-lg font-semibold text-white">
                            Video {selectedVideo ? '(1/1)' : '(0/1)'}
                        </Text>
                    </View>
                    {mediaStats?.canAddVideo && (
                        <Pressable
                            onPress={onOpenVideoModal}
                            className="rounded-lg bg-primary px-3 py-1">
                            <Text className="text-sm text-white">Agregar</Text>
                        </Pressable>
                    )}
                </View>

                {selectedVideo ? (
                    <View className="relative">
                        <TouchableOpacity className="rounded-lg border border-gray-400 border-opacity-30 bg-tertiary p-4">
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="play-circle-outline" size={24} color="#537CF2" />
                                <Text className="ml-2 font-medium text-[#537CF2]">
                                    Reproducir video
                                </Text>
                            </View>
                            <Text className="mt-2 text-center text-sm text-white">
                                Video seleccionado
                            </Text>
                        </TouchableOpacity>
                        <Pressable
                            onPress={onRemoveVideo}
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1">
                            <Ionicons name="close" size={16} color="white" />
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        onPress={onOpenVideoModal}
                        className="h-[100px] w-full items-center justify-center rounded-lg bg-secondary p-3 active:bg-slate-500">
                        <MaterialCommunityIcons name="video" size={40} color="white" />
                        <Text className="mt-2 text-sm text-white">Agregar video (máx. 1)</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};

export default MediaSection;
