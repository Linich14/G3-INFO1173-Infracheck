import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReportFormData {
    descripcion: string;
}

interface ReportProblemProps {
    onBack: () => void;
    onProblemReported: (data: any) => void;
}

export default function ReportProblem({ onBack, onProblemReported }: ReportProblemProps) {
    const [formData, setFormData] = useState<ReportFormData>({
        descripcion: '',
    });

    // Contador de caracteres
    const maxLength = 1000;
    const remainingChars = maxLength - formData.descripcion.length;

    const handleSubmitReport = () => {
        // Validación simple
        if (!formData.descripcion.trim()) {
            Alert.alert('Error', 'Por favor describe el problema antes de enviarlo');
            return;
        }

        if (formData.descripcion.trim().length < 10) {
            Alert.alert('Error', 'La descripción debe tener al menos 10 caracteres');
            return;
        }

        const reportData = {
            id: Date.now(),
            titulo: 'Reporte de Problema', // Título genérico
            descripcion: formData.descripcion.trim(),
            fecha: new Date().toISOString(),
            estado: 'Reportado',
            usuario: 'Usuario Autoridad',
            ubicacion: 'Sin especificar', // Datos por defecto
            tipoProblem: 'General',
            prioridad: 'Media',
        };

        Alert.alert(
            'Problema Reportado', 
            'Tu reporte ha sido enviado exitosamente. Gracias por contribuir a mejorar la infraestructura.', 
            [
                {
                    text: 'OK',
                    onPress: () => onProblemReported(reportData),
                },
            ]
        );
    };

    const handleTextChange = (text: string) => {
        if (text.length <= maxLength) {
            setFormData({ descripcion: text });
        }
    };

    return (
        <View className="flex-1 bg-black px-4 pt-10">
            {/* Header */}
            <View className="mb-6 flex-row items-center">
                <TouchableOpacity className="rounded-xl bg-blue-500 p-2" onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-bold text-white">Reportar Problema</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Instrucciones */}
                <View className="mb-6 rounded-xl bg-blue-900/20 border border-blue-600/30 p-4">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="information-circle" size={20} color="#60A5FA" />
                        <Text className="ml-2 text-blue-400 font-semibold">¿Cómo reportar?</Text>
                    </View>
                    <Text className="text-gray-300 text-sm leading-5">
                        Describe el problema que observaste de manera clara y detallada. 
                        Incluye la ubicación, qué está pasando y cualquier información que consideres importante.
                    </Text>
                </View>

                {/* Formulario Principal */}
                <View className="mb-6 rounded-xl bg-neutral-900 p-6">
                    <Text className="mb-4 text-lg font-bold text-blue-400">
                        Describe el Problema
                    </Text>

                    {/* Caja de texto grande */}
                    <View className="mb-4">
                        <TextInput
                            className="rounded-lg bg-neutral-800 p-4 text-white text-base leading-6 min-h-[200px]"
                            placeholder="Describe el problema que encontraste...&#10;&#10;Por ejemplo:&#10;• ¿Dónde está ubicado?&#10;• ¿Qué tipo de problema es?&#10;• ¿Qué tan grave consideras que es?&#10;• ¿Cualquier detalle adicional?"
                            placeholderTextColor="#9CA3AF"
                            value={formData.descripcion}
                            onChangeText={handleTextChange}
                            multiline
                            textAlignVertical="top"
                            maxLength={maxLength}
                            style={{ fontSize: 16, lineHeight: 24 }}
                        />
                        
                        {/* Contador de caracteres */}
                        <View className="flex-row justify-between items-center mt-2">
                            <Text className="text-gray-500 text-xs">
                                Mínimo 10 caracteres
                            </Text>
                            <Text className={`text-xs ${
                                remainingChars < 100 ? 'text-yellow-400' : 
                                remainingChars < 50 ? 'text-red-400' : 'text-gray-400'
                            }`}>
                                {remainingChars} caracteres restantes
                            </Text>
                        </View>
                    </View>

                    {/* Indicador de progreso visual */}
                    <View className="mb-4">
                        <View className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                            <View 
                                className={`h-full transition-all duration-300 ${
                                    formData.descripcion.length < 10 ? 'bg-red-500' :
                                    formData.descripcion.length < 50 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                }`}
                                style={{ width: `${Math.min((formData.descripcion.length / maxLength) * 100, 100)}%` }}
                            />
                        </View>
                    </View>
                </View>

                {/* Consejos */}
                <View className="mb-6 rounded-xl bg-neutral-900 p-4">
                    <Text className="mb-3 text-md font-semibold text-green-400">
                        💡 Consejos para un buen reporte:
                    </Text>
                    <View className="space-y-2">
                        <Text className="text-gray-300 text-sm">• Sé específico con la ubicación</Text>
                        <Text className="text-gray-300 text-sm">• Explica qué está funcionando mal</Text>
                        <Text className="text-gray-300 text-sm">• Menciona si es urgente o peligroso</Text>
                        <Text className="text-gray-300 text-sm">• Añade cualquier detalle útil</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Botones de Acción */}
            <View className="pb-6 pt-4 border-t border-neutral-800">
                <View className="flex-row space-x-3">
                    <TouchableOpacity
                        className="flex-1 rounded-lg bg-gray-600 p-4"
                        onPress={onBack}>
                        <Text className="text-center font-semibold text-white">Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`flex-1 rounded-lg p-4 ${
                            formData.descripcion.trim().length >= 10 
                                ? 'bg-red-600' 
                                : 'bg-gray-700'
                        }`}
                        onPress={handleSubmitReport}
                        disabled={formData.descripcion.trim().length < 10}>
                        <Text className={`text-center font-semibold ${
                            formData.descripcion.trim().length >= 10 
                                ? 'text-white' 
                                : 'text-gray-400'
                        }`}>
                            Enviar Reporte
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
