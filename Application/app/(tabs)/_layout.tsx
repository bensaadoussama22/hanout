import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { LayoutDashboard, Package, Wallet, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function TabsLayout() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  if (!user) return <Redirect href="/(auth)/login" />;

  const isAdmin = user.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(8,8,24,0.92)',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={LayoutDashboard} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="articles"
        options={{
          title: 'Articles',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Package} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finance',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Wallet} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="parametres"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Settings} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ Icon, color, focused }: { Icon: any; color: unknown; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Icon size={20} color={color as string} strokeWidth={focused ? 2.5 : 1.8} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: { padding: 6, borderRadius: 10 },
  iconWrapActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
});
