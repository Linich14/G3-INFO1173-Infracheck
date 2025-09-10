import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import EmailInput from '../components/EmailInput';
import RutInput from '../components/RutInput';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const RegisterScreen: React.FC = () => {
  const handleConfirm = () => {
    const data = getRegisterData();
    setShowModal(false);
    // Reemplazar la URL por endpoint Django REST
    fetch('http://127.0.0.1:8000/api/v1/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (response.ok) {
          // Registro exitoso
          // mostrar un mensaje o navegar
          router.replace('/(tabs)/home');
        } else {
          // Error en el registro
          const errorData = await response.json();
          alert('Error en el registro: ' + (errorData.detail || 'Verifica los datos.'));
        }
      })
      .catch((error) => {
        alert('Error de red: ' + error.message);
      });
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showModal, setShowModal] = useState(false);

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
  setShowModal(true);
  const handleConfirm = () => {
    const data = getRegisterData();
    // enviar 'data' a la API REST
    setShowModal(false);
    //router.replace('/(tabs)/home');
  };

  const handleCancel = () => {
    setShowModal(false);
  };
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
              <RutInput value={rut} onChangeText={setRut} keyboardType="numeric" />
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
                onChangeText={setUsername}
              />
            </View>

            {/* Campo Correo */}
            <View className="space-y-2 w-72 mb-8">
              <Text className="text-white text-2xl font-bold">Correo Electrónico</Text>
              <EmailInput value={email} onChangeText={setEmail} />
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
                onChangeText={setPassword}
              />
              <Text className="text-white text-2xl font-bold">Repetir Contraseña</Text>
              <TextInput
                placeholder="************"
                placeholderTextColor="#ccc"
                secureTextEntry
                className="text-white text-xl border-b border-white pb-2"
                keyboardType="default"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
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
                  onChangeText={setPhone}
                />
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