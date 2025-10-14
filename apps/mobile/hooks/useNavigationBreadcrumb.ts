import { useEffect, useRef } from 'react';
import { usePathname, useSegments } from 'expo-router';

export function useNavigationBreadcrumb() {
  const segments = useSegments();
  const pathname = usePathname();
  const previousPath = useRef<string>('');

  useEffect(() => {
    if (__DEV__ === false) return;
    const currentPath = pathname || '/';
    if (currentPath === previousPath.current) return;
    previousPath.current = currentPath;
    const breadcrumb = segments.length > 0 
      ? segments.join(' > ') 
      : 'root';
    const timestamp = new Date().toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });

    // Log formateado en terminal
    console.log('========================================');
    console.log(`[${timestamp}]`);
    console.log(`Ruta: ${currentPath}`);
    console.log(`Breadcrumb: ${breadcrumb}`);
    console.log(`Segmentos: [${segments.map(s => `"${s}"`).join(', ')}]`);
    console.log('========================================\n');

  }, [segments, pathname]);
}
