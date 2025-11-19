import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { X, User, Check } from 'lucide-react-native';
import { useLanguage } from '~/contexts/LanguageContext';

interface EditNameModalProps {
  isVisible: boolean;
  currentFirstName: string;
  currentLastName: string;
  onClose: () => void;
  onSave: (firstName: string, lastName: string) => Promise<boolean>;
}

export const EditNameModal: React.FC<EditNameModalProps> = ({
  isVisible,
  currentFirstName,
  currentLastName,
  onClose,
  onSave,
}) => {
  const [firstName, setFirstName] = useState(currentFirstName || '');
  const [lastName, setLastName] = useState(currentLastName || '');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleSave = async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst || !trimmedLast) {
      Alert.alert(t('profileEditNameError'), t('profileEditNameErrorBody'));
      return;
    }

    if (
      trimmedFirst === (currentFirstName || '').trim() &&
      trimmedLast === (currentLastName || '').trim()
    ) {
      onClose();
      return;
    }

    try {
      setIsLoading(true);
      const success = await onSave(trimmedFirst, trimmedLast);
      if (success) {
        onClose();
      }
    } catch (error) {
      // El error se maneja en onSave
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setFirstName(currentFirstName || '');
    setLastName(currentLastName || '');
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-[#13161E] rounded-2xl p-6 w-full max-w-sm">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-xl font-bold">{t('editNameTitle')}</Text>
            <TouchableOpacity onPress={resetAndClose} activeOpacity={0.7}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Nombre */}
          <View className="mb-4">
            <Text className="text-gray-300 text-sm mb-2">{t('firstNameLabel')}</Text>
            <View className="flex-row items-center bg-[#1D212D] rounded-lg px-4 py-3">
              <User size={20} color="#537CF2" />
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder={t('firstNameLabel')}
                placeholderTextColor="#6B7280"
                className="flex-1 text-white ml-3"
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Apellido */}
          <View className="mb-6">
            <Text className="text-gray-300 text-sm mb-2">{t('lastNameLabel')}</Text>
            <View className="flex-row items-center bg-[#1D212D] rounded-lg px-4 py-3">
              <User size={20} color="#537CF2" />
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder={t('lastNameLabel')}
                placeholderTextColor="#6B7280"
                className="flex-1 text-white ml-3"
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={resetAndClose}
              className="flex-1 bg-gray-600 rounded-lg py-3"
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-medium">{t('cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              className={`flex-1 rounded-lg py-3 flex-row justify-center items-center ${
                isLoading ? 'bg-gray-500' : 'bg-[#537CF2]'
              }`}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Check size={16} color="white" />
              <Text className="text-white font-medium ml-2">
                {isLoading ? t('saving') : t('save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
