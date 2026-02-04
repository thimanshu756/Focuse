import { Tabs } from 'expo-router';
import { Home, ListTodo, Trees, BarChart3 } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import { Image, View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';

export default function TabLayout() {
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const getAvatarColor = (id?: string) => {
    if (!id) return COLORS.primary.accent;
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary.accent,
        tabBarInactiveTintColor: COLORS.text.muted,
        tabBarStyle: {
          backgroundColor: COLORS.background.card,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <ListTodo size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="forest"
        options={{
          title: 'Focuse',
          tabBarIcon: ({ color, size }) => <Trees size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: focused ? 2 : 0,
              borderColor: COLORS.primary.accent,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: user?.avatar ? 'transparent' : getAvatarColor(user?.id)
            }}>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

