import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Mail, CreditCard, Phone, Camera } from 'lucide-react-native';
import { ContactField } from './ContactField';
import { EditEmailModal } from './EditEmailModal';
import { EditPhoneModal } from './EditPhoneModal';
import { UserInfoProps } from '../types';
import { useUser } from '../hooks/useUser';

export const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
  const { updateUser, refreshUser } = useUser();

  // Función helper para formatear el teléfono
  const formatPhone = (phone: number) => {
    const phoneStr = phone.toString();
    // Formato chileno: +56 9 XXXX XXXX
    if (phoneStr.length === 11 && phoneStr.startsWith('569')) {
      return `+56 9 ${phoneStr.slice(3, 7)} ${phoneStr.slice(7)}`;
    }
    return phoneStr;
  };

  // Obtener las iniciales del nombre completo
  const getInitials = (fullName: string) => {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return fullName.charAt(0).toUpperCase();
  };

  // Handler para cambiar foto de perfil
  const handleChangePhoto = () => {
    Alert.alert(
      'Cambiar foto de perfil',
      'Esta funcionalidad estará disponible próximamente',
      [{ text: 'OK' }]
    );
  };

  // Handler para guardar email
  const handleSaveEmail = async (newEmail: string): Promise<boolean> => {
    try {
      const success = await updateUser({ usua_email: newEmail });
      if (success) {
        // Recargar el perfil para sincronizar los datos
        await refreshUser();
        Alert.alert(
          '✅ Email actualizado', 
          'Tu email ha sido actualizado correctamente',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo actualizar el email');
      }
      return success;
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el email');
      return false;
    }
  };

  // Handler para guardar teléfono
  const handleSavePhone = async (newPhone: number): Promise<boolean> => {
    try {
      const success = await updateUser({ usua_telefono: newPhone });
      if (success) {
        // Recargar el perfil para sincronizar los datos
        await refreshUser();
        Alert.alert(
          '✅ Teléfono actualizado', 
          'Tu teléfono ha sido actualizado correctamente',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo actualizar el teléfono');
      }
      return success;
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el teléfono');
      return false;
    }
  };

  return (
    <View className="flex-1 px-3.5 w-full">
      {/* User Avatar with Edit Button */}
      <View className="self-center mt-8 relative">
        <View className="w-[108px] h-[108px] bg-[#537CF2] rounded-full justify-center items-center shadow-lg">
          {user.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              className="w-[108px] h-[108px] rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-white text-4xl font-bold text-center">
              {getInitials(user.full_name)}
            </Text>
          )}
        </View>
        
        {/* Camera Button */}
        <TouchableOpacity
          onPress={handleChangePhoto}
          className="absolute bottom-0 right-0 w-8 h-8 bg-[#537CF2] rounded-full justify-center items-center border-2 border-[#090A0D]"
          activeOpacity={0.8}
        >
          <Camera size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* User Name */}
      <View className="justify-center items-center px-4 mt-6">
        <Text className="text-3xl font-medium text-white text-center leading-9">
          {user.full_name}
        </Text>
        <Text className="text-lg text-gray-300 text-center mt-1">
          @{user.usua_nickname}
        </Text>
      </View>

      {/* Contact Information with Edit Buttons */}
      <View className="px-3.5 py-5 mt-3 w-full">
        {/* Email with Edit Button */}
        <TouchableOpacity onPress={() => setIsEmailModalVisible(true)} activeOpacity={0.7}>
          <ContactField
            icon={<Mail size={24} color="#f6fa00ff" />}
            value={user.usua_email}
            className="mb-4"
            showEditIcon={true}
          />
        </TouchableOpacity>

        {/* RUT (no editable) */}
        <ContactField
          icon={<CreditCard size={24} color="#3cff00ff" />}
          value={user.usua_rut}
          className="mb-4"
        />

        {/* Phone with Edit Button */}
        <TouchableOpacity onPress={() => setIsPhoneModalVisible(true)} activeOpacity={0.7}>
          <ContactField
            icon={<Phone size={24} color="#ff6b00ff" />}
            value={formatPhone(user.usua_telefono)}
            className="mb-4"
            showEditIcon={true}
          />
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <EditEmailModal
        isVisible={isEmailModalVisible}
        currentEmail={user.usua_email}
        onClose={() => setIsEmailModalVisible(false)}
        onSave={handleSaveEmail}
      />

      <EditPhoneModal
        isVisible={isPhoneModalVisible}
        currentPhone={user.usua_telefono}
        onClose={() => setIsPhoneModalVisible(false)}
        onSave={handleSavePhone}
      />
    </View>
  );
};
