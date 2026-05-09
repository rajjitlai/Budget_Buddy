import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Menu, Bell, CheckCheck, Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useData } from '@/lib/DataContext';
import {
  AppNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '@/lib/services/notifications';
import { AnimatedScale } from '@/components/ui/AnimatedScale';

export default function NotificationsScreen() {
  const { backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const { refreshKey, triggerNotifRefresh } = useData();
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error('Error loading notifications:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [refreshKey]);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    triggerNotifRefresh();
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    triggerNotifRefresh();
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    triggerNotifRefresh();
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    setNotifications([]);
    triggerNotifRefresh();
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={18} color={colors.warning} />;
      case 'success': return <CheckCircle size={18} color={colors.success} />;
      case 'info': return <Info size={18} color={colors.info} />;
    }
  };

  const getAccent = (type: AppNotification['type']) => {
    switch (type) {
      case 'warning': return colors.warning;
      case 'success': return colors.success;
      case 'info': return colors.info;
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.header}>
        <AnimatedScale
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={[styles.iconButton, { backgroundColor: `${colors.primary[500]}10` }]}
        >
          <Menu size={22} color={textSecondary} />
        </AnimatedScale>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: textPrimary }]}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={[styles.iconButton, { backgroundColor: `${colors.primary[500]}10` }]}>
              <CheckCheck size={18} color={colors.primary[500]} />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={[styles.iconButton, { backgroundColor: `${colors.error}10` }]}>
              <Trash2 size={18} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator color={colors.primary[500]} style={{ marginTop: spacing.xl * 2 }} />
        ) : notifications.length === 0 ? (
          <Animated.View entering={FadeInDown.springify()} style={[styles.emptyState, { backgroundColor: cardBackground, borderColor }]}>
            <Bell size={48} color={textSecondary} style={{ opacity: 0.3, marginBottom: spacing.md }} />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>All Clear!</Text>
            <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
              No alerts right now. We'll notify you when something needs your attention.
            </Text>
          </Animated.View>
        ) : (
          notifications.map((notification, index) => {
            const accent = getAccent(notification.type);
            return (
              <Animated.View key={notification.id} entering={FadeInDown.delay(index * 50).springify()}>
                <TouchableOpacity
                  onPress={() => !notification.read && handleMarkRead(notification.id)}
                  activeOpacity={0.85}
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor: notification.read ? cardBackground : `${accent}08`,
                      borderColor: notification.read ? borderColor : `${accent}30`,
                    },
                  ]}
                >
                  <View style={[styles.notifAccent, { backgroundColor: notification.read ? 'transparent' : accent }]} />
                  <View style={[styles.notifIcon, { backgroundColor: `${accent}15` }]}>
                    {getIcon(notification.type)}
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                      <Text style={[styles.notifTitle, { color: textPrimary, opacity: notification.read ? 0.7 : 1 }]} numberOfLines={1}>
                        {notification.title}
                      </Text>
                      <Text style={[styles.notifTime, { color: textSecondary }]}>{formatTime(notification.createdAt)}</Text>
                    </View>
                    <Text style={[styles.notifBody, { color: textSecondary }]}>{notification.body}</Text>
                    {!notification.read && (
                      <View style={[styles.unreadDot, { backgroundColor: accent }]} />
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(notification.id)} style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Trash2 size={14} color={textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
  },
  unreadBadge: {
    minWidth: 20, height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: typography.fontWeights.bold,
  },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  iconButton: {
    width: 40, height: 40,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingTop: spacing.sm, paddingHorizontal: spacing.xl },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  notifAccent: { width: 3 },
  notifIcon: {
    width: 38, height: 38,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.md,
    marginRight: 0,
  },
  notifContent: {
    flex: 1,
    padding: spacing.md,
    paddingLeft: spacing.sm,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  notifTitle: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    marginRight: spacing.sm,
  },
  notifTime: {
    fontSize: typography.fontSizes.xs,
  },
  notifBody: {
    fontSize: typography.fontSizes.xs,
    lineHeight: 16,
  },
  unreadDot: {
    width: 6, height: 6,
    borderRadius: 3,
    marginTop: spacing.xs,
  },
  deleteBtn: {
    padding: spacing.md,
    alignSelf: 'center',
  },
  emptyState: {
    marginTop: spacing.xl * 2,
    padding: spacing.xl * 2,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
