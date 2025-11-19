import { useUserContext } from '~/contexts/UserContext';

/**
 * Hook para acceder a los datos del usuario desde el contexto global.
 * Esto evita llamadas múltiples e innecesarias al API.
 * 
 * @returns {object} Datos del usuario, loading, error, y funciones de actualización
 */
export const useUser = () => {
  return useUserContext();
};
