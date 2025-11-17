import axios from 'axios';
import { API_CONFIG } from '~/constants/config';
import type { FollowedReportsResponse } from '../types';

const API_URL = API_CONFIG.BASE_URL;

export interface FollowResponse {
  message: string;
  seguidores_count: number;
}

/**
 * Seguir un reporte
 * @param reportId - ID del reporte a seguir
 * @param token - Token de autenticación del usuario
 * @returns Respuesta del servidor con el nuevo contador
 */
export const followReport = async (
  reportId: string | number,
  token: string
): Promise<FollowResponse> => {
  try {
    const url = `${API_URL}/api/reports/${reportId}/follow/`;
    
    const response = await axios.post<FollowResponse>(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error siguiendo reporte:', error.response?.data?.error || error.message);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Error al seguir el reporte';
      throw new Error(errorMessage);
    }
    throw new Error('Error al seguir el reporte');
  }
};

/**
 * Dejar de seguir un reporte
 * @param reportId - ID del reporte
 * @param token - Token de autenticación del usuario
 * @returns Respuesta del servidor con el nuevo contador
 */
export const unfollowReport = async (
  reportId: string | number,
  token: string
): Promise<FollowResponse> => {
  try {
    const url = `${API_URL}/api/reports/${reportId}/unfollow/`;
    
    const response = await axios.delete<FollowResponse>(
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error dejando de seguir reporte:', error.response?.data?.error || error.message);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Error al dejar de seguir el reporte';
      throw new Error(errorMessage);
    }
    throw new Error('Error al dejar de seguir el reporte');
  }
};

/**
 * Obtiene la lista de reportes que el usuario sigue
 * @param token - Token de autenticación del usuario
 * @returns Lista de reportes seguidos con toda la información
 */
export const getFollowedReports = async (
  token: string
): Promise<FollowedReportsResponse> => {
  try {
    const url = `${API_URL}/api/reports/followed/`;
    console.log('Fetching followed reports:', { url, hasToken: !!token });
    
    const response = await axios.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('Followed reports fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching followed reports - Full error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Error al obtener reportes seguidos';
      throw new Error(errorMessage);
    }
    throw new Error('Error al obtener reportes seguidos');
  }
};
