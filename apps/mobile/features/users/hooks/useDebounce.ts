import { useState, useEffect } from 'react';

/**
 * Hook personalizado para implementar debounce en búsquedas
 * @param value - Valor a debounce
 * @param delay - Retraso en milisegundos (por defecto 500ms)
 * @returns - Valor debouncedo
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Crear timer que actualizará el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timeout si el valor cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}