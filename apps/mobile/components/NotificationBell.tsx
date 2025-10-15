import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useNotifications } from '~/hooks/useNotifications';

interface NotificationBellProps {
  size?: number;
  color?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  size = 24,
  color = '#FFFFFF',
}) => {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  const handlePress = () => {
    router.push('/notifications');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="relative"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Bell size={size} color={color} />
      
      {unreadCount > 0 && (
        <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
          <Text className="text-white text-[10px] font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
