import React from 'react';
import { View, Text } from 'react-native';
import { Edit3 } from 'lucide-react-native';
import { ContactFieldProps } from '../types';

export const ContactField: React.FC<ContactFieldProps> = ({ 
  icon, 
  value, 
  className = "",
  showEditIcon = false 
}) => {
  return (
    <View className={`flex-row w-full bg-[#1D212D] rounded-xl shadow-sm ${className}`}>
      <View className="justify-center items-center w-[65px] aspect-[1.3]">
        {icon}
      </View>
      <View className="flex-1 justify-center py-4 pr-4">
        <Text className="text-white text-xl font-bold">
          {value}
        </Text>
      </View>
      {showEditIcon && (
        <View className="justify-center items-center pr-4">
          <Edit3 size={20} color="#537CF2" />
        </View>
      )}
    </View>
  );
};
