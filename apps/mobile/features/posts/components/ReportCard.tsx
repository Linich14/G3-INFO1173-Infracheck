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

    const goToDetail = () => {
        router.push({ pathname: '/report/[id]', params: { id } });
    };

    return (
        <View className="overflow-hidden rounded-[12px] bg-[#13161E]">
            {/* Header - No clickeable */}
            <View className="flex-row items-center justify-between px-4 py-2">
                {/* Avatar / Perfil */}
                <View className="flex-row items-center">
                    <UserCircle2 size={28} color="#537CF2" />
                </View>

                <View>
                    <Text className="mr-4 text-2xl text-white">{author}</Text>
                </View>

                <View>
                    <Text className="text-2xl text-white">{timeAgo}</Text>
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
