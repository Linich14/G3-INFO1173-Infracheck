import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import EmailInput from '../components/EmailInput';
import RutInput from '../components/RutInput';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { registerUser } from '../services/registerService';
import { RegisterData } from '../types/RegisterData';
import { validateRegisterData, getPasswordValidationState } from '../../../utils/validation';

const RegisterScreen: React.FC = () => {
  const handleConfirm = async () => {
    const data: RegisterData = getRegisterData();
    setShowModal(false);
    const result = await registerUser(data);
    if (result.success) {
      router.replace('/(tabs)/home');
    } else {
      alert('Error en el registro: ' + result.message);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const passwordState = getPasswordValidationState(password);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});


  // Limpiar error de campo al cambiar el valor
  const handleFieldChange = (field: string, value: string, setter: (v: string) => void) => {
    setter(value);
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Función para recoger los datos
  const getRegisterData = () => ({
    rut,
    email,
    username,
    password,
    confirmPassword,
    phone: `+569${phone}`,
  });


  const handleRegister = () => {
    const data: RegisterData = getRegisterData();
    const validation = validateRegisterData(data);
    if (!validation.isValid) {
      // Mapear errores a cada campo
      const errors: { [key: string]: string } = {};
      validation.errors.forEach(err => {
        errors[err.field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setShowModal(true);
  };

  return (
    // Respetamos solo el safe area superior; la parte inferior la maneja el contenido
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Sección superior decorativa */}
      <View>
        <View className="flex-row justify-between">
          <View className="top-5 left-10 w-32 h-32 bg-white rounded-full justify-center" />
          <View className="justify-center items-end mr-4">
            <Text className="text-white text-4xl font-bold">Registrarse</Text>
          </View>
        </View>
      </View>

      {/* Vector separador */}
      <View>
        <Image
          source={require('@assets/Vectores/Vector 7.png')}
          className="-left-10"
          resizeMode="cover"
          style={{ width: '120%', height: 120 }}
        />
        <Image
          source={require('@assets/Vectores/Vector 6.png')}
          className="absolute mt-8 -left-10"
          resizeMode="cover"
          style={{ width: '120%', height: 120 }}
        />
      </View>

      {/* Sección principal con scroll (sobre fondo #14161E) */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        className="-my-10 bg-[#14161E]"
        contentContainerStyle={{
          paddingTop: 64,
          paddingBottom: insets.bottom + 16, // aire para no chocar con la tab bar
          alignItems: 'center',
          rowGap: 0,
        }}
      >
        <View className="w-full px-6">
          {/* Header del form: back + Hola! centrado + spacer */}
          <View className="flex-row items-center justify-between mb-10">
            {/* Botón atrás (icon-only, sin fondo) */}
            <TouchableOpacity
              onPress={() => router.replace('/')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              activeOpacity={0.6}
              className="items-center justify-center bg-primary p-3 px-4 rounded-[12px]"
            >
              <ArrowLeft size={28} color="#fff" />
            </TouchableOpacity>

            <Text className="text-white text-6xl font-bold">Hola!</Text>

            {/* Spacer del mismo ancho visual que el botón atrás */}
            <View style={{ width: 36 }} />
          </View>

          {/* Campos */}
          <View className="items-center mb-8">
            {/* Campo RUT */}
            <View className="space-y-2 w-72 mb-8">
              <Text className="text-white text-2xl font-bold">RUT</Text>
              <RutInput value={rut} onChangeText={v => handleFieldChange('rut', v, setRut)} keyboardType="numeric" error={fieldErrors.rut} />
            </View>


            {/* Campo Nombre de Usuario */}
            <View className="space-y-2 w-72 mb-8">
              <Text className="text-white text-2xl font-bold">Nombre de Usuario</Text>
              <TextInput
                placeholder="pepa"
                placeholderTextColor="#ccc"
                className="text-white text-xl border-b border-white pb-2"
                keyboardType="default"
                value={username}
                onChangeText={v => handleFieldChange('username', v, setUsername)}
                style={{ borderColor: fieldErrors.username ? 'red' : 'white', borderBottomWidth: 1, color: 'white', paddingBottom: 8, fontSize: 18 }}
              />
              {fieldErrors.username && (
                <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{fieldErrors.username}</Text>
              )}
            </View>

            {/* Campo Correo */}
            <View className="space-y-2 w-72 mb-8">
              <Text className="text-white text-2xl font-bold">Correo Electrónico</Text>
              <EmailInput value={email} onChangeText={v => handleFieldChange('email', v, setEmail)} error={fieldErrors.email} />
            </View>

            {/* Campo Contraseña */}
            <View className="space-y-2 w-72 mb-8">
              <Text className="text-white text-2xl font-bold">Contraseña</Text>
              <TextInput
                placeholder="************"
                placeholderTextColor="#ccc"
                secureTextEntry
                className="text-white text-xl border-b border-white pb-2"
                keyboardType="default"
                value={password}
                onChangeText={v => handleFieldChange('password', v, setPassword)}
                style={{ borderColor: fieldErrors.password ? 'red' : 'white', borderBottomWidth: 1, color: 'white', paddingBottom: 8, fontSize: 18 }}
              />
              {password.length > 0 && (
                <View style={{ marginTop: 4, marginBottom: 4 }}>
                  <Text style={{ color: passwordState.length ? 'green' : 'red', fontSize: 13 }}>
                    • Entre 8 y 16 caracteres
                  </Text>
                  <Text style={{ color: passwordState.uppercase ? 'green' : 'red', fontSize: 13 }}>
                    • Al menos una mayúscula
                  </Text>
                  <Text style={{ color: passwordState.number ? 'green' : 'red', fontSize: 13 }}>
                    • Al menos un número
                  </Text>
                  <Text style={{ color: passwordState.noSpecial ? 'green' : 'red', fontSize: 13 }}>
                    • Sin caracteres especiales
                  </Text>
                </View>
              )}
              {fieldErrors.password && (
                <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{fieldErrors.password}</Text>
              )}
              <Text className="text-white text-2xl font-bold">Repetir Contraseña</Text>
              <TextInput
                placeholder="************"
                placeholderTextColor="#ccc"
                secureTextEntry
                className="text-white text-xl border-b border-white pb-2"
                keyboardType="default"
                value={confirmPassword}
                onChangeText={v => handleFieldChange('confirmPassword', v, setConfirmPassword)}
                style={{ borderColor: fieldErrors.confirmPassword ? 'red' : 'white', borderBottomWidth: 1, color: 'white', paddingBottom: 8, fontSize: 18 }}
              />
              {confirmPassword.length > 0 && (
                <Text style={{ color: confirmPassword === password ? 'green' : 'red', fontSize: 13 }}>
                  {confirmPassword === password ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                </Text>
              )}
              {fieldErrors.confirmPassword && (
                <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{fieldErrors.confirmPassword}</Text>
              )}
            </View>

            {/* Campo Teléfono */}
            <View className="space-y-2 w-72 mb-8">
              <Text className="text-white text-2xl font-bold">Teléfono</Text>
              <View className="flex-row items-center">
                <Text className="text-white text-xl mr-2">+569</Text>
                <TextInput
                  placeholder="12345678"
                  placeholderTextColor="#ccc"
                  keyboardType="number-pad"
                  className="text-white text-xl border-b border-white pb-2 flex-1"
                  maxLength={8}
                  value={phone}
                  onChangeText={v => {
                    const onlyNumbers = v.replace(/[^0-9]/g, '');
                    handleFieldChange('phone', onlyNumbers, setPhone);
                  }}
                  style={{ borderColor: fieldErrors.phone ? 'red' : 'white', borderBottomWidth: 1, color: 'white', paddingBottom: 8, fontSize: 18 }}
                />
                {fieldErrors.phone && (
                  <Text style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{fieldErrors.phone}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Botones */}
          <View className="items-center mt-2">
            <TouchableOpacity
              className="bg-[#537CF2] items-center justify-center w-48 py-5 rounded-[32px] shadow active:opacity-80 mb-4"
              onPress={handleRegister}
            >
              <Text className="text-white text-lg font-bold">Registrarse</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/(auth)/sign-in')}
              className="bg-gray-400 items-center justify-center w-48 py-5 rounded-[32px] shadow border-2 border-white active:opacity-80"
            >
              <Text className="text-white text-lg font-bold">Ya tengo cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* Modal de confirmación temporal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, minWidth: 300 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 12 }}>Confirma tus datos</Text>
            <Text>RUT: {rut}</Text>
            <Text>Correo: {email}</Text>
            <Text>Usuario: {username}</Text>
            <Text>Contraseña: {password}</Text>
            <Text>Repetir Contraseña: {confirmPassword}</Text>
            <Text>Teléfono: +569{phone}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
              <TouchableOpacity onPress={handleCancel} style={{ padding: 10 }}>
                <Text style={{ color: '#537CF2', fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm} style={{ padding: 10 }}>
                <Text style={{ color: '#537CF2', fontWeight: 'bold' }}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RegisterScreen;