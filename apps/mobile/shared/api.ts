import axios from 'axios';
import { getToken, removeToken } from '~/features/auth/services/authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Crear instancia de axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
    '/api/v1/login/',
    '/api/v1/register/',
    '/api/v1/password-reset/request/',
    '/api/v1/password-reset/verify-code/',
    '/api/v1/password-reset/reset/',
    '/api/v1/verify-token/', // No aplicar interceptor aquí
    '/api/v1/refresh-token/', // No aplicar interceptor aquí
];

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let failedQueue: {
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Interceptor para agregar el token automáticamente
api.interceptors.request.use(
    async (config) => {
        try {
            // No agregar token a rutas públicas
            const isPublicRoute = PUBLIC_ROUTES.some(route => config.url?.includes(route));
            
            if (!isPublicRoute) {
                const token = await getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (error) {
            console.error('Error getting token:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // No reintentar rutas públicas o requests ya reintentados
        if (!originalRequest || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Solo manejar 401 para rutas protegidas
        const isPublicRoute = PUBLIC_ROUTES.some(route => originalRequest.url?.includes(route));
        
        if (error.response?.status === 401 && !isPublicRoute) {
            // Si ya hay un refresh en proceso, agregar a la cola
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        const token = getToken();
                        if (token) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Token expirado o inválido - cerrar sesión directamente
                // No intentar refrescar para evitar loops
                await removeToken();
                processQueue(new Error('Session expired'));
                
                // Rechazar el request original
                return Promise.reject(error);
            } catch (refreshError) {
                processQueue(refreshError);
                await removeToken();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
