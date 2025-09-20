import React from 'react';
import { View, Text, Image, TouchableOpacity, ImageSourcePropType, Pressable } from 'react-native';
import {
    UserCircle2,
    MoreVertical,
    MapPin,
    ArrowBigUp,
    MessageCircle,
    Share2,
} from 'lucide-react-native';
import { ReportCardProps } from '../types';

import { useRouter } from 'expo-router';
const ReportCard: React.FC<ReportCardProps> = ({
    id,
    title,
    author,
    timeAgo,
    image,
    upvotes = 0,
    onFollow,
    onMore,
    onLocation,
    onUpvote,
    onComment,
    onShare,
    followLabel = 'Seguir',
    aspectRatio = 16 / 9,
}) => {
    const router = useRouter();
    const hasImage = !!image;

  return (
    <View className="bg-[#13161E] rounded-[12px] overflow-hidden">
      {/* Header */}
      <View className="px-4 py-2 flex-row items-center gap-2">
        {/* Avatar / Perfil */}
        <View className="flex-shrink-0">
          <UserCircle2 size={28} color="#537CF2" />
        </View>

        {/* Nombre del autor - flexible con truncado */}
        <View className="flex-1 min-w-0">
          <Text 
            className="text-white text-2xl" 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {author}
          </Text>
        </View>

        {/* Tiempo - fijo */}
        <View className="flex-shrink-0">
          <Text className="text-white text-xl">{timeAgo}</Text>
        </View>

        {/* Botón seguir - fijo */}
        <View className="flex-shrink-0">
          <TouchableOpacity
            className="bg-[#537CF2] rounded-[32px] shadow border border-white px-4 py-1 active:opacity-80"
            onPress={onFollow}
          >
            <Text className="text-white font-medium text-lg text-center">{followLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>

                <View className="flex justify-center">
                    <TouchableOpacity
                        className="rounded-[32px] border border-white bg-[#537CF2] px-6 py-1 shadow active:opacity-80"
                        onPress={onFollow}>
                        <Text className="text-center text-xl font-medium text-white">
                            {followLabel}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Título + Imagen/Placeholder + botones flotantes - CLICKEABLE */}
            <Pressable onPress={goToDetail} className="relative">
                <Text className="pb-2 pl-4 text-2xl text-white">{title}</Text>

                {hasImage ? (
                    <Image
                        source={image as ImageSourcePropType}
                        resizeMode="cover"
                        style={{ width: '100%', aspectRatio }}
                    />
                ) : (
                    <View
                        style={{ width: '100%', aspectRatio }}
                        className="items-center justify-center bg-[#0f172a]">
                        <Text className="text-white/40">Sin imagen</Text>
                    </View>
                )}

                {/* Botones flotantes SOLO si hay imagen - Estos NO son clickeables para navegación */}
                {hasImage && (
                    <View className="absolute bottom-3 right-3">
                        <TouchableOpacity
                            className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#537CF2] shadow active:opacity-80"
                            onPress={(e) => {
                                e.stopPropagation();
                                onMore && onMore();
                            }}>
                            <MoreVertical size={22} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="h-12 w-12 items-center justify-center rounded-full bg-[#537CF2] shadow active:opacity-80"
                            onPress={(e) => {
                                e.stopPropagation();
                                onLocation && onLocation();
                            }}>
                            <MapPin size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </Pressable>

            {/* Footer - Los botones NO son clickeables para navegación */}
            <View className="flex-row items-center justify-between p-4">
                <View className="flex-row">
                    <TouchableOpacity
                        className="mr-4 flex-row items-center gap-2 rounded-[32px] border border-white bg-[#537CF2] px-4 py-2 shadow active:opacity-90"
                        onPress={(e) => {
                            e.stopPropagation();
                            onUpvote && onUpvote();
                        }}>
                        <ArrowBigUp size={18} color="#fff" />
                        <Text className="text-center text-base font-medium text-white">
                            {upvotes}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center gap-2 rounded-[32px] border border-white bg-[#537CF2] px-4 py-2 shadow active:opacity-90"
                        onPress={(e) => {
                            e.stopPropagation();
                            onComment && onComment();
                        }}>
                        <MessageCircle size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    className="flex-row items-center gap-2 rounded-[32px] border border-white bg-[#537CF2] px-4 py-2 shadow active:opacity-90"
                    onPress={(e) => {
                        e.stopPropagation();
                        onShare && onShare();
                    }}>
                    <Share2 size={18} color="#fff" />
                    <Text className="text-center text-base font-medium text-white">Compartir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ReportCard;
