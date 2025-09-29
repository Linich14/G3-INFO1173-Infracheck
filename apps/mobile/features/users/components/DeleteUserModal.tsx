import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
}

interface DeleteUserModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({ visible, user, onClose, onConfirm }: DeleteUserModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className='flex-1 bg-black/50 justify-center items-center px-6'>
        <View className='bg-[#1a1a1a] rounded-3xl p-6 w-full max-w-sm'>
          <Text className='text-white text-2xl font-bold text-center mb-2'>
            Eliminar Usuario
          </Text>
          <Text className='text-gray-300 text-base text-center mb-8 leading-6'>
            ¿Estas seguro que quieres eliminar{'\n'}al usuario?
          </Text>
          
          <View className='flex-row'>
            <TouchableOpacity
              onPress={onClose}
              className='flex-1 bg-red-500 py-4 rounded-l-2xl border border-white'
              activeOpacity={0.8}
            >
              <Text className='text-white text-xl font-semibold text-center'>
                No
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onConfirm}
              className='flex-1 bg-green-500 py-4 rounded-r-2xl border border-white'
              activeOpacity={0.8}
            >
              <Text className='text-white text-xl font-semibold text-center'>
                Si
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}