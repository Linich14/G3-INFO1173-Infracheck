import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Edit3 } from 'lucide-react-native';
import { ContactField } from './ContactField';

interface EditableContactFieldProps {
  icon: React.ReactNode;
  value: string;
  onPress: () => void;
  className?: string;
}

export const EditableContactField: React.FC<EditableContactFieldProps> = ({
  icon,
  value,
  onPress,
  className,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6} className={className}>
      <View className="flex-row items-center justify-between bg-[#1A1D29] rounded-lg px-3 py-2 border border-transparent active:border-[#537CF2]/30">
        <View className="flex-1">
          <ContactField
            icon={icon}
            value={value}
          />
        </View>
        <View className="ml-3 p-1 bg-[#537CF2]/10 rounded-full">
          <Edit3 size={16} color="#537CF2" />
        </View>
      </View>
    </TouchableOpacity>
  );
};