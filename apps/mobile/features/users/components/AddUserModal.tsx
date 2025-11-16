import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, User, Mail, Phone, Lock, Users, Camera, Image as ImageIcon } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '~/contexts/LanguageContext';

interface AddUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void;
}

export default function AddUserModal({ visible, onClose, onSubmit }: AddUserModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    nickname: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'cliente',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validar RUT (formato básico)
    if (!formData.rut.trim()) {
      newErrors.rut = t('usersAddErrorRutRequired');
    } else if (!/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(formData.rut)) {
      newErrors.rut = t('usersAddErrorRutInvalid');
    }

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = t('usersAddErrorNameRequired');
    }

    // Validar apellido
    if (!formData.apellido.trim()) {
      newErrors.apellido = t('usersAddErrorLastNameRequired');
    }

    // Validar nickname
    if (!formData.nickname.trim()) {
      newErrors.nickname = t('usersAddErrorNicknameRequired');
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = t('usersAddErrorEmailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('usersAddErrorEmailInvalid');
    }

    // Validar contraseña
    if (!formData.password.trim()) {
      newErrors.password = t('usersAddErrorPasswordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('usersAddErrorPasswordLength');
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = t('usersAddErrorPhoneRequired');
    } else if (!/^\d{8,9}$/.test(formData.telefono.replace(/\s+/g, ''))) {
      newErrors.telefono = t('usersAddErrorPhoneInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({ ...formData, profileImage });
      // Resetear formulario
      setFormData({
        rut: '',
        nombre: '',
        apellido: '',
        nickname: '',
        email: '',
        password: '',
        telefono: '',
        rol: 'cliente',
      });
      setErrors({});
      setProfileImage(null);
      onClose();
    }
  };

  const handleClose = () => {
    // Resetear formulario al cerrar
    setFormData({
      rut: '',
      nombre: '',
      apellido: '',
      nickname: '',
      email: '',
      password: '',
      telefono: '',
      rol: 'cliente',
    });
    setErrors({});
    setProfileImage(null);
    setShowImageOptions(false);
    onClose();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        t('usersAddPermissionsTitle'),
        t('usersAddPermissionsMessage'),
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleImageSelection = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;
    
    setShowImageOptions(true);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
    setShowImageOptions(false);
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
    setShowImageOptions(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#090A0D' }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View className="bg-[#14161F] flex-row items-center justify-between p-4 border-b border-gray-700">
            <View className="flex-1">
              <Text className="text-[#537CF2] font-bold text-xl">{t('usersAddTitle')}</Text>
              <Text className="text-gray-400 text-sm mt-1">
                {t('usersAddSubtitle')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="ml-4 p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingVertical: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Imagen de Perfil */}
            <View className="items-center mb-6">
              <Text className="text-white text-base font-medium mb-4">{t('usersAddProfilePicture')}</Text>
              <TouchableOpacity
                onPress={handleImageSelection}
                className="w-24 h-24 rounded-full bg-[#13161E] border-2 border-gray-600 items-center justify-center overflow-hidden"
                activeOpacity={0.8}
              >
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="items-center">
                    <Camera size={32} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs mt-1">{t('usersAddAddPhoto')}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* RUT */}
            <View className="mb-4">
              <Text className="text-white text-base font-medium mb-2">{t('usersAddLabelRut')}</Text>
              <View className="flex-row items-center bg-[#13161E] rounded-lg px-4 py-3 border border-gray-600">
                <User size={20} color="#9CA3AF" />
                <TextInput
                  value={formData.rut}
                  onChangeText={(text) => updateField('rut', text)}
                  placeholder={t('usersAddPlaceholderRut')}
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-white text-base"
                />
              </View>
              {errors.rut && <Text className="text-red-500 text-sm mt-1">{errors.rut}</Text>}
            </View>

            {/* Nombre */}
            <View className="mb-4">
              <Text className="text-white text-base font-medium mb-2">{t('usersAddLabelName')}</Text>
              <View className="flex-row items-center bg-[#13161E] rounded-lg px-4 py-3 border border-gray-600">
                <User size={20} color="#9CA3AF" />
                <TextInput
                  value={formData.nombre}
                  onChangeText={(text) => updateField('nombre', text)}
                  placeholder={t('usersAddPlaceholderName')}
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-white text-base"
                />
              </View>
              {errors.nombre && <Text className="text-red-500 text-sm mt-1">{errors.nombre}</Text>}
            </View>

            {/* Apellido */}
            <View className="mb-4">
              <Text className="text-white text-base font-medium mb-2">{t('usersAddLabelLastName')}</Text>
              <View className="flex-row items-center bg-[#13161E] rounded-lg px-4 py-3 border border-gray-600">
                <User size={20} color="#9CA3AF" />
                <TextInput
                  value={formData.apellido}
                  onChangeText={(text) => updateField('apellido', text)}
                  placeholder={t('usersAddPlaceholderLastName')}
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-white text-base"
                />
              </View>
              {errors.apellido && <Text className="text-red-500 text-sm mt-1">{errors.apellido}</Text>}
            </View>

            {/* Nickname */}
            <View className="mb-4">
              <Text className="text-white text-base font-medium mb-2">{t('usersAddLabelNickname')}</Text>
              <View className="flex-row items-center bg-[#13161E] rounded-lg px-4 py-3 border border-gray-600">
                <User size={20} color="#9CA3AF" />
                <TextInput
                  value={formData.nickname}
                  onChangeText={(text) => updateField('nickname', text)}
                  placeholder={t('usersAddPlaceholderNickname')}
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-white text-base"
                />
              </View>
              {errors.nickname && <Text className="text-red-500 text-sm mt-1">{errors.nickname}</Text>}
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-white text-base font-medium mb-2">{t('usersAddLabelEmail')}</Text>
              <View className="flex-row items-center bg-[#13161E] rounded-lg px-4 py-3 border border-gray-600">
                <Mail size={20} color="#9CA3AF" />
                <TextInput
                  value={formData.email}
                  onChangeText={(text) => updateField('email', text)}
                  placeholder={t('usersAddPlaceholderEmail')}
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-white text-base"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>}
            </View>

            {/* Contraseña */}
            <View className="mb-4">
              <Text className="text-white text-base font-medium mb-2">{t('usersAddLabelPassword')}</Text>
              <View className="flex-row items-center bg-[#13161E] rounded-lg px-4 py-3 border border-gray-600">
                <Lock size={20} color="#9CA3AF" />
                <TextInput
                  value={formData.password}
                  onChangeText={(text) => updateField('password', text)}
                  placeholder={t('usersAddPlaceholderPassword')}
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-white text-base"
                  secureTextEntry
                />
              </View>
              {errors.password && <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>}
            </View>

            {/* Teléfono */}
            <View className="mb-4">
              <Text className="text-white text-base font-medium mb-2">{t('usersAddLabelPhone')}</Text>
              <View className="flex-row items-center bg-[#13161E] rounded-lg px-4 py-3 border border-gray-600">
                <Phone size={20} color="#9CA3AF" />
                <Text className="text-white ml-3">+569</Text>
                <TextInput
                  value={formData.telefono}
                  onChangeText={(text) => updateField('telefono', text)}
                  placeholder={t('usersAddPlaceholderPhone')}
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-white text-base"
                  keyboardType="numeric"
                  maxLength={9}
                />
              </View>
              {errors.telefono && <Text className="text-red-500 text-sm mt-1">{errors.telefono}</Text>}
            </View>

            {/* Rol */}
            <View className="mb-6">
              <Text className="text-white text-base font-medium mb-2">{t('usersAddLabelRole')}</Text>
              <View className="flex-row items-center bg-[#13161E] rounded-lg border border-gray-600 overflow-hidden">
                <View className="px-4 py-3">
                  <Users size={20} color="#9CA3AF" />
                </View>
                <Picker
                  selectedValue={formData.rol}
                  onValueChange={(value) => updateField('rol', value)}
                  style={{
                    flex: 1,
                    color: '#FFFFFF',
                    backgroundColor: 'transparent',
                  }}
                  dropdownIconColor="#FFFFFF"
                >
                  <Picker.Item 
                    label={t('usersAddRoleClient')} 
                    value="cliente" 
                    style={{ backgroundColor: '#13161E' }}
                    color="#FFFFFF"
                  />
                  <Picker.Item 
                    label={t('usersAddRoleAdmin')} 
                    value="administrador"
                    style={{ backgroundColor: '#13161E' }}
                    color="#FFFFFF"
                  />
                  <Picker.Item 
                    label={t('usersAddRoleAuthority')} 
                    value="autoridad"
                    style={{ backgroundColor: '#13161E' }}
                    color="#FFFFFF"
                  />
                </Picker>
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View className="p-4 border-t border-gray-700">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleClose}
                className="flex-1 bg-gray-600 rounded-lg py-4 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-semibold">{t('usersAddCancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                className="flex-1 bg-[#537CF2] rounded-lg py-4 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-semibold">{t('usersAddSubmit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Modal de opciones de imagen */}
        <Modal
          visible={showImageOptions}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowImageOptions(false)}
        >
          <TouchableOpacity
            className="flex-1 justify-end bg-black/50"
            onPress={() => setShowImageOptions(false)}
            activeOpacity={1}
          >
            <View
              className="bg-[#13161E] rounded-t-xl p-6"
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <Text className="text-white text-lg font-bold mb-4 text-center">
                {t('usersAddSelectImage')}
              </Text>

              <TouchableOpacity
                className="flex-row items-center bg-[#1D212D] rounded-lg p-4 mb-3"
                onPress={takePhoto}
                activeOpacity={0.8}
              >
                <Camera size={24} color="#537CF2" />
                <Text className="text-white ml-3 text-base">{t('usersAddTakePhoto')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center bg-[#1D212D] rounded-lg p-4 mb-4"
                onPress={pickFromGallery}
                activeOpacity={0.8}
              >
                <ImageIcon size={24} color="#537CF2" />
                <Text className="text-white ml-3 text-base">{t('usersAddPickFromGallery')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-600 rounded-lg py-3 items-center"
                onPress={() => setShowImageOptions(false)}
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-medium">{t('usersAddCancel')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}