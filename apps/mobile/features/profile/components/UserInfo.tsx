import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Modal, TextInput } from 'react-native';
import { Mail, CreditCard, Phone, Camera, User, QrCode, X, Save } from 'lucide-react-native';
import { ContactField } from './ContactField';
import { UserInfoProps } from '../types';
import { useUser } from '../hooks/useUser';

export const UserInfo: React.FC<UserInfoProps> = ({ 
  user, 
  isEditModalVisible = false, 
  setIsEditModalVisible = () => {} 
}) => {
  const { updateUser, refreshUser } = useUser();
  
  const [editData, setEditData] = useState({
    nickname: user.usua_nickname || '',
    email: user.usua_email || '',
    telefono: user.usua_telefono ? user.usua_telefono.toString() : '',
    nombre: user.usua_nombre && user.usua_nombre !== 'null' ? user.usua_nombre : '',
    apellido: user.usua_apellido && user.usua_apellido !== 'null' ? user.usua_apellido : ''
  });

  // Sincronizar editData cuando cambie el usuario
  useEffect(() => {
    setEditData({
      nickname: user.usua_nickname || '',
      email: user.usua_email || '',
      telefono: user.usua_telefono ? user.usua_telefono.toString() : '',
      nombre: user.usua_nombre && user.usua_nombre !== 'null' ? user.usua_nombre : '',
      apellido: user.usua_apellido && user.usua_apellido !== 'null' ? user.usua_apellido : ''
    });
  }, [user]);

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
  const getInitials = (fullName: string | null | undefined) => {
    if (!fullName || fullName === 'null' || fullName.trim() === '') {
      // Si no hay full_name, usar nombre y apellido
      const firstName = user.usua_nombre && user.usua_nombre !== 'null' ? user.usua_nombre : '';
      const lastName = user.usua_apellido && user.usua_apellido !== 'null' ? user.usua_apellido : '';
      if (firstName && lastName) {
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
      }
      if (firstName) return firstName.charAt(0).toUpperCase();
      if (lastName) return lastName.charAt(0).toUpperCase();
      return user.usua_nickname ? user.usua_nickname.charAt(0).toUpperCase() : 'U';
    }
    
    const names = fullName.split(' ').filter(name => name.trim() !== '');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return names.length > 0 ? names[0].charAt(0).toUpperCase() : 'U';
  };

  // Handler para cambiar foto de perfil
  const handleChangePhoto = () => {
    Alert.alert(
      'Cambiar foto de perfil',
      'Esta funcionalidad estará disponible próximamente',
      [{ text: 'OK' }]
    );
  };



  // Handler para guardar datos del modal principal
  const handleSave = async () => {
    try {
      const phoneNumber = parseInt(editData.telefono);
      const success = await updateUser({ 
        usua_nickname: editData.nickname,
        usua_email: editData.email,
        usua_telefono: phoneNumber,
        usua_nombre: editData.nombre,
        usua_apellido: editData.apellido
      });
      
      if (success) {
        await refreshUser();
        Alert.alert('✅ Perfil actualizado', 'Tu información ha sido actualizada correctamente');
        setIsEditModalVisible(false);
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  return (
    <View className="flex-1 w-full">
      {/* Main Profile Card */}
      <View 
        className="bg-[#1D212D] rounded-3xl m-4 p-6 items-center border"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 8,
          borderColor: 'rgba(83, 124, 242, 0.1)'
        }}
      >
        {/* Avatar with Camera Button */}
        <View className="relative mb-4">
          <View 
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#537CF2',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 4,
              borderColor: 'rgba(83, 124, 242, 0.2)'
            }}
          >
            {user.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60
                }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{
                color: '#fff',
                fontSize: 48,
                fontWeight: 'bold'
              }}>
                {getInitials(user.full_name)}
              </Text>
            )}
          </View>
          
          {/* Camera Button */}
          <TouchableOpacity
            onPress={handleChangePhoto}
            className="absolute bottom-0 right-0 w-8 h-8 bg-[#537CF2] rounded-full justify-center items-center border-2 border-[#1D212D]"
            activeOpacity={0.8}
          >
            <Camera size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Username */}
        <Text className="text-3xl font-bold text-white text-center mb-1">
          @{user.usua_nickname}
        </Text>

        {/* Full Name */}
        <Text className="text-base text-slate-400 text-center mb-4">
          {user.full_name && user.full_name !== 'null' ? user.full_name : 
           `${user.usua_nombre || ''} ${user.usua_apellido || ''}`.trim() || 'Nombre no disponible'}
        </Text>

        {/* Action Buttons */}
        <View className="flex-row items-center mb-5">
          <TouchableOpacity 
            className="py-3 px-8 rounded-full mx-2"
            style={{ backgroundColor: '#537CF2' }}
            onPress={() => console.log('seguir')}
          >
            <Text className="text-white text-base font-semibold">
              Seguir
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="py-3 px-4 rounded-full border"
            style={{
              backgroundColor: 'rgba(83, 124, 242, 0.1)',
              borderColor: 'rgba(83, 124, 242, 0.3)'
            }}
            onPress={() => Alert.alert('Código QR', 'Funcionalidad de QR próximamente')}
          >
            <QrCode size={20} color="#537CF2" />
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View className="flex-row justify-around w-full">
          <View className="items-center">
            <Text className="text-white text-2xl font-bold mb-1">
              12
            </Text>
            <Text className="text-slate-400 text-sm">
              Reportes
            </Text>
          </View>

          {/* Divisor vertical */}
          <View 
            className="w-px bg-slate-600"
            style={{ height: 50 }}
          />

          <View className="items-center">
            <Text className="text-white text-2xl font-bold mb-1">
              148
            </Text>
            <Text className="text-slate-400 text-sm">
              Seguidores
            </Text>
          </View>

          {/* Divisor vertical */}
          <View 
            className="w-px bg-slate-600"
            style={{ height: 50 }}
          />

          <View className="items-center">
            <Text className="text-white text-2xl font-bold mb-1">
              89
            </Text>
            <Text className="text-slate-400 text-sm">
              Up Votos
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View className="px-4">
        <Text className="text-lg font-semibold text-slate-400 mb-3">
          Información de Contacto
        </Text>
        
        <ContactField
          icon={<User size={20} color="#537CF2" />}
          value={user.full_name && user.full_name !== 'null' ? user.full_name : 
                 `${user.usua_nombre || ''} ${user.usua_apellido || ''}`.trim() || 'Nombre no disponible'}
          className="mb-3"
        />

        <ContactField
          icon={<Mail size={20} color="#537CF2" />}
          value={user.usua_email}
          className="mb-3"
        />

        <ContactField
          icon={<CreditCard size={20} color="#537CF2" />}
          value={user.usua_rut}
          className="mb-3"
        />

        <ContactField
          icon={<Phone size={20} color="#537CF2" />}
          value={formatPhone(user.usua_telefono)}
          className="mb-4"
        />
      </View>

      {/* Modal de Edición Principal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View 
            className="bg-[#1D212D] rounded-3xl mx-4 p-6 w-11/12"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
              borderWidth: 1,
              borderColor: 'rgba(83, 124, 242, 0.2)'
            }}
          >
            {/* Header del Modal */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-white">
                Editar Perfil
              </Text>
              <TouchableOpacity 
                onPress={() => setIsEditModalVisible(false)}
                className="p-2"
              >
                <X size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Campos de Edición */}
            <View>
              {/* Nombre de Usuario */}
              <View className="mb-5">
                <Text className="text-white text-sm font-semibold mb-3">
                  Nombre de Usuario
                </Text>
                <TextInput
                  value={editData.nickname}
                  onChangeText={(text) => setEditData({...editData, nickname: text})}
                  className="bg-slate-700 text-white p-4 rounded-xl border"
                  style={{ borderColor: 'rgba(83, 124, 242, 0.3)' }}
                  placeholder="Ingresa tu nombre de usuario"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              {/* Nombre */}
              <View className="mb-5">
                <Text className="text-white text-sm font-semibold mb-3">
                  Nombre
                </Text>
                <TextInput
                  value={editData.nombre}
                  onChangeText={(text) => setEditData({...editData, nombre: text})}
                  className="bg-slate-700 text-white p-4 rounded-xl border"
                  style={{ borderColor: 'rgba(83, 124, 242, 0.3)' }}
                  placeholder="Ingresa tu nombre"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              {/* Apellido */}
              <View className="mb-5">
                <Text className="text-white text-sm font-semibold mb-3">
                  Apellido
                </Text>
                <TextInput
                  value={editData.apellido}
                  onChangeText={(text) => setEditData({...editData, apellido: text})}
                  className="bg-slate-700 text-white p-4 rounded-xl border"
                  style={{ borderColor: 'rgba(83, 124, 242, 0.3)' }}
                  placeholder="Ingresa tu apellido"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              {/* Email */}
              <View className="mb-5">
                <Text className="text-white text-sm font-semibold mb-3">
                  Correo Electrónico
                </Text>
                <TextInput
                  value={editData.email}
                  onChangeText={(text) => setEditData({...editData, email: text})}
                  className="bg-slate-700 text-white p-4 rounded-xl border"
                  style={{ borderColor: 'rgba(83, 124, 242, 0.3)' }}
                  placeholder="Ingresa tu correo"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                />
              </View>

              {/* Teléfono */}
              <View className="mb-6">
                <Text className="text-white text-sm font-semibold mb-3">
                  Número de Teléfono
                </Text>
                <TextInput
                  value={editData.telefono}
                  onChangeText={(text) => setEditData({...editData, telefono: text})}
                  className="bg-slate-700 text-white p-4 rounded-xl border"
                  style={{ borderColor: 'rgba(83, 124, 242, 0.3)' }}
                  placeholder="Ingresa tu teléfono"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Botones de Acción */}
            <View className="flex-row justify-between mt-8 px-2">
              <TouchableOpacity 
                onPress={() => setIsEditModalVisible(false)}
                className="py-4 px-8 rounded-xl border flex-1 mr-3"
                style={{ borderColor: 'rgba(148, 163, 184, 0.3)' }}
              >
                <Text className="text-slate-400 font-semibold text-center">
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleSave}
                className="py-4 px-8 rounded-xl flex-row items-center justify-center flex-1 ml-3"
                style={{ backgroundColor: '#537CF2' }}
              >
                <Save size={16} color="#fff" />
                <Text className="text-white font-semibold ml-2">
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};
