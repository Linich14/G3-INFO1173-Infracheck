import { Tabs } from 'expo-router';
import { useState, useEffect } from 'react';
import { Keyboard, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Map, Settings, Users2 } from 'lucide-react-native';

function TabItem({
    label,
    focused,
    children,
}: {
    label: string;
    focused: boolean;
    children: React.ReactNode;
}) {
    return (
        // Empuje vertical forzado (más fiable que marginTop dentro del tab)
        <View style={{ transform: [{ translateY: 8 }] }}>
            <View
                style={{
                    backgroundColor: focused ? '#1e293b' : 'transparent',
                    paddingVertical: 16,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 86,
                }}>
                {children}
                <Text
                    numberOfLines={1}
                    style={{
                        color: '#fff',
                        fontSize: 12,
                        lineHeight: 18,
                        marginTop: 4,
                        textAlign: 'center',
                    }}>
                    {label}
                </Text>
            </View>
        </View>
    );
}

export default function Layout() {
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const s = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const h = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            s.remove();
            h.remove();
        };
    }, []);

    const BASE = 56;

    return (
        <Tabs
            initialRouteName="home/index"
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    display: keyboardVisible ? 'none' : 'flex',
                    backgroundColor: '#0f172a',
                    borderTopWidth: 0,
                    height: BASE + insets.bottom + 8,
                    paddingBottom: insets.bottom + 8,
                    paddingTop: 8,
                },
                tabBarItemStyle: {
                    overflow: 'visible',
                },
            }}>
            <Tabs.Screen
                name="home/index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <TabItem label="Home" focused={focused}>
                            <Home size={24} color="#fff" />
                        </TabItem>
                    ),
                }}
            />

            <Tabs.Screen
                name="(map)"
                options={{
                    title: 'Mapa',
                    tabBarIcon: ({ focused }) => (
                        <TabItem label="Mapa" focused={focused}>
                            <Map size={24} color="#fff" />
                        </TabItem>
                    ),
                }}
            />


            <Tabs.Screen
                name="settings/index"
                options={{
                    title: 'Ajustes',
                    tabBarIcon: ({ focused }) => (
                        <TabItem label="Ajustes" focused={focused}>
                            <Settings size={24} color="#fff" />
                        </TabItem>
                    ),
                }}
            />

            {/* Páginas ocultas - no aparecen en la barra de navegación */}
            <Tabs.Screen
                name="report/[id]"
                options={{
                    href: null, // Oculta de la barra de navegación
                }}
            />
            <Tabs.Screen
                name="users/index"
                options={{
                    href: null, // Oculta de la barra de navegación
                }}
            />
            <Tabs.Screen
                name="proyect/index"
                options={{
                    href: null, // Oculta de la barra de navegación
                }}
            />
            <Tabs.Screen
                name="analytics/index"
                options={{
                    href: null, // Oculta de la barra de navegación
                }}
            />
            <Tabs.Screen
                name="profile/index"
                options={{
                    href: null, // Oculta de la barra de navegación
                }}
            />
        </Tabs>
    );
}
