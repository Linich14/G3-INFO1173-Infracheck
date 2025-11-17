import React from 'react';
import { View, Text, ScrollView, Image, Pressable, Modal, Alert } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ReportPreviewData } from '../types';
import { useLanguage } from '~/contexts/LanguageContext';

interface ReportPreviewProps {
    visible: boolean;
    data: ReportPreviewData;
    onClose: () => void;
    onConfirm: () => void;
    onEdit: () => void;
    loading?: boolean;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({
    visible,
    data,
    onClose,
    onConfirm,
    onEdit,
    loading = false,
}) => {
    const { t } = useLanguage();
    
    const getTipoDenunciaLabel = (value: string) => {
        const tipos: Record<string, string> = {
            '1': t('reportFormType1'),
            '2': t('reportFormType2'),
            '3': t('reportFormType3'),
            '6': t('reportFormType6'),
            '7': t('reportFormType7'),
        };
        return tipos[value] || t('reportPreviewNotSelected');
    };

    const getUrgenciaLabel = (value: string) => {
        const urgencias: Record<string, string> = {
            '1': t('homeCardUrgencyLow'),
            '2': t('homeCardUrgencyMedium'),
            '3': t('homeCardUrgencyHigh'),
            '4': t('homeCardUrgencyCritical'),
        };
        return urgencias[value] || t('reportPreviewNotSelected');
    };

    const getCiudadLabel = (value: string) => {
        const ciudades: Record<string, string> = {
            '1': 'Temuco',
        };
        return ciudades[value] || t('reportPreviewNotSelected');
    };

    // Función mejorada para manejar el cierre
    const handleClose = () => {
        if (loading) {
            Alert.alert(
                t('reportPreviewCloseTitle'),
                t('reportPreviewCloseMessage'),
                [
                    { text: t('reportPreviewCloseContinue'), style: 'cancel' },
                    {
                        text: t('reportPreviewCloseCancel'),
                        style: 'destructive',
                        onPress: () => onClose(),
                    },
                ]
            );
            return;
        }
        onClose();
    };

    // Función mejorada para manejar la edición
    const handleEdit = () => {
        if (loading) {
            Alert.alert(
                t('reportPreviewEditDisabledTitle'),
                t('reportPreviewEditDisabledMessage'),
                [{ text: 'OK' }]
            );
            return;
        }

        onEdit();
    };

    // Función para confirmar el envío
    const handleConfirm = () => {
        if (loading) {
            return; // Ya está enviando
        }

        Alert.alert(
            t('reportPreviewConfirmTitle'),
            t('reportPreviewConfirmMessage'),
            [
                { text: t('reportPreviewConfirmReview'), style: 'cancel' },
                {
                    text: t('reportPreviewConfirmButton'),
                    style: 'default',
                    onPress: () => onConfirm(),
                },
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}>
            <View className="flex-1 bg-secondary">
                {/* Header mejorado */}
                <View className="flex-row items-center justify-between bg-tertiary p-4 pt-12">
                    <Pressable
                        onPress={handleClose}
                        className={`rounded-lg p-2 ${loading ? 'opacity-50' : 'hover:bg-white/10'}`}
                        disabled={loading}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                    </Pressable>
                    <Text className="text-lg font-semibold text-white">{t('reportPreviewTitle')}</Text>
                    <Pressable
                        onPress={handleEdit}
                        className={`rounded-lg p-2 ${loading ? 'opacity-50' : 'hover:bg-white/10'}`}
                        disabled={loading}>
                        <MaterialCommunityIcons name="pencil" size={24} color="white" />
                    </Pressable>
                </View>

                <ScrollView className="flex-1 p-4">
                    {/* Información básica */}
                    <View className="mb-4 rounded-lg bg-tertiary p-4">
                        <Text className="mb-2 text-xl font-bold text-white">{data.titulo}</Text>
                        <Text className="mb-3 text-gray-300">{data.descripcion}</Text>

                        <View className="mb-2 flex-row items-center">
                            <MaterialCommunityIcons name="tag" size={20} color="#60a5fa" />
                            <Text className="ml-2 text-white">
                                {t('reportPreviewType')} {getTipoDenunciaLabel(data.tipoDenuncia)}
                            </Text>
                        </View>

                        <View className="mb-2 flex-row items-center">
                            <MaterialCommunityIcons name="alert" size={20} color="#f59e0b" />
                            <Text className="ml-2 text-white">
                                {t('reportPreviewUrgency')} {getUrgenciaLabel(data.urgencia)}
                            </Text>
                        </View>

                        <View className="mb-2 flex-row items-center">
                            <MaterialCommunityIcons name="city" size={20} color="#10b981" />
                            <Text className="ml-2 text-white">
                                {t('reportPreviewCity')} {getCiudadLabel(data.ciudad)}
                            </Text>
                        </View>

                        <View className="mb-2 flex-row items-center">
                            <MaterialCommunityIcons
                                name={data.visible ? 'eye' : 'eye-off'}
                                size={20}
                                color={data.visible ? '#10b981' : '#ef4444'}
                            />
                            <Text className="ml-2 text-white">
                                {data.visible ? t('reportPreviewPublic') : t('reportPreviewPrivate')}
                            </Text>
                        </View>
                    </View>

                    {/* Ubicación */}
                    <View className="mb-4 rounded-lg bg-tertiary p-4">
                        <Text className="mb-3 text-lg font-semibold text-white">{t('reportPreviewLocation')}</Text>

                        <View className="mb-2 flex-row items-center">
                            <MaterialCommunityIcons name="map-marker" size={20} color="#ef4444" />
                            <Text className="ml-2 text-white">
                                {data.direccion || t('reportPreviewNoAddress')}
                            </Text>
                        </View>

                        <View className="mb-2 flex-row items-center">
                            <MaterialCommunityIcons
                                name="crosshairs-gps"
                                size={20}
                                color="#8b5cf6"
                            />
                            <Text className="ml-2 text-white">
                                Lat: {data.latitud.toFixed(6)}, Lng: {data.longitud.toFixed(6)}
                            </Text>
                        </View>
                    </View>

                    {/* Imágenes */}
                    {data.imagenes.length > 0 && (
                        <View className="mb-4 rounded-lg bg-tertiary p-4">
                            <Text className="mb-3 text-lg font-semibold text-white">
                                {t('reportPreviewImages')} ({data.imagenes.length})
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {data.imagenes.map((uri, index) => (
                                    <View key={index} className="mr-3">
                                        <Image
                                            source={{ uri }}
                                            className="h-24 w-24 rounded-lg"
                                            resizeMode="cover"
                                        />
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Video */}
                    {data.video && (
                        <View className="mb-4 rounded-lg bg-tertiary p-4">
                            <Text className="mb-3 text-lg font-semibold text-white">{t('reportPreviewVideo')}</Text>
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons name="video" size={24} color="#60a5fa" />
                                <Text className="ml-2 text-white">{t('reportPreviewVideoAttached')}</Text>
                            </View>
                        </View>
                    )}

                    {/* Mensaje de estado cuando está enviando */}
                    {loading && (
                        <View className="mb-4 rounded-lg bg-blue-900 p-4">
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons name="loading" size={20} color="#60a5fa" />
                                <Text className="ml-2 text-blue-300">
                                    {t('reportPreviewSending')}
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Botones de acción mejorados */}
                <View className="flex-row gap-3 bg-tertiary p-4">
                    <Pressable
                        onPress={handleEdit}
                        className={`flex-1 items-center rounded-lg p-3 ${
                            loading ? 'bg-gray-500 opacity-50' : 'bg-gray-600 active:bg-gray-700'
                        }`}
                        disabled={loading}>
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons
                                name="pencil"
                                size={18}
                                color="white"
                                style={{ marginRight: 6 }}
                            />
                            <Text className="font-semibold text-white">
                                {loading ? t('reportPreviewSending') : t('reportPreviewEdit')}
                            </Text>
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={handleConfirm}
                        className={`flex-1 items-center rounded-lg p-3 ${
                            loading ? 'bg-gray-500 opacity-50' : 'bg-blue-600 active:bg-blue-700'
                        }`}
                        disabled={loading}>
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons
                                name={loading ? 'loading' : 'send'}
                                size={18}
                                color="white"
                                style={{ marginRight: 6 }}
                            />
                            <Text className="font-semibold text-white">
                                {loading ? t('reportPreviewSending') : t('reportPreviewConfirmSend')}
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

export default ReportPreview;
