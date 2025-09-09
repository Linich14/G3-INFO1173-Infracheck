import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProjectDetails from './project_details';

interface PriorityItem {
    id: number;
    lugar: string;
    prioridad: string;
    color: string;
}

interface ProjectItem {
    id: number;
    lugar: string;
    estado: string;
    color: string;
    prioridad?: string;
    reportesAsociados?: number;
    votosAFavor?: number;
}

const dataPrioridad: PriorityItem[] = [
    { id: 1, lugar: 'Centro Temuco', prioridad: 'Muy Importante', color: 'bg-red-800' },
    { id: 2, lugar: 'Centro Temuco', prioridad: 'Importante', color: 'bg-yellow-700' },
    { id: 3, lugar: 'Centro Temuco', prioridad: 'Normal', color: 'bg-blue-700' },
];

const dataProyectos: ProjectItem[] = [
    {
        id: 1,
        lugar: 'Calle esquina Alemania con Prat',
        estado: 'En Progreso',
        color: 'bg-purple-700',
        reportesAsociados: 3,
        votosAFavor: 46,
    },
    {
        id: 2,
        lugar: 'Calle 2',
        estado: 'Completado',
        color: 'bg-green-800',
        reportesAsociados: 5,
        votosAFavor: 82,
    },
    {
        id: 3,
        lugar: 'Plaza central',
        estado: 'Pendiente',
        color: 'bg-blue-700',
        reportesAsociados: 2,
        votosAFavor: 15,
    },
    {
        id: 4,
        lugar: 'Avenida Siempre Viva',
        estado: 'Aprobado',
        color: 'bg-yellow-700',
        reportesAsociados: 1,
        votosAFavor: 7,
    },
    {
        id: 5,
        lugar: 'Calle Falsa X',
        estado: 'Rechazado',
        color: 'bg-gray-700',
        reportesAsociados: 4,
        votosAFavor: 23,
    },
];

export default function App() {
    const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const handleProjectSelect = (project: ProjectItem) => {
        setSelectedProject(project);
        setShowDetails(true);
    };

    const handleBackToList = () => {
        setShowDetails(false);
        setSelectedProject(null);
    };

    const handlePrioritySelect = (item: PriorityItem) => {
        const projectFromPriority: ProjectItem = {
            ...item,
            estado: `Prioridad ${item.prioridad}`,
        };
        handleProjectSelect(projectFromPriority);
    };

    if (showDetails && selectedProject) {
        return <ProjectDetails project={selectedProject} onBack={handleBackToList} />;
    }

    return (
        <View className="flex-1 bg-black px-4 pt-10">
            {/* Header */}
            <View className="mb-4 flex-row items-center">
                <TouchableOpacity className="rounded-xl bg-blue-500 p-2">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-bold text-white">Proyectos</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Sección Prioridad */}
                <View className="mb-4 rounded-xl bg-neutral-900 p-4">
                    <Text className="mb-2 text-lg font-bold text-blue-400">Prioridad</Text>
                    {dataPrioridad.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            className="mb-2 flex-row items-center justify-between rounded-lg bg-neutral-800 p-3"
                            onPress={() => handlePrioritySelect(item)}>
                            <Ionicons name="grid" size={20} color="white" />
                            <Text className="ml-3 flex-1 text-white">{item.lugar}</Text>
                            <Text className={`rounded-md px-2 text-white ${item.color}`}>
                                {item.prioridad}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sección Proyectos */}
                <View className="rounded-xl bg-neutral-900 p-4">
                    <Text className="mb-2 text-lg font-bold text-blue-400">Proyectos</Text>
                    {dataProyectos.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            className="mb-2 flex-row items-center justify-between rounded-lg bg-neutral-800 p-3"
                            onPress={() => handleProjectSelect(item)}>
                            <Ionicons name="grid" size={20} color="white" />
                            <Text className="ml-3 flex-1 text-white">{item.lugar}</Text>
                            <Text className={`rounded-md px-2 text-white ${item.color}`}>
                                {item.estado}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
