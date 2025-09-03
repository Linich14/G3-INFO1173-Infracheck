import { Tabs } from 'expo-router';
import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';

export default function Layout() {
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
        };
    }, []);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    display: keyboardVisible ? 'none' : 'flex',
                },
            }}>
            <Tabs.Screen
                name="home/index"
                options={{
                    title: 'Home',
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="(map)/index"
                options={{
                    title: 'Mapa',
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="(map)/create_report"
                options={{
                    href: null,
                    headerShown: false,
                }}
            />
        </Tabs>
    );
}
