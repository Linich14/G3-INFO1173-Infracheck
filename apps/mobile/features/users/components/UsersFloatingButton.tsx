import React from 'react';
import { TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface UsersFloatingButtonProps {
  onPress: () => void;
}

export default function UsersFloatingButton({ onPress }: UsersFloatingButtonProps) {
  return (
    <TouchableOpacity 
      className="absolute bottom-0 right-0 rounded-full bg-primary p-4 m-4"
      onPress={onPress}
      style={{
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      }}
    >
      <MaterialCommunityIcons name="plus" size={40} color="#FFFFFF" />
    </TouchableOpacity>
  );
}