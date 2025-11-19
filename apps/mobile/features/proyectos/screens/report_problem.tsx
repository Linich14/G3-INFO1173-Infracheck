import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ReportFormData {
  descripcion: string;
}

interface ReportProblemProps {
  onBack: () => void;
  onProblemReported: (data: any) => void;
}

export default function ReportProblem({ onBack, onProblemReported }: ReportProblemProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ReportFormData>({
    descripcion: '',
  });

  // Contador de caracteres
  const maxLength = 1000;
  const remainingChars = maxLength - formData.descripcion.length;

  const handleSubmitReport = () => {
    // Validación simple
    if (!formData.descripcion.trim()) {
      Alert.alert(t('projectReportProblemError'), t('projectReportProblemPlaceholder'));
      return;
    }

    if (formData.descripcion.trim().length < 10) {
      Alert.alert(t('projectReportProblemError'), t('projectReportProblemErrorTooShort'));
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
      t('projectReportProblemSuccess'),
      t('projectReportProblemSuccessMessage'),
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
        <TouchableOpacity className="rounded-xl bg-[#537CF2] p-2" onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-bold text-white">{t('projectReportProblemTitle')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Instrucciones */}
        <View className="mb-6 rounded-xl border border-[#537CF2]/30 bg-[#537CF2]/20 p-4">
          <View className="mb-2 flex-row items-center">
            <Ionicons name="information-circle" size={20} color="#60A5FA" />
            <Text className="ml-2 font-semibold text-blue-400">{t('projectReportProblemHow')}</Text>
          </View>
          <Text className="text-sm leading-5 text-gray-300">
            {t('projectReportProblemHowDescription')}
          </Text>
        </View>

        {/* Formulario Principal */}
        <View className="mb-6 rounded-xl bg-[#13161E] p-6">
          <Text className="mb-4 text-lg font-bold text-blue-400">{t('projectReportProblemDescribe')}</Text>

          {/* Caja de texto grande */}
          <View className="mb-4">
            <TextInput
              className="min-h-[200px] rounded-lg bg-[#1D212D] p-4 text-base leading-6 text-white"
              placeholder={t('projectReportProblemPlaceholder')}
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
              <Text className="text-xs text-gray-500">{t('projectReportProblemMinChars')}</Text>
              <Text
                className={`text-xs ${
                  remainingChars < 100
                    ? 'text-yellow-400'
                    : remainingChars < 50
                      ? 'text-red-400'
                      : 'text-gray-400'
                }`}>
                {remainingChars} {t('projectReportProblemCharsRemaining')}
              </Text>
            </View>
          </View>
        </View>

        {/* Consejos */}
        <View className="mb-6 rounded-xl bg-[#13161E] p-4">
          <Text className="text-md mb-3 font-semibold text-green-400">
            {t('projectReportProblemTips')}
          </Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-300">{t('projectReportProblemTip1')}</Text>
            <Text className="text-sm text-gray-300">{t('projectReportProblemTip2')}</Text>
            <Text className="text-sm text-gray-300">{t('projectReportProblemTip3')}</Text>
            <Text className="text-sm text-gray-300">{t('projectReportProblemTip4')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Botones de Acción */}
      <View className="border-t border-[#1D212D] pb-6 pt-4">
        <View className="flex-row gap-3">
          <TouchableOpacity className="flex-1 rounded-lg bg-[#1D212D] p-4" onPress={onBack}>
            <Text className="text-center font-semibold text-white">{t('projectReportProblemCancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 rounded-lg p-4 ${
              formData.descripcion.trim().length >= 10 ? 'bg-[#537CF2]' : 'bg-[#1D212D]'
            }`}
            onPress={handleSubmitReport}
            disabled={formData.descripcion.trim().length < 10}>
            <Text
              className={`text-center font-semibold ${
                formData.descripcion.trim().length >= 10 ? 'text-white' : 'text-gray-400'
              }`}>
              {t('projectReportProblemSubmit')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
