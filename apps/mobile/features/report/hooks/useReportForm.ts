import { useState } from 'react';
import { ReportFormData, ReportFormErrors } from '../types';
import { validateReportData, createReport } from '../services/reportService';
import { useCamera } from './useCamera';

export const useReportForm = () => {
    const [formData, setFormData] = useState<ReportFormData>({
        titulo: '',
        descripcion: '',
        direccion: '',
        latitud: 0,
        longitud: 0,
        urgencia: '', // Asegurarse de que inicia vacío
        tipoDenuncia: '',
        ciudad: '',
        visible: true,
        imagenes: [],
        video: undefined,
    });

    const [errors, setErrors] = useState<ReportFormErrors>({});
    const [showMapModal, setShowMapModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        selectedImages,
        selectedVideo,
        showImageModal,
        showVideoModal,
        setShowImageModal,
        setShowVideoModal,
        takePhoto,
        pickImageFromGallery,
        recordVideo,
        pickVideoFromGallery,
        removeImage,
        removeVideo,
        openImageModal,
        openVideoModal,
        resetMedia,
        getMediaStats,
    } = useCamera();

    const updateField = (field: keyof ReportFormData, value: any) => {
        console.log(`Updating field ${field} with value:`, value, typeof value); // Debug log

        setFormData((prev) => ({ ...prev, [field]: value }));

        // Limpiar error del campo si existe
        if (errors[field as keyof ReportFormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const syncFormDataWithMedia = () => {
        setFormData((prev) => ({
            ...prev,
            imagenes: selectedImages,
            video: selectedVideo,
        }));
    };

    const validateForm = (): boolean => {
        const dataToValidate = {
            ...formData,
            imagenes: selectedImages,
            video: selectedVideo,
        };

        console.log('Validating form data:', dataToValidate); // Debug log

        const validationErrors = validateReportData(dataToValidate);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handlePreview = () => {
        syncFormDataWithMedia();
        if (validateForm()) {
            setShowPreview(true);
        }
    };

    const resetForm = () => {
        setFormData({
            titulo: '',
            descripcion: '',
            direccion: '',
            latitud: 0,
            longitud: 0,
            urgencia: '',
            tipoDenuncia: '',
            ciudad: '',
            visible: true,
            imagenes: [],
            video: undefined,
        });
        setErrors({});
        resetMedia();
    };

    const handleSubmit = async () => {
        syncFormDataWithMedia();

        const finalData = {
            ...formData,
            imagenes: selectedImages,
            video: selectedVideo,
        };

        console.log('Final data to submit:', finalData); // Debug log

        if (!validateForm()) {
            return { success: false, message: 'Por favor, complete todos los campos requeridos.' };
        }

        setIsSubmitting(true);
        try {
            const result = await createReport(finalData);

            if (result.success) {
                resetForm();
                setShowPreview(false);
            } else if (result.errors) {
                setErrors(result.errors as ReportFormErrors);
                setShowPreview(false);
            }

            return result;
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCurrentFormData = () => ({
        ...formData,
        imagenes: selectedImages,
        video: selectedVideo,
    });

    return {
        formData: getCurrentFormData(),
        errors,
        showMapModal,
        showPreview,
        isSubmitting,
        loading: false,
        mediaStats: getMediaStats(),
        showImageModal,
        showVideoModal,
        setShowImageModal,
        setShowVideoModal,
        updateField,
        setShowMapModal,
        setShowPreview,
        handlePreview,
        handleSubmit,
        validateForm,
        resetForm,
        takePhoto,
        pickImageFromGallery,
        recordVideo,
        pickVideoFromGallery,
        removeImage,
        removeVideo,
        openImageModal,
        openVideoModal,
        getMediaStats,
    };
};
