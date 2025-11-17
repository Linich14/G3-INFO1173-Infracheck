import { View, Text, TextInput, Pressable, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ModalMap from './modalMap';
import MediaSection from './mediaSelected';
import { SelectorNivelUrgencia } from './SelectorNivelUrgencia';
import { ReportFormData, ReportFormErrors } from '../types';
import { useLanguage } from '~/contexts/LanguageContext';

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
    const { t } = useLanguage();
    const TITLE_MAX_LENGTH = 50;
    const DESCRIPTION_MAX_LENGTH = 3000;
    const ADDRESS_MAX_LENGTH = 200;

    const convertToLocation = (): Location | null => {
        if (formData.latitud === 0) return null;
        return {
            latitude: formData.latitud,
            longitude: formData.longitud,
            address: formData.direccion,
        };
    };

    const handleLocationSelect = (location: Location) => {
        onUpdateField('latitud', location.latitude);
        onUpdateField('longitud', location.longitude);
        if (location.address) {
            onUpdateField('direccion', location.address);
        }
        onSetShowMapModal(false);
    };

    return (
        <>
            <View className={style.firstContainer}>
                {/* Título */}
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

                {/* Descripción */}
                <View>
                    <TextInput
                        placeholderTextColor={'#FFFFFF'}
                        className={`w-min-[20px] border-b-2 pb-1 text-white ${
                            errors.descripcion ? 'border-b-red-500' : 'border-b-slate-600'
                        }`}
                        placeholder={t('reportFormDescriptionPlaceholder')}
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

                {/* Tipo de Denuncia */}
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
                                label={t('reportFormTypePlaceholder')}
                                value=""
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label={t('reportFormType1')}
                                value="1"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label={t('reportFormType2')}
                                value="2"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label={t('reportFormType3')}
                                value="3"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label={t('reportFormType6')}
                                value="6"
                                color="#FFFFFF"
                                style={{ backgroundColor: '#13161E' }}
                            />
                            <Picker.Item
                                label={t('reportFormType7')}
                                value="7"
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

            {/* Sección de Medios */}
            <View className={style.container + 'mt-4'}>
                <Text className="text-xl text-white">{t('reportFormMediaTitle')}</Text>
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

            {/* Sección de Ubicación */}
            <View className={style.container + 'mt-4'}>
                <Text className="text-xl text-white">{t('reportFormLocationTitle')}</Text>

                {/* Selector de Ciudad */}
                <View
                    className={`overflow-visible rounded-lg bg-secondary ${errors.ciudad ? 'border border-red-500' : ''}`}>
                    <Picker
                        style={{ color: '#FFFFFF', backgroundColor: 'transparent' }}
                        itemStyle={{ color: '#FFFFFF', fontSize: 18 }}
                        selectedValue={formData.ciudad}
                        onValueChange={(value) => onUpdateField('ciudad', value)}
                        dropdownIconColor="#FFFFFF">
                        <Picker.Item
                            label={t('reportFormSelectCity')}
                            value=""
                            color="#FFFFFF"
                            enabled={false}
                            style={{ backgroundColor: '#13161E' }}
                        />
                        <Picker.Item
                            label={t('reportFormCityPlaceholder')}
                            value=""
                            color="#FFFFFF"
                            style={{ backgroundColor: '#13161E' }}
                        />
                    </Picker>
                </View>
                {errors.ciudad && (
                    <Text className="mt-1 text-sm text-red-500">{errors.ciudad}</Text>
                )}

                {/* Selector de ubicación en mapa */}
                <Pressable
                    onPress={() => onSetShowMapModal(true)}
                    className={`group w-full items-center justify-center rounded-lg p-3 active:bg-slate-500 ${
                        errors.ubicacion ? 'border border-red-500 bg-red-900/20' : 'bg-secondary'
                    }`}>
                    <MaterialCommunityIcons name="map-marker" size={30} color="white" />
                    <Text className="mt-2 text-sm text-white">
                        {convertToLocation()
                            ? `Lat: ${formData.latitud.toFixed(4)}, Lng: ${formData.longitud.toFixed(4)}`
                            : t('reportFormSelectLocation')}
                    </Text>
                </Pressable>
                {errors.ubicacion && (
                    <Text className="mt-1 text-sm text-red-500">{errors.ubicacion}</Text>
                )}

                {/* Campo de dirección */}
                <View>
                    <TextInput
                        placeholderTextColor={'#FFFFFF'}
                        className={`w-min-[20px] border-b-2 pb-1 text-white ${
                            errors.direccion ? 'border-b-red-500' : 'border-b-slate-600'
                        }`}
                        placeholder={t('reportFormAddressPlaceholder')}
                        value={formData.direccion}
                        onChangeText={(text) => onUpdateField('direccion', text)}
                        multiline={true}
                        maxLength={ADDRESS_MAX_LENGTH}
                    />
                    <View className="mt-1 flex-row justify-between">
                        {errors.direccion && (
                            <Text className="text-sm text-red-500">{errors.direccion}</Text>
                        )}
                        <Text className="ml-auto text-xs text-gray-400">
                            {formData.direccion.length}/{ADDRESS_MAX_LENGTH}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Sección de Urgencia */}
            <View className={style.container + 'mt-4'}>
                <SelectorNivelUrgencia
                    value={formData.urgencia}
                    onChange={(value) => onUpdateField('urgencia', value)}
                    error={errors.urgencia}
                />
            </View>

            {/* Sección de Visibilidad */}
            <View className={style.container + 'mb-4 mt-4'}>
                <Text className="mb-3 text-xl text-white">Configuración</Text>
                <View className="flex-row items-center justify-between">
                    <Text className="text-white">Reporte público</Text>
                    <Switch
                        value={formData.visible}
                        onValueChange={(value) => onUpdateField('visible', value)}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={formData.visible ? '#f5dd4b' : '#f4f3f4'}
                    />
                </View>
                <Text className="mt-1 text-xs text-gray-400">
                    {formData.visible
                        ? t('reportFormPublicDescription')
                        : t('reportFormPrivateDescription')}
                </Text>
            </View>

            <ModalMap
                visible={showMapModal}
                onClose={() => onSetShowMapModal(false)}
                onSelectLocation={handleLocationSelect}
                initialLocation={convertToLocation() || undefined}
                title={t('reportFormMapTitle')}
                mode="select"
            />
        </>
    );
};

const style = {
    container: 'w-full flex-col gap-4 rounded-lg bg-tertiary p-4 ',
    firstContainer: 'w-full flex-col gap-4 rounded-b-lg bg-tertiary p-4 ',
};

export default FormReport;
