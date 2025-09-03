import { Tabs } from 'expo-router';

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
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
