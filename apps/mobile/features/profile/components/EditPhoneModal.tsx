import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { X, Phone, Check } from 'lucide-react-native';
import { useLanguage } from '~/contexts/LanguageContext';

interface EditPhoneModalProps {
  isVisible: boolean;
  currentPhone: number;
  onClose: () => void;
  onSave: (newPhone: number) => Promise<boolean>;
}

export const EditPhoneModal: React.FC<EditPhoneModalProps> = ({
  isVisible,
  currentPhone,
  onClose,
  onSave,
}) => {
  // Extraer solo los últimos 8 dígitos del teléfono (sin 569)
  const extractLastDigits = (phoneNumber: number) => {
    const phoneStr = phoneNumber.toString();
    if (phoneStr.startsWith('569') && phoneStr.length === 11) {
      return phoneStr.slice(3); // Remover '569'
    }
    return phoneStr;
  };

  const [phone, setPhone] = useState(extractLastDigits(currentPhone));
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const formatPhoneInput = (text: string) => {
    // Remover todo excepto números
    const numbers = text.replace(/\D/g, '');
    
    // Limitar a 8 dígitos (XXXXXXXX)
    const limited = numbers.slice(0, 8);
    
    // Formatear visualmente: XXXX XXXX
    if (limited.length > 4) {
      return `${limited.slice(0, 4)} ${limited.slice(4)}`;
    }
    return limited;
  };

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    // Validar que tenga exactamente 8 dígitos
    return numbers.length === 8;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneInput(text);
    setPhone(formatted);
  };

  const handleSave = async () => {
    const numbers = phone.replace(/\D/g, '');
    
    if (!numbers) {
      Alert.alert(t('notifyErrorTitle'), t('profileEditPhoneErrorEmpty'));
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert(t('notifyErrorTitle'), t('profileEditPhoneErrorInvalid'));
      return;
    }

    // Agregar el prefijo 569 automáticamente
    const fullPhoneNumber = parseInt(`569${numbers}`);
    if (fullPhoneNumber === currentPhone) {
      onClose();
      return;
    }

    try {
      setIsLoading(true);
      const success = await onSave(fullPhoneNumber);
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
    setPhone(extractLastDigits(currentPhone));
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
            <Text className="text-white text-xl font-bold">{t('editPhoneTitle')}</Text>
            <TouchableOpacity onPress={resetAndClose} activeOpacity={0.7}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Phone Input */}
          <View className="mb-4">
            <Text className="text-gray-300 text-sm mb-2">{t('editPhoneLabel')}</Text>
            <View className="flex-row items-center bg-[#1D212D] rounded-lg px-4 py-3">
              <Phone size={20} color="#537CF2" />
              <Text className="text-gray-400 ml-3">+56 9 </Text>
              <TextInput
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder={t('editPhonePlaceholder')}
                placeholderTextColor="#6B7280"
                className="flex-1 text-white"
                keyboardType="numeric"
                maxLength={9} // Para formato "1234 5678"
                editable={!isLoading}
              />
            </View>
            <Text className="text-gray-500 text-xs mt-1">
              {t('editPhoneHint')}
            </Text>
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