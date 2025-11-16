import React, { useState, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { useLanguage } from '~/contexts/LanguageContext';

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (filters: FilterValues) => void;
  onApplyFilters?: (filters: FilterValues) => void;
  onClear?: () => void;
  initialFilters?: FilterValues;
}

export interface FilterValues {
  categoria: string | null;
  estado: string | null;
  urgencia: number;
}

export default function FiltersModal({ 
  visible, 
  onClose, 
  onApply,
  onApplyFilters,
  onClear,
  initialFilters 
}: FiltersModalProps) {
  const { t, locale } = useLanguage();
  const [categoria, setCategoria] = useState<string | null>(initialFilters?.categoria || null);
  const [estado, setEstado] = useState<string | null>(initialFilters?.estado || null);
  const [urgencia, setUrgencia] = useState<number>(initialFilters?.urgencia || 1);

  // Traducción dinámica de categorías
  const getCategoryTranslation = useMemo(() => {
    const categoryMap: Record<string, { es: string; en: string }> = {
      'Infraestructura': { es: 'Infraestructura', en: 'Infrastructure' },
      'Señalización': { es: 'Señalización', en: 'Signage' },
      'Alumbrado': { es: 'Alumbrado', en: 'Lighting' },
      'Limpieza': { es: 'Limpieza', en: 'Cleaning' },
      'Seguridad': { es: 'Seguridad', en: 'Security' },
      'Transporte': { es: 'Transporte', en: 'Transportation' },
      'Otro': { es: 'Otro', en: 'Other' }
    };
    return (cat: string): string => categoryMap[cat]?.[locale] || cat;
  }, [locale]);

  const CATEGORIAS = useMemo(() => [
    'Infraestructura',
    'Señalización',
    'Alumbrado',
    'Limpieza',
    'Seguridad',
    'Transporte',
    'Otro'
  ], []);

  const ESTADOS = useMemo(() => [
    { label: t('filtersStatusAll'), value: null },
    { label: t('filtersStatusNew'), value: 'nuevo' },
    { label: t('filtersStatusInProgress'), value: 'en_proceso' },
    { label: t('filtersStatusResolved'), value: 'resuelto' },
    { label: t('filtersStatusRejected'), value: 'rechazado' }
  ], [t]);

  const URGENCIA_LABELS = useMemo(() => [
    t('filtersUrgencyLow'),
    t('filtersUrgencyMedium'),
    t('filtersUrgencyHigh'),
    t('filtersUrgencyCritical')
  ], [t]);

  const handleApply = () => {
    const filterValues = { categoria, estado, urgencia };
    // Llamar a la función que esté disponible
    if (onApply) {
      onApply(filterValues);
    } else if (onApplyFilters) {
      onApplyFilters(filterValues);
    }
    onClose();
  };

  const handleReset = () => {
    setCategoria(null);
    setEstado(null);
    setUrgencia(1);
    if (onClear) {
      onClear();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="max-h-[85%] rounded-t-3xl bg-[#13161E] p-6">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-white">{t('filtersTitle')}</Text>
            <TouchableOpacity onPress={onClose} className="rounded-full bg-[#1D212D] p-2">
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Categorías con chips */}
            <View className="mb-6">
              <Text className="mb-3 text-lg font-semibold text-white">{t('filtersCategory')}</Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIAS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategoria(categoria === cat ? null : cat)}
                    className={`rounded-full px-4 py-2 ${
                      categoria === cat ? 'bg-[#537CF2]' : 'bg-[#1D212D]'
                    }`}
                  >
                    <Text className={`text-sm ${categoria === cat ? 'text-white font-semibold' : 'text-gray-400'}`}>
                      {getCategoryTranslation(cat)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Estados con radio buttons */}
            <View className="mb-6">
              <Text className="mb-3 text-lg font-semibold text-white">{t('filtersStatus')}</Text>
              {ESTADOS.map((est) => (
                <TouchableOpacity
                  key={est.label}
                  onPress={() => setEstado(est.value)}
                  className="mb-3 flex-row items-center"
                >
                  <View className={`mr-3 h-5 w-5 rounded-full border-2 ${
                    estado === est.value ? 'border-[#537CF2]' : 'border-gray-600'
                  } items-center justify-center`}>
                    {estado === est.value && (
                      <View className="h-3 w-3 rounded-full bg-[#537CF2]" />
                    )}
                  </View>
                  <Text className={`text-base ${estado === est.value ? 'text-white font-semibold' : 'text-gray-400'}`}>
                    {est.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Slider de urgencia */}
            <View className="mb-8">
              <Text className="mb-3 text-lg font-semibold text-white">
                {t('filtersUrgency')}: <Text className="text-[#537CF2]">{URGENCIA_LABELS[urgencia - 1]}</Text>
              </Text>
              
              {/* Slider personalizado con botones */}
              <View className="flex-row justify-between items-center mb-2">
                {[1, 2, 3, 4].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setUrgencia(level)}
                    className={`flex-1 mx-1 py-3 rounded-lg items-center ${
                      urgencia === level ? 'bg-[#537CF2]' : 'bg-[#1D212D]'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${
                      urgencia === level ? 'text-white' : 'text-gray-400'
                    }`}>
                      {URGENCIA_LABELS[level - 1]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Barra de progreso visual */}
              <View className="h-2 bg-[#1D212D] rounded-full overflow-hidden">
                <View 
                  className="h-full bg-[#537CF2] rounded-full"
                  style={{ width: `${(urgencia / 4) * 100}%` }}
                />
              </View>
            </View>
          </ScrollView>

          {/* Botones de acción */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleReset}
              className="flex-1 rounded-xl bg-[#1D212D] py-4"
            >
              <Text className="text-center text-base font-semibold text-gray-400">
                {t('filtersClear')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              className="flex-1 rounded-xl bg-[#537CF2] py-4"
            >
              <Text className="text-center text-base font-semibold text-white">
                {t('filtersApply')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
