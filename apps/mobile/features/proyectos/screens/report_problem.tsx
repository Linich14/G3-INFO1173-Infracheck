import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReportFormData {
    titulo: string;
    descripcion: string;
    ubicacion: string;
    tipoProblem: string;
    prioridad: 'Alta' | 'Media' | 'Baja';
}

interface ReportProblemProps {
    onBack: () => void;
    onProblemReported: (data: any) => void;
}

export default function ReportProblem({ onBack, onProblemReported }: ReportProblemProps) {
    const [formData, setFormData] = useState<ReportFormData>({
        titulo: '',
        descripcion: '',
        ubicacion: '',
        tipoProblem: '',
        prioridad: 'Media',
    });

    const tiposProblema = [
        'Infraestructura Vial',
        'Iluminación Pública',
        'Servicios Básicos',
        'Limpieza y Ornato',
        'Seguridad Ciudadana',
        'Espacios Públicos',
        'Medio Ambiente',
        'Otros',
    ];

    const handleSubmitReport = () => {
        // Validaciones
        if (!formData.titulo.trim()) {
            Alert.alert('Error', 'El título es obligatorio');
            return;
        }
        if (!formData.descripcion.trim()) {
            Alert.alert('Error', 'La descripción es obligatoria');
            return;
        }
        if (!formData.ubicacion.trim()) {
            Alert.alert('Error', 'La ubicación es obligatoria');
            return;
        }
        if (!formData.tipoProblem) {
            Alert.alert('Error', 'Debe seleccionar un tipo de problema');
            return;
        }

        const reportData = {
            id: Date.now(),
            ...formData,
            fecha: new Date().toISOString(),
            estado: 'Reportado',
            usuario: 'Usuario Autoridad',
        };

        Alert.alert('Problema Reportado', 'El problema ha sido reportado exitosamente', [
            {
                text: 'OK',
                onPress: () => onProblemReported(reportData),
            },
        ]);
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

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="mb-6 rounded-xl bg-neutral-900 p-4">
                    <Text className="mb-4 text-lg font-bold text-blue-400">
                        Información del Problema
                    </Text>

                    {/* Título */}
                    <View className="mb-4">
                        <Text className="mb-2 text-gray-400">Título del Problema *</Text>
                        <TextInput
                            className="rounded-lg bg-neutral-800 p-3 text-white"
                            placeholder="Ej: Semáforo no funciona"
                            placeholderTextColor="#9CA3AF"
                            value={formData.titulo}
                            onChangeText={(text) =>
                                setFormData((prev) => ({ ...prev, titulo: text }))
                            }
                        />
                    </View>

                    {/* Descripción */}
                    <View className="mb-4">
                        <Text className="mb-2 text-gray-400">Descripción *</Text>
                        <TextInput
                            className="rounded-lg bg-neutral-800 p-3 text-white"
                            placeholder="Describe el problema en detalle..."
                            placeholderTextColor="#9CA3AF"
                            value={formData.descripcion}
                            onChangeText={(text) =>
                                setFormData((prev) => ({ ...prev, descripcion: text }))
                            }
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Ubicación */}
                    <View className="mb-4">
                        <Text className="mb-2 text-gray-400">Ubicación *</Text>
                        <TextInput
                            className="rounded-lg bg-neutral-800 p-3 text-white"
                            placeholder="Ej: Av. Alemania con Prat"
                            placeholderTextColor="#9CA3AF"
                            value={formData.ubicacion}
                            onChangeText={(text) =>
                                setFormData((prev) => ({ ...prev, ubicacion: text }))
                            }
                        />
                    </View>

                    {/* Tipo de Problema */}
                    <View className="mb-4">
                        <Text className="mb-2 text-gray-400">Tipo de Problema *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row">
                                {tiposProblema.map((tipo) => (
                                    <TouchableOpacity
                                        key={tipo}
                                        className={`mr-2 rounded-lg px-3 py-2 ${
                                            formData.tipoProblem === tipo
                                                ? 'bg-blue-600'
                                                : 'bg-neutral-800'
                                        }`}
                                        onPress={() =>
                                            setFormData((prev) => ({ ...prev, tipoProblem: tipo }))
                                        }>
                                        <Text className="text-sm text-white">{tipo}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Prioridad */}
                    <View className="mb-4">
                        <Text className="mb-2 text-gray-400">Prioridad</Text>
                        <View className="flex-row">
                            {['Alta', 'Media', 'Baja'].map((prioridad) => (
                                <TouchableOpacity
                                    key={prioridad}
                                    className={`mr-2 rounded-lg px-4 py-2 ${
                                        formData.prioridad === prioridad
                                            ? prioridad === 'Alta'
                                                ? 'bg-red-600'
                                                : prioridad === 'Media'
                                                  ? 'bg-yellow-600'
                                                  : 'bg-blue-600'
                                            : 'bg-neutral-800'
                                    }`}
                                    onPress={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            prioridad: prioridad as any,
                                        }))
                                    }>
                                    <Text className="text-sm text-white">{prioridad}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Botones de Acción */}
                <View className="mb-6 flex-row">
                    <TouchableOpacity
                        className="mr-3 flex-1 rounded-lg bg-gray-600 p-4"
                        onPress={onBack}>
                        <Text className="text-center font-semibold text-white">Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 rounded-lg bg-red-600 p-4"
                        onPress={handleSubmitReport}>
                        <Text className="text-center font-semibold text-white">
                            Reportar Problema
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
