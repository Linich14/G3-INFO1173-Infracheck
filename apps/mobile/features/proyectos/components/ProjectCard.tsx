import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import type { Project } from '../services/ProjectsService';

type Props = {
  project: Project;
  onPress?: (p: Project) => void;
};

const estadoLabels: Record<string, string> = {
  '1': 'Planificación',
};

const prioridadLabels: Record<string, { label: string; color: string }> = {
  Normal: { label: 'Normal', color: 'bg-gray-200' },
  Importante: { label: 'Importante', color: 'bg-yellow-300' },
  'Muy Importante': { label: 'Urgente', color: 'bg-red-400' },
};

export default function ProjectCard({ project, onPress }: Props) {
  const router = useRouter();

  const open = () => {
    if (onPress) return onPress(project);
    router.push({ pathname: '/(tabs)/proyect/[id]', params: { id: String(project.id) } });
  };

  const openReport = () => {
    if (!project.denuncia_id) return;
    router.push({ pathname: '/(tabs)/report/[id]', params: { id: String(project.denuncia_id) } });
  };

  const progreso = 0; // backend doesn't expose progreso yet; keep 0 as fallback
  const startDate = project.fechaInicioEstimada ? new Date(project.fechaInicioEstimada).toLocaleDateString() : '-';
  const created = project.fechaCreacion ? new Date(project.fechaCreacion).toLocaleDateString() : '-';

  return (
    <TouchableOpacity onPress={open} className="mb-3 rounded-lg bg-[#1D212D] p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="mb-2 flex-row items-center">
            <Text className="ml-2 flex-1 font-medium text-white">{project.lugar || project.titulo || 'Sin título'}</Text>
          </View>

          <View className="mb-2 flex-row items-center">
            <Text className={`rounded-md px-2 py-1 text-xs text-white ${project.color || 'bg-gray-700'}`}>{project.estado || 'Desconocido'}</Text>
            <Text className={`ml-2 rounded-md px-2 py-1 text-xs text-white ${project.color || 'bg-gray-700'}`}>
              {project.prioridad || 'Normal'}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-400">{project.tipoDenuncia}</Text>
            <View className="flex-row items-center">
              <Text className="ml-1 text-xs text-gray-400">{project.votosAFavor || 0}</Text>
              <Text className="ml-3 text-xs text-gray-400">{project.reportesAsociados || 0}</Text>
            </View>
          </View>
        </View>

      </View>

      <View className="w-full bg-gray-200 h-2 mt-3 rounded-full overflow-hidden">
        <View style={{ width: `${progreso}%` }} className="h-2 bg-green-500" />
      </View>

      <View className="flex-row justify-between mt-3">
        <TouchableOpacity onPress={open} className="px-3 py-1">
          <Text className="text-primary-600">Ver detalle</Text>
        </TouchableOpacity>

        {project.denuncia_id ? (
          <TouchableOpacity onPress={openReport} className="px-3 py-1">
            <Text className="text-gray-600 underline text-sm">Reporte origen</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
