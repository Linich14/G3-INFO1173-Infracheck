import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { verifyResetCode } from '../services/authService';
import { useLanguage } from '~/contexts/LanguageContext';

const VerifyResetCodeScreen: React.FC = () => {
  const router = useRouter();
  const { identifier } = useLocalSearchParams<{ identifier: string }>();
  const { t } = useLanguage();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Función para ocultar parcialmente el identifier
  const maskIdentifier = (id: string) => {
    if (!id) return '';
    if (id.includes('@')) {
      const [local, domain] = id.split('@');
      return `${local.slice(0, 2)}***@${domain}`;
    } else {
      return `${id.slice(0, 5)}***${id.slice(-2)}`;
    }
  };

  // Handler para verificar el código
  const handleVerifyCode = async () => {
    // Validar que el código tenga exactamente 6 dígitos
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setFeedbackMessage(t('verifyCodeErrorInvalid'));
      setIsSuccess(false);
      setFeedbackModalVisible(true);
      return;
    }

    // Mostrar modal de carga
    setLoading(true);
    setFeedbackModalVisible(true);
    
    try {
      const result = await verifyResetCode({ identifier: identifier!, code });
      
      setLoading(false);
      setIsSuccess(result.success);
      setFeedbackMessage(result.message);
      
      if (result.success && result.reset_token) {
        // Esperar un momento antes de navegar
        setTimeout(() => {
          setFeedbackModalVisible(false);
          // Navegar a la pantalla de reset de contraseña
          console.log('Navegando a reset password con token:', result.reset_token);
          router.push({
            pathname: '/(auth)/reset-password',
            params: { reset_token: result.reset_token }
          });
        }, 2000);
      }
    } catch (error: any) {
      setLoading(false);
      setIsSuccess(false);
      setFeedbackMessage(t('recoverConnectionError'));
    }
  };

  // Handler para el input del código
  const handleCodeChange = (text: string) => {
    // Solo permitir números y máximo 6 caracteres
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(numericText);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">
      {/* Header decorativo */}
      <View>
        <View className='flex-row justify-between'>
          <View className="top-5 left-10 w-32 h-32 bg-white rounded-full justify-center" />
          <View className='justify-center items-end mr-4'>
            <Text className="text-white text-2xl font-bold">{t('verifyCodeTitle')}</Text>
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

      {/* Formulario de verificación */}
      <ScrollView 
        className='-my-10 pt-16 flex-1 bg-[#14161E]' 
        keyboardShouldPersistTaps="handled" 
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="w-full px-6">
          {/* Botón atrás y título en la misma fila */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/recover-password')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={t('back')}
              activeOpacity={0.6}
              className="items-center justify-center bg-primary p-3 px-4 rounded-[12px]"
            >
              <ArrowLeft size={28} color="#fff" />
            </TouchableOpacity>
            
            <Text className="text-white text-2xl font-bold text-center flex-1 mx-4">
              {t('verifyCodeEnterCode')}
            </Text>
            
            {/* Espacio vacío para balancear el layout */}
            <View className="w-16" />
          </View>

          {/* Información del destino */}
          <View className="w-full items-center mb-8">
            <Text className="text-white text-lg text-center mb-2">
              {t('verifyCodeSentTo')}
            </Text>
            <Text className="text-[#537CF2] text-base text-center font-mono">
              {maskIdentifier(identifier || '')}
            </Text>
          </View>

          {/* Input del código */}
          <View className="w-full items-center mb-8">
            <View className="bg-[#1f2937] rounded-xl p-4 w-full max-w-xs">
              <TextInput
                value={code}
                onChangeText={handleCodeChange}
                placeholder={t('verifyCodePlaceholder')}
                placeholderTextColor="#666"
                keyboardType="numeric"
                maxLength={6}
                autoFocus={true}
                style={{
                  fontSize: 28,
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  letterSpacing: 8,
                  color: 'white',
                  paddingVertical: 12,
                }}
              />
            </View>
            <Text className="text-gray-400 text-sm text-center mt-2">
              {t('verifyCodeInstruction')}
            </Text>
          </View>

          {/* Botón de verificación */}
          <View className='items-center mt-4'>
            <TouchableOpacity
              className="bg-[#537CF2] items-center justify-center w-64 py-4 rounded-[32px] shadow active:opacity-80"
              onPress={handleVerifyCode}
              disabled={loading || code.length !== 6}
              style={{ 
                opacity: (loading || code.length !== 6) ? 0.6 : 1 
              }}
            >
              <Text className="text-white text-lg font-bold">
                {loading ? t('verifyCodeVerifying') : t('verifyCodeButton')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Enlace para reenviar código */}
          <View className='items-center mt-6'>
            <Text className="text-gray-400 text-sm text-center mb-2">
              {t('verifyCodeNoReceived')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                // TODO: Implementar reenvío del código
                console.log('Reenviar código para:', identifier);
              }}
            >
              <Text className="text-[#537CF2] text-sm font-semibold">
                {t('verifyCodeResend')}
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
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 12, minWidth: 280, alignItems: 'center', maxWidth: '90%' }}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#537CF2" style={{ marginBottom: 16 }} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
                  {t('verifyCodeModalVerifying')}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
                  {t('verifyCodeModalWait')}
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
                  {isSuccess ? t('verifyCodeModalSuccess') : t('verifyCodeModalError')}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
                  {feedbackMessage}
                </Text>
                {!isSuccess && (
                  <TouchableOpacity
                    onPress={() => setFeedbackModalVisible(false)}
                    style={{ backgroundColor: '#537CF2', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('verifyCodeModalRetry')}</Text>
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

export default VerifyResetCodeScreen;