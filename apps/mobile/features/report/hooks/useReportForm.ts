import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { ReportFormData, ReportFormErrors } from '../types';
import { localizacion as Localizacion } from '../../map/types';
import { useImagePicker } from './useCamera';

const initialFormData: ReportFormData = {
    titulo: '',
    descripcion: '',
    tipoDenuncia: '',
    ubicacion: { latitud: 0, longitud: 0, direccion: '' },
    nivelUrgencia: '',
    imagenes: [],
    video: null,
};

export const useReportForm = () => {
    const [formData, setFormData] = useState<ReportFormData>(initialFormData);
    const [errors, setErrors] = useState<ReportFormErrors>({});
    const [loading, setLoading] = useState(false);

    // Hook para manejo de imágenes y videos
    const {
        selectedImages,
        selectedVideo,
        mediaStats,
        takePhoto: cameraPhoto,
        takeVideo: cameraVideo,
        pickFromGallery: galleryImages,
        pickVideoFromGallery: galleryVideo,
        removeImage: deleteImage,
        removeVideo: deleteVideo,
        removeAllMedia,
    } = useImagePicker();

    // Sincronizar datos del hook de cámara con el formulario
    const syncFormDataWithMedia = useCallback(() => {
        if (formData.imagenes !== selectedImages) {
            setFormData((prev) => ({ ...prev, imagenes: selectedImages }));
        }
        if (formData.video !== selectedVideo) {
            setFormData((prev) => ({ ...prev, video: selectedVideo }));
        }
    }, [selectedImages, selectedVideo, formData.imagenes, formData.video]);

    // Actualizar campo específico
    const updateField = useCallback(
        (field: keyof ReportFormData, value: any) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            // Limpiar error del campo al modificarlo
            if (errors[field as keyof ReportFormErrors]) {
                setErrors((prev) => ({ ...prev, [field]: undefined }));
            }
        },
        [errors]
    );

    // Validar formulario
    const validateForm = useCallback((): boolean => {
        syncFormDataWithMedia(); // Sincronizar antes de validar

        const newErrors: ReportFormErrors = {};

        if (!formData.titulo.trim()) {
            newErrors.titulo = 'El título es requerido';
        } else if (formData.titulo.length < 5) {
            newErrors.titulo = 'El título debe tener al menos 5 caracteres';
        }

        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripción es requerida';
        } else if (formData.descripcion.length < 10) {
            newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
        }

        if (!formData.tipoDenuncia) {
            newErrors.tipoDenuncia = 'Selecciona un tipo de denuncia';
        }

        if (!formData.nivelUrgencia) {
            newErrors.nivelUrgencia = 'Selecciona el nivel de urgencia';
        }

        if (formData.ubicacion.latitud === 0) {
            newErrors.ubicacion = 'Selecciona la ubicación del problema';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, syncFormDataWithMedia]);

    // Wrapper functions para mantener la interfaz consistente
    const takePhoto = useCallback(async () => {
        await cameraPhoto();
        syncFormDataWithMedia();
    }, [cameraPhoto, syncFormDataWithMedia]);

    const takeVideo = useCallback(async () => {
        await cameraVideo();
        syncFormDataWithMedia();
    }, [cameraVideo, syncFormDataWithMedia]);

    const pickFromGallery = useCallback(async () => {
        await galleryImages();
        syncFormDataWithMedia();
    }, [galleryImages, syncFormDataWithMedia]);

    const pickVideoFromGallery = useCallback(async () => {
        await galleryVideo();
        syncFormDataWithMedia();
    }, [galleryVideo, syncFormDataWithMedia]);

    const removeImage = useCallback(
        (index: number) => {
            deleteImage(index);
            syncFormDataWithMedia();
        },
        [deleteImage, syncFormDataWithMedia]
    );

    const removeVideo = useCallback(() => {
        deleteVideo();
        syncFormDataWithMedia();
    }, [deleteVideo, syncFormDataWithMedia]);

    // Seleccionar ubicación en el mapa
    const selectLocation = useCallback(
        (location: { latitude: number; longitude: number; address?: string }) => {
            const newUbicacion: Localizacion = {
                latitud: location.latitude,
                longitud: location.longitude,
                direccion: location.address || '',
            };
            updateField('ubicacion', newUbicacion);
        },
        [updateField]
    );

    // Resetear formulario
    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setErrors({});
        removeAllMedia();
    }, [removeAllMedia]);

    // Enviar formulario
    const submitForm = useCallback(
        async (onSuccess?: (data: ReportFormData) => void): Promise<boolean> => {
            syncFormDataWithMedia();

            // Log de datos antes de validar
            console.log('DATOS DEL FORMULARIO ANTES DE VALIDAR:');
            console.log('- Título:', formData.titulo);
            console.log('- Descripción:', formData.descripcion);
            console.log('- Tipo Denuncia:', formData.tipoDenuncia);
            console.log('- Nivel Urgencia:', formData.nivelUrgencia);
            console.log('- Ubicación:', formData.ubicacion);
            console.log('- Imágenes seleccionadas:', selectedImages.length);
            console.log('- Video seleccionado:', selectedVideo ? 'Sí' : 'No');

            if (!validateForm()) {
                console.log('VALIDACIÓN FALLIDA');
                console.log('Errores encontrados:', errors);
                Alert.alert('Error', 'Por favor completa todos los campos requeridos');
                return false;
            }

            try {
                setLoading(true);

                // Crear data final con medios sincronizados
                const finalData: ReportFormData = {
                    ...formData,
                    imagenes: selectedImages,
                    video: selectedVideo,
                };

                // Log de datos finales que se enviarían
                console.log('DATOS FINALES A ENVIAR:');
                console.log('=====================================');
                console.log(JSON.stringify(finalData, null, 2));
                console.log('=====================================');

                // Log detallado de cada campo
                console.log('DETALLES DEL REPORTE:');
                console.log(`Título: "${finalData.titulo}"`);
                console.log(`Descripción: "${finalData.descripcion}"`);
                console.log(`Categoría: ${finalData.tipoDenuncia}`);
                console.log(`Urgencia: ${finalData.nivelUrgencia}`);
                console.log(
                    `Ubicación: Lat ${finalData.ubicacion.latitud}, Lng ${finalData.ubicacion.longitud}`
                );
                console.log(`Dirección: ${finalData.ubicacion.direccion || 'No especificada'}`);
                console.log(`Total imágenes: ${finalData.imagenes.length}`);
                console.log(`Video incluido: ${finalData.video ? 'Sí' : 'No'}`);

                // Log de URIs de medios
                if (finalData.imagenes.length > 0) {
                    console.log('IMÁGENES:');
                    finalData.imagenes.forEach((uri, index) => {
                        console.log(`  ${index + 1}. ${uri}`);
                    });
                }

                if (finalData.video) {
                    console.log('VIDEO:');
                    console.log(`  ${finalData.video}`);
                }

                // Simular envío a API
                console.log('Enviando reporte...');
                await new Promise((resolve) => setTimeout(resolve, 2000));

                console.log('REPORTE ENVIADO EXITOSAMENTE');
                Alert.alert('Éxito', 'Reporte enviado correctamente');
                onSuccess?.(finalData);
                resetForm();
                return true;
            } catch (error) {
                console.log('ERROR AL ENVIAR REPORTE:');
                console.error(error);
                Alert.alert('Error', 'No se pudo enviar el reporte');
                return false;
            } finally {
                setLoading(false);
            }
        },
        [formData, selectedImages, selectedVideo, validateForm, resetForm, syncFormDataWithMedia]
    );

    // Sincronizar automáticamente cuando cambien los medios
    useEffect(() => {
        syncFormDataWithMedia();
    }, [selectedImages, selectedVideo, syncFormDataWithMedia]);

    return {
        // Estado
        formData: {
            ...formData,
            imagenes: selectedImages, // Usar siempre los datos del hook de cámara
            video: selectedVideo,
        },
        errors,
        loading,
        mediaStats,

        // Acciones
        updateField,
        takePhoto,
        takeVideo,
        pickFromGallery,
        pickVideoFromGallery,
        removeImage,
        removeVideo,
        selectLocation,
        resetForm,
        submitForm,
        validateForm,
    };
};
