import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useAuth } from '~/contexts/AuthContext';
import { deleteAccount } from '../services/profileService';

export const DeleteAccountSection: React.FC = () => {
    const [showFirstConfirm, setShowFirstConfirm] = useState(false);
    const [showSecondConfirm, setShowSecondConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { logout } = useAuth();

    const handleFirstConfirm = () => {
        setShowFirstConfirm(false);
        setShowSecondConfirm(true);
    };

    const handleDelete = async () => {
        if (confirmText !== 'ELIMINAR') {
            Alert.alert('Error', 'Debes escribir "ELIMINAR" exactamente para confirmar');
            return;
        }

        setIsLoading(true);
        try {
            const result = await deleteAccount();

            if (result.success) {
                Alert.alert('Cuenta Eliminada', result.message, [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Logout automático y limpieza de datos
                            logout();
                        },
                    },
                ]);
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error de conexión. Intenta nuevamente.');
        } finally {
            setIsLoading(false);
            setShowSecondConfirm(false);
            setConfirmText('');
        }
    };

    const handleCancel = () => {
        setShowFirstConfirm(false);
        setShowSecondConfirm(false);
        setConfirmText('');
    };

    return (
        <View className="mt-6 px-3.5">
            {/* Delete Account Button */}
            <TouchableOpacity
                onPress={() => setShowFirstConfirm(true)}
                className="w-full flex-row rounded-xl bg-[#1D212D] shadow-sm"
                activeOpacity={0.7}>
                <View className="aspect-[1.3] w-[65px] items-center justify-center">
                    <AlertTriangle size={24} color="#dc3545" />
                </View>
                <View className="flex-1 justify-center py-4 pr-4">
                    <Text className="mb-1 text-xl font-bold text-white">Eliminar Cuenta</Text>
                    <Text className="text-sm text-gray-400">
                        Acción irreversible - Contacta soporte para recuperar
                    </Text>
                </View>
                <View className="items-center justify-center pr-4">
                    <AlertTriangle size={16} color="#dc3545" />
                </View>
            </TouchableOpacity>

            {/* Primer Modal de Confirmación */}
            <Modal
                visible={showFirstConfirm}
                transparent
                animationType="fade"
                onRequestClose={handleCancel}>
                <View className="flex-1 items-center justify-center bg-black/70 p-4">
                    <View className="w-full max-w-sm rounded-2xl bg-[#1D212D] p-6">
                        <View className="mb-4 items-center">
                            <AlertTriangle size={48} color="#dc3545" />
                            <Text className="mb-2 mt-3 text-xl font-bold text-white">
                                ¿Eliminar Cuenta?
                            </Text>
                        </View>

                        <Text className="mb-6 text-center leading-5 text-gray-300">
                            Esta acción desactivará tu cuenta permanentemente y es irreversible
                            desde la aplicación.
                            {'\n\n'}Perderás acceso a todos tus datos y no podrás iniciar sesión.
                            {'\n\n'}Para reactivar, deberás contactar directamente con soporte
                            técnico.
                        </Text>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 items-center rounded-xl bg-[#333] py-3"
                                onPress={handleCancel}>
                                <Text className="font-medium text-gray-300">Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 items-center rounded-xl bg-[#dc3545] py-3"
                                onPress={handleFirstConfirm}>
                                <Text className="font-bold text-white">Continuar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Segundo Modal de Confirmación */}
            <Modal
                visible={showSecondConfirm}
                transparent
                animationType="fade"
                onRequestClose={handleCancel}>
                <View className="flex-1 items-center justify-center bg-black/70 p-4">
                    <View className="w-full max-w-sm rounded-2xl bg-[#1D212D] p-6">
                        <View className="mb-4 items-center">
                            <AlertTriangle size={32} color="#dc3545" />
                            <Text className="mb-2 mt-2 text-lg font-bold text-white">
                                Confirmar Eliminación
                            </Text>
                        </View>

                        <Text className="mb-4 text-center leading-5 text-gray-300">
                            Para confirmar la eliminación permanente de tu cuenta, escribe
                            <Text className="font-bold text-[#dc3545]"> &quot;ELIMINAR&quot; </Text>
                            en el campo abajo:
                        </Text>

                        <TextInput
                            className="mb-6 rounded-xl border border-[#444] bg-[#2a2a2a] px-4 py-3 text-center text-lg text-white"
                            value={confirmText}
                            onChangeText={setConfirmText}
                            placeholder="Escribe ELIMINAR"
                            placeholderTextColor="#666"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            maxLength={20}
                            editable={!isLoading}
                        />

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 items-center rounded-xl bg-[#333] py-3"
                                onPress={handleCancel}
                                disabled={isLoading}>
                                <Text className="font-medium text-gray-300">Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`flex-1 items-center rounded-xl py-3 ${
                                    confirmText !== 'ELIMINAR' || isLoading
                                        ? 'bg-[#333] opacity-50'
                                        : 'bg-[#dc3545]'
                                }`}
                                onPress={handleDelete}
                                disabled={confirmText !== 'ELIMINAR' || isLoading}>
                                {isLoading ? (
                                    <ActivityIndicator color="#ffffff" size="small" />
                                ) : (
                                    <Text className="font-bold text-white">Eliminar Cuenta</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
