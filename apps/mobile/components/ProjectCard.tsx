import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import type { Project } from '../features/proyectos/services/ProjectsService';
import { useLanguage } from '~/contexts/LanguageContext';

type Props = {
  project: Project;
  onPress?: (p: Project) => void;
};

export default function ProjectCard({ project, onPress }: Props) {
  const router = useRouter();
  const { t } = useLanguage();

  const open = () => {
    if (onPress) return onPress(project);
    router.push({ pathname: '/(tabs)/proyect/[id]', params: { id: String(project.id) } });
  };

  const openReport = () => {
    if (!project.denuncia_id) return;
    router.push({ pathname: '/(tabs)/report/[id]', params: { id: String(project.denuncia_id) } });
  };

  const progreso = project.progreso ?? 0;
  const startDate = project.fechaInicioEstimada ? new Date(project.fechaInicioEstimada).toLocaleDateString() : '-';
  const created = project.fechaCreacion ? new Date(project.fechaCreacion).toLocaleDateString() : '-';

  return (
    <TouchableOpacity onPress={open} className="mb-3 rounded-lg bg-[#1D212D] p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="mb-2 flex-row items-center">
            <Text className="ml-2 flex-1 font-medium text-white">{project.lugar || project.titulo || t('projectUntitled')}</Text>
          </View>

          <View className="mb-2 flex-row items-center">
            <Text className={`rounded-md px-2 py-1 text-xs text-white ${project.color || 'bg-gray-700'}`}>{project.estado || t('projectUnknownStatus')}</Text>
            <Text className={`ml-2 rounded-md px-2 py-1 text-xs text-white ${project.color || 'bg-gray-700'}`}>
              {project.prioridad || t('projectPriorityNormal')}
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
          <Text className="text-primary-600">{t('projectViewDetails')}</Text>
        </TouchableOpacity>

        {project.denuncia_id ? (
          <TouchableOpacity onPress={openReport} className="px-3 py-1">
            <Text className="text-gray-600 underline text-sm">{t('projectOriginReport')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
