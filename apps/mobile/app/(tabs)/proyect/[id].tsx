import { useLocalSearchParams } from 'expo-router';
import ProjectDetails from '~/features/proyectos/screens/project_details';

/**
 * Ruta dinámica para ver detalles de un proyecto específico
 * URL: /(tabs)/proyect/[id]
 * Ejemplo: /(tabs)/proyect/123
 */
export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  
  // TODO: En producción, obtener el proyecto desde la API usando el id
  // const project = await fetchProjectById(id);
  
  // Por ahora, datos de ejemplo (debería venir de la API o estado global)
  const mockProject = {
    id: Number(id) || 1,
    lugar: 'Proyecto de ejemplo',
    estado: 'En Progreso',
    color: 'bg-blue-600',
    prioridad: 'Alta',
    reportesAsociados: 5,
    votosAFavor: 42,
    tipoDenuncia: 'Infraestructura',
  };

  return <ProjectDetails project={mockProject} />;
}
