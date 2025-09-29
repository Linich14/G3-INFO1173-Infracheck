import React from 'react';
import { View, Text } from 'react-native';

export default function UsersHeader() {
  return (
    <View className='px-5 pt-5 pb-4'>
      <View className='bg-secondary p-2 rounded-[12px] items-center justify-center py-3'>
        <Text className='text-[#537CF2] font-bold text-3xl'>
          Gestión de Usuarios
        </Text>
      </View>
    </View>
  );
}