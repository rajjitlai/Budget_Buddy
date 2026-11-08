

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Moon,
  Sun,
  Sparkles,
  BarChart3,
  ChevronRight,
  Info,
  Shield,
  HelpCircle,
  Code,
  Instagram,
  Facebook,
  Github,
  Linkedin,
  Globe,
  FileText,
  History,
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useUser } from '@/lib/UserContext';
import Constants from 'expo-constants';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import * as SecureStore from 'expo-secure-store';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ModalSheet } from '@/components/ui/ModalSheet';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { exportData, importData } from '@/lib/services/dataPortability';
import { checkForUpdates, UpdateInfo } from '@/lib/utils/updates';
import { LegalDocumentBody } from '@/components/LegalDocumentBody';
import { privacyPolicy, termsOfService } from '@/lib/content/legal';
import { CurrencyModal } from '@/components/settings/CurrencyModal';
import { AIConfigModal } from '@/components/settings/AIConfigModal';
import { HelpModal } from '@/components/settings/HelpModal';
import { ChangelogModal } from '@/components/settings/ChangelogModal';

export default function SettingsScreen() {
  const { isDarkMode, toggleDarkMode, backgroundColor, textPrimary, textSecondary, borderColor } = useTheme();
  const { user, updateUser } = useUser();
  
  const [settings, setSettings] = useState({
    smartPlanner: true,
    advancedCharts: false,
  });
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  
  // AI Config State
  const [aiApiKey, setAiApiKey] = useState(user?.aiConfig?.apiKey || '');
  const [aiProvider, setAiProvider] = useState<string | null>(user?.aiConfig?.provider || 'openrouter');
  const [aiModel, setAiModel] = useState(user?.aiConfig?.model || 'google/gemma-2-9b-it:free');
  const [aiCustomInstructions, setAiCustomInstructions] = useState(user?.aiConfig?.customInstructions || '');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || 'Rs.');

  useEffect(() => {
    loadSettings();
    checkAppUpdates();
  }, []);

  useEffect(() => {
    if (user?.aiConfig) {
      setAiApiKey(user.aiConfig.apiKey || '');
      setAiProvider(user.aiConfig.provider || 'openrouter');
      setAiModel(user.aiConfig.model || 'google/gemma-2-9b-it:free');
      setAiCustomInstructions(user.aiConfig.customInstructions || '');
    }
    if (user?.currency) {
      setSelectedCurrency(user.currency);
    }
  }, [user]);

  const checkAppUpdates = async () => {
    setIsCheckingUpdate(true);
    const info = await checkForUpdates();
    setUpdateInfo(info);
    setIsCheckingUpdate(false);
  };

  const handleManualUpdateCheck = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsCheckingUpdate(true);
    const info = await checkForUpdates();
    setUpdateInfo(info);
    setIsCheckingUpdate(false);

    if (info.hasUpdate) {
      Alert.alert(
        'Update Available',
        `Version ${info.latestVersion} is available.\n\n${info.releaseNotes ? info.releaseNotes.slice(0, 200) + '...' : ''}`,
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'View Release',
            onPress: () => {
              if (info.downloadUrl) {
                Linking.openURL(info.downloadUrl).catch(() => {});
              }
            },
          },
        ]
      );
    } else {
      Alert.alert('Up to Date', `You are running the latest version (v${info.latestVersion}).`);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const loadSettings = async () => {
    try {
      const advancedCharts = Platform.OS === 'web'
        ? localStorage.getItem('advancedCharts')
        : await SecureStore.getItemAsync('advancedCharts');
      if (advancedCharts !== null) {
        setSettings((prev) => ({
          ...prev,
          advancedCharts: advancedCharts === 'true',
        }));
      }

    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveAIConfig = async () => {
    if (!aiApiKey.trim()) {
      Alert.alert('Missing API Key', 'Please enter an API key before saving.');
      return;
    }
    try {
      await updateUser({
        aiConfig: {
          apiKey: aiApiKey.trim().replace(/^["']|["']$/g, ''),
          provider: (aiProvider as 'openrouter' | 'openai') || 'openrouter',
          model: aiModel.trim() || (aiProvider === 'openai' ? 'gpt-4o-mini' : 'openrouter/free'),
          customInstructions: aiCustomInstructions.trim() || undefined,
        },
      });
      setShowAIModal(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Saved', 'AI configuration saved successfully.');
    } catch (error) {
      console.error('Error saving AI config:', error);
      Alert.alert('Error', 'Failed to save AI configuration. Please try again.');
    }
  };

  const handleSaveCurrency = async (currency: string) => {
    try {
      setSelectedCurrency(currency);
      await updateUser({ currency });
      setShowCurrencyModal(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  const handleExportData = async () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      await exportData();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to export data');
    }
  };

  const handleImportData = async () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const jsonString = await FileSystem.readAsStringAsync(fileUri);

      Alert.alert(
        'Confirm Import',
        'This will OVERWRITE all your current data. Are you sure you want to proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Import', 
            style: 'destructive',
            onPress: async () => {
              try {
                await importData(jsonString);
                Alert.alert('Success', 'Data imported successfully. The app will now refresh.');
                // In a real app, you might want to reload the entire app state
              } catch (err) {
                Alert.alert('Error', err instanceof Error ? err.message : 'Error');
              }
            }
          }
        ]
      );
    } catch {
      Alert.alert('Error', 'Failed to read backup file');
    }
  };



  const handleToggle = async (key: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newValue = !settings[key as keyof typeof settings];
    setSettings((prev) => ({ ...prev, [key]: newValue }));
    
    // Save advancedCharts setting
    if (key === 'advancedCharts') {
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem('advancedCharts', String(newValue));
        } else {
          await SecureStore.setItemAsync('advancedCharts', String(newValue));
        }
      } catch (error) {
        console.error('Error saving advanced charts setting:', error);
      }
    }
  };

  const openLink = (url: string) => {
    // Add https:// if not present
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(fullUrl).catch((err) => {
      console.error('Error opening link:', err);
    });
  };

  const renderSettingItem = (
    icon: React.ComponentType<{ size: number; color: string }>,
    title: string,
    subtitle: string | undefined,
    type: 'toggle' | 'select' | 'link',
    value?: boolean,
    onPress?: () => void,
    selectedValue?: string
  ) => {
    const Icon = icon;
    return (
      <TouchableOpacity
        onPress={type !== 'toggle' ? onPress : undefined}
        activeOpacity={type === 'toggle' ? 1 : 0.7}
        style={[styles.settingItem, { borderBottomColor: borderColor }]}
      >
        <View style={[styles.settingIcon, { backgroundColor: `${colors.primary[500]}15` }]}>
          <Icon size={20} color={colors.primary[500]} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: textPrimary }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {type === 'toggle' && (
          <Switch
            value={value}
            onValueChange={onPress}
            trackColor={{ false: colors.slate[300], true: colors.primary[400] }}
            thumbColor={value ? colors.primary[500] : colors.slate[100]}
            ios_backgroundColor={colors.slate[300]}
          />
        )}
        {type === 'select' && (
          <View style={styles.selectValue}>
            <Text style={[styles.selectText, { color: colors.primary[500] }]}>
              {selectedValue}
            </Text>
            <ChevronRight size={18} color={textSecondary} />
          </View>
        )}
        {type === 'link' && <ChevronRight size={20} color={textSecondary} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <ScreenHeader
          entering={FadeInDown.delay(100).duration(500)}
          title="Settings"
          subtitle="App preferences"
        />

        {/* General Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <SectionHeader title="General" />
          <Card bordered={false} style={styles.settingsCard}>
            {renderSettingItem(
              Globe,
              'Currency',
              'Select your preferred currency symbol',
              'select',
              undefined,
              () => setShowCurrencyModal(true),
              selectedCurrency
            )}
            {renderSettingItem(
              isDarkMode ? Moon : Sun,
              'Dark Mode',
              isDarkMode ? 'Currently using dark theme' : 'Currently using light theme',
              'toggle',
              isDarkMode,
              () => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                toggleDarkMode();
              }
            )}
          </Card>
        </Animated.View>

        {/* AI Configuration Section */}
        <Animated.View entering={FadeInDown.delay(250).duration(500)} style={{ marginTop: spacing.lg }}>
          <SectionHeader title="AI Features" />
          <Card bordered={false} style={styles.settingsCard}>
            {renderSettingItem(
              Sparkles,
              'AI Configuration',
              user?.aiConfig?.apiKey ? 'Personal AI key configured' : 'Using free/rule-based insights',
              'link',
              undefined,
              () => setShowAIModal(true)
            )}
            {renderSettingItem(
              BarChart3,
              'Advanced Charts',
              'Show detailed spending visualizations',
              'toggle',
              settings.advancedCharts,
              () => handleToggle('advancedCharts')
            )}
          </Card>
        </Animated.View>

        {/* Data Management Section */}
        <Animated.View entering={FadeInDown.delay(280).duration(500)} style={{ marginTop: spacing.lg }}>
          <SectionHeader title="Data Management" />
          <Card bordered={false} style={styles.settingsCard}>
            {renderSettingItem(
              Download,
              'Export Data',
              'Backup your data to a JSON file',
              'link',
              undefined,
              handleExportData
            )}
            {renderSettingItem(
              Upload,
              'Import Data',
              'Restore from a Budget Buddy backup',
              'link',
              undefined,
              handleImportData
            )}
          </Card>
        </Animated.View>

        {/* About Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ marginTop: spacing.lg }}>
          <SectionHeader title="About" />
          <Card bordered={false} style={styles.settingsCard}>
            {renderSettingItem(
              Shield,
              'Privacy Policy',
              'View our privacy policy',
              'link',
              undefined,
              () => setShowPrivacyModal(true)
            )}
            {renderSettingItem(
              Info,
              'Terms of Service',
              'Read our terms and conditions',
              'link',
              undefined,
              () => setShowTermsModal(true)
            )}
            {renderSettingItem(
              HelpCircle,
              'Help & Support',
              'Get help and FAQs',
              'link',
              undefined,
              () => setShowHelpModal(true)
            )}
          </Card>
        </Animated.View>

        {/* About This App Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={{ marginTop: spacing.lg }}>
          <SectionHeader title="About This App" />
          <Card bordered={false} style={styles.settingsCard}>
            <View style={[styles.aboutCard, { borderBottomColor: borderColor }]}>
              <Text style={[styles.aboutTitle, { color: textPrimary }]}>Budget Buddy</Text>
              <Text style={[styles.aboutDescription, { color: textSecondary }]}>
                Your personal finance companion. Track accounts, manage transactions, plan budgets, and get AI-powered financial insights.
              </Text>
              <View style={styles.aboutInfo}>
                <Text style={[styles.aboutInfoText, { color: textSecondary }]}>
                  Version {Constants.expoConfig?.version || '2.4.0'}
                </Text>
                <Text style={[styles.aboutInfoText, { color: textSecondary }]}>
                  © {new Date().getFullYear()} Budget Buddy
                </Text>
              </View>
              {/* Check for Updates Button */}
              <TouchableOpacity
                onPress={handleManualUpdateCheck}
                disabled={isCheckingUpdate}
                style={[
                  styles.checkUpdateBtn,
                  { borderColor: colors.primary[500], opacity: isCheckingUpdate ? 0.6 : 1 }
                ]}
              >
                <RefreshCw
                  size={14}
                  color={colors.primary[500]}
                  style={isCheckingUpdate ? { opacity: 0.5 } : {}}
                />
                <Text style={[styles.checkUpdateText, { color: colors.primary[500] }]}>
                  {isCheckingUpdate
                    ? 'Checking...'
                    : updateInfo?.hasUpdate
                    ? `Update Available (v${updateInfo.latestVersion})`
                    : 'Check for Updates'}
                </Text>
              </TouchableOpacity>
            </View>
            {renderSettingItem(
              History,
              "What's New in v2.4.0",
              'View release notes & changelog',
              'link',
              undefined,
              () => setShowChangelogModal(true)
            )}
          </Card>
        </Animated.View>

        {/* Developer Section */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={{ marginTop: spacing.lg }}>
          <SectionHeader title="Developer" />
          <Card bordered={false} style={styles.settingsCard}>
            <View style={[styles.developerCard, { borderBottomColor: borderColor }]}>
              <View style={styles.developerHeader}>
                <View style={[styles.developerIcon, { backgroundColor: `${colors.primary[500]}15` }]}>
                  <Code size={24} color={colors.primary[500]} />
                </View>
                <View style={styles.developerInfo}>
                  <Text style={[styles.developerName, { color: textPrimary }]}>
                    Rajjit Laishram
                  </Text>
                  <Text style={[styles.developerRole, { color: textSecondary }]}>
                    Developer & Creator
                  </Text>
                </View>
              </View>
            </View>
            {renderSettingItem(
              Instagram,
              'Instagram',
              '@rajjitlaishram',
              'link',
              undefined,
              () => openLink('https://instagram.com/rajjitlaishram')
            )}
            {renderSettingItem(
              Facebook,
              'Facebook',
              '@rajjitlaishram',
              'link',
              undefined,
              () => openLink('https://facebook.com/rajjitlaishram')
            )}
            {renderSettingItem(
              Github,
              'GitHub',
              'rajjitlai',
              'link',
              undefined,
              () => openLink('github.com/rajjitlai')
            )}
            {renderSettingItem(
              Linkedin,
              'LinkedIn',
              'rajjitlaishram',
              'link',
              undefined,
              () => openLink('linkedin.com/in/rajjitlaishram')
            )}
            {renderSettingItem(
              Globe,
              'Portfolio',
              'rajjitlaishram.netlify.app',
              'link',
              undefined,
              () => openLink('rajjitlaishram.netlify.app')
            )}
            {renderSettingItem(
              FileText,
              'Blog',
              'rjsblog.in',
              'link',
              undefined,
              () => openLink('rjsblog.in')
            )}
          </Card>
        </Animated.View>



        {/* App Info */}
        <Animated.View
          entering={FadeInDown.delay(700).duration(500)}
          style={styles.appInfo}
        >
          <Text style={[styles.appName, { color: textPrimary }]}>Budget Buddy</Text>
          <Text style={[styles.appVersion, { color: textSecondary }]}>
            Version {Constants.expoConfig?.version || '2.4.0'}
          </Text>
          {updateInfo?.hasUpdate && (
            <TouchableOpacity 
              style={styles.updateBadge}
              onPress={() => updateInfo.downloadUrl && Linking.openURL(updateInfo.downloadUrl)}
            >
              <RefreshCw size={12} color="#fff" />
              <Text style={styles.updateBadgeText}>Update Available (v{updateInfo.latestVersion})</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.appTagline, { color: textSecondary }]}>
            Your personal finance companion
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Privacy Policy Modal */}
      <ModalSheet
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
      >
        <LegalDocumentBody document={privacyPolicy} />
      </ModalSheet>

      {/* Terms of Service Modal */}
      <ModalSheet
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms of Service"
      >
        <LegalDocumentBody document={termsOfService} />
      </ModalSheet>

      {/* Currency Selection Modal */}
      <CurrencyModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        selectedCurrency={selectedCurrency}
        onSelect={handleSaveCurrency}
      />

      {/* AI Configuration Modal */}
      <AIConfigModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        apiKey={aiApiKey}
        provider={aiProvider}
        model={aiModel}
        customInstructions={aiCustomInstructions}
        onApiKeyChange={setAiApiKey}
        onProviderChange={setAiProvider}
        onModelChange={setAiModel}
        onCustomInstructionsChange={setAiCustomInstructions}
        onSave={handleSaveAIConfig}
        savedConfig={user?.aiConfig ?? null}
      />

      {/* Help & Support Modal */}
      <HelpModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Changelog Modal */}
      <ChangelogModal
        visible={showChangelogModal}
        onClose={() => setShowChangelogModal(false)}
      />
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
  settingsCard: {
    marginHorizontal: spacing.xl,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  settingSubtitle: {
    fontSize: typography.fontSizes.sm,
    marginTop: 2,
  },
  selectValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  appName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  appVersion: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
  },
  appTagline: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  aboutCard: {
    padding: spacing.lg,
    borderBottomWidth: 0,
  },
  aboutTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.sm,
  },
  aboutDescription: {
    fontSize: typography.fontSizes.md,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  aboutInfo: {
    gap: spacing.xs,
  },
  aboutInfoText: {
    fontSize: typography.fontSizes.sm,
  },
  checkUpdateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  checkUpdateText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },

  developerCard: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  developerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  developerIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  developerInfo: {
    flex: 1,
  },
  developerName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  developerRole: {
    fontSize: typography.fontSizes.sm,
  },
  updateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary[500],
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  updateBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});


