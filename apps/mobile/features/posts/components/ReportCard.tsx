import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ImageSourcePropType, Pressable, ActivityIndicator } from 'react-native';
import {
    UserCircle2,
    MoreVertical,
    MapPin,
    ArrowBigUp,
    MessageCircle,
    Share2,
} from 'lucide-react-native';
import { ReportCardProps } from '../types';
import { useReportVotes } from '../hooks/useReportVotes';
import { useRouter } from 'expo-router';
import VoteButton from './VoteButton';

const ReportCard: React.FC<ReportCardProps> = ({
    id,
    title,
    author,
    timeAgo,
    image,
    upvotes = 0, // Mantener como fallback por compatibilidad
    initialVoteCount = 0,
    initialUserHasVoted = false,
    onFollow,
    onMore,
    onLocation,
    onUpvote,
    onComment,
    onShare,
    followLabel = 'Seguir',
    aspectRatio = 16 / 9,
    isFollowed = false,
}) => {
    const router = useRouter();
    const [imageError, setImageError] = useState(false);
    const hasImage = !!image && !imageError;

    // Hook para manejar votos con datos embebidos
    const { voteCount, userHasVoted, isLoading: votesLoading, isSubmitting, submitVote } = useReportVotes(
        id,
        initialVoteCount,
        initialUserHasVoted
    );

    const goToDetail = () => {
        router.push(`/report/${id}`);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const handleImageLoad = () => {
        setImageError(false);
    };

    // Debug de la imagen
    React.useEffect(() => {
        if (image) {
            // Se recibio la foto
            //console.log('ReportCard image source:', image);
        }
    }, [image]);

    return (
        <View className="overflow-hidden rounded-[12px] bg-[#13161E]">
            <View className="flex-row items-center gap-2 px-4 py-2" pointerEvents="box-none">
                <View className="flex-shrink-0">
                    <UserCircle2 size={28} color="#537CF2" />
                </View>

                <View className="min-w-0 flex-1">
                    <Text className="text-2xl text-white" numberOfLines={1} ellipsizeMode="tail">
                        {author}
                    </Text>
                </View>

                <View className="flex-shrink-0">
                    <Text className="font-light text-white">{timeAgo}</Text>
                </View>

                <View className="flex-shrink-0">
                    <TouchableOpacity
                        className={`rounded-[32px] border px-4 py-1 shadow active:opacity-80 ${
                            isFollowed ? 'border-red-500 bg-red-500' : 'border-white bg-[#537CF2]'
                        }`}
                        onPress={onFollow}>
                        <Text className="text-center text-lg font-medium text-white">
                            {followLabel}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Pressable onPress={goToDetail}>
                <View className="relative">
                    <Text className="pb-2 pl-4 text-2xl text-white">{title}</Text>

                    {hasImage && !imageError ? (
                        <Image
                            source={image as ImageSourcePropType}
                            resizeMode="cover"
                            style={{ width: '100%', aspectRatio }}
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                        />
                    ) : (
                        <View
                            style={{ width: '100%', aspectRatio }}
                            className="items-center justify-center bg-[#0f172a]">
                            <Text className="text-white/40">
                                {imageError ? 'Error al cargar imagen' : 'Sin imagen'}
                            </Text>
                        </View>
                    )}

                    {hasImage && !imageError && (
                        <View className="absolute bottom-3 right-3">
                            <TouchableOpacity
                                className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#537CF2] shadow active:opacity-80"
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onMore?.();
                                }}>
                                <MoreVertical size={22} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="h-12 w-12 items-center justify-center rounded-full bg-[#537CF2] shadow active:opacity-80"
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onLocation?.();
                                }}>
                                <MapPin size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Footer */}
                <View className="flex-row items-center justify-between p-4">
                    <View className="flex-row">
                        <VoteButton
                            voteCount={voteCount}
                            userHasVoted={userHasVoted}
                            isLoading={votesLoading}
                            isSubmitting={isSubmitting}
                            onPress={() => {
                                submitVote();
                                onUpvote?.(); // Mantener callback por compatibilidad
                            }}
                        />

                        <TouchableOpacity
                            className="flex-row items-center gap-2 rounded-[32px] border border-white bg-[#537CF2] px-4 py-2 shadow active:opacity-90"
                            onPress={(e) => {
                                e.stopPropagation();
                                onComment?.();
                            }}>
                            <MessageCircle size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className="flex-row items-center gap-2 rounded-[32px] border border-white bg-[#537CF2] px-4 py-2 shadow active:opacity-90"
                        onPress={(e) => {
                            e.stopPropagation();
                            onShare?.();
                        }}>
                        <Share2 size={18} color="#fff" />
                        <Text className="text-center text-base font-medium text-white">
                            Compartir
                        </Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </View>
    );
};

export default ReportCard;
