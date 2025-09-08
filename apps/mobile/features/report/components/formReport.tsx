import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ModalMap from './modalMap'; // Importar el modal

interface Location {
    latitude: number;
    longitude: number;
    address?: string;
}

interface FormReportProps {
    onOpenImageModal: () => void;
}

const FormReport = ({ onOpenImageModal }: FormReportProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showMapModal, setShowMapModal] = useState(false); // Estado para el modal del mapa
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null); // Ubicación seleccionada

    const TITLE_MAX_LENGTH = 50;
    const DESCRIPTION_MAX_LENGTH = 3000;

    const handleLocationSelect = (location: Location) => {
        setSelectedLocation(location);
        console.log('Ubicación seleccionada:', location);
    };

    const handleOpenMapModal = () => {
        setShowMapModal(true);
    };

    const handleCloseMapModal = () => {
        setShowMapModal(false);
    };

    return (
        <>
            <View className={style.container}>
                <View>
                    <TextInput
                        placeholderTextColor={'#FFFFFF'}
                        className="w-min-[20px] border-b-2 border-b-slate-500 bg-secondary pb-1 text-2xl text-white"
                        placeholder="Título"
                        value={title}
                        onChangeText={setTitle}
                        multiline={true}
                        maxLength={TITLE_MAX_LENGTH}
                    />
                    <Text className="mt-1 text-right text-xs text-gray-400">
                        {title.length}/{TITLE_MAX_LENGTH}
                    </Text>
                </View>
                <View>
                    <TextInput
                        placeholderTextColor={'#FFFFFF'}
                        className="w-min-[20px] border-b-2 border-b-slate-500 bg-secondary pb-1 text-white"
                        placeholder="Descripción del problema"
                        value={description}
                        onChangeText={setDescription}
                        multiline={true}
                        maxLength={DESCRIPTION_MAX_LENGTH}
                    />
                    <Text className="mt-1 text-right text-xs text-gray-400">
                        {description.length}/{DESCRIPTION_MAX_LENGTH}
                    </Text>
                </View>

                <Pressable
                    className="group h-[100px] w-full items-center justify-center rounded-lg bg-background p-3 active:bg-slate-500"
                    onPress={onOpenImageModal}>
                    <MaterialCommunityIcons name="file-image" size={40} color="white" />
                    <Text className="mt-2 text-sm text-white">Agregar imagen</Text>
                </Pressable>

                <View className="rounded-lg bg-background">
                    <Picker
                        mode="dropdown"
                        style={nativeStyles.picker}
                        dropdownIconColor={'#FFFFFF'}
                        dropdownIconRippleColor={'#FFFFFF'}>
                        <Picker.Item
                            label="Selecciona una categoría"
                            value=""
                            style={{ color: '#999999' }}
                        />
                        <Picker.Item
                            label="Medio ambiente"
                            value="ambiente"
                            style={{ color: '#FFFFFF', backgroundColor: '#090A0D' }}
                        />
                        <Picker.Item
                            label="Infraestructura vial"
                            value="vial"
                            style={{ color: '#FFFFFF', backgroundColor: '#090A0D' }}
                        />
                    </Picker>
                </View>
            </View>

            <View className={style.container + 'mt-4'}>
                <Text className="text-xl text-white">Ubicacion</Text>

                <Pressable
                    onPress={handleOpenMapModal}
                    className="group w-full items-center justify-center rounded-lg bg-background p-3 active:bg-slate-500">
                    <MaterialCommunityIcons name="map-marker" size={30} color="white" />
                    <Text className="mt-2 text-sm text-white">
                        {selectedLocation
                            ? `Lat: ${selectedLocation.latitude.toFixed(4)}, Lng: ${selectedLocation.longitude.toFixed(4)}`
                            : 'Seleccionar en el mapa'}
                    </Text>
                </Pressable>
            </View>

            <View className={style.container + 'mt-4'}>
                <Text className="text-xl text-white">Nivel de Urgencia</Text>
                <View className="rounded-lg bg-background">
                    <Picker
                        mode="dropdown"
                        style={nativeStyles.picker}
                        dropdownIconColor={'#FFFFFF'}
                        selectionColor={'#090A0D'}
                        itemStyle={{ backgroundColor: '#090A0D', color: '#000000' }}>
                        <Picker.Item label="Selecciona una gravedad" value="" />
                        <Picker.Item
                            label="Bajo"
                            value="bajo"
                            style={{
                                color: '#FFFFFF',
                                backgroundColor: '#090A0D',
                            }}
                        />
                        <Picker.Item
                            label="Grave"
                            value="grave"
                            style={{ color: '#FFFFFF', backgroundColor: '#090A0D' }}
                        />
                        <Picker.Item
                            label="Alto"
                            value="alto"
                            style={{ color: '#FFFFFF', backgroundColor: '#090A0D' }}
                        />
                    </Picker>
                </View>
            </View>

            {/* Modal del Mapa */}
            <ModalMap
                visible={showMapModal}
                onClose={handleCloseMapModal}
                onSelectLocation={handleLocationSelect}
                initialLocation={selectedLocation}
                title="Seleccionar Ubicación del Problema"
            />
        </>
    );
};

const style = {
    container: 'w-full flex-col gap-4 rounded-lg bg-secondary p-4 ',
};

const nativeStyles = {
    picker: {
        backgroundColor: 'transparent',
        color: '#FFFFFF',
        borderRadius: 8,
    },
};

export default FormReport;
