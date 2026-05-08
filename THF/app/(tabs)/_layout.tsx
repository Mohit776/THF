import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#E8304A',
            tabBarStyle: {
                height: 60 + insets.bottom,
                paddingBottom: insets.bottom > 0 ? insets.bottom : 4,
                paddingTop: 4,
                borderTopWidth: 1,
                borderTopColor: '#f0f0f0',
                backgroundColor: '#fff',
                elevation: 0,
                shadowOpacity: 0,
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '500',
            }
        }}>
            <Tabs.Screen
                name="Dashboard"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="MyBookings"
                options={{
                    title: 'Bookings',
                    tabBarIcon: ({ color }) => <FontAwesome name="calendar" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="Earnings"
                options={{
                    title: 'Earnings',
                    tabBarIcon: ({ color }) => <FontAwesome name="money" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="Profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }: { color: string }) => <FontAwesome name="user" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
