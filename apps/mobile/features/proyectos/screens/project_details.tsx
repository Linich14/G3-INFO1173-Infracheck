import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ReportsView from './AssociatedReports';
import ReportProblem from './report_problem';
import ProjectsService from '../services/ProjectsService';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ProjectDetailsProps {
    project: {
        id: number;
        lugar: string;
        estado: string;
        color: string;
        prioridad?: string;
        reportesAsociados?: number;
        votosAFavor?: number;
        tipoDenuncia?: string;
    };
    onBack?: () => void; // Ahora es opcional
}

export default function ProjectDetails({ project, onBack }: ProjectDetailsProps) {
    const { t } = useLanguage();
    const [showReports, setShowReports] = useState(false);
    const [showReportProblem, setShowReportProblem] = useState(false);
    const [projectDetails, setProjectDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Estados disponibles
    const estadosDisponibles = [
        { id: 1, nombre: t('projectUpdateStatusPlanning'), color: 'bg-blue-600', icon: 'clipboard-outline' },
        { id: 2, nombre: t('projectUpdateStatusInProgress'), color: 'bg-yellow-600', icon: 'construct-outline' },
        { id: 3, nombre: t('projectUpdateStatusCompleted'), color: 'bg-green-600', icon: 'checkmark-circle-outline' },
        { id: 4, nombre: t('projectUpdateStatusCanceled'), color: 'bg-red-600', icon: 'close-circle-outline' },
        { id: 5, nombre: t('projectUpdateStatusPending'), color: 'bg-gray-600', icon: 'time-outline' },
        { id: 6, nombre: t('projectUpdateStatusApproved'), color: 'bg-teal-600', icon: 'thumbs-up-outline' },
        { id: 7, nombre: t('projectUpdateStatusRejected'), color: 'bg-orange-600', icon: 'thumbs-down-outline' },
    ];

    // Cargar detalles completos del proyecto
    useEffect(() => {
        loadProjectDetails();
    }, [project.id]);

    const loadProjectDetails = async () => {
        try {
            setLoading(true);
            const detalles = await ProjectsService.fetchById(project.id);
            setProjectDetails(detalles);
        } catch (error) {
            console.error('Error al cargar detalles del proyecto:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Maneja la navegación hacia atrás
     * Si onBack está definido, lo usa (modo componente embebido)
     * Si no, usa router.back() (modo ruta independiente)
     */
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    const handleShowReports = () => {
        setShowReports(true);
    };

    const handleBackFromReports = () => {
        setShowReports(false);
    };

    const handleShowReportProblem = () => {
        setShowReportProblem(true);
    };

    const handleBackFromReportProblem = () => {
        setShowReportProblem(false);
    };

    const handleProblemReported = (reportData: any) => {
        // Aquí podrías enviar el reporte al backend relacionado al proyecto
        console.log('Problema reportado para proyecto:', project.id, reportData);
        setShowReportProblem(false);
    };

    const handleShowStatusModal = () => {
        setShowStatusModal(true);
    };

    const handleUpdateStatus = async (estadoId: number) => {
        try {
            setUpdatingStatus(true);
            
            // Actualizar estado en el backend
            await ProjectsService.updateStatus(project.id, estadoId as 1 | 2 | 3 | 4 | 5 | 6 | 7);
            
            // Recargar detalles del proyecto
            await loadProjectDetails();
            
            setShowStatusModal(false);
            
            Alert.alert(
                t('projectUpdateStatusSuccess'),
                t('projectUpdateStatusSuccessMessage'),
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            console.error('Error al actualizar estado:', error);
            Alert.alert(
                t('projectUpdateStatusError'),
                error?.message || t('projectUpdateStatusErrorMessage'),
                [{ text: 'OK' }]
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (showReports) {
        return (
            <ReportsView
                projectId={project.id}
                projectName={project.lugar}
                onBack={handleBackFromReports}
            />
        );
    }

    if (showReportProblem) {
        return (
            <ReportProblem
                onBack={handleBackFromReportProblem}
                onProblemReported={handleProblemReported}
            />
        );
    }
    return (
        <View className="flex-1 bg-black px-4 pt-10">
            {/* Header */}
            <View className="mb-6 flex-row items-center">
                <TouchableOpacity className="rounded-xl bg-[#537CF2] p-2" onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-bold text-white">{t('projectDetailsTitle')}</Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#537CF2" />
                    <Text className="mt-4 text-gray-400">{t('projectDetailsLoading')}</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Información Principal */}
                    <View className="mb-6 rounded-xl bg-[#13161E] p-6">
                        <View className="mb-4 flex-row items-center">
                            <Ionicons name="location" size={24} color="#60A5FA" />
                            <Text className="ml-3 text-xl font-bold text-white">{project.lugar}</Text>
                        </View>

                        <View className="mb-4 flex-row items-center justify-between">
                            <Text className="text-gray-400">{t('projectDetailsStatus')}:</Text>
                            <Text className={`rounded-md px-3 py-1 text-white ${project.color}`}>
                                {project.estado}
                            </Text>
                        </View>

                        {project.prioridad && (
                            <View className="mb-4 flex-row items-center justify-between">
                                <Text className="text-gray-400">{t('projectDetailsPriority')}:</Text>
                                <Text className={`rounded-md px-3 py-1 text-white ${project.color}`}>
                                    {project.prioridad}
                                </Text>
                            </View>
                        )}

                        <View className="mb-3 flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <Ionicons name="calendar" size={16} color="#9CA3AF" />
                                <Text className="ml-2 text-gray-400">{t('projectDetailsEstimatedStartDate')}:</Text>
                            </View>
                            <Text className="text-white">
                                {projectDetails?.fechaInicioEstimada 
                                    ? new Date(projectDetails.fechaInicioEstimada).toLocaleDateString('es-ES')
                                    : t('projectDetailsNotSpecified')}
                            </Text>
                        </View>

                    <View className="mb-3 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="document-text" size={16} color="#9CA3AF" />
                            <Text className="ml-2 text-gray-400">{t('projectDetailsAssociatedReports')}:</Text>
                        </View>
                        <Text className="text-white">
                            {projectDetails?.reportesAsociados || (projectDetails?.denuncia_id ? 1 : 0)}
                        </Text>
                    </View>

                    <View className="mb-3 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="arrow-up" size={16} color="#9CA3AF" />
                            <Text className="ml-2 text-gray-400">{t('projectDetailsVotesInFavor')}:</Text>
                        </View>
                        <Text className="text-white">{projectDetails?.votosAFavor || 0}</Text>
                    </View>

                    {project.tipoDenuncia && (
                        <View className="mb-3 flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <Ionicons name="flag" size={16} color="#9CA3AF" />
                                <Text className="ml-2 text-gray-400">{t('projectDetailsReportType')}:</Text>
                            </View>
                            <Text className="text-white">{project.tipoDenuncia}</Text>
                        </View>
                    )}

                    {/* Descripción */}
                    {projectDetails?.descripcion && (
                        <View className="mt-4 rounded-lg bg-[#1D212D] p-4">
                            <Text className="mb-2 text-sm font-bold text-blue-400">{t('projectDetailsDescription')}</Text>
                            <Text className="leading-5 text-gray-300">
                                {projectDetails.descripcion}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Acciones */}
                <View className="mb-6 rounded-xl bg-[#13161E] p-6">
                    <Text className="mb-4 text-lg font-bold text-blue-400">{t('projectDetailsActions')}</Text>
                    
                    <TouchableOpacity
                        className="mb-3 flex-row items-center rounded-lg bg-[#537CF2] p-4"
                        onPress={handleShowStatusModal}>
                        <Ionicons name="sync" size={20} color="white" />
                        <Text className="ml-3 font-semibold text-white">{t('projectDetailsUpdateStatus')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="mb-3 flex-row items-center rounded-lg bg-[#537CF2] p-4"
                        onPress={handleShowReports}>
                        <Ionicons name="document-text" size={20} color="white" />
                        <Text className="ml-3 font-semibold text-white">{t('projectDetailsViewReports')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center rounded-lg bg-[#537CF2] p-4"
                        onPress={handleShowReportProblem}>
                        <Ionicons name="alert-circle" size={20} color="white" />
                        <Text className="ml-3 font-semibold text-white">{t('projectDetailsReportProblem')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            )}

            {/* Modal de Actualización de Estado */}
            <Modal
                visible={showStatusModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowStatusModal(false)}>
                <View className="flex-1 bg-black/80 items-center justify-center px-4">
                    <View className="w-full max-w-md rounded-xl bg-[#13161E] p-6">
                        {/* Header */}
                        <View className="mb-6 flex-row items-center justify-between">
                            <Text className="text-xl font-bold text-white">{t('projectUpdateStatusTitle')}</Text>
                            <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Estado Actual */}
                        <View className="mb-6 rounded-lg bg-[#1D212D] p-4">
                            <Text className="mb-2 text-sm text-gray-400">{t('projectUpdateStatusCurrent')}</Text>
                            <View className="flex-row items-center">
                                <View className={`mr-3 h-3 w-3 rounded-full ${project.color}`} />
                                <Text className="text-lg font-bold text-white">{project.estado}</Text>
                            </View>
                        </View>

                        {/* Lista de Estados */}
                        <Text className="mb-3 text-sm font-bold text-gray-400">{t('projectUpdateStatusSelectNew')}</Text>
                        <ScrollView className="max-h-80">
                            {estadosDisponibles.map((estado) => (
                                <TouchableOpacity
                                    key={estado.id}
                                    className="mb-2 flex-row items-center rounded-lg bg-[#1D212D] p-4"
                                    onPress={() => handleUpdateStatus(estado.id)}
                                    disabled={updatingStatus}>
                                    <View className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${estado.color}`}>
                                        <Ionicons name={estado.icon as any} size={20} color="white" />
                                    </View>
                                    <Text className="flex-1 font-semibold text-white">{estado.nombre}</Text>
                                    {updatingStatus && (
                                        <ActivityIndicator size="small" color="#537CF2" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Botón Cancelar */}
                        <TouchableOpacity
                            className="mt-4 rounded-lg bg-[#1D212D] p-4"
                            onPress={() => setShowStatusModal(false)}
                            disabled={updatingStatus}>
                            <Text className="text-center font-semibold text-white">{t('projectUpdateStatusCancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
