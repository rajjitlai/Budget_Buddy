

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  Moon,
  Sun,
  Sparkles,
  BarChart3,
  ChevronRight,
  Info,
  Shield,
  HelpCircle,
  LogOut,
  Mail,
  Book,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Code,
  Instagram,
  Facebook,
  Github,
  Linkedin,
  Globe,
  FileText,
  Menu,
  RefreshCcw,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useUser } from '@/lib/UserContext';
import { useRouter, useNavigation } from 'expo-router';
import Constants from 'expo-constants';
import { DrawerActions } from '@react-navigation/native';
import { AnimatedScale } from '@/components/ui/AnimatedScale';
import * as SecureStore from 'expo-secure-store';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { InputField } from '@/components/ui/InputField';
import { SelectField } from '@/components/ui/SelectField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { exportData, importData } from '@/lib/services/dataPortability';
import { Download, Upload, Database, RefreshCw } from 'lucide-react-native';
import { checkForUpdates, UpdateInfo } from '@/lib/utils/updates';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  type: 'toggle' | 'select' | 'link';
  value?: boolean;
  options?: string[];
  selectedOption?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I add my first account?',
    answer: 'Go to the Dashboard tab and tap "Add Account". Enter your account name, select the account type (Salary, Spending, Savings, etc.), and set the initial balance. Your account will be created and displayed on the dashboard.',
  },
  {
    id: '2',
    question: 'How do transactions affect account balances?',
    answer: 'When you create a transaction, account balances are automatically updated. Expenses decrease the source account balance, income increases it, and transfers move money between accounts. The system prevents negative balances for expenses and transfers.',
  },
  {
    id: '3',
    question: 'What are AI Insights?',
    answer: 'AI Insights provide personalized financial recommendations based on your spending patterns, account balances, and budget plans. You can enable AI-powered insights (requires OpenRouter API key) or use rule-based insights that work without any API key.',
  },
  {
    id: '4',
    question: 'How do I set up a monthly budget?',
    answer: 'Go to the Charts tab to view detailed financial visualizations and trends. You can see your spending patterns, account distribution, and monthly trends.',
  },
  {
    id: '5',
    question: 'Can I edit or delete transactions?',
    answer: 'Yes! Go to the Transactions tab, switch to the "History" view, and you\'ll see all your transactions. Tap the edit icon to modify a transaction or the delete icon to remove it. Account balances will be automatically adjusted.',
  },
  {
    id: '6',
    question: 'How do I enable Advanced Charts?',
    answer: 'Go to Settings → Features and toggle "Show Advanced Charts" ON. Then visit the Insights screen to see detailed visualizations including savings rate, account distribution, spending by category, and monthly trends.',
  },
  {
    id: '7',
    question: 'Is my financial data secure?',
    answer: 'Yes! Your data is stored locally on your device in a secure SQLite database. We do not store your data on our servers, ensuring total privacy. You can also enable biometric locking for an extra layer of security.',
  },
  {
    id: '8',
    question: 'Can I use the app without an internet connection?',
    answer: 'Absolutely! Budget Buddy is a local-first app, meaning all your data is stored on your device. You only need an internet connection for optional features like AI-powered insights or cloud backups.',
  },
];

const currencies = ['INR (?)', 'USD ($)', 'EUR (?)', 'GBP (�)', 'JPY (�)'];

