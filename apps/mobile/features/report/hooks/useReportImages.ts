import { useState } from 'react';
import { useLanguage } from '~/contexts/LanguageContext';
import api from '~/shared/api';
import { isAuthenticated } from '~/features/auth/services/authService';

export interface UploadImageResponse {
    success: boolean;
    message: string;
    data?: any;
}

export interface DeleteImageResponse {
    success: boolean;
    message: string;
}

export function useReportImages() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();

    const uploadImages = async (reportId: string, images: any[]): Promise<UploadImageResponse> => {
        try {
            setLoading(true);
            setError(null);

            // Verificar autenticación
            const authenticated = await isAuthenticated();
            if (!authenticated) {
                return {
                    success: false,
                    message: t('sessionExpired') || 'Sesión expirada. Inicie sesión nuevamente.',
                };
            }

            const formData = new FormData();

            images.forEach((image, index) => {
                const imageFile = {
                    uri: image.uri || image, // Soporta tanto objetos como strings
                    type: image.type || 'image/jpeg',
                    name: image.fileName || `image_${Date.now()}_${index}.jpg`,
                } as any;

                formData.append('imagenes', imageFile);
            });

            const response = await api.post(`/api/reports/${reportId}/media/upload/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return {
                success: true,
                message:
                    response.data.message ||
                    t('imagesUploadSuccess') ||
                    'Imágenes subidas exitosamente',
                data: response.data,
            };
        } catch (error: any) {
            console.error('Error uploading images:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                t('imagesUploadError') ||
                'Error al subir las imágenes';

            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    };

    const deleteImage = async (reportId: string, imageId: number): Promise<DeleteImageResponse> => {
        try {
            setLoading(true);
            setError(null);

            // Verificar autenticación
            const authenticated = await isAuthenticated();
            if (!authenticated) {
                return {
                    success: false,
                    message: t('sessionExpired') || 'Sesión expirada. Inicie sesión nuevamente.',
                };
            }

            const response = await api.delete(`/api/reports/${reportId}/media/${imageId}/delete/`);

            return {
                success: true,
                message:
                    response.data.message ||
                    t('imageDeleteSuccess') ||
                    'Imagen eliminada exitosamente',
            };
        } catch (error: any) {
            console.error('Error deleting image:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                t('imageDeleteError') ||
                'Error al eliminar la imagen';

            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    };

    const deleteMultipleImages = async (
        reportId: string,
        imageIds: number[]
    ): Promise<DeleteImageResponse> => {
        try {
            setLoading(true);
            setError(null);

            let deletedCount = 0;
            let errors: string[] = [];

            for (const imageId of imageIds) {
                const result = await deleteImage(reportId, imageId);
                if (result.success) {
                    deletedCount++;
                } else {
                    errors.push(`Imagen ${imageId}: ${result.message}`);
                }
            }

            const totalImages = imageIds.length;

            if (deletedCount === totalImages) {
                return {
                    success: true,
                    message:
                        t('multipleImagesDeleteSuccess') ||
                        `${deletedCount} imagen(es) eliminada(s) exitosamente`,
                };
            } else if (deletedCount > 0) {
                return {
                    success: false,
                    message:
                        t('partialImagesDeleteError') ||
                        `${deletedCount} de ${totalImages} imagen(es) eliminada(s). Errores: ${errors.join(', ')}`,
                };
            } else {
                return {
                    success: false,
                    message: t('noImagesDeleted') || 'No se pudo eliminar ninguna imagen',
                };
            }
        } catch (error: any) {
            console.error('Error deleting multiple images:', error);
            const errorMessage = t('multipleImagesDeleteError') || 'Error al eliminar las imágenes';

            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        uploadImages,
        deleteImage,
        deleteMultipleImages,
        loading,
        error,
        setError,
    };
}
