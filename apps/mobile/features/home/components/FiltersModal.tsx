import React, { useState, useMemo, useEffect } from 'react';
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
  const [categoria, setCategoria] = useState<string | null>(initialFilters?.categoria || 'Todas');
  const [estado, setEstado] = useState<string | null>(initialFilters?.estado || 'Todos');
  const [urgencia, setUrgencia] = useState<number>(initialFilters?.urgencia ?? 0);

  // Sincronizar con initialFilters cuando cambian
  useEffect(() => {
    if (initialFilters) {
      setCategoria(initialFilters.categoria || 'Todas');
      setEstado(initialFilters.estado || 'Todos');
      setUrgencia(initialFilters.urgencia ?? 0);
    }
  }, [initialFilters, visible]);

  // Traducción dinámica de categorías
  const getCategoryTranslation = useMemo(() => {
    const categoryMap: Record<string, { es: string; en: string; display: string }> = {
      'Todas': { es: 'Todas', en: 'All', display: 'Todas' },
      'Calles y Veredas en Mal Estado': { es: 'Calles y Veredas', en: 'Streets and Sidewalks', display: 'Calles y Veredas' },
      'Luz o Alumbrado Público Dañado': { es: 'Alumbrado Público', en: 'Public Lighting', display: 'Alumbrado' },
      'Drenaje o Aguas Estancadas': { es: 'Drenaje', en: 'Drainage', display: 'Drenaje' },
      'Parques, Plazas o Árboles con Problemas': { es: 'Parques y Plazas', en: 'Parks and Squares', display: 'Parques' },
      'Basura, Escombros o Espacios Sucios': { es: 'Basura y Limpieza', en: 'Trash and Cleaning', display: 'Limpieza' },
      'Emergencias o Situaciones de Riesgo': { es: 'Emergencias', en: 'Emergencies', display: 'Emergencias' },
      'Infraestructura o Mobiliario Público Dañado': { es: 'Infraestructura', en: 'Infrastructure', display: 'Infraestructura' }
    };
    return (cat: string): string => {
      if (cat === 'Todas') return categoryMap[cat]?.[locale] || cat;
      return categoryMap[cat]?.display || cat;
    };
  }, [locale]);

  const CATEGORIAS = useMemo(() => [
    'Todas',
    'Calles y Veredas en Mal Estado',
    'Luz o Alumbrado Público Dañado',
    'Drenaje o Aguas Estancadas',
    'Parques, Plazas o Árboles con Problemas',
    'Basura, Escombros o Espacios Sucios',
    'Emergencias o Situaciones de Riesgo',
    'Infraestructura o Mobiliario Público Dañado'
  ], []);

  const ESTADOS = useMemo(() => [
    { label: t('filtersStatusAll'), value: 'Todos' },
    { label: t('filtersStatusNew'), value: 'Pendiente' },
    { label: t('filtersStatusInProgress'), value: 'En Proceso' },
    { label: t('filtersStatusResolved'), value: 'Resuelto' },
    { label: t('filtersStatusRejected'), value: 'Rechazado' }
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
    setCategoria('Todas');
    setEstado('Todos');
    setUrgencia(0);
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
        <View className="max-h-[80%] rounded-t-3xl bg-[#13161E]">
          {/* Header */}
          <View className="px-6 pt-6 pb-4 flex-row items-center justify-between border-b border-gray-800">
            <Text className="text-xl font-bold text-white">{t('filtersTitle')}</Text>
            <TouchableOpacity onPress={onClose} className="rounded-full bg-[#1D212D] p-2">
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="px-6 py-4">
            {/* Categorías con chips */}
            <View className="mb-6">
              <Text className="mb-3 text-base font-semibold text-white">{t('filtersCategory')}</Text>
              <View className="flex-row flex-wrap">
                {CATEGORIAS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategoria(cat)}
                    className={`rounded-full px-4 py-2 mr-2 mb-2 ${
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
              <Text className="mb-3 text-base font-semibold text-white">{t('filtersStatus')}</Text>
              {ESTADOS.map((est) => (
                <TouchableOpacity
                  key={est.value}
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
                  <Text className={`text-sm ${estado === est.value ? 'text-white font-semibold' : 'text-gray-400'}`}>
                    {est.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selector de urgencia */}
            <View className="mb-6">
              <Text className="mb-3 text-base font-semibold text-white">
                {t('filtersUrgency')}: <Text className="text-[#537CF2]">{urgencia === 0 ? t('filtersAll') : URGENCIA_LABELS[urgencia - 1]}</Text>
              </Text>
              
              {/* Selector con botones */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setUrgencia(0)}
                  className={`flex-1 py-3 rounded-lg items-center ${
                    urgencia === 0 ? 'bg-[#537CF2]' : 'bg-[#1D212D]'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${
                    urgencia === 0 ? 'text-white' : 'text-gray-400'
                  }`}>
                    {t('filtersAll')}
                  </Text>
                </TouchableOpacity>
                {[1, 2, 3, 4].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setUrgencia(level)}
                    className={`flex-1 py-3 rounded-lg items-center ${
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
            </View>
          </ScrollView>

          {/* Botones de acción */}
          <View className="px-6 pb-6 pt-4 flex-row gap-3 border-t border-gray-800">
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
