import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Search, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function UsersSearchBar() {
  return (
    <View className='px-5 mb-5 flex-row items-center gap-4'>
      <TouchableOpacity 
        className='bg-[#537CF2] rounded-2xl p-4'
        onPress={() => router.push('/home')}
      >
        <ArrowLeft size={24} color='white' />
      </TouchableOpacity>
      
      <View className='flex-1 flex-row items-center bg-gray-300 rounded-full px-4 py-4'>
        <Search size={20} color="#6b7280" />
        <TextInput
          placeholder="Buscar"
          placeholderTextColor="#6b7280"
          className='flex-1 text-gray-800 px-3 text-xl'
        />
      </View>
    </View>
  );
}