import axios from 'axios';
import { API_CONFIG } from '~/constants/config';

const API_URL = API_CONFIG.BASE_URL;

export interface CreateCommentRequest {
  comentario: string;
}

export interface CommentResponse {
  id: number;
  comentario: string;
  fecha_comentario: string;
  tiempo_relativo: string;
  usuario: {
    id: number;
    nickname: string;
  };
  puede_eliminar: boolean;
  es_autor: boolean;
  es_admin: boolean;
}

export interface CreateCommentResponse {
  message: string;
  comentario: CommentResponse;
}

/**
 * Crea un comentario en un reporte específico
 * @param reportId - ID del reporte
 * @param comentario - Texto del comentario
 * @param token - Token de autenticación del usuario
 * @returns Respuesta del servidor con el comentario creado
 */
export const createComment = async (
  reportId: string | number,
  comentario: string,
  token: string
): Promise<CreateCommentResponse> => {
  try {
    const url = `${API_URL}/api/reports/${reportId}/comments/`;
    console.log('Creating comment:', { url, reportId, hasToken: !!token });
    
    const response = await axios.post<CreateCommentResponse>(
      url,
      { comentario },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Comment created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating comment:', error.response?.data || error.message);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.response?.data?.errors?.[0] || 'Error al crear el comentario';
      throw new Error(errorMessage);
    }
    throw new Error('Error al crear el comentario');
  }
};

/**
 * Obtiene la lista de comentarios de un reporte
 * @param reportId - ID del reporte
 * @param token - Token de autenticación del usuario
 * @param page - Número de página (default: 1)
 * @param limit - Límite de comentarios por página (default: 20, max: 50)
 * @returns Lista de comentarios con paginación
 */
export const getComments = async (
  reportId: string | number,
  token: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  comentarios: CommentResponse[];
  usuario_ha_comentado: boolean;
  message?: string;
  empty?: boolean;
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}> => {
  try {
    const url = `${API_URL}/api/reports/${reportId}/comments/list/`;
    console.log('Fetching comments:', { url, reportId, page, limit, hasToken: !!token });
    
    const response = await axios.get(
      url,
      {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('Comments fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching comments - Full error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.response?.data?.errors?.[0] || 'Error al obtener los comentarios';
      throw new Error(errorMessage);
    }
    throw new Error('Error al obtener los comentarios');
  }
};

/**
 * Elimina un comentario (soft delete)
 * @param commentId - ID del comentario a eliminar
 * @param token - Token de autenticación del usuario
 * @returns Respuesta del servidor
 */
export const deleteComment = async (
  commentId: string | number,
  token: string
): Promise<{ message: string }> => {
  try {
    const url = `${API_URL}/api/reports/comments/${commentId}/delete/`;
    console.log('Deleting comment:', { url, commentId, hasToken: !!token });
    
    const response = await axios.delete(
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('Comment deleted successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting comment - Full error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Error al eliminar el comentario';
      throw new Error(errorMessage);
    }
    throw new Error('Error al eliminar el comentario');
  }
};
