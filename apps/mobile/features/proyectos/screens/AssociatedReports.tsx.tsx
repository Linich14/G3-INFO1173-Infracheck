import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReportsStatistics from './ReportsStatistics';

interface Report {
    id: number;
    titulo: string;
    descripcion: string;
    fecha: string;
    usuario: string;
    votos: number;
    ubicacionEspecifica: string;
}

interface ReportsViewProps {
    projectId: number;
    projectName: string;
    onBack: () => void;
}

// Datos falsos de ejemplo - después los reemplazarás con datos reales
const reportesEjemplo: Report[] = [
    {
        id: 1,
        titulo: 'Bache profundo en intersección',
        descripcion:
            'Hay un bache muy profundo que puede dañar los vehículos. Es urgente repararlo.',
        fecha: '2024-09-05',
        usuario: 'Juan Pérez',
        votos: 23,
        ubicacionEspecifica: 'Esquina de Av. Alemania con Prat',
    },
    {
        id: 2,
        titulo: 'Un bache qlo malo weon',
        descripcion: 'La calle presenta irregularidades que dificultan el tránsito de peatones.',
        fecha: '2024-09-03',
        usuario: 'María González',
        votos: 15,
        ubicacionEspecifica: 'Frente al edificio municipal',
    },
    {
        id: 3,
        titulo: 'Yapo muni pa cuando el bache',
        descripcion: 'Hice mierda el auto por ese bache',
        fecha: '2024-09-01',
        usuario: 'Carlos Silva',
        votos: 8,
        ubicacionEspecifica: 'Cerca del semáforo principal',
    },
];

export default function ReportsView({ projectId, projectName, onBack }: ReportsViewProps) {
    const totalVotos = reportesEjemplo.reduce((sum, report) => sum + report.votos, 0);
    const [showStatistics, setShowStatistics] = useState(false);

    // Si está mostrando estadísticas, renderizar la vista de estadísticas
    if (showStatistics) {
        return (
            <ReportsStatistics
                projectId={projectId}
                projectName={projectName}
                onBack={() => setShowStatistics(false)}
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
                <Text className="ml-4 text-xl font-bold text-white">Reportes Asociados</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Resumen del Proyecto */}
                <View className="mb-6 rounded-xl bg-neutral-900 p-6">
                    <Text className="mb-3 text-lg font-bold text-blue-400">
                        Proyecto: {projectName}
                    </Text>

                    <View className="mb-3 flex-row justify-between">
                        <View className="mr-2 flex-1 rounded-lg bg-neutral-800 p-3">
                            <Text className="text-center text-gray-400">Total Reportes</Text>
                            <Text className="text-center text-2xl font-bold text-white">
                                {reportesEjemplo.length}
                            </Text>
                        </View>
                        <View className="ml-2 flex-1 rounded-lg bg-neutral-800 p-3">
                            <Text className="text-center text-gray-400">Total Votos</Text>
                            <Text className="text-center text-2xl font-bold text-white">
                                {totalVotos}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Lista de Reportes */}
                <View className="mb-6">
                    <Text className="mb-4 text-lg font-bold text-blue-400">
                        Reportes Individuales
                    </Text>

                    {reportesEjemplo.map((reporte) => (
                        <TouchableOpacity
                            key={reporte.id}
                            className="mb-4 rounded-xl bg-neutral-900 p-4">
                            {/* Header del reporte */}
                            <View className="mb-3 flex-row items-start justify-between">
                                <Text className="flex-1 pr-2 text-lg font-semibold text-white">
                                    {reporte.titulo}
                                </Text>
                                <View className="flex-row items-center">
                                    <Ionicons name="arrow-up" size={16} color="#60A5FA" />
                                    <Text className="ml-1 font-semibold text-blue-400">
                                        {reporte.votos}
                                    </Text>
                                </View>
                            </View>

                            {/* Información del reporte */}
                            <Text className="mb-3 leading-5 text-gray-300">
                                {reporte.descripcion}
                            </Text>

                            {/* Ubicación específica */}
                            <View className="mb-3 flex-row items-center">
                                <Ionicons name="location" size={14} color="#9CA3AF" />
                                <Text className="ml-2 text-sm text-gray-400">
                                    {reporte.ubicacionEspecifica}
                                </Text>
                            </View>

                            {/* Footer del reporte */}
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Ionicons name="person" size={14} color="#9CA3AF" />
                                    <Text className="ml-1 text-sm text-gray-400">
                                        {reporte.usuario}
                                    </Text>
                                    <Text className="ml-3 text-sm text-gray-400">
                                        {reporte.fecha}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Acciones */}
                <View className="mb-6 rounded-xl bg-neutral-900 p-6">
                    <Text className="mb-4 text-lg font-bold text-blue-400">Acciones</Text>

                    <TouchableOpacity
                        className="mb-3 flex-row items-center rounded-lg bg-purple-600 p-4"
                        onPress={() => setShowStatistics(true)}>
                        <Ionicons name="analytics" size={20} color="white" />
                        <Text className="ml-3 font-semibold text-white">Ver Estadísticas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center rounded-lg bg-orange-600 p-4">
                        <Ionicons name="download" size={20} color="white" />
                        <Text className="ml-3 font-semibold text-white">Exportar Reportes</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
