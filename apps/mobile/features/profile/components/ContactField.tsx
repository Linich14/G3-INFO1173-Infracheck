import React from 'react';
import { View, Text } from 'react-native';
import { ContactFieldProps } from '../types';

export const ContactField: React.FC<ContactFieldProps> = ({ icon, value, className = "" }) => {
  return (
    <View className={`flex-row w-full bg-[#1D212D] rounded-xl shadow-sm ${className}`}>
      <View className="justify-center items-center w-[65px] aspect-[1.3]">
        {icon}
      </View>
      <View className="flex-1 justify-center py-4 pr-4">
        <Text className="text-white text-base font-bold">
          {value}
        </Text>
      </View>
    </View>
  );
};
