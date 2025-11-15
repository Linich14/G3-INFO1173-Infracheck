import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import EmailInput from '../components/EmailInput';
import RutInput from '../components/RutInput';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestPasswordReset } from '../services/authService';
import { isValidIdentifier } from '~/utils/validation';
import { useLanguage } from '~/contexts/LanguageContext';

const RecoverPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState<'rut' | 'email'>('rut');
  const [loading, setLoading] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Handler para solicitar recuperación de contraseña
  const handlePasswordReset = async () => {
    const identifier = method === 'rut' ? rut : email;
    
    // Validar que el campo no esté vacío
    if (!identifier.trim()) {
  setFeedbackMessage(t('recoverFieldRequired'));
      setIsSuccess(false);
      setFeedbackModalVisible(true);
      return;
    }

    // Validar formato del identifier
    const validation = isValidIdentifier(identifier);
    if (!validation.isValid) {
      setFeedbackMessage(
        method === 'rut'
          ? t('rutErrorDefault')
          : t('emailErrorDefault')
      );
      setIsSuccess(false);
      setFeedbackModalVisible(true);
      return;
    }

    // Mostrar modal de carga
    setLoading(true);
    setFeedbackModalVisible(true);
    
    try {
      const result = await requestPasswordReset({ identifier });
      
      setLoading(false);
      setIsSuccess(result.success);
      setFeedbackMessage(result.message);
      
      if (result.success) {
        // Esperar un momento antes de navegar
        setTimeout(() => {
          setFeedbackModalVisible(false);
          // Navegar a la pantalla de verificación de código
          console.log('Navegando a verificación de código con identifier:', identifier);
          router.push({
            pathname: '/(auth)/verify-reset-code',
            params: { identifier }
          });
        }, 2000);
      }
    } catch (error: any) {
      setLoading(false);
      setIsSuccess(false);
  setFeedbackMessage(t('recoverConnectionError'));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">
      {/* Header decorativo */}
      <View>
        <View className='flex-row justify-between'>
          <View className="top-5 left-10 w-32 h-32 bg-white rounded-full justify-center" />
          <View className='justify-center items-end mr-4'>
            <Text className=" text-white text-2xl font-bold">{t('recoverTitle')}</Text>
          </View>
        </View>
      </View>
      {/* Vector separador */}
      <View>
        <Image
          source={require('@assets/Vectores/Vector 7.png')}
          className="-left-10 "
          resizeMode="cover"
          style={{ width: "120%", height: 120 }}
        />
        <Image
          source={require('@assets/Vectores/Vector 6.png')}
          className="absolute mt-8 -left-10 "
          resizeMode="cover"
          style={{ width: "120%", height: 120 }}
        />
      </View>
      {/* Formulario de recuperación */}
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
              onPress={() => router.replace('/(auth)/sign-in')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={t('back')}
              activeOpacity={0.6}
              className="items-center justify-center bg-primary p-3 px-4 rounded-[12px]"
            >
              <ArrowLeft size={28} color="#fff" />
            </TouchableOpacity>
            
            <Text className="text-white text-2xl font-bold text-center flex-1 mx-4">{t('recoverHeaderQuestion')}</Text>
            
            {/* Espacio vacío para balancear el layout */}
            <View className="w-16" />
          </View>

          {/* Selector y campo centrados */}
          <View className="w-full items-center space-y-6">
            <Text className="text-white text-lg text-center py-2">{t('recoverSelectMethod')}</Text>
            
            <View className="flex-row gap-4 mb-6">
              <TouchableOpacity
                onPress={() => setMethod('rut')}
                className={`flex-row items-center px-6 py-3 rounded-xl ${method === 'rut' ? 'bg-[#537CF2]' : 'bg-gray-700'}`}
                activeOpacity={0.8}
              >
                <View className={`w-5 h-5 mr-3 rounded-full border-2 ${method === 'rut' ? 'bg-white border-blue-600' : 'border-gray-400'}`} />
                <Text className="text-white text-base font-medium">{t('recoverMethodRut')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setMethod('email')}
                className={`flex-row items-center px-6 py-3 rounded-xl ${method === 'email' ? 'bg-[#537CF2]' : 'bg-gray-700'}`}
                activeOpacity={0.8}
              >
                <View className={`w-5 h-5 mr-3 rounded-full border-2 ${method === 'email' ? 'bg-white border-blue-600' : 'border-gray-400'}`} />
                <Text className="text-white text-base font-medium">{t('recoverMethodEmail')}</Text>
              </TouchableOpacity>
            </View>

            {method === 'rut' ? (
              <View className="w-full max-w-xs">
                <Text className="text-white text-xl font-bold mb-3">{t('recoverMethodRut')}</Text>
                <RutInput value={rut} onChangeText={setRut} keyboardType="numeric" />
              </View>
            ) : (
              <View className="w-full max-w-xs">
                <Text className="text-white text-xl font-bold mb-3">{t('registerEmailLabel')}</Text>
                <EmailInput value={email} onChangeText={setEmail} />
              </View>
            )}
          </View>

          {/* Botón centrado */}
          <View className='items-center mt-8'>
            <TouchableOpacity
              className="bg-[#537CF2] items-center justify-center w-64 py-4 rounded-[32px] shadow active:opacity-80"
              onPress={handlePasswordReset}
              disabled={loading}
            >
              <Text className="text-white text-lg font-bold">
                {loading ? t('recoverButtonSending') : t('recoverButton')}
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
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>{t('recoverSendingCodeTitle')}</Text>
                <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>{t('recoverSendingCodeBody')}</Text>
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
                  {isSuccess ? t('recoverCodeSentTitle') : t('recoverErrorTitle')}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
                  {feedbackMessage}
                </Text>
                {!isSuccess && (
                  <TouchableOpacity
                    onPress={() => setFeedbackModalVisible(false)}
                    style={{ backgroundColor: '#537CF2', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('recoverModalUnderstand')}</Text>
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



export default RecoverPasswordScreen;