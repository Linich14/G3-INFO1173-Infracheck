import { View, Text, TextInput, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ModalMap from './modalMap';
import MediaSection from './mediaSelected';
import { SelectorNivelUrgencia } from './SelectorNivelUrgencia';
import { ReportFormData, ReportFormErrors } from '../types';

interface Location {
    latitude: number;
    longitude: number;
    address?: string;
}

interface FormReportProps {
    formData: ReportFormData;
    errors: ReportFormErrors;
    onUpdateField: (field: keyof ReportFormData, value: any) => void;
    onOpenImageModal: () => void;
    onOpenVideoModal: () => void;
    onRemoveImage: (index: number) => void;
    onRemoveVideo: () => void;
    onSelectLocation: (location: Location) => void;
    showMapModal: boolean;
    onSetShowMapModal: (show: boolean) => void;
    mediaStats?: {
        imageCount: number;
        hasVideo: boolean;
        canAddImages: boolean;
        canAddVideo: boolean;
        remainingImageSlots: number;
    };
}

const FormReport = ({
    formData,
    errors,
    onUpdateField,
    onOpenImageModal,
    onOpenVideoModal,
    onRemoveImage,
    onRemoveVideo,
    onSelectLocation,
    showMapModal,
    onSetShowMapModal,
    mediaStats,
}: FormReportProps) => {
    const TITLE_MAX_LENGTH = 50;
    const DESCRIPTION_MAX_LENGTH = 3000;

    const convertToLocation = (): Location | null => {
        if (formData.ubicacion.latitud === 0) return null;
        return {
            latitude: formData.ubicacion.latitud,
            longitude: formData.ubicacion.longitud,
            address: formData.ubicacion.direccion,
        };
    };

    const handleLocationSelect = (location: Location) => {
        onSelectLocation(location);
        onSetShowMapModal(false);
    };

    return (
        <>
            <View className={style.firstContainer}>
                <View>
                    <TextInput
                        placeholderTextColor={'#FFFFFF'}
                        className={`w-min-[20px] border-b-2 pb-1 text-2xl text-white ${
                            errors.titulo ? 'border-b-red-500' : 'border-b-slate-600'
                        }`}
                        placeholder="Título"
                        value={formData.titulo}
                        onChangeText={(text) => onUpdateField('titulo', text)}
                        multiline={true}
                        maxLength={TITLE_MAX_LENGTH}
                    />
                    <View className="mt-1 flex-row justify-between">
                        {errors.titulo && (
                            <Text className="text-sm text-red-500">{errors.titulo}</Text>
                        )}
                        <Text className="ml-auto text-xs text-gray-400">
                            {formData.titulo.length}/{TITLE_MAX_LENGTH}
                        </Text>
                    </View>
                </View>

                <View>
                    <TextInput
                        placeholderTextColor={'#FFFFFF'}
                        className={`w-min-[20px] border-b-2 pb-1 text-white ${
                            errors.descripcion ? 'border-b-red-500' : 'border-b-slate-600'
                        }`}
                        placeholder="Descripción del problema"
                        value={formData.descripcion}
                        onChangeText={(text) => onUpdateField('descripcion', text)}
                        multiline={true}
                        maxLength={DESCRIPTION_MAX_LENGTH}
                    />
                    <View className="mt-1 flex-row justify-between">
                        {errors.descripcion && (
                            <Text className="text-sm text-red-500">{errors.descripcion}</Text>
                        )}
                        <Text className="ml-auto text-xs text-gray-400">
                            {formData.descripcion.length}/{DESCRIPTION_MAX_LENGTH}
                        </Text>
                    </View>
                </View>

                <View>
                    <View
                        className={`overflow-visible rounded-lg bg-secondary ${errors.tipoDenuncia ? 'border border-red-500' : ''}`}>
                        <Picker
                            style={{ color: '#FFFFFF', backgroundColor: 'transparent' }}
                            itemStyle={{ color: '#FFFFFF', fontSize: 18 }}
                            selectedValue={formData.tipoDenuncia}
                            onValueChange={(value) => onUpdateField('tipoDenuncia', value)}
                            dropdownIconColor="#FFFFFF">
                            <Picker.Item
                                label="Selecciona una categoría"
                                value=""
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label="Vialidad y veredas"
                                value="vialidad_veredas"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label="Alumbrado público"
                                value="alumbrado_publico"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label="Drenaje y aguas lluvias"
                                value="drenaje_aguas"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label="Áreas verdes y arbolado"
                                value="areas_verdes"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label="Mobiliario urbano y plazas"
                                value="mobiliario_urbano"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label="Señalización y demarcación"
                                value="senalizacion"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label="Ciclovías y movilidad activa"
                                value="ciclovias"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label="Paraderos y equipamiento de transporte"
                                value="paraderos_transporte"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label="Infraestructura municipal (edificios y recintos)"
                                value="infraestructura_municipal"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label="Limpieza y recuperación de espacio público"
                                value="limpieza_espacio_publico"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label="Accesibilidad"
                                value="accesibilidad"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label="Riesgos y emergencias"
                                value="riesgos_emergencias"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                        </Picker>
                    </View>
                    {errors.tipoDenuncia && (
                        <Text className="mt-1 text-sm text-red-500">{errors.tipoDenuncia}</Text>
                    )}
                </View>
            </View>

            <View className={style.container + 'mt-4'}>
                <Text className="text-xl text-white">Medios</Text>
                <MediaSection
                    selectedImages={formData.imagenes}
                    selectedVideo={formData.video}
                    onOpenImageModal={onOpenImageModal}
                    onOpenVideoModal={onOpenVideoModal}
                    onRemoveImage={onRemoveImage}
                    onRemoveVideo={onRemoveVideo}
                    mediaStats={mediaStats}
                />
            </View>

            <View className={style.container + 'mt-4'}>
                <Text className="text-xl text-white">Ubicación</Text>
                <View
                    className={`overflow-hidden rounded-lg bg-secondary  ${errors.nivelUrgencia ? 'border border-red-500' : ''}`}>
                    <Picker
                        style={{ color: '#FFFFFF', backgroundColor: 'transparent' }}
                        itemStyle={{ color: '#FFFFFF', fontSize: 18 }}
                        selectedValue={formData.nivelUrgencia}
                        onValueChange={(value) => onUpdateField('nivelUrgencia', value)}
                        dropdownIconColor="#FFFFFF">
                        <Picker.Item
                            label="Seleccione Ciudad"
                            value=""
                            color="#FFFFFF"
                            enabled={false}
                            style={{ backgroundColor: '#13161E' }}
                        />
                        <Picker.Item
                            label="Temuco"
                            value="1"
                            color="#FFFFFF"
                            style={{ backgroundColor: '#13161E' }}
                        />
                    </Picker>
                    {errors.idCiudad && (
                        <Text className="mt-1 text-sm text-red-500">{errors.idCiudad}</Text>
                    )}
                </View>

                <Pressable
                    onPress={() => onSetShowMapModal(true)}
                    className={`group w-full items-center justify-center rounded-lg p-3 active:bg-slate-500 ${
                        errors.ubicacion ? 'border border-red-500 bg-red-900/20' : 'bg-secondary'
                    }`}>
                    <MaterialCommunityIcons name="map-marker" size={30} color="white" />
                    <Text className="mt-2 text-sm text-white">
                        {convertToLocation()
                            ? `Lat: ${formData.ubicacion.latitud.toFixed(4)}, Lng: ${formData.ubicacion.longitud.toFixed(4)}`
                            : 'Seleccionar en el mapa'}
                    </Text>
                </Pressable>
                {errors.ubicacion && (
                    <Text className="mt-1 text-sm text-red-500">{errors.ubicacion}</Text>
                )}
            </View>

            <View className={style.container + 'mb-4 mt-4'}>
                <SelectorNivelUrgencia
                    value={formData.nivelUrgencia}
                    onChange={(value) => onUpdateField('nivelUrgencia', value)}
                    error={errors.nivelUrgencia}
                />
            </View>

            <ModalMap
                visible={showMapModal}
                onClose={() => onSetShowMapModal(false)}
                onSelectLocation={handleLocationSelect}
                initialLocation={convertToLocation() || undefined}
                title="Seleccionar Ubicación del Problema"
            />
        </>
    );
};

const style = {
    container: 'w-full flex-col gap-4 rounded-lg bg-tertiary p-4 ',
    firstContainer: 'w-full flex-col gap-4 rounded-b-lg bg-tertiary p-4 ',
};

const nativeStyles = {
    picker: {
        backgroundColor: 'transparent',
        color: '#FFFFFF',
        borderRadius: 8,
        height: 50,
    },
    pickerWithBackground: {
        backgroundColor: '#13161E',
        color: '#FFFFFF',
        borderRadius: 8,
        height: 50,
        paddingHorizontal: 12,
    },
    pickerComplete: {
        backgroundColor: '#13161E',
        color: '#FFFFFF',
        borderRadius: 8,
        height: 60,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginVertical: 4,
    },
    pickerClear: {
        backgroundColor: 'transparent',
        color: '#FFFFFF',
        height: 50,
        paddingHorizontal: 16,
    },
    pickerExpanded: {
        backgroundColor: 'transparent',
        color: '#FFFFFF',
        height: 120, // Altura aumentada para mostrar múltiples opciones
        paddingHorizontal: 16,
    },
    pickerMultipleVisible: {
        backgroundColor: 'transparent',
        color: '#FFFFFF',
        height: 150,
        paddingHorizontal: 16,
    },
    pickerItemStyle: {
        color: '#FFFFFF',
        backgroundColor: '#13161E',
        fontSize: 16,
        height: 50,
    },
    pickerItemExpanded: {
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        fontSize: 18,
        height: 60, // Altura mayor para iOS
    },
    pickerItemMultiple: {
        color: '#FFFFFF',
        backgroundColor: '#13161E',
        fontSize: 16,
        height: 35,
    },
    pickerItem: {
        color: '#FFFFFF',
        backgroundColor: '#13161E',
        fontSize: 16,
    },
};

export default FormReport;
