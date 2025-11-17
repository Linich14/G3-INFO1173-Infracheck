import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useLanguage } from '~/contexts/LanguageContext';

interface SelectorNivelUrgenciaProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export const SelectorNivelUrgencia: React.FC<SelectorNivelUrgenciaProps> = ({
    value,
    onChange,
    error,
}) => {
    const { t } = useLanguage();
    
    const urgencyLevels = [
        {
            id: '1',
            label: t('reportUrgencyLow'),
            color: 'bg-green-600',
        },
        {
            id: '2',
            label: t('reportUrgencyMedium'),
            color: 'bg-yellow-600',
        },
        {
            id: '3',
            label: t('reportUrgencyHigh'),
            color: 'bg-orange-600',
        },
        {
            id: '4',
            label: t('reportUrgencyCritical'),
            color: 'bg-red-600',
        },
    ];

    return (
        <View>
            <Text className="mb-3 text-xl text-white">{t('reportUrgencyTitle')}</Text>

            <View className="flex-row flex-wrap gap-3">
                {urgencyLevels.map((level) => (
                    <Pressable
                        key={level.id}
                        onPress={() => onChange(level.id)}
                        style={{ width: '48%' }}
                        className={`items-center justify-center rounded-lg border-2 p-4 ${
                            value === level.id
                                ? `${level.color} border-white`
                                : 'border-gray-600 bg-gray-700'
                        }`}>
                        <Text className="text-lg font-semibold text-white">{level.label}</Text>
                    </Pressable>
                ))}
            </View>

            {error && <Text className="mt-2 text-sm text-red-500">{error}</Text>}
        </View>
    );
};
