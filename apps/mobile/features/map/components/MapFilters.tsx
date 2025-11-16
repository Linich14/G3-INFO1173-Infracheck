import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AnnotationType, ANNOTATION_CONFIGS, FilterState } from '../types';
import { useLanguage } from '~/contexts/LanguageContext';

interface MapFiltersProps {
    filterState: FilterState;
    onFilterChange: (filterState: FilterState) => void;
    isVisible: boolean;
    onToggleVisibility: () => void;
    currentZoom?: number;
}

const FILTER_LABELS: Record<AnnotationType, string> = {
    [AnnotationType.CALLES_VEREDAS]: 'Calles y Veredas',
    [AnnotationType.ALUMBRADO_DANADO]: 'Alumbrado Público',
    [AnnotationType.DRENAJE_AGUAS]: 'Drenaje y Aguas',
    [AnnotationType.PARQUES_ARBOLES]: 'Parques y Árboles',
    [AnnotationType.BASURA_ESCOMBROS]: 'Basura y Escombros',
    [AnnotationType.EMERGENCIAS_RIESGOS]: 'Emergencias',
    [AnnotationType.MOBILIARIO_DANADO]: 'Mobiliario Público',
};

export default function MapFilters({
    filterState,
    onFilterChange,
    isVisible,
    onToggleVisibility,
    currentZoom = 0,
}: MapFiltersProps) {
    const { t } = useLanguage();
    
    const toggleFilter = (type: AnnotationType) => {
        const newActiveTypes = new Set(filterState.activeTypes);

        if (newActiveTypes.has(type)) {
            newActiveTypes.delete(type);
        } else {
            newActiveTypes.add(type);
        }

        onFilterChange({
            activeTypes: newActiveTypes,
            showAll: newActiveTypes.size === Object.keys(AnnotationType).length,
        });
    };

    const toggleAll = () => {
        const allTypes = Object.values(AnnotationType);
        const newShowAll = !filterState.showAll;

        onFilterChange({
            activeTypes: newShowAll ? new Set(allTypes) : new Set(),
            showAll: newShowAll,
        });
    };

    const activeCount = filterState.activeTypes.size;
    const totalCount = Object.keys(AnnotationType).length;

    return (
        <View className="absolute left-0 right-0 top-0 z-10">
            {/* Toggle Button */}
            <View className="flex-row items-center justify-between p-4">
                <Pressable
                    onPress={onToggleVisibility}
                    className="flex-row items-center rounded-lg bg-white px-4 py-3 shadow-lg">
                    <MaterialCommunityIcons name="filter-variant" size={22} color="#374151" />
                    <View className="ml-2 flex-row items-center">
                        <Text className="font-semibold text-gray-800">{t('mapFiltersTitle')}</Text>
                        <View className="ml-2 rounded-full bg-blue-500 px-2 py-0.5">
                            <Text className="text-xs font-medium text-white">
                                {activeCount}/{totalCount}
                            </Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons
                        name={isVisible ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#374151"
                        className="ml-1"
                    />
                </Pressable>
            </View>

            {/* Filter Panel */}
            {isVisible && (
                <View className="mx-4 mb-2 rounded-lg bg-white p-3 shadow-xl">
                    {/* Header with Show All */}
                    <View className="mb-3 flex-row items-center justify-between">
                        <Text className="text-lg font-semibold text-gray-800">{t('mapCategoriesTitle')}</Text>
                        <Pressable
                            onPress={toggleAll}
                            className={`rounded-full px-4 py-2 ${
                                filterState.showAll ? 'bg-blue-500' : 'bg-gray-200'
                            }`}>
                            <Text
                                className={`font-medium ${
                                    filterState.showAll ? 'text-white' : 'text-gray-700'
                                }`}>
                                {filterState.showAll ? 'Deseleccionar todo' : 'Seleccionar todo'}
                            </Text>
                        </Pressable>
                    </View>

                    {/* Filter Grid */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 4 }}>
                        <View className="flex-row gap-2">
                            {Object.values(AnnotationType).map((type) => {
                                const config = ANNOTATION_CONFIGS[type];
                                const isActive = filterState.activeTypes.has(type);

                                return (
                                    <Pressable
                                        key={type}
                                        onPress={() => toggleFilter(type)}
                                        className={`min-w-[100px] flex-col items-center rounded-lg border-2 px-3 py-3 ${
                                            isActive
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 bg-white'
                                        }`}
                                        style={{
                                            shadowColor: isActive ? config.color : '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: isActive ? 0.3 : 0.1,
                                            shadowRadius: 3,
                                            elevation: isActive ? 4 : 2,
                                        }}>
                                        <View
                                            className={`mb-2 rounded-full p-2 ${isActive ? '' : 'bg-gray-100'}`}
                                            style={{
                                                backgroundColor: isActive
                                                    ? config.color + '20'
                                                    : undefined,
                                            }}>
                                            <MaterialCommunityIcons
                                                name={config.icon}
                                                size={24}
                                                color={isActive ? config.color : '#9CA3AF'}
                                            />
                                        </View>
                                        <Text
                                            className={`text-center text-xs font-medium leading-tight ${
                                                isActive ? 'text-gray-900' : 'text-gray-500'
                                            }`}
                                            numberOfLines={2}>
                                            {FILTER_LABELS[type]}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </ScrollView>

                    {/* Info message */}
                    {currentZoom < 13 && (
                        <View className="mt-3 rounded-lg bg-amber-50 p-3">
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons
                                    name="information"
                                    size={20}
                                    color="#3B82F6"
                                />
                                <Text className="ml-2 text-sm text-gray-600">
                                    {t('mapZoomToSee')}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}
