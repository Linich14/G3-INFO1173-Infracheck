import React from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MediaStats } from '../hooks/useCamera';
import { useLanguage } from '~/contexts/LanguageContext';

interface MediaSectionProps {
    selectedImages: string[];
    selectedVideo?: string;
    onOpenImageModal: () => void;
    onOpenVideoModal: () => void;
    onRemoveImage: (index: number) => void;
    onRemoveVideo: () => void;
    mediaStats?: MediaStats;
}

const MediaSection: React.FC<MediaSectionProps> = ({
    selectedImages,
    selectedVideo,
    onOpenImageModal,
    onOpenVideoModal,
    onRemoveImage,
    onRemoveVideo,
    mediaStats,
}) => {
    const { t } = useLanguage();
    
    return (
        <View className="gap-4">
            {/* Botones para agregar medios */}
            <View className="flex-row gap-3">
                <Pressable
                    onPress={onOpenImageModal}
                    className={`flex-1 flex-row items-center justify-center rounded-lg p-3 ${
                        mediaStats?.canAddImages ? 'bg-blue-600 active:bg-blue-700' : 'bg-gray-500'
                    }`}
                    disabled={!mediaStats?.canAddImages}>
                    <MaterialCommunityIcons name="camera" size={20} color="white" />
                    <Text className="ml-2 text-white">{t('reportMediaSectionImage')} ({selectedImages.length}/5)</Text>
                </Pressable>

                <Pressable
                    onPress={onOpenVideoModal}
                    className={`flex-1 flex-row items-center justify-center rounded-lg p-3 ${
                        mediaStats?.canAddVideo
                            ? 'bg-purple-600 active:bg-purple-700'
                            : 'bg-gray-500'
                    }`}
                    disabled={!mediaStats?.canAddVideo}>
                    <MaterialCommunityIcons name="video" size={20} color="white" />
                    <Text className="ml-2 text-white">
                        {t('reportMediaSectionVideo')} {selectedVideo ? '(1/1)' : '(0/1)'}
                    </Text>
                </Pressable>
            </View>

            {/* Mostrar imágenes seleccionadas */}
            {selectedImages.length > 0 && (
                <View>
                    <Text className="mb-2 text-white">{t('reportMediaSectionImagesSelected')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-2">
                            {selectedImages.map((uri, index) => (
                                <View key={index} className="relative">
                                    <Image
                                        source={{ uri }}
                                        className="h-20 w-20 rounded-lg"
                                        resizeMode="cover"
                                    />
                                    <Pressable
                                        onPress={() => onRemoveImage(index)}
                                        className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-red-500">
                                        <MaterialCommunityIcons
                                            name="close"
                                            size={16}
                                            color="white"
                                        />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* Mostrar video seleccionado */}
            {selectedVideo && (
                <View>
                    <Text className="mb-2 text-white">{t('reportMediaSectionVideoSelected')}</Text>
                    <View className="relative">
                        <View className="h-20 w-32 items-center justify-center rounded-lg bg-secondary">
                            <MaterialCommunityIcons name="video" size={30} color="white" />
                            <Text className="mt-1 text-xs text-white">{t('reportMediaSectionVideoLabel')}</Text>
                        </View>
                        <Pressable
                            onPress={onRemoveVideo}
                            className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-red-500">
                            <MaterialCommunityIcons name="close" size={16} color="white" />
                        </Pressable>
                    </View>
                </View>
            )}

            {/* Información sobre límites */}
            {mediaStats && (
                <View className="rounded-lg bg-secondary/50 p-3">
                    <Text className="text-xs text-gray-300">
                        • {t('reportMediaSectionMaxImages')} ({mediaStats.remainingImageSlots} {t('reportMediaSectionRemaining')})
                    </Text>
                    <Text className="text-xs text-gray-300">• {t('reportMediaSectionMaxVideo')}</Text>
                </View>
            )}
        </View>
    );
};

export default MediaSection;