export default function SettingsScreen() {
  const { isDarkMode, toggleDarkMode, backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const { user } = useUser();
  const router = useRouter();
  const navigation = useNavigation();
  
  const [settings, setSettings] = useState({
    smartPlanner: true,
    advancedCharts: false,
  });
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);
  
  // AI Config State
  const [aiApiKey, setAiApiKey] = useState(user?.aiConfig?.apiKey || '');
  const [aiProvider, setAiProvider] = useState<string | null>(user?.aiConfig?.provider || 'openrouter');
  const [aiModel, setAiModel] = useState(user?.aiConfig?.model || 'google/gemma-3n-e2b-it:free');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || 'Rs.');

  useEffect(() => {
    loadSettings();
    checkAppUpdates();
  }, []);

  const checkAppUpdates = async () => {
    setIsCheckingUpdate(true);
    const info = await checkForUpdates();
    setUpdateInfo(info);
    setIsCheckingUpdate(false);
    if (!info.hasUpdate && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const loadSettings = async () => {
    try {
      const advancedCharts = await SecureStore.getItemAsync('advancedCharts');
      if (advancedCharts !== null) {
        setSettings((prev) => ({
          ...prev,
          advancedCharts: advancedCharts === 'true',
        }));
      }

      // Sync AI config from user context
      if (user?.aiConfig) {
        setAiApiKey(user.aiConfig.apiKey);
        setAiProvider(user.aiConfig.provider);
        setAiModel(user.aiConfig.model);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveAIConfig = async () => {
    try {
      await updateUser({
        aiConfig: {
          apiKey: aiApiKey,
          provider: (aiProvider as 'openrouter' | 'openai') || 'openrouter',
          model: aiModel,
        },
      });
      setShowAIModal(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error saving AI config:', error);
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
      Alert.alert('Error', 'Failed to export data');
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
              } catch (err: any) {
                Alert.alert('Error', err.message);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to read backup file');
    }
  };



  const handleToggle = async (key: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newValue = !settings[key as keyof typeof settings];
    setSettings((prev) => ({ ...prev, [key]: newValue }));
    
    // Save advancedCharts setting to SecureStore
    if (key === 'advancedCharts') {
      try {
        await SecureStore.setItemAsync('advancedCharts', String(newValue));
      } catch (error) {
        console.error('Error saving advanced charts setting:', error);
      }
    }
  };

  const toggleFAQ = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedFAQs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openEmail = () => {
    const email = 'rajjitlai@mail.com';
    const subject = 'Budget Buddy Support Request';
    const body = 'Please describe your issue or question:';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch((err) => {
      console.error('Error opening email:', err);
    });
  };

  const openDocumentation = () => {
    const url = 'https://budgetbuddy.app/docs';
    Linking.openURL(url).catch((err) => {
      console.error('Error opening documentation:', err);
    });
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
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <AnimatedScale 
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={[styles.iconButton, { backgroundColor: `${colors.primary[500]}10`, marginRight: spacing.md }]}
            >
              <Menu size={22} color={textSecondary} />
            </AnimatedScale>
            <View>
              <Text style={[styles.title, { color: textPrimary }]}>
                Settings
              </Text>
              <Text style={[styles.subtitle, { color: textSecondary }]}>
                App preferences
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* General Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <SectionHeader title="General" />
          <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
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
          </View>
        </Animated.View>

        {/* AI Configuration Section */}
        <Animated.View entering={FadeInDown.delay(250).duration(500)} style={{ marginTop: spacing.lg }}>
          <SectionHeader title="AI Features" />
          <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
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
          </View>
        </Animated.View>

        {/* Data Management Section */}
        <Animated.View entering={FadeInDown.delay(280).duration(500)} style={{ marginTop: spacing.lg }}>
          <SectionHeader title="Data Management" />
          <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
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
          </View>
        </Animated.View>

        {/* About Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ marginTop: spacing.lg }}>
          <SectionHeader title="About" />
          <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
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
          </View>
        </Animated.View>

        {/* About This App Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={{ marginTop: spacing.lg }}>
          <SectionHeader title="About This App" />
          <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
            <View style={[styles.aboutCard, { borderBottomColor: borderColor }]}>
              <Text style={[styles.aboutTitle, { color: textPrimary }]}>Budget Buddy</Text>
              <Text style={[styles.aboutDescription, { color: textSecondary }]}>
                Your personal finance companion. Track accounts, manage transactions, plan budgets, and get AI-powered financial insights.
              </Text>
              <View style={styles.aboutInfo}>
                <Text style={[styles.aboutInfoText, { color: textSecondary }]}>
                  Version {Constants.expoConfig?.version || '2.1.0'}
                </Text>
                <Text style={[styles.aboutInfoText, { color: textSecondary }]}>
                  © {new Date().getFullYear()} Budget Buddy
                </Text>
              </View>
              {/* Check for Updates Button */}
              <TouchableOpacity
                onPress={checkAppUpdates}
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
          </View>
        </Animated.View>

        {/* Developer Section */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={{ marginTop: spacing.lg }}>
          <SectionHeader title="Developer" />
          <View style={[styles.settingsCard, { backgroundColor: cardBackground }]}>
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
          </View>
        </Animated.View>



        {/* App Info */}
        <Animated.View
          entering={FadeInDown.delay(700).duration(500)}
          style={styles.appInfo}
        >
          <Text style={[styles.appName, { color: textPrimary }]}>Budget Buddy</Text>
          <Text style={[styles.appVersion, { color: textSecondary }]}>
            Version {Constants.expoConfig?.version || '2.1.0'}
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.modalScroll}
          contentContainerStyle={styles.modalContentContainer}
        >
          <Text style={[styles.modalLastUpdated, { color: textSecondary }]}>
            Last Updated: May 2026
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            1. Information We Collect
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            Budget Buddy collects the following information to provide you with financial management services:
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Account information (account names, types, balances)
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Transaction data (amounts, categories, dates, notes)
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Monthly budget plans and allocations
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • User account information (name, email) for authentication
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            2. How We Use Your Information
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            We use your information to:
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Provide financial tracking and budgeting features
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Generate AI-powered financial insights and recommendations
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Calculate and display your net worth and account balances
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Maintain your account and provide customer support
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            3. Data Storage and Security
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            Your financial data is stored locally on your device using a secure SQLite database. We implement the following security measures:
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Local-only data storage (we never see your financial data)
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Optional biometric locking (FaceID/Fingerprint)
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Secure credential storage for settings using Expo SecureStore
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • No tracking or third-party analytics
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            4. Third-Party Services
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            Budget Buddy uses the following third-party services only when explicitly requested:
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • OpenRouter (optional): For AI-powered insights generation
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            We do not share your raw financial data with any third-party services unless you use the AI insights feature, in which case only anonymized spending summaries are sent.
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            5. Your Rights
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            You have the right to:
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Access your personal and financial data
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Update or correct your information
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Delete your account and all associated data
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Export your data at any time
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            6. Data Retention
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            We retain your data for as long as your account is active. When you delete your account, all associated data is permanently removed from our systems.
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            7. Children's Privacy
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            Budget Buddy is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13.
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            8. Changes to This Policy
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this policy.
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            9. Contact Us
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            If you have questions about this Privacy Policy or our data practices, please contact us through the Help & Support section in the app settings.
          </Text>
        </ScrollView>
      </ModalSheet>

      {/* Terms of Service Modal */}
      <ModalSheet
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms of Service"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.modalScroll}
          contentContainerStyle={styles.modalContentContainer}
        >
          <Text style={[styles.modalLastUpdated, { color: textSecondary }]}>
            Last Updated: May 2026
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            1. Acceptance of Terms
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            By accessing and using Budget Buddy, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use the application.
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            2. Description of Service
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            Budget Buddy is a personal finance management application that helps you track accounts, manage transactions, plan budgets, and receive AI-powered financial insights. The service is provided "as is" for your personal use.
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            3. User Accounts
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            To use Budget Buddy, you must:
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Create an account with accurate and complete information
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Maintain the security of your account credentials
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Be responsible for all activities under your account
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Notify us immediately of any unauthorized access
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            4. Acceptable Use
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            You agree not to:
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Use the service for any illegal or unauthorized purpose
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Attempt to gain unauthorized access to the service or other users' accounts
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Interfere with or disrupt the service or servers
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Use automated systems to access the service without permission
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            5. Financial Information
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            Budget Buddy is a tool to help you manage your finances. However:
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • We do not provide financial, investment, or tax advice
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • All financial decisions are your sole responsibility
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • AI insights are recommendations only, not professional advice
          </Text>
          <Text style={[styles.modalBulletPoint, { color: textSecondary }]}>
            • Consult a qualified financial advisor for personalized advice
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            6. Data Accuracy
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            You are responsible for the accuracy of all financial data you enter into Budget Buddy. We are not liable for any errors, omissions, or inaccuracies in the data you provide.
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            7. Service Availability
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            We strive to provide reliable service but do not guarantee uninterrupted or error-free operation. The service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            8. Limitation of Liability
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            Budget Buddy is provided "as is" without warranties of any kind. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the service, including but not limited to financial losses or data loss.
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            9. Intellectual Property
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            All content, features, and functionality of Budget Buddy are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any part of the service without our permission.
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            10. Termination
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            We reserve the right to terminate or suspend your account at any time for violation of these terms. You may also delete your account at any time through the settings.
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            11. Changes to Terms
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            12. Governing Law
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            These terms are governed by applicable laws. Any disputes will be resolved through appropriate legal channels.
          </Text>

          <Text style={[styles.modalSectionTitle, { color: textPrimary }]}>
            13. Contact
          </Text>
          <Text style={[styles.modalContent, { color: textSecondary }]}>
            For questions about these Terms of Service, please contact us through the Help & Support section in the app settings.
          </Text>
        </ScrollView>
      </ModalSheet>

      {/* Currency Selection Modal */}
      <ModalSheet
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        title="Select Currency"
      >
        <View style={styles.modalBody}>
          <Text style={[styles.modalHint, { color: textSecondary }]}>
            Choose the currency symbol to be used across the application.
          </Text>
          <View style={styles.currencyGrid}>
            {['Rs.', '$', '€', '£', '¥', 'CHF', 'A$', 'C$'].map((curr) => (
              <TouchableOpacity
                key={curr}
                onPress={() => handleSaveCurrency(curr)}
                style={[
                  styles.currencyOption,
                  { 
                    backgroundColor: selectedCurrency === curr ? `${colors.primary[500]}20` : cardBackground,
                    borderColor: selectedCurrency === curr ? colors.primary[500] : borderColor
                  }
                ]}
              >
                <Text style={[
                  styles.currencyText, 
                  { color: selectedCurrency === curr ? colors.primary[500] : textPrimary }
                ]}>
                  {curr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ModalSheet>

      {/* AI Configuration Modal */}
      <ModalSheet
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        title="AI Configuration"
      >
        <View style={styles.modalBody}>
          <Text style={[styles.modalHint, { color: textSecondary }]}>
            Personalize your AI insights by providing your own API key. Your key is stored securely on your device.
          </Text>
          
          <SelectField
            label="API Provider"
            options={[
              { id: 'openrouter', label: 'OpenRouter (Recommended)', icon: 'Globe' },
              { id: 'openai', label: 'OpenAI', icon: 'Sparkles' },
            ]}
            value={aiProvider}
            onChange={setAiProvider}
          />

          <InputField
            label="API Key"
            placeholder="sk-..."
            value={aiApiKey}
            onChangeText={setAiApiKey}
            secureTextEntry
          />

          <InputField
            label="Model Name"
            placeholder={aiProvider === 'openrouter' ? 'google/gemma-3-4b-it:free' : 'gpt-4o-mini'}
            value={aiModel}
            onChangeText={setAiModel}
          />

          <View style={styles.modalHintContainer}>
            <Info size={16} color={colors.primary[500]} />
            <Text style={[styles.modalHintText, { color: textSecondary }]}>
              {aiProvider === 'openrouter' 
                ? 'OpenRouter allows using free models like Gemma or paid ones like Claude/GPT.'
                : 'OpenAI requires a paid API key and balance.'}
            </Text>
          </View>

          <View style={styles.modalActions}>
            <PrimaryButton
              title="Save Configuration"
              onPress={handleSaveAIConfig}
              fullWidth
              size="lg"
            />
          </View>
        </View>
      </ModalSheet>

      {/* Help & Support Modal */}
      <ModalSheet
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Help & Support"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.modalScroll}
          contentContainerStyle={styles.modalContentContainer}
        >
          {/* Quick Actions */}
          <View style={styles.modalQuickActions}>
            <TouchableOpacity
              onPress={openEmail}
              style={[styles.modalActionCard, { backgroundColor: cardBackground, borderColor }]}
            >
              <View style={[styles.modalActionIcon, { backgroundColor: `${colors.primary[500]}15` }]}>
                <Mail size={24} color={colors.primary[500]} />
              </View>
              <Text style={[styles.modalActionTitle, { color: textPrimary }]}>Email Support</Text>
              <Text style={[styles.modalActionSubtitle, { color: textSecondary }]}>
                Get help via email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openDocumentation}
              style={[styles.modalActionCard, { backgroundColor: cardBackground, borderColor }]}
            >
              <View style={[styles.modalActionIcon, { backgroundColor: `${colors.info}15` }]}>
                <Book size={24} color={colors.info} />
              </View>
              <Text style={[styles.modalActionTitle, { color: textPrimary }]}>Documentation</Text>
              <Text style={[styles.modalActionSubtitle, { color: textSecondary }]}>
                User guides & tutorials
              </Text>
              <ExternalLink size={14} color={textSecondary} style={styles.modalExternalIcon} />
            </TouchableOpacity>
          </View>

          {/* Getting Started */}
          <Text style={[styles.modalSectionHeader, { color: textPrimary }]}>Getting Started</Text>
          <View style={[styles.modalInfoCard, { backgroundColor: cardBackground, borderColor }]}>
            <Text style={[styles.modalContent, { color: textSecondary }]}>
              Welcome to Budget Buddy! Here's how to get started:
            </Text>
            <Text style={[styles.modalStepText, { color: textSecondary }]}>
              1. Add your accounts (Salary, Spending, Savings, etc.)
            </Text>
            <Text style={[styles.modalStepText, { color: textSecondary }]}>
              2. Record your transactions (income, expenses, transfers)
            </Text>
            <Text style={[styles.modalStepText, { color: textSecondary }]}>
              3. View detailed financial charts in the Charts tab
            </Text>
            <Text style={[styles.modalStepText, { color: textSecondary }]}>
              4. View insights and recommendations in the Insights tab
            </Text>
          </View>

          {/* FAQs */}
          <Text style={[styles.modalSectionHeader, { color: textPrimary }]}>Frequently Asked Questions</Text>
          <View style={styles.modalFaqContainer}>
            {faqs.map((faq) => {
              const isExpanded = expandedFAQs.includes(faq.id);
              return (
                <TouchableOpacity
                  key={faq.id}
                  onPress={() => toggleFAQ(faq.id)}
                  activeOpacity={0.7}
                  style={[styles.modalFaqCard, { backgroundColor: cardBackground, borderColor }]}
                >
                  <View style={styles.modalFaqHeader}>
                    <Text style={[styles.modalFaqQuestion, { color: textPrimary }]}>
                      {faq.question}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={20} color={textSecondary} />
                    ) : (
                      <ChevronDown size={20} color={textSecondary} />
                    )}
                  </View>
                  {isExpanded && (
                    <View>
                      <Animated.View entering={FadeIn.duration(200)}>
                        <Text style={[styles.modalFaqAnswer, { color: textSecondary }]}>
                          {faq.answer}
                        </Text>
                      </Animated.View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tips & Tricks */}
          <Text style={[styles.modalSectionHeader, { color: textPrimary }]}>Tips & Tricks</Text>
          <View style={[styles.modalInfoCard, { backgroundColor: cardBackground, borderColor }]}>
            <Text style={[styles.modalTipTitle, { color: textPrimary }]}>💡 Pro Tips</Text>
            <Text style={[styles.modalTipText, { color: textSecondary }]}>
              • Use categories consistently to get better spending insights
            </Text>
            <Text style={[styles.modalTipText, { color: textSecondary }]}>
              • Review your monthly trends to identify spending patterns
            </Text>
            <Text style={[styles.modalTipText, { color: textSecondary }]}>
              • Enable Advanced Charts for detailed financial visualizations
            </Text>
            <Text style={[styles.modalTipText, { color: textSecondary }]}>
              • Set up your monthly plan to track budget vs actual spending
            </Text>
            <Text style={[styles.modalTipText, { color: textSecondary }]}>
              • Use the search and filter features to find specific transactions quickly
            </Text>
          </View>

          {/* Contact Info */}
          <View style={[styles.modalContactCard, { backgroundColor: cardBackground, borderColor }]}>
            <Text style={[styles.modalContactTitle, { color: textPrimary }]}>Need More Help?</Text>
            <Text style={[styles.modalContactText, { color: textSecondary }]}>
              If you can't find what you're looking for, feel free to reach out:
            </Text>
            <TouchableOpacity
              onPress={openEmail}
              style={styles.modalContactButton}
            >
              <Mail size={18} color={colors.primary[500]} />
              <Text style={[styles.modalContactButtonText, { color: colors.primary[500] }]}>
                rajjitlai@mail.com
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ModalSheet>
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
  },
  settingsCard: {
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.sm,
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
  // Modal styles
  modalScroll: {
    maxHeight: 600,
  },
  modalContentContainer: {
    paddingBottom: spacing.xl,
  },
  modalLastUpdated: {
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  modalSectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  modalContent: {
    fontSize: typography.fontSizes.md,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  modalBulletPoint: {
    fontSize: typography.fontSizes.md,
    lineHeight: 24,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  modalQuickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  modalActionCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    ...shadows.sm,
  },
  modalActionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalActionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalActionSubtitle: {
    fontSize: typography.fontSizes.sm,
    textAlign: 'center',
  },
  modalExternalIcon: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  modalSectionHeader: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  modalInfoCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    ...shadows.sm,
  },
  modalStepText: {
    fontSize: typography.fontSizes.md,
    lineHeight: 24,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  modalFaqContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  modalFaqCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    ...shadows.sm,
  },
  modalFaqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalFaqQuestion: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    flex: 1,
    marginRight: spacing.md,
  },
  modalFaqAnswer: {
    fontSize: typography.fontSizes.md,
    lineHeight: 24,
    marginTop: spacing.md,
  },
  modalTipTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.md,
  },
  modalTipText: {
    fontSize: typography.fontSizes.md,
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  modalContactCard: {
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    ...shadows.sm,
  },
  modalContactTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.sm,
  },
  modalContactText: {
    fontSize: typography.fontSizes.md,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  modalContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  modalContactButtonText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
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
  modalBody: {
    paddingBottom: spacing.xl,
  },
  modalHint: {
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  modalHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: `${colors.primary[500]}10`,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  modalHintText: {
    flex: 1,
    fontSize: typography.fontSizes.xs,
    lineHeight: 16,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  currencyOption: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  currencyText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
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


