import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReportsView from './AssociatedReports.tsx';
import ReportProblem from './report_problem';

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
    onBack: () => void;
}

export default function ProjectDetails({ project, onBack }: ProjectDetailsProps) {
    const [showReports, setShowReports] = useState(false);
    const [showReportProblem, setShowReportProblem] = useState(false);

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
                <TouchableOpacity className="rounded-xl bg-blue-500 p-2" onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-bold text-white">Detalles del Proyecto</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Información Principal */}
                <View className="mb-6 rounded-xl bg-neutral-900 p-6">
                    <View className="mb-4 flex-row items-center">
                        <Ionicons name="location" size={24} color="#60A5FA" />
                        <Text className="ml-3 text-xl font-bold text-white">{project.lugar}</Text>
                    </View>

                    <View className="mb-4 flex-row items-center justify-between">
                        <Text className="text-gray-400">Estado:</Text>
                        <Text className={`rounded-md px-3 py-1 text-white ${project.color}`}>
                            {project.estado}
                        </Text>
                    </View>

                    {project.prioridad && (
                        <View className="mb-4 flex-row items-center justify-between">
                            <Text className="text-gray-400">Prioridad:</Text>
                            <Text className={`rounded-md px-3 py-1 text-white ${project.color}`}>
                                {project.prioridad}
                            </Text>
                        </View>
                    )}

                    <View className="mb-3 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="calendar" size={16} color="#9CA3AF" />
                            <Text className="ml-2 text-gray-400">Fecha de inicio:</Text>
                        </View>
                        <Text className="text-white">15/08/2024</Text>
                    </View>

                    <View className="mb-3 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="time" size={16} color="#9CA3AF" />
                            <Text className="ml-2 text-gray-400">Duración estimada:</Text>
                        </View>
                        <Text className="text-white">6 meses</Text>
                    </View>

                    <View className="mb-3 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="document-text" size={16} color="#9CA3AF" />
                            <Text className="ml-2 text-gray-400">Reportes asociados:</Text>
                        </View>
                        <Text className="text-white">{project.reportesAsociados || 0}</Text>
                    </View>

                    <View className="mb-3 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="arrow-up" size={16} color="#9CA3AF" />
                            <Text className="ml-2 text-gray-400">Votos a favor:</Text>
                        </View>
                        <Text className="text-white">{project.votosAFavor || 0}</Text>
                    </View>

                    {project.tipoDenuncia && (
                        <View className="mb-3 flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <Ionicons name="flag" size={16} color="#9CA3AF" />
                                <Text className="ml-2 text-gray-400">Tipo de denuncia:</Text>
                            </View>
                            <Text className="text-white">{project.tipoDenuncia}</Text>
                        </View>
                    )}

                    {/* Descripción */}
                    <View className="mb-6 rounded-xl bg-neutral-900 p-6">
                        <Text className="mb-3 text-lg font-bold text-blue-400">Descripción</Text>
                        <Text className="leading-6 text-gray-300">
                            Este proyecto se encuentra ubicado en {project.lugar} y actualmente
                            tiene un estado de {project.estado.toLowerCase()}. Se requiere
                            seguimiento continuo para asegurar el cumplimiento de los objetivos
                            establecidos.
                        </Text>
                    </View>
                </View>

                {/* Acciones */}
                <View className="mb-6 rounded-xl bg-neutral-900 p-6">
                    <Text className="mb-4 text-lg font-bold text-blue-400">Acciones</Text>

                    <TouchableOpacity
                        className="mb-3 flex-row items-center rounded-lg bg-blue-600 p-4"
                        onPress={handleShowReports}>
                        <Ionicons name="document-text" size={20} color="white" />
                        <Text className="ml-3 font-semibold text-white">Reportes asociados</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center rounded-lg bg-red-600 p-4"
                        onPress={handleShowReportProblem}>
                        <Ionicons name="alert-circle" size={20} color="white" />
                        <Text className="ml-3 font-semibold text-white">Reportar Problema</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
