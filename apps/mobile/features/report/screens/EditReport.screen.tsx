import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLanguage } from '~/contexts/LanguageContext';
import { useReportEdit, EditReportData } from '../hooks/useReportEdit';
import ModalMap from '../components/modalMap';

type Props = {
    reportId: string;
    initialData: {
        titulo: string;
        descripcion: string;
        direccion: string;
        latitud: number;
        longitud: number;
        urgencia: string;
        tipoDenuncia: string;
        ciudad: string;
        visible: boolean;
    };
    onBack: () => void;
    onSuccess?: () => void;
};

// Mapeo de urgencia (nombre -> ID)
const urgencyMap: Record<string, string> = {
    Baja: '1',
    Media: '2',
    Alta: '3',
};

// Mapeo de tipos de denuncia (nombre -> ID) - ACTUALIZADO
const reportTypeMap: Record<string, string> = {
    'Calles y Veredas en Mal Estado': '1',
    'Luz o Alumbrado Público Dañado': '2',
    'Drenaje o Aguas Estancadas': '3',
    'Parques, Plazas o Árboles con Problemas': '4',
    'Basura, Escombros o Espacios Sucios': '5',
    'Emergencias o Situaciones de Riesgo': '6',
    'Infraestructura o Mobiliario Público Dañado': '7',
};

