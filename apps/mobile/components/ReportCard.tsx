import React from 'react';
import { View, Text, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import {
  UserCircle2,
  MoreVertical,
  MapPin,
  ArrowBigUp,
  MessageCircle,
  Share2,
} from 'lucide-react-native';

type Props = {
  title: string;
  author: string;
  timeAgo: string;                 // ej: "3d"
  image?: ImageSourcePropType | null; // opcional
  upvotes?: number;
  onFollow?: () => void;
  onMore?: () => void;
  onLocation?: () => void;
  onUpvote?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  followLabel?: string;            // ej: "Seguir"
  aspectRatio?: number;            // ej: 16/9 (default)
};

const ReportCard: React.FC<Props> = ({
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
  const hasImage = !!image;

  return (
    <View className="bg-[#13161E] rounded-[12px] overflow-hidden">
      {/* Header */}
      <View className="px-4 py-2 flex-row items-center justify-between">
        {/* Avatar / Perfil */}
        <View className="flex-row items-center">
          <UserCircle2 size={28} color="#537CF2" />
        </View>

        <View>
          <Text className="text-white text-2xl mr-4">{author}</Text>
        </View>

        <View>
          <Text className="text-white text-2xl">{timeAgo}</Text>
        </View>

        <View className="flex justify-center">
          <TouchableOpacity
            className="bg-[#537CF2] rounded-[32px] shadow border border-white px-6 py-1 active:opacity-80"
            onPress={onFollow}
          >
            <Text className="text-white font-medium text-xl text-center">{followLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Título + Imagen/Placeholder + botones flotantes */}
      <View className="relative">
        <Text className="text-white text-2xl pb-2 pl-4">{title}</Text>

        {hasImage ? (
          <Image
            source={image as ImageSourcePropType}
            resizeMode="cover"
            style={{ width: '100%', aspectRatio }}
          />
        ) : (
          <View
            style={{ width: '100%', aspectRatio }}
            className="bg-[#0f172a] items-center justify-center"
          >
            <Text className="text-white/40">Sin imagen</Text>
          </View>
        )}

        {/* Botones flotantes SOLO si hay imagen */}
        {hasImage && (
          <View className="absolute right-3 bottom-3">
            <TouchableOpacity
              className="bg-[#537CF2] w-12 h-12 rounded-full items-center justify-center shadow mb-3 active:opacity-80"
              onPress={onMore}
            >
              <MoreVertical size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-[#537CF2] w-12 h-12 rounded-full items-center justify-center shadow active:opacity-80"
              onPress={onLocation}
            >
              <MapPin size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-row">
          <TouchableOpacity
            className="bg-[#537CF2] rounded-[32px] shadow border border-white px-4 py-2 mr-4 flex-row items-center gap-2 active:opacity-90"
            onPress={onUpvote}
          >
            <ArrowBigUp size={18} color="#fff" />
            <Text className="text-white font-medium text-base text-center">{upvotes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#537CF2] rounded-[32px] shadow border border-white px-4 py-2 flex-row items-center gap-2 active:opacity-90"
            onPress={onComment}
          >
            <MessageCircle size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-[#537CF2] rounded-[32px] shadow border border-white px-4 py-2 flex-row items-center gap-2 active:opacity-90"
          onPress={onShare}
        >
          <Share2 size={18} color="#fff" />
          <Text className="text-white font-medium text-base text-center">Compartir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReportCard;