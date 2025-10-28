import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { UserPlus, UserCheck } from 'lucide-react-native';

interface FollowButtonProps {
  isFollowing: boolean;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ 
  isFollowing, 
  onPress, 
  loading = false,
  disabled = false 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center px-8 py-3 rounded-xl ${
        isFollowing 
          ? 'bg-gray-700 border border-gray-600' 
          : 'bg-[#537CF2]'
      }`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          {isFollowing ? (
            <UserCheck size={20} color="white" />
          ) : (
            <UserPlus size={20} color="white" />
          )}
          <Text className="text-white font-semibold text-base ml-2">
            {isFollowing ? 'Siguiendo' : 'Seguir'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
