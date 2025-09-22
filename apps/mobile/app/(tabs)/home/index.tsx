import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions,
    TouchableWithoutFeedback,
    RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ReportCard } from '~/features/posts';
import { CommentsModal, Comment, Report } from '~/features/comments';
import { SearchModal } from '~/features/search';
import {
    AlignJustify,
    UserCircle2,
    Search,
    LogOut,
    Home,
    Settings,
    Map,
    Shield,
    Users,
} from 'lucide-react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const MENU_BG = '#0f172a';
const ACCENT = '#537CF2';

export default function HomeScreen() {
    const insets = useSafeAreaInsets();

    const [open, setOpen] = useState(false);
    const [commentsModalVisible, setCommentsModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchModalVisible, setSearchModalVisible] = useState(false);

    // Estado para simular los datos de los reportes con comentarios
    const [reports, setReports] = useState<Report[]>([
        {
            id: '1',
            title: 'Calle en mal estado',
            author: 'ChristianV',
            timeAgo: '3d',
            image: require('@assets/Publicaciones/1.png'),
            upvotes: 254,
            comments: [
                {
                    id: '1',
                    author: 'María123',
                    content:
                        'Sí, he visto que está muy deteriorada esa calle. Deberían arreglarla pronto.',
                    timeAgo: '2d',
                },
                {
                    id: '2',
                    author: 'Carlos',
                    content: 'Completamente de acuerdo, es un peligro para los conductores.',
                    timeAgo: '1d',
                },
            ],
        },
        {
            id: '2',
            title: 'Semáforo apagado',
            author: 'María',
            timeAgo: '5h',
            image: { uri: 'https://picsum.photos/seed/semaforo/800/500' },
            upvotes: 91,
            comments: [],
        },
        {
            id: '3',
            title: 'Bache muy peligroso en intersección',
            author: 'Carlos',
            timeAgo: '2h',
            image: { uri: 'https://picsum.photos/seed/bache/800/600' },
            upvotes: 67,
            comments: [],
        },
        {
            id: '4',
            title: 'Problema con alumbrado público',
            author: 'VecinoConcernedoPorSuComunidadYQueReportaProblemas',
            timeAgo: '1d',
            image: { uri: 'https://picsum.photos/seed/luz/800/600' },
            upvotes: 23,
            comments: [],
        },
    ]);

    const drawerX = useRef(new Animated.Value(-Dimensions.get('window').width * 0.75)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const DRAWER_W = Math.min(320, Dimensions.get('window').width * 0.75);

    const openMenu = () => {
        setOpen(true);
        Animated.parallel([
            Animated.timing(drawerX, {
                toValue: 0,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0.45,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeMenu = () => {
        Animated.parallel([
            Animated.timing(drawerX, {
                toValue: -DRAWER_W,
                duration: 200,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 200,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) setOpen(false);
        });
    };

    const handleLogout = () => {
        closeMenu();
        router.replace('/(auth)/sign-in');
    };

    const openCommentsModal = (report: Report) => {
        setSelectedReport(report);
        setCommentsModalVisible(true);
    };

    const closeCommentsModal = () => {
        setCommentsModalVisible(false);
        setSelectedReport(null);
    };

    const addComment = (content: string) => {
        if (!selectedReport) return;

        const newComment: Comment = {
            id: Date.now().toString(),
            author: 'Usuario Actual',
            content,
            timeAgo: 'Ahora',
        };

        setReports((prevReports) =>
            prevReports.map((report) =>
                report.id === selectedReport.id
                    ? { ...report, comments: [...report.comments, newComment] }
                    : report
            )
        );

        setSelectedReport((prev) =>
            prev ? { ...prev, comments: [...prev.comments, newComment] } : null
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);

        setTimeout(() => {
            const publicationTypes = [
                {
                    title: 'Bache peligroso reportado',
                    author: 'LalitoCubano',
                    image: { uri: 'https://picsum.photos/seed/bache/800/600' },
                },
                {
                    title: 'Semáforo reparado exitosamente',
                    author: 'GeorgeS',
                    image: { uri: 'https://picsum.photos/seed/semaforo/800/600' },
                },
                {
                    title: 'Nueva área verde inaugurada',
                    author: 'ElliotM',
                    image: { uri: 'https://picsum.photos/seed/parque/800/600' },
                },
                {
                    title: 'Fuga de agua en la calle principal',
                    author: 'IgnacioL',
                    image: { uri: 'https://picsum.photos/seed/agua/800/600' },
                },
            ];

            const randomPublication =
                publicationTypes[Math.floor(Math.random() * publicationTypes.length)];

            const newReport: Report = {
                id: Date.now().toString(),
                title: randomPublication.title,
                author: randomPublication.author,
                timeAgo: 'Ahora',
                image: randomPublication.image,
                upvotes: Math.floor(Math.random() * 100) + 5,
                comments: [],
            };

            setReports((prevReports) => [newReport, ...prevReports]);
            console.log(
                'Publicaciones actualizadas - Nueva publicación agregada:',
                randomPublication.title
            );
            setRefreshing(false);
        }, 1500);
    };

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#090A0D' }}>
            {/* Header */}
            <View className="flex-row justify-between bg-[#13161E] p-4">
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity
                        onPress={openMenu}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityRole="button"
                        accessibilityLabel="Abrir menú"
                        activeOpacity={0.6}>
                        <AlignJustify size={26} color="white" />
                    </TouchableOpacity>

                    <Text className="text-2xl font-bold text-[#537CF2]">Reportes</Text>
                </View>

                <View className="flex-row items-center gap-6">
                    <TouchableOpacity
                        onPress={() => setSearchModalVisible(true)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityRole="button"
                        accessibilityLabel="Buscar"
                        activeOpacity={0.6}>
                        <Search size={26} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/profile')}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityRole="button"
                        accessibilityLabel="Perfil"
                        activeOpacity={0.6}>
                        <UserCircle2 size={26} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Lista de reportes */}
            <ScrollView
                className="mt-4 px-4"
                contentContainerStyle={{
                    gap: 16,
                    paddingBottom: insets.bottom + 12,
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#537CF2"
                        colors={['#537CF2']}
                        progressBackgroundColor="#13161E"
                    />
                }>
                {reports.map((report) => (
                    <ReportCard
                        id={report.id}
                        key={report.id}
                        title={report.title}
                        author={report.author}
                        timeAgo={report.timeAgo}
                        image={report.image}
                        upvotes={report.upvotes}
                        onFollow={() => console.log('Seguir')}
                        onMore={() => console.log('Más opciones')}
                        onLocation={() => console.log('Ubicación')}
                        onUpvote={() => console.log('Upvote')}
                        onComment={() => openCommentsModal(report)}
                        onShare={() => console.log('Compartir')}
                    />
                ))}
            </ScrollView>

            <View className="absolute bottom-0 right-0 flex-col items-center gap-3 px-4 py-7">
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/(map)/create_report')}
                    className="rounded-full bg-primary p-4">
                    <MaterialCommunityIcons name="plus" size={40} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Drawer / Canvas */}
            {open && (
                <>
                    <TouchableWithoutFeedback onPress={closeMenu}>
                        <Animated.View
                            pointerEvents={open ? 'auto' : 'none'}
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0,
                                backgroundColor: '#000',
                                opacity: backdropOpacity,
                            }}
                        />
                    </TouchableWithoutFeedback>

                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: DRAWER_W,
                            backgroundColor: MENU_BG,
                            paddingTop: insets.top + 12,
                            paddingHorizontal: 16,
                            transform: [{ translateX: drawerX }],
                            borderRightWidth: 1,
                            borderRightColor: '#1f2937',
                        }}>
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ color: ACCENT, fontSize: 20, fontWeight: '700' }}>
                                Menú
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                closeMenu();
                                router.replace('/(tabs)/home');
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 12,
                                gap: 10,
                            }}
                            activeOpacity={0.7}>
                            <Home size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 16 }}>Inicio</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                closeMenu();
                                router.push('/(tabs)/(map)');
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 12,
                                gap: 10,
                            }}
                            activeOpacity={0.7}>
                            <Map size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 16 }}>Mapa</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                closeMenu();
                                router.push('/(tabs)/settings');
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 12,
                                gap: 10,
                            }}
                            activeOpacity={0.7}>
                            <Settings size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 16 }}>Ajustes</Text>
                        </TouchableOpacity>

                        <View
                            style={{ height: 1, backgroundColor: '#1f2937', marginVertical: 12 }}
                        />

                        <TouchableOpacity
                            onPress={() => {
                                closeMenu();
                                router.push('/(tabs)/home/Homeclientescreen');
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 12,
                                gap: 10,
                            }}
                            activeOpacity={0.7}>
                            <UserCircle2 size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 16 }}>Home Cliente</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                closeMenu();
                                router.push('/(tabs)/home/Homeauthoscreen');
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 12,
                                gap: 10,
                            }}
                            activeOpacity={0.7}>
                            <Shield size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 16 }}>Home Autoridad</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                closeMenu();
                                router.push('/(tabs)/home/Homeadminscreen');
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 12,
                                gap: 10,
                            }}
                            activeOpacity={0.7}>
                            <Users size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 16 }}>Home Admin</Text>
                        </TouchableOpacity>

                        <View
                            style={{ height: 1, backgroundColor: '#1f2937', marginVertical: 12 }}
                        />

                        <TouchableOpacity
                            onPress={handleLogout}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 12,
                                gap: 10,
                            }}
                            activeOpacity={0.7}>
                            <LogOut size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 16 }}>Cerrar sesión</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </>
            )}

            {/* Modal de Comentarios */}
            {selectedReport && (
                <CommentsModal
                    visible={commentsModalVisible}
                    onClose={closeCommentsModal}
                    postTitle={selectedReport.title}
                    comments={selectedReport.comments}
                    onAddComment={addComment}
                />
            )}

            {/* Modal de Búsqueda */}
            <SearchModal
                visible={searchModalVisible}
                onClose={() => setSearchModalVisible(false)}
                reports={reports}
                onSelectReport={(report) => {
                    setSelectedReport(report);
                    setCommentsModalVisible(true);
                }}
            />
        </SafeAreaView>
    );
}
