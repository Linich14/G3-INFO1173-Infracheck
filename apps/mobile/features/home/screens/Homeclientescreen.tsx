import React, { useRef, useState, useEffect } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Animated, Dimensions, TouchableWithoutFeedback, Easing } from "react-native";
import { router } from "expo-router";
import { useAuth } from '~/contexts/AuthContext';
import { Comment, Report } from "~/features/comments";
import ClientHeader from "~/features/home/components/ClientHeader";
import ClientContent from "~/features/home/components/ClientContent";
import FloatingButton from "~/features/home/components/Floatingbutton";
import ClientDrawerMenu from "~/features/home/components/ClientDrawerMenu";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);

  // Estado con reportes iniciales (mock)
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
          content: 'Sí, he visto que está muy deteriorada esa calle. Deberían arreglarla pronto.',
          timeAgo: '2d',
        },
        {
          id: '2',
          author: 'Carlos',
          content: 'Completamente de acuerdo, es un peligro para los conductores.',
          timeAgo: '1d',
        },
      ],
      categoria: 'Infraestructura',
    },
    {
      id: '2',
      title: 'Semáforo apagado',
      author: 'María',
      timeAgo: '5h',
      image: { uri: 'https://picsum.photos/seed/semaforo/800/500' },
      upvotes: 91,
      comments: [],
      categoria: 'Señalización',
    },
    {
      id: '3',
      title: 'Bache muy peligroso en intersección',
      author: 'Carlos',
      timeAgo: '2h',
      image: { uri: 'https://picsum.photos/seed/bache/800/600' },
      upvotes: 67,
      comments: [],
      categoria: 'Infraestructura',
    },
    {
      id: '4',
      title: 'Problema con alumbrado público',
      author: 'DBurgos',
      timeAgo: '1d',
      image: { uri: 'https://picsum.photos/seed/luz/800/600' },
      upvotes: 23,
      comments: [],
      categoria: 'Alumbrado',
    },
  ]);

  // Animaciones Drawer
  const drawerX = useRef(new Animated.Value(-Dimensions.get("window").width * 0.75)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const DRAWER_W = Math.min(280, Dimensions.get("window").width * 0.65);

  // Filtrar reportes por categoría
  const filtrarReportesPorCategoria = (categoria: string | null, reportsList: Report[]): Report[] => {
    if (!categoria) {
      return reportsList;
    }
    return reportsList.filter(report => report.categoria === categoria);
  };

  // Actualizar reportes filtrados
  useEffect(() => {
    const reportesFiltrados = filtrarReportesPorCategoria(selectedCategoria, reports);
    setFilteredReports(reportesFiltrados);
  }, [reports, selectedCategoria]);

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

  const handleLogout = async () => {
    closeMenu();
    await logout();
    router.replace("/(auth)/sign-in");
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

    setReports(prev => prev.map(report => 
      report.id === selectedReport.id 
        ? { ...report, comments: [...report.comments, newComment] }
        : report
    ));

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
          categoria: 'Infraestructura',
        },
        {
          title: 'Semáforo reparado exitosamente',
          author: 'GeorgeS',
          image: { uri: 'https://picsum.photos/seed/semaforo/800/600' },
          categoria: 'Señalización',
        },
        {
          title: 'Nueva área verde inaugurada',
          author: 'ElliotM',
          image: { uri: 'https://picsum.photos/seed/parque/800/600' },
          categoria: 'Áreas Verdes',
        },
        {
          title: 'Fuga de agua en la calle principal',
          author: 'IgnacioL',
          image: { uri: 'https://picsum.photos/seed/agua/800/600' },
          categoria: 'Servicios Públicos',
        },
      ];

      const randomPublication = publicationTypes[Math.floor(Math.random() * publicationTypes.length)];

      const newReport: Report = {
        id: Date.now().toString(),
        title: randomPublication.title,
        author: randomPublication.author,
        timeAgo: 'Ahora',
        image: randomPublication.image,
        upvotes: Math.floor(Math.random() * 100) + 5,
        comments: [],
        categoria: randomPublication.categoria,
      };

      setReports((prevReports) => [newReport, ...prevReports]);
      console.log('Publicaciones actualizadas - Nueva publicación agregada:', randomPublication.title);
      setRefreshing(false);
    }, 1500);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#090A0D" }}>
      <ClientHeader 
        onMenuPress={openMenu} 
        onSearchPress={() => setSearchModalVisible(true)} 
      />

      <ClientContent
        reports={filteredReports.length > 0 || selectedCategoria ? filteredReports : reports}
        onCommentPress={openCommentsModal}
        insets={insets}
        refreshing={refreshing}
        onRefresh={onRefresh}
        selectedReport={selectedReport}
        commentsModalVisible={commentsModalVisible}
        onCloseCommentsModal={closeCommentsModal}
        onAddComment={addComment}
        searchModalVisible={searchModalVisible}
        onCloseSearchModal={() => setSearchModalVisible(false)}
        onSelectReport={(report: Report) => {
          setSelectedReport(report);
          setCommentsModalVisible(true);
        }}
        selectedCategoria={selectedCategoria}
        onCategoriaChange={setSelectedCategoria}
      />

      <FloatingButton onPress={() => router.push("/(tabs)/(map)/create_report")} />

      {open && (
        <>
          <TouchableWithoutFeedback onPress={closeMenu}>
            <Animated.View
              style={{
                position: "absolute",
                left: 0, right: 0, top: 0, bottom: 0,
                backgroundColor: "#000",
                opacity: backdropOpacity,
              }}
            />
          </TouchableWithoutFeedback>

          <ClientDrawerMenu 
            drawerX={drawerX} 
            DRAWER_W={DRAWER_W} 
            insets={insets} 
            onClose={closeMenu} 
            onLogout={handleLogout} 
          />
        </>
      )}
    </SafeAreaView>
  );
}
