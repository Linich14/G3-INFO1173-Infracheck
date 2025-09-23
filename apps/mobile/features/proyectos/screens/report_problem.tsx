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
        <View className="mb-6 rounded-xl border border-blue-600/30 bg-blue-900/20 p-4">
          <View className="mb-2 flex-row items-center">
            <Ionicons name="information-circle" size={20} color="#60A5FA" />
            <Text className="ml-2 font-semibold text-blue-400">¿Cómo reportar?</Text>
          </View>
          <Text className="text-sm leading-5 text-gray-300">
            Describe el problema que observaste de manera clara y detallada, qué está pasando y
            cualquier información que consideres importante.
          </Text>
        </View>

        {/* Formulario Principal */}
        <View className="mb-6 rounded-xl bg-neutral-900 p-6">
          <Text className="mb-4 text-lg font-bold text-blue-400">Describe el Problema</Text>

          {/* Caja de texto grande */}
          <View className="mb-4">
            <TextInput
              className="min-h-[200px] rounded-lg bg-neutral-800 p-4 text-base leading-6 text-white"
              placeholderTextColor="#9CA3AF"
              value={formData.descripcion}
              onChangeText={handleTextChange}
              multiline
              textAlignVertical="top"
              maxLength={maxLength}
              style={{ fontSize: 16, lineHeight: 24 }}
            />

            {/* Contador de caracteres */}
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-xs text-gray-500">Mínimo 10 caracteres</Text>
              <Text
                className={`text-xs ${
                  remainingChars < 100
                    ? 'text-yellow-400'
                    : remainingChars < 50
                      ? 'text-red-400'
                      : 'text-gray-400'
                }`}>
                {remainingChars} caracteres restantes
              </Text>
            </View>
          </View>
        </View>

        {/* Consejos */}
        <View className="mb-6 rounded-xl bg-neutral-900 p-4">
          <Text className="text-md mb-3 font-semibold text-green-400">
            💡 Consejos para un buen reporte:
          </Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-300">• Sé específico</Text>
            <Text className="text-sm text-gray-300">• Explica qué salió mal</Text>
            <Text className="text-sm text-gray-300">• Menciona si es urgente o peligroso</Text>
            <Text className="text-sm text-gray-300">• Añade cualquier detalle útil</Text>
          </View>
        </View>
      </ScrollView>

      {/* Botones de Acción */}
      <View className="border-t border-neutral-800 pb-6 pt-4">
        <View className="flex-row gap-3">
          <TouchableOpacity className="flex-1 rounded-lg bg-gray-600 p-4" onPress={onBack}>
            <Text className="text-center font-semibold text-white">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 rounded-lg p-4 ${
              formData.descripcion.trim().length >= 10 ? 'bg-red-600' : 'bg-gray-700'
            }`}
            onPress={handleSubmitReport}
            disabled={formData.descripcion.trim().length < 10}>
            <Text
              className={`text-center font-semibold ${
                formData.descripcion.trim().length >= 10 ? 'text-white' : 'text-gray-400'
              }`}>
              Enviar Reporte
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
