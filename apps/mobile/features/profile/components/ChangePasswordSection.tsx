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
import { Lock } from 'lucide-react-native';
import { useAuth } from '~/contexts/AuthContext';
import { changePassword } from '../services/profileService';
import { ChangePasswordData } from '../types';
import { isValidPassword, getPasswordValidationState } from '~/utils/validation';

export const ChangePasswordSection: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
    const { logout } = useAuth();

    // Estado de validación de contraseña en tiempo real
    const passwordValidation = getPasswordValidationState(newPassword);

    const handleChangePassword = async () => {
        // Validaciones básicas
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'La nueva contraseña y su confirmación no coinciden');
            return;
        }

        if (!isValidPassword(newPassword)) {
            Alert.alert('Error', 'La contraseña no cumple con los requisitos de seguridad');
            return;
        }

        setIsLoading(true);
        try {
            const passwordData: ChangePasswordData = {
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            };

            const result = await changePassword(passwordData);

            if (result.success) {
                Alert.alert('Contraseña Cambiada', result.message, [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Logout automático por seguridad
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
            setShowModal(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordRequirements(false);
        }
    };

    const handleCancel = () => {
        setShowModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordRequirements(false);
    };

    return (
        <View className="mt-6 px-3.5">
            {/* Change Password Button */}
            <TouchableOpacity
                onPress={() => setShowModal(true)}
                className="w-full flex-row rounded-xl bg-[#1D212D] shadow-sm"
                activeOpacity={0.7}>
                <View className="aspect-[1.3] w-[65px] items-center justify-center">
                    <Lock size={24} color="#537CF2" />
                </View>
                <View className="flex-1 justify-center py-4 pr-4">
                    <Text className="mb-1 text-xl font-bold text-white">Cambiar Contraseña</Text>
                    <Text className="text-sm text-gray-400">
                        Actualiza tu contraseña de forma segura
                    </Text>
                </View>
                <View className="items-center justify-center pr-4">
                    <Lock size={16} color="#537CF2" />
                </View>
            </TouchableOpacity>

            {/* Change Password Modal */}
            <Modal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={handleCancel}>
                <View className="flex-1 items-center justify-center bg-black/70 p-4">
                    <View className="w-full max-w-sm rounded-2xl bg-[#1D212D] p-6">
                        <View className="mb-4 items-center">
                            <Lock size={48} color="#537CF2" />
                            <Text className="mb-2 mt-3 text-xl font-bold text-white">
                                Cambiar Contraseña
                            </Text>
                        </View>

                        <Text className="mb-6 text-center leading-5 text-gray-300">
                            Ingresa tu contraseña actual y la nueva contraseña que deseas usar.
                        </Text>

                        {/* Current Password Input */}
                        <TextInput
                            className="mb-4 rounded-xl border border-[#444] bg-[#2a2a2a] px-4 py-3 text-white"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Contraseña actual"
                            placeholderTextColor="#666"
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                        />

                        {/* New Password Input */}
                        <TextInput
                            className="mb-4 rounded-xl border border-[#444] bg-[#2a2a2a] px-4 py-3 text-white"
                            value={newPassword}
                            onChangeText={(text) => {
                                setNewPassword(text);
                                setShowPasswordRequirements(text.length > 0);
                            }}
                            onFocus={() => setShowPasswordRequirements(true)}
                            placeholder="Nueva contraseña"
                            placeholderTextColor="#666"
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                        />

                        {/* Indicadores de requisitos de contraseña */}
                        {showPasswordRequirements && (
                            <View className="mb-4 px-2">
                                <Text className="text-gray-300 text-sm mb-2">Requisitos de contraseña:</Text>
                                <View className="space-y-1">
                                    <Text className={`text-xs ${passwordValidation.length ? 'text-green-400' : 'text-red-400'}`}>
                                        {passwordValidation.length ? '✓' : '✗'} Entre 8 y 16 caracteres
                                    </Text>
                                    <Text className={`text-xs ${passwordValidation.uppercase ? 'text-green-400' : 'text-red-400'}`}>
                                        {passwordValidation.uppercase ? '✓' : '✗'} Al menos una mayúscula
                                    </Text>
                                    <Text className={`text-xs ${passwordValidation.number ? 'text-green-400' : 'text-red-400'}`}>
                                        {passwordValidation.number ? '✓' : '✗'} Al menos un número
                                    </Text>
                                    <Text className={`text-xs ${passwordValidation.noSpecial ? 'text-green-400' : 'text-red-400'}`}>
                                        {passwordValidation.noSpecial ? '✓' : '✗'} Solo letras y números
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Confirm Password Input */}
                        <TextInput
                            className="mb-6 rounded-xl border border-[#444] bg-[#2a2a2a] px-4 py-3 text-white"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirmar nueva contraseña"
                            placeholderTextColor="#666"
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
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
                                    !currentPassword || !newPassword || !confirmPassword || isLoading
                                        ? 'bg-[#333] opacity-50'
                                        : 'bg-[#537CF2]'
                                }`}
                                onPress={handleChangePassword}
                                disabled={!currentPassword || !newPassword || !confirmPassword || isLoading}>
                                {isLoading ? (
                                    <ActivityIndicator color="#ffffff" size="small" />
                                ) : (
                                    <Text className="font-bold text-white">Cambiar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};