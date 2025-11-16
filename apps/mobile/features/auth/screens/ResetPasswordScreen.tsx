import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resetPassword } from '../services/authService';
import { isValidPassword, getPasswordValidationState } from '~/utils/validation';
import { useLanguage } from '~/contexts/LanguageContext';

const ResetPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { reset_token } = useLocalSearchParams<{ reset_token: string }>();
  const { t } = useLanguage();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Estado de validación de contraseña en tiempo real
  const passwordValidation = getPasswordValidationState(newPassword);

  // Handler para resetear la contraseña
  const handleResetPassword = async () => {
    // Validar que los campos no estén vacíos
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setFeedbackMessage(t('resetPasswordErrorEmpty'));
      setIsSuccess(false);
      setFeedbackModalVisible(true);
      return;
    }

    // Validar que la contraseña cumpla con los requisitos
    if (!isValidPassword(newPassword)) {
      setFeedbackMessage(t('resetPasswordErrorRequirements'));
      setIsSuccess(false);
      setFeedbackModalVisible(true);
      return;
    }

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setFeedbackMessage(t('resetPasswordErrorNoMatch'));
      setIsSuccess(false);
      setFeedbackModalVisible(true);
      return;
    }

    // Validar que tenemos el token
    if (!reset_token) {
      setFeedbackMessage(t('resetPasswordErrorNoToken'));
      setIsSuccess(false);
      setFeedbackModalVisible(true);
      return;
    }

    // Mostrar modal de carga
    setLoading(true);
    setFeedbackModalVisible(true);
    
    try {
      const result = await resetPassword({ 
        reset_token: reset_token, 
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      setLoading(false);
      setIsSuccess(result.success);
      setFeedbackMessage(result.message);
      
      if (result.success) {
        // Esperar un momento antes de navegar al login
        setTimeout(() => {
          setFeedbackModalVisible(false);
          router.replace('/(auth)/sign-in');
        }, 3000);
      }
    } catch (error: any) {
      setLoading(false);
      setIsSuccess(false);
      setFeedbackMessage(t('recoverConnectionError'));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">
      {/* Sección superior decorativa */}
      <View>
        <View className='flex-row justify-between'>
          <View className="top-5 left-10 w-32 h-32 bg-white rounded-full justify-center" />
          <View className='justify-center items-end mr-4'>
            <Text className="text-white text-3xl font-bold">{t('resetPasswordTitle')}</Text>
          </View>
        </View>
      </View>

      {/* Vector separador */}
      <View>
        <Image
          source={require('@assets/Vectores/Vector 7.png')}
          className="-left-10"
          resizeMode="cover"
          style={{ width: "120%", height: 120 }}
        />
        <Image
          source={require('@assets/Vectores/Vector 6.png')}
          className="absolute mt-8 -left-10"
          resizeMode="cover"
          style={{ width: "120%", height: 120 }}
        />
      </View>

      {/* Sección central con ScrollView para evitar desbordes y manejo de teclado */}
      <ScrollView
        contentContainerStyle={{ paddingTop: 64, paddingBottom: 32, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        className='bg-[#14161E] -my-10'
      >
        <View className="w-full px-6">
          <View className="flex-row items-center justify-between mb-10">
            {/* Botón atrás */}
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={t('back')}
              activeOpacity={0.6}
              className="items-center justify-center bg-primary p-3 px-4 rounded-[12px]"
            >
              <ArrowLeft size={28} color="#fff" />
            </TouchableOpacity>
            
            {/* Texto centrado */}
            <Text className="text-white text-5xl font-bold">{t('resetPasswordAlmostThere')}</Text>
            
            {/* Espacio vacío para balancear */}
            <View className="w-16" />
          </View>

          {/* Información contextual */}
          <View className="w-full items-center mb-8">
            <Text className="text-white text-lg text-center">
              {t('resetPasswordInstruction')}
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              {t('resetPasswordRequirements')}
            </Text>
          </View>

          {/* Campos de contraseña alineados verticalmente */}
          <View className="w-full items-center space-y-6 mb-8">
            {/* Campo Nueva Contraseña */}
            <View className="space-y-2 w-72">
              <Text className="text-white text-xl font-bold">{t('resetPasswordNewLabel')}</Text>
              <View className="relative">
                <TextInput
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setShowPasswordRequirements(text.length > 0);
                  }}
                  placeholder="*************"
                  placeholderTextColor="#ccc"
                  secureTextEntry={!showNewPassword}
                  className="text-white text-xl border-b border-white pb-2 pr-10"
                  keyboardType="default"
                  onFocus={() => setShowPasswordRequirements(true)}
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-0 bottom-2"
                >
                  {showNewPassword ? (
                    <EyeOff size={24} color="#fff" />
                  ) : (
                    <Eye size={24} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Indicadores de requisitos de contraseña */}
            {showPasswordRequirements && (
              <View className="w-72 mt-4">
                <Text className="text-white text-sm mb-2">{t('passwordRequirementsTitle')}</Text>
                <View className="space-y-1">
                  <Text className={`text-xs ${passwordValidation.length ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordValidation.length ? '✓' : '✗'} {t('resetPasswordReqLength')}
                  </Text>
                  <Text className={`text-xs ${passwordValidation.uppercase ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordValidation.uppercase ? '✓' : '✗'} {t('resetPasswordReqUppercase')}
                  </Text>
                  <Text className={`text-xs ${passwordValidation.number ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordValidation.number ? '✓' : '✗'} {t('resetPasswordReqNumber')}
                  </Text>
                  <Text className={`text-xs ${passwordValidation.noSpecial ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordValidation.noSpecial ? '✓' : '✗'} {t('resetPasswordReqNoSpecial')}
                  </Text>
                </View>
              </View>
            )}

            {/* Campo Confirmar Contraseña */}
            <View className="space-y-2 w-72 pt-4">
              <Text className="text-white text-xl font-bold">{t('resetPasswordConfirmLabel')}</Text>
              <View className="relative">
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="*************"
                  placeholderTextColor="#ccc"
                  secureTextEntry={!showConfirmPassword}
                  className="text-white text-xl border-b border-white pb-2 pr-10"
                  keyboardType="default"
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 bottom-2"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={24} color="#fff" />
                  ) : (
                    <Eye size={24} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
              {/* Indicador de coincidencia */}
              {confirmPassword.length > 0 && (
                <Text className={`text-xs mt-1 ${
                  newPassword === confirmPassword ? 'text-green-400' : 'text-red-400'
                }`}>
                  {newPassword === confirmPassword 
                    ? t('resetPasswordMatch')
                    : t('resetPasswordNoMatch')
                  }
                </Text>
              )}
            </View>
          </View>

          {/* Botón centrado */}
          <View className='items-center mt-4'>
            <TouchableOpacity
              className="bg-[#537CF2] items-center justify-center w-56 py-5 rounded-[32px] shadow active:opacity-80"
              onPress={handleResetPassword}
              disabled={loading || !isValidPassword(newPassword) || newPassword !== confirmPassword}
              style={{ 
                opacity: (loading || !isValidPassword(newPassword) || newPassword !== confirmPassword) ? 0.6 : 1 
              }}
            >
              <Text className="text-white text-lg font-bold">
                {loading ? t('resetPasswordUpdating') : t('resetPasswordButton')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de feedback */}
      <Modal
        visible={feedbackModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 12, minWidth: 300, alignItems: 'center', maxWidth: '90%' }}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#537CF2" style={{ marginBottom: 16 }} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
                  {t('resetPasswordModalUpdating')}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
                  {t('resetPasswordModalUpdatingBody')}
                </Text>
              </>
            ) : (
              <>
                <View style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: 30, 
                  backgroundColor: isSuccess ? '#10B981' : '#EF4444',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16
                }}>
                  <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                    {isSuccess ? '✓' : '✕'}
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
                  {isSuccess ? t('resetPasswordModalSuccess') : t('resetPasswordModalError')}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
                  {feedbackMessage}
                </Text>
                {isSuccess ? (
                  <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
                    {t('resetPasswordModalRedirecting')}
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => setFeedbackModalVisible(false)}
                    style={{ backgroundColor: '#537CF2', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('resetPasswordModalRetry')}</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;