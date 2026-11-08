
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BarChart3 } from 'lucide-react-native';
import { RefreshButton } from '@/components/RefreshButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useData } from '@/lib/DataContext';
import { AdvancedCharts } from '@/components/AdvancedCharts';

export default function ChartsScreen() {
  const { backgroundColor, textSecondary } = useTheme();
  const { accounts, transactions, monthlyPlan, loading, refreshKey, triggerRefresh } = useData();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (refreshing) setRefreshing(false);
  }, [refreshKey, refreshing]);

  const refreshData = () => {
    setRefreshing(true);
    triggerRefresh();
  };

  const handleRefresh = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    refreshData();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={[styles.loadingText, { color: textSecondary }]}>
            Loading charts...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Header */}
        <ScreenHeader
          entering={FadeInDown.delay(100).duration(500)}
          title="Financial Charts"
          subtitle="Visualize your data"
          icon={<BarChart3 size={28} color={colors.primary[500]} />}
          right={<RefreshButton onPress={refreshData} refreshing={refreshing} />}
        />

        {/* Charts */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <AdvancedCharts
            accounts={accounts}
            transactions={transactions}
            monthlyPlan={monthlyPlan || undefined}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['5xl'],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    marginTop: spacing.sm,
  },
});

