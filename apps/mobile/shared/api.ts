import axios from 'axios';
import { getToken, removeToken, refreshToken } from '~/features/auth/services/authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Crear instancia de axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
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

        // Solo manejar 401 para refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshSuccess = await refreshToken();

                if (refreshSuccess) {
                    const newToken = await getToken();
                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return api(originalRequest);
                    }
                }

                await removeToken();
            } catch (refreshError) {
                await removeToken();
            }
        }

        return Promise.reject(error);
    }
);

export default api;
