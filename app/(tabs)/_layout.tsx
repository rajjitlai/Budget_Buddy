import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { View, Text, StyleSheet, Platform } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Sparkles,
  Target,
  Settings,
  HelpCircle,
  Landmark,
  Bell,
  MessageCircle,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useData } from '@/lib/DataContext';
import { getUnreadCount } from '@/lib/services/notifications';
import { colors, borderRadius, typography, spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

export default function DrawerLayout() {
  const { isDarkMode, cardBackground, textPrimary, textSecondary } = useTheme();
  const router = useRouter();
  const { notifRefreshKey } = useData();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (e) {}
    };
    load();
  }, [notifRefreshKey]);

  function CustomDrawerContent(props: any) {
    return (
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <View style={styles.drawerHeader}>
          <Text style={[styles.drawerTitle, { color: textPrimary }]}>Budget Buddy</Text>
          <Text style={[styles.drawerSubtitle, { color: textSecondary }]}>v{Constants.expoConfig?.version || '2.2.1'} Premium</Text>
        </View>
        <DrawerItemList {...props} />
        <View style={styles.drawerDivider} />
        <DrawerItem
          label="Help & Support"
          labelStyle={{
            marginLeft: 8,
            fontWeight: '600',
            fontSize: 15,
            color: textSecondary,
          }}
          icon={({ color, size }) => <HelpCircle size={22} color={textSecondary} />}
          onPress={() => router.push('/help-support')}
          style={{
            borderRadius: borderRadius.lg,
            marginVertical: 4,
            marginHorizontal: 8,
          }}
        />
      </DrawerContentScrollView>
    );
  }

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: isDarkMode ? colors.slate[950] : '#ffffff',
          width: 280,
        },
        drawerActiveTintColor: colors.primary[500],
        drawerInactiveTintColor: textSecondary,
        drawerLabelStyle: {
          marginLeft: 8,
          fontWeight: '600',
          fontSize: 15,
        },
        drawerItemStyle: {
          borderRadius: borderRadius.lg,
          marginVertical: 4,
          paddingHorizontal: 8,
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Budget Buddy',
          drawerIcon: ({ color, size }) => (
            <LayoutDashboard size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="transactions"
        options={{
          drawerLabel: 'Transactions',
          title: 'History',
          drawerIcon: ({ color, size }) => (
            <ArrowLeftRight size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="charts"
        options={{
          drawerLabel: 'Analytics',
          title: 'Spending Analysis',
          drawerIcon: ({ color, size }) => (
            <BarChart3 size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="planner"
        options={{
          drawerLabel: 'Budget Planner',
          title: 'My Strategy',
          drawerIcon: ({ color, size }) => (
            <Target size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="loans"
        options={{
          drawerLabel: 'Loans',
          title: 'Loans Tracker',
          drawerIcon: ({ color, size }) => (
            <Landmark size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="notifications"
        options={{
          drawerLabel: 'Notifications',
          title: 'Alerts',
          drawerIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Bell size={22} color={color} />
              {unreadCount > 0 && (
                <View style={[styles.drawerBadge, { backgroundColor: colors.error }]}>
                  <Text style={styles.drawerBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="insights"
        options={{
          drawerLabel: 'AI Insights',
          title: 'Financial Advice',
          drawerIcon: ({ color, size }) => (
            <Sparkles size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="chat"
        options={{
          drawerLabel: 'AI Chat',
          title: 'Finance Assistant',
          drawerIcon: ({ color, size }) => (
            <MessageCircle size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'Settings',
          title: 'Preferences',
          drawerIcon: ({ color, size }) => (
            <Settings size={22} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
const styles = StyleSheet.create({
  drawerHeader: {
    padding: spacing.xl,
    paddingTop: spacing.xl * 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: spacing.md,
  },
  drawerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
  },
  drawerSubtitle: {
    fontSize: typography.fontSizes.xs,
    marginTop: 4,
    opacity: 0.7,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: spacing.md,
    marginHorizontal: spacing.xl,
  },
  drawerBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  drawerBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
  },
});
