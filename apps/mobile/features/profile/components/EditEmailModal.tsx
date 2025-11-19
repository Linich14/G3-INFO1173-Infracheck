import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { X, Mail, Check } from 'lucide-react-native';
import { useLanguage } from '~/contexts/LanguageContext';

interface EditEmailModalProps {
  isVisible: boolean;
  currentEmail: string;
  onClose: () => void;
  onSave: (newEmail: string) => Promise<boolean>;
}

export const EditEmailModal: React.FC<EditEmailModalProps> = ({
  isVisible,
  currentEmail,
  onClose,
  onSave,
}) => {
  const [email, setEmail] = useState(currentEmail);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    if (!email.trim()) {
      Alert.alert(t('notifyErrorTitle'), t('profileEditEmailErrorEmpty'));
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(t('notifyErrorTitle'), t('profileEditEmailErrorInvalid'));
      return;
    }

    if (email === currentEmail) {
      onClose();
      return;
    }

    try {
      setIsLoading(true);
      const success = await onSave(email);
      if (success) {
        // El modal se cierra automáticamente después de la actualización y recarga
        onClose();
      }
    } catch (error) {
      // El error ya se maneja en onSave
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setEmail(currentEmail);
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
            <Text className="text-white text-xl font-bold">{t('editEmailTitle')}</Text>
            <TouchableOpacity onPress={resetAndClose} activeOpacity={0.7}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-gray-300 text-sm mb-2">{t('editEmailLabel')}</Text>
            <View className="flex-row items-center bg-[#1D212D] rounded-lg px-4 py-3">
              <Mail size={20} color="#537CF2" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('editEmailPlaceholder')}
                placeholderTextColor="#6B7280"
                className="flex-1 text-white ml-3"
                keyboardType="email-address"
                autoCapitalize="none"
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