export default function EditReportScreen({ reportId, initialData, onBack, onSuccess }: Props) {
    const { t } = useLanguage();
    const { updateReport, loading, error } = useReportEdit();

    // Estados del formulario
    const [formData, setFormData] = useState<EditReportData>({
        titulo: initialData.titulo,
        descripcion: initialData.descripcion,
        direccion: initialData.direccion,
        latitud: initialData.latitud,
        longitud: initialData.longitud,
        urgencia: urgencyMap[initialData.urgencia] || '2',
        visible: initialData.visible,
        tipo_denuncia: reportTypeMap[initialData.tipoDenuncia] || '1',
        ciudad: '1', // Por defecto Medellín
    });

    const [showMapModal, setShowMapModal] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Validación básica
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.titulo.trim()) {
            newErrors.titulo = t('formTitleRequired') || 'El título es obligatorio';
        }

        if (!formData.descripcion.trim()) {
            newErrors.descripcion = t('formDescriptionRequired') || 'La descripción es obligatoria';
        }

        if (!formData.direccion.trim()) {
            newErrors.direccion = t('formAddressRequired') || 'La dirección es obligatoria';
        }

        if (formData.latitud === 0 || formData.longitud === 0) {
            newErrors.ubicacion =
                t('formLocationRequired') || 'Seleccione una ubicación en el mapa';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar actualización del formulario
    const handleUpdate = async () => {
        if (!validateForm()) {
            return;
        }

        const result = await updateReport(reportId, formData);

        if (result.success) {
            Alert.alert(t('success') || 'Éxito', result.message, [
                {
                    text: t('ok') || 'OK',
                    onPress: () => {
                        onSuccess?.();
                        onBack();
                    },
                },
            ]);
        } else {
            Alert.alert(t('error') || 'Error', result.message, [{ text: t('ok') || 'OK' }]);
        }
    };

    // Manejar selección de ubicación
    const handleLocationSelect = (location: {
        latitude: number;
        longitude: number;
        address: string;
    }) => {
        setFormData((prev) => ({
            ...prev,
            latitud: location.latitude,
            longitud: location.longitude,
            direccion: location.address,
        }));
        setShowMapModal(false);

        // Limpiar error de ubicación si existe
        if (errors.ubicacion) {
            setErrors((prev) => ({ ...prev, ubicacion: '' }));
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="bg-secondary px-4 py-3">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={onBack} className="flex-row items-center">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="mr-6 flex-1 text-center text-2xl font-bold text-white">
                        {t('editReportTitle') || 'Editar Reporte'}
                    </Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Título */}
                <View className="mt-6">
                    <Text className="mb-2 text-lg font-semibold text-white">
                        {t('formTitleLabel') || 'Título'}
                    </Text>
                    <TextInput
                        className="rounded-lg bg-secondary p-4 text-white"
                        placeholder={t('formTitlePlaceholder') || 'Ingrese un título descriptivo'}
                        placeholderTextColor="#9CA3AF"
                        value={formData.titulo}
                        onChangeText={(text) => setFormData((prev) => ({ ...prev, titulo: text }))}
                        maxLength={50}
                    />
                    {errors.titulo && (
                        <Text className="mt-1 text-sm text-red-400">{errors.titulo}</Text>
                    )}
                </View>

                {/* Descripción */}
                <View className="mt-4">
                    <Text className="mb-2 text-lg font-semibold text-white">
                        {t('formDescriptionLabel') || 'Descripción'}
                    </Text>
                    <TextInput
                        className="rounded-lg bg-secondary p-4 text-white"
                        placeholder={
                            t('formDescriptionPlaceholder') || 'Describa detalladamente el problema'
                        }
                        placeholderTextColor="#9CA3AF"
                        value={formData.descripcion}
                        onChangeText={(text) =>
                            setFormData((prev) => ({ ...prev, descripcion: text }))
                        }
                        multiline
                        numberOfLines={4}
                        maxLength={3000}
                        style={{ minHeight: 100 }}
                    />
                    {errors.descripcion && (
                        <Text className="mt-1 text-sm text-red-400">{errors.descripcion}</Text>
                    )}
                </View>

                {/* Nivel de Urgencia */}
                <View className="mt-4">
                    <Text className="mb-2 text-lg font-semibold text-white">
                        {t('formUrgencyLabel') || 'Nivel de Urgencia'}
                    </Text>
                    <View className="flex-row justify-between">
                        {[
                            { id: '1', label: 'Baja', color: '#10b981' },
                            { id: '2', label: 'Media', color: '#f59e0b' },
                            { id: '3', label: 'Alta', color: '#ef4444' },
                        ].map((urgency) => (
                            <TouchableOpacity
                                key={urgency.id}
                                className={`mx-1 flex-1 rounded-lg p-3 ${
                                    formData.urgencia === urgency.id
                                        ? 'border-2'
                                        : 'border border-gray-600'
                                }`}
                                style={{
                                    backgroundColor:
                                        formData.urgencia === urgency.id
                                            ? urgency.color + '20'
                                            : '#1F2937',
                                    borderColor:
                                        formData.urgencia === urgency.id
                                            ? urgency.color
                                            : '#4B5563',
                                }}
                                onPress={() =>
                                    setFormData((prev) => ({ ...prev, urgencia: urgency.id }))
                                }>
                                <Text
                                    className="text-center font-semibold"
                                    style={{
                                        color:
                                            formData.urgencia === urgency.id
                                                ? urgency.color
                                                : '#9CA3AF',
                                    }}>
                                    {urgency.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Tipo de Denuncia - ACTUALIZADO */}
                <View className="mt-4">
                    <Text className="mb-2 text-lg font-semibold text-white">
                        {t('formTypeLabel') || 'Tipo de Denuncia'}
                    </Text>
                    <View className="rounded-lg bg-secondary">
                        {[
                            {
                                id: '1',
                                label: t('reportTypeStreets') || 'Calles y Veredas en Mal Estado',
                            },
                            {
                                id: '2',
                                label: t('reportTypeLighting') || 'Luz o Alumbrado Público Dañado',
                            },
                            {
                                id: '3',
                                label: t('reportTypeDrainage') || 'Drenaje o Aguas Estancadas',
                            },
                            {
                                id: '4',
                                label:
                                    t('reportTypeParks') ||
                                    'Parques, Plazas o Árboles con Problemas',
                            },
                            {
                                id: '5',
                                label:
                                    t('reportTypeGarbage') || 'Basura, Escombros o Espacios Sucios',
                            },
                            {
                                id: '6',
                                label:
                                    t('reportTypeEmergencies') ||
                                    'Emergencias o Situaciones de Riesgo',
                            },
                            {
                                id: '7',
                                label:
                                    t('reportTypeInfrastructure') ||
                                    'Infraestructura o Mobiliario Público Dañado',
                            },
                        ].map((type, index) => (
                            <TouchableOpacity
                                key={type.id}
                                className={`p-3 ${index < 6 ? 'border-b border-gray-600' : ''}`}
                                onPress={() =>
                                    setFormData((prev) => ({ ...prev, tipo_denuncia: type.id }))
                                }>
                                <View className="flex-row items-center justify-between">
                                    <Text className="flex-1 pr-2 text-white">{type.label}</Text>
                                    <Ionicons
                                        name={
                                            formData.tipo_denuncia === type.id
                                                ? 'radio-button-on'
                                                : 'radio-button-off'
                                        }
                                        size={20}
                                        color={
                                            formData.tipo_denuncia === type.id
                                                ? '#537CF2'
                                                : '#9CA3AF'
                                        }
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Ubicación */}
                <View className="mt-4">
                    <Text className="mb-2 text-lg font-semibold text-white">
                        {t('formLocationLabel') || 'Ubicación'}
                    </Text>
                    <View className="rounded-lg bg-secondary p-4">
                        <Text className="mb-2 text-white">{formData.direccion}</Text>
                        <Text className="mb-3 text-sm text-gray-400">
                            Lat: {formData.latitud.toFixed(6)}, Lng: {formData.longitud.toFixed(6)}
                        </Text>
                        <TouchableOpacity
                            className="rounded-lg bg-[#537CF2] p-3"
                            onPress={() => setShowMapModal(true)}>
                            <View className="flex-row items-center justify-center">
                                <Ionicons name="location-outline" size={18} color="white" />
                                <Text className="ml-2 font-medium text-white">
                                    {t('formSelectLocation') || 'Cambiar Ubicación'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        {errors.ubicacion && (
                            <Text className="mt-2 text-sm text-red-400">{errors.ubicacion}</Text>
                        )}
                    </View>
                </View>

                {/* Botones de acción */}
                <View className="mt-6 flex-row justify-between gap-4">
                    <TouchableOpacity
                        className="flex-1 rounded-lg bg-gray-600 p-4"
                        onPress={onBack}>
                        <Text className="text-center font-semibold text-white">
                            {t('cancel') || 'Cancelar'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 rounded-lg bg-[#537CF2] p-4"
                        onPress={handleUpdate}
                        disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-center font-semibold text-white">
                                {t('updateReport') || 'Actualizar'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal del mapa */}
            <ModalMap
                visible={showMapModal}
                onClose={() => setShowMapModal(false)}
                mode="select"
                onLocationSelect={handleLocationSelect}
                title={t('selectLocationTitle') || 'Seleccionar Ubicación'}
                initialLocation={{
                    latitude: formData.latitud,
                    longitude: formData.longitud,
                    address: formData.direccion,
                }}
            />
        </SafeAreaView>
    );
}
