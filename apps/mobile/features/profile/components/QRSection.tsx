import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { QrCode, Share } from 'lucide-react-native';

export const QRSection: React.FC = () => {
  return (
    <View className="flex-row justify-between py-4 w-full bg-[#1D212D] rounded-xl shadow-sm">
      <View className="justify-center items-center pl-4">
        <Text className="text-white text-base font-bold">Mi QR</Text>
      </View>
      
      <View className="justify-center items-center w-[129px] h-[129px] bg-white rounded-lg">
        <QrCode size={100} color="#000000ff" />
      </View>
      
      <TouchableOpacity 
        className="justify-center items-center w-[66px]"
        onPress={() => console.log('Compartir QR')}
        activeOpacity={0.7}
      >
        <Share size={32} color="#537CF2" />
      </TouchableOpacity>
    </View>
  );
};
