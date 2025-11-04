import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createNotification } from '~/services/notificationService';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

export default function CreateNotificationScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [usuarioIdentifier, setUsuarioIdentifier] = useState('');
    const [titulo, setTitulo] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [tipo, setTipo] = useState<NotificationType>('info');
    const [denunciaId, setDenunciaId] = useState('');

    // Tipos de notificación con sus configuraciones
    const tiposNotificacion = [
        { value: 'info', label: 'Información', icon: 'information-circle', color: '#537CF2' },
        { value: 'success', label: 'Éxito', icon: 'checkmark-circle', color: '#10b981' },
        { value: 'warning', label: 'Advertencia', icon: 'warning', color: '#f59e0b' },
        { value: 'error', label: 'Error', icon: 'close-circle', color: '#ef4444' },
    ] as const;

    const handleCreate = async () => {
        // Validaciones
        if (!usuarioIdentifier.trim()) {
            Alert.alert('Error', 'Debes ingresar el RUT o ID del usuario');
            return;
        }
        if (!titulo.trim()) {
            Alert.alert('Error', 'Debes ingresar un título');
            return;
        }
        if (!mensaje.trim()) {
            Alert.alert('Error', 'Debes ingresar un mensaje');
            return;
        }

        setLoading(true);

        try {
            const data = {
                usuario_identifier: usuarioIdentifier.trim(),
                titulo: titulo.trim(),
                mensaje: mensaje.trim(),
                tipo,
                ...(denunciaId.trim() && { reporte_id: parseInt(denunciaId) }),
            };

            const response = await createNotification(data);

            if (response.success) {
                Alert.alert(
                    'Éxito',
                    'Notificación creada correctamente',
                    [
                        {
                            text: 'Crear otra',
                            onPress: () => {
                                setUsuarioIdentifier('');
                                setTitulo('');
                                setMensaje('');
                                setDenunciaId('');
                                setTipo('info');
                            },
                        },
                        {
                            text: 'Volver',
                            onPress: () => router.back(),
                        },
                    ]
                );
            }
        } catch (error: any) {
            console.error('Error creando notificación:', error);
            Alert.alert('Error', error.message || 'No se pudo crear la notificación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="bg-secondary px-4 pt-3 pb-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-3">
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-white text-xl font-bold">Crear Notificación</Text>
                            <Text className="text-gray-400 text-sm">Panel Administrativo</Text>
                        </View>
                        <Ionicons name="notifications" size={24} color="#537CF2" />
                    </View>
                </View>

                <View className="p-4">
                    {/* Info Card */}
                    <View className="bg-[#537CF2]/10 border border-[#537CF2]/30 rounded-lg p-4 mb-6">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="information-circle" size={20} color="#537CF2" />
                            <Text className="text-[#537CF2] font-semibold ml-2">Información</Text>
                        </View>
                        <Text className="text-gray-300 text-sm">
                            Esta función permite crear notificaciones de prueba para cualquier usuario del sistema.
                        </Text>
                    </View>

                    {/* Formulario */}
                    <View className="space-y-4">
                        {/* RUT o ID Usuario */}
                        <View className="mb-4">
                            <Text className="text-white font-semibold mb-2">
                                RUT o ID del Usuario <Text className="text-red-500">*</Text>
                            </Text>
                            <TextInput
                                className="bg-secondary text-white px-4 py-3 rounded-lg border border-gray-700"
                                placeholder="Ej: 12345678-9 o 5"
                                placeholderTextColor="#6b7280"
                                value={usuarioIdentifier}
                                onChangeText={setUsuarioIdentifier}
                            />
                            <Text className="text-gray-500 text-xs mt-1">
                                Puedes ingresar el RUT (con o sin guión) o el ID numérico
                            </Text>
                        </View>

                        {/* Título */}
                        <View className="mb-4">
                            <Text className="text-white font-semibold mb-2">
                                Título <Text className="text-red-500">*</Text>
                            </Text>
                            <TextInput
                                className="bg-secondary text-white px-4 py-3 rounded-lg border border-gray-700"
                                placeholder="Ej: Actualización importante"
                                placeholderTextColor="#6b7280"
                                value={titulo}
                                onChangeText={setTitulo}
                                maxLength={200}
                            />
                            <Text className="text-gray-500 text-xs mt-1">
                                {titulo.length}/200 caracteres
                            </Text>
                        </View>

                        {/* Mensaje */}
                        <View className="mb-4">
                            <Text className="text-white font-semibold mb-2">
                                Mensaje <Text className="text-red-500">*</Text>
                            </Text>
                            <TextInput
                                className="bg-secondary text-white px-4 py-3 rounded-lg border border-gray-700"
                                placeholder="Escribe el mensaje de la notificación..."
                                placeholderTextColor="#6b7280"
                                value={mensaje}
                                onChangeText={setMensaje}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Tipo de Notificación */}
                        <View className="mb-4">
                            <Text className="text-white font-semibold mb-2">
                                Tipo de Notificación <Text className="text-red-500">*</Text>
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {tiposNotificacion.map((tipoOption) => (
                                    <TouchableOpacity
                                        key={tipoOption.value}
                                        onPress={() => setTipo(tipoOption.value)}
                                        className={`flex-1 min-w-[45%] py-3 px-3 rounded-lg border ${
                                            tipo === tipoOption.value
                                                ? 'border-2'
                                                : 'border border-gray-700'
                                        }`}
                                        style={{
                                            backgroundColor:
                                                tipo === tipoOption.value
                                                    ? `${tipoOption.color}20`
                                                    : '#13161E',
                                            borderColor:
                                                tipo === tipoOption.value
                                                    ? tipoOption.color
                                                    : '#374151',
                                        }}
                                    >
                                        <View className="flex-row items-center justify-center">
                                            <Ionicons
                                                name={tipoOption.icon as any}
                                                size={20}
                                                color={tipoOption.color}
                                            />
                                            <Text
                                                className="ml-2 font-semibold"
                                                style={{ color: tipoOption.color }}
                                            >
                                                {tipoOption.label}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* ID Denuncia (Opcional) */}
                        <View className="mb-6">
                            <Text className="text-white font-semibold mb-2">
                                ID del Reporte (Opcional)
                            </Text>
                            <TextInput
                                className="bg-secondary text-white px-4 py-3 rounded-lg border border-gray-700"
                                placeholder="Ej: 123"
                                placeholderTextColor="#6b7280"
                                value={denunciaId}
                                onChangeText={setDenunciaId}
                                keyboardType="numeric"
                            />
                            <Text className="text-gray-500 text-xs mt-1">
                                Si la notificación está relacionada con un reporte específico
                            </Text>
                        </View>

                        {/* Botones */}
                        <View className="flex-row gap-3 mb-8">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="flex-1 bg-secondary py-4 rounded-lg"
                                disabled={loading}
                            >
                                <Text className="text-white text-center font-semibold">
                                    Cancelar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleCreate}
                                className="flex-1 py-4 rounded-lg"
                                style={{ backgroundColor: '#537CF2' }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white text-center font-semibold">
                                        Crear Notificación
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
