import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Modal,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import RutInput from '../components/RutInput';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginUser } from '../services/authService';
import { useAuth } from '~/contexts/AuthContext';
import { useLanguage } from '~/contexts/LanguageContext';

const LoginScreen: React.FC = () => {
    const router = useRouter();
    const { checkAuthStatus } = useAuth();
    const [rut, setRut] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const handleLogin = async () => {
        // Validar que los campos no estén vacíos
        if (!rut.trim() || !password.trim()) {
            setFeedbackMessage(t('loginEmptyFieldsError'));
            setFeedbackModalVisible(true);
            setLoading(false);
            return;
        }

        // Mostrar modal de carga inmediatamente
        setFeedbackModalVisible(true);
        setLoading(true);

        // Espera artificial para mostrar el modal de carga
        await new Promise((resolve) => setTimeout(resolve, 1500));

        try {
            // Llamada real al backend de login
            const result = await loginUser({ rut, password });

            // Debug: Log the result to understand what we're getting
            console.log('Login result:', result);

            if (result.success) {
                setFeedbackMessage(t('loginSuccess'));
                setLoading(false);

                // Actualizar inmediatamente el estado de autenticación
                await checkAuthStatus();

                setTimeout(() => {
                    setFeedbackModalVisible(false);
                    // Forzar redirección si el contexto no la maneja automáticamente
                    router.replace('/(tabs)/home');
                }, 1500);
            } else {
                setFeedbackMessage(result.message);
                setLoading(false);
            }
        } catch (error: any) {
            setFeedbackMessage(
                t('loginErrorPrefix') + (error.message || t('loginErrorFallback'))
            );
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0f172a]">
            {/* Sección superior decorativa */}
            <View>
                <View className="flex-row justify-between">
                    <View className="left-10 top-5 h-32 w-32 justify-center rounded-full bg-white" />
                    <View className="mr-4 items-end justify-center">
                        <Text className=" text-4xl font-bold text-white">{t('loginTitle')}</Text>
                    </View>
                </View>
            </View>

            {/* Vector separador */}
            <View>
                <Image
                    source={require('@assets/Vectores/Vector 7.png')}
                    className="-left-10 "
                    resizeMode="cover"
                    style={{ width: '120%', height: 120 }}
                />
                <Image
                    source={require('@assets/Vectores/Vector 6.png')}
                    className="absolute -left-10 mt-8 "
                    resizeMode="cover"
                    style={{ width: '120%', height: 120 }}
                />
            </View>

            {/* Sección central con ScrollView para evitar desbordes y manejo de teclado */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 40}
                style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{
                        paddingTop: 64,
                        paddingBottom: 100, // Aumentado para dar más espacio
                        flexGrow: 1,
                        justifyContent: 'flex-start', // Asegura que el contenido se alinee desde arriba
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false} // Evita el rebote en iOS
                    className="-my-10 bg-[#14161E]">
                    <View className="itemsy-center px-6 w-full">
                        <View className="mb-10 flex-row items-center justify-between">
                            {/* Botón atrás */}
                            <TouchableOpacity
                                onPress={() => router.replace('/')}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                accessibilityRole="button"
                                accessibilityLabel={t('back')}
                                activeOpacity={0.6}
                                className="items-center justify-center rounded-[12px] bg-primary p-3 px-4 ml-2">
                                <ArrowLeft size={28} color="#fff" />
                            </TouchableOpacity>
                            {/* Texto centrado */}
                            <Text className="text-6xl font-bold text-white">{t('loginHello')}</Text>
                            {/* View vacío para balancear el espacio */}
                            <View className="w-16" />
                        </View>
                        {/* Campos de usuario y contraseña alineados verticalmente */}
                        <View className="mb-8 w-full items-center space-y-6 ">
                            {/* Campo Usuario */}
                            <View className="w-72 space-y-2">
                                <Text className="text-2xl font-bold text-white ">{t('loginUserLabel')}</Text>
                                <RutInput
                                    value={rut}
                                    onChangeText={setRut}
                                    keyboardType="numeric"
                                />
                            </View>
                            {/* Campo Contraseña */}
                            <View className="w-72 space-y-2 pt-8">
                                <Text className="text-2xl font-bold text-white">{t('loginPasswordLabel')}</Text>
                                <View className="relative">
                                    <TextInput
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="*************"
                                        placeholderTextColor="#ccc"
                                        secureTextEntry={!showPassword}
                                        className="border-b border-white pb-2 pr-12 text-xl text-white"
                                        keyboardType="default"
                                        returnKeyType="done"
                                        onSubmitEditing={handleLogin}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 bottom-2"
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        {showPassword ? (
                                            <EyeOff size={24} color="#ccc" />
                                        ) : (
                                            <Eye size={24} color="#ccc" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        {/* Botones centrados y visibles */}
                        <View className="mt-2 items-center">
                            <TouchableOpacity
                                className="mb-4 w-48 items-center justify-center rounded-[32px] bg-[#537CF2] py-5 shadow active:opacity-80"
                                onPress={handleLogin}>
                                <Text className="text-lg font-bold text-white">{t('welcomeLogin')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.replace('/(auth)/recover-password')}>
                                <Text className="mt-2 text-lg text-[#537CF2]">
                                    {t('loginForgotPassword')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal de feedback de login */}
            <Modal
                visible={feedbackModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setFeedbackModalVisible(false)}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.4)',
                    }}>
                    <View
                        style={{
                            backgroundColor: 'white',
                            padding: 24,
                            borderRadius: 12,
                            minWidth: 220,
                            alignItems: 'center',
                        }}>
                        {loading ? (
                            <>
                                <ActivityIndicator
                                    size="large"
                                    color="#2563eb"
                                    style={{ marginBottom: 16 }}
                                />
                                <Text style={{ fontSize: 16, marginBottom: 8 }}>
                                    {t('loginSubmitting')}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={{ fontSize: 16, marginBottom: 16 }}>
                                    {feedbackMessage}
                                </Text>
                                {!feedbackMessage.includes('exitoso') && (
                                    <TouchableOpacity
                                        onPress={() => setFeedbackModalVisible(false)}
                                        style={{
                                            backgroundColor: '#2563eb',
                                            paddingVertical: 8,
                                            paddingHorizontal: 24,
                                            borderRadius: 8,
                                        }}>
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                            {t('loginErrorClose')}
                                        </Text>
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

export default LoginScreen;
