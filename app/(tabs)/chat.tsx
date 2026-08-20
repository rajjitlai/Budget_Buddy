import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Menu, Send, Sparkles, MessageCircle, Settings, Trash2, Zap, ZapOff } from 'lucide-react-native';
import * as Crypto from 'expo-crypto';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useUser } from '@/lib/UserContext';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useData } from '@/lib/DataContext';
import { formatCurrency } from '@/lib/types';
import { getAccounts } from '@/lib/services/accounts';
import { getTransactions } from '@/lib/services/transactions';
import { getLoans } from '@/lib/services/loans';
import { ChatMessage, FinancialContext, sendChatMessage, getChatHistory, saveChatMessage, clearChatHistory, buildOfflineResponse } from '@/lib/services/aiChat';
import { AnimatedScale } from '@/components/ui/AnimatedScale';
import { MarkdownView } from '@/components/ui/MarkdownView';

const SUGGESTED_PROMPTS = [
  'How is my savings rate?',
  'Where am I spending the most?',
  'How can I improve my budget?',
  'What is my net worth?',
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode, backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const { user } = useUser();
  const { refreshKey } = useData();
  const navigation = useNavigation();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [sending, setSending] = useState(false);
  const [context, setContext] = useState<FinancialContext | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);

  const keyboard = useAnimatedKeyboard({ isStatusBarTranslucentAndroid: true });

  const animatedBottomStyle = useAnimatedStyle(() => {
    const kbHeight = keyboard.height.value;
    const basePadding = Math.max(insets.bottom, spacing.xs) + 4;
    return {
      paddingBottom: kbHeight > 0 ? kbHeight : basePadding,
    };
  });

  const hasApiKey = !!(user?.aiConfig?.apiKey);
  const usingAI = hasApiKey && aiEnabled;

  useEffect(() => {
    loadContext();
    loadHistory();
  }, [refreshKey]);

  const loadHistory = async () => {
    try {
      const history = await getChatHistory();
      setMessages(history);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (e) {
      console.error('Error loading chat history:', e);
    }
  };

  const handleClearChat = async () => {
    await clearChatHistory();
    setMessages([]);
    if (Platform.OS !== 'web') {
      const Haptics = await import('expo-haptics');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const loadContext = async () => {
    try {
      const [accounts, transactions, loans] = await Promise.all([
        getAccounts(),
        getTransactions({}),
        getLoans(),
      ]);
      const now = new Date();
      const monthTxns = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const income = monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
      const categoryMap: Record<string, number> = {};
      monthTxns.filter((t) => t.type === 'expense').forEach((t) => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });
      const topCategories = Object.entries(categoryMap)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);
      const netWorth = accounts.reduce((s, a) => s + a.balance, 0);
      const totalLoansOwed = loans.filter((l) => l.type === 'borrowed').reduce((s, l) => s + l.remaining, 0);
      const totalLoansLent = loans.filter((l) => l.type === 'lent').reduce((s, l) => s + l.remaining, 0);

      setContext({
        netWorth,
        currency: user?.currency || 'Rs.',
        monthlyIncome: income,
        monthlyExpenses: expenses,
        savingsRate,
        topCategories,
        accountCount: accounts.length,
        totalLoansOwed,
        totalLoansLent,
      });
    } catch (e) {
      console.error('Error loading chat context:', e);
    }
  };

  const send = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || sending || !context) return;

    const userMsg: ChatMessage = {
      id: Crypto.randomUUID(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await saveChatMessage(userMsg);
      const chatResult = usingAI
        ? await sendChatMessage(messageText, messages, context)
        : {
            reply: buildOfflineResponse(
              messageText,
              context ?? {
                netWorth: 0,
                currency: user?.currency || 'Rs.',
                monthlyIncome: 0,
                monthlyExpenses: 0,
                savingsRate: 0,
                topCategories: [],
                accountCount: 0,
              }
            ),
            isAI: false,
          };

      const assistantMsg: ChatMessage = {
        id: Crypto.randomUUID(),
        role: 'assistant',
        content: chatResult.reply,
        timestamp: new Date().toISOString(),
        isAI: chatResult.isAI,
        modelUsed: chatResult.modelUsed,
      };
      await saveChatMessage(assistantMsg);
      setMessages((prev) => [...prev, assistantMsg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.error('Chat error:', e);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedScale
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={[styles.iconButton, { backgroundColor: `${colors.primary[500]}10` }]}
        >
          <Menu size={22} color={textSecondary} />
        </AnimatedScale>
        <View style={styles.headerCenter}>
          <Sparkles size={18} color={colors.primary[500]} />
          <Text style={[styles.title, { color: textPrimary }]}>AI Chat</Text>
        </View>
        <View style={styles.headerRight}>
          {hasApiKey && (
            <AnimatedScale
              onPress={() => setAiEnabled(v => !v)}
              style={[styles.iconButton, { backgroundColor: usingAI ? `${colors.primary[500]}15` : `${colors.error}10` }]}
            >
              {usingAI
                ? <Zap size={18} color={colors.primary[500]} />
                : <ZapOff size={18} color={colors.error} />}
            </AnimatedScale>
          )}
          {messages.length > 0 && (
            <AnimatedScale
              onPress={handleClearChat}
              style={[styles.iconButton, { backgroundColor: `${colors.error}10` }]}
            >
              <Trash2 size={18} color={colors.error} />
            </AnimatedScale>
          )}
          <AnimatedScale
            onPress={() => router.push('/settings' as any)}
            style={[styles.iconButton, { backgroundColor: `${colors.primary[500]}10` }]}
          >
            <Settings size={20} color={textSecondary} />
          </AnimatedScale>
        </View>
      </View>

      {/* Status banner */}
      {!hasApiKey ? (
        <View style={[styles.apiBanner, { backgroundColor: `${colors.warning}15`, borderColor: `${colors.warning}30` }]}>
          <Text style={[styles.apiBannerText, { color: colors.warning }]}>
            No AI key set — using smart offline calculations. Add a key in Settings for full AI.
          </Text>
        </View>
      ) : !aiEnabled ? (
        <View style={[styles.apiBanner, { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}25` }]}>
          <Text style={[styles.apiBannerText, { color: colors.error }]}>
            AI mode paused — using offline calculations. Tap ⚡ to re-enable.
          </Text>
        </View>
      ) : (
        <View style={[styles.apiBanner, { backgroundColor: `${colors.primary[500]}10`, borderColor: `${colors.primary[500]}25` }]}>
          <Sparkles size={14} color={colors.primary[500]} />
          <Text style={[styles.apiBannerText, { color: colors.primary[500], marginLeft: 6 }]}>
            Live AI Active · {user?.aiConfig?.provider === 'openai' ? 'OpenAI' : 'OpenRouter'} ({user?.aiConfig?.model || 'openrouter/free'})
          </Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {/* Welcome / Empty state */}
          {messages.length === 0 && (
            <Animated.View entering={FadeInDown.springify()} style={styles.emptyState}>
              <View style={[styles.avatarLarge, { backgroundColor: `${colors.primary[500]}15` }]}>
                <MessageCircle size={40} color={colors.primary[500]} />
              </View>
              <Text style={[styles.emptyTitle, { color: textPrimary }]}>Your Finance Assistant</Text>
              <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
                Ask me anything about your spending, savings, or budget.
              </Text>
              <View style={styles.suggestedRow}>
                {SUGGESTED_PROMPTS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => send(p)}
                    style={[styles.suggestChip, { backgroundColor: cardBackground, borderColor }]}
                  >
                    <Text style={[styles.suggestChipText, { color: textPrimary }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Messages */}
          {messages.map((msg, index) => (
            <Animated.View
              key={msg.id}
              entering={msg.role === 'user' ? FadeInRight.duration(250) : FadeInLeft.duration(250)}
              style={[styles.msgRow, msg.role === 'user' ? styles.msgRowUser : styles.msgRowAssistant]}
            >
              {msg.role === 'assistant' && (
                <View style={[styles.avatar, { backgroundColor: `${colors.primary[500]}15` }]}>
                  <Sparkles size={14} color={colors.primary[500]} />
                </View>
              )}
              <View style={[
                styles.bubble,
                msg.role === 'user'
                  ? { backgroundColor: colors.primary[500] }
                  : { backgroundColor: cardBackground, borderColor, borderWidth: 1 },
              ]}>
                <MarkdownView
                  content={msg.content}
                  isUserBubble={msg.role === 'user'}
                  textColor={msg.role === 'user' ? '#ffffff' : textPrimary}
                />
                <Text style={[styles.bubbleTime, { color: msg.role === 'user' ? 'rgba(255,255,255,0.6)' : textSecondary }]}>
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            </Animated.View>
          ))}

          {/* Typing indicator */}
          {sending && (
            <Animated.View entering={FadeInLeft.duration(200)} style={[styles.msgRow, styles.msgRowAssistant]}>
              <View style={[styles.avatar, { backgroundColor: `${colors.primary[500]}15` }]}>
                <Sparkles size={14} color={colors.primary[500]} />
              </View>
              <View style={[styles.bubble, { backgroundColor: cardBackground, borderColor, borderWidth: 1 }]}>
                <ActivityIndicator size="small" color={colors.primary[500]} />
              </View>
            </Animated.View>
          )}

          <View style={{ height: 12 }} />
        </ScrollView>

        {/* Input bar */}
        <Animated.View
          style={[
            styles.inputContainer,
            { backgroundColor },
            animatedBottomStyle,
          ]}
        >
          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: cardBackground,
                borderColor: isFocused ? colors.primary[500] : borderColor,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: textPrimary }]}
              placeholder="Ask about your finances..."
              placeholderTextColor={textSecondary}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              onFocus={() => {
                setIsFocused(true);
                setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
              }}
              onBlur={() => setIsFocused(false)}
            />
            <TouchableOpacity
              onPress={() => send()}
              disabled={!input.trim() || sending || !context}
              activeOpacity={0.7}
              style={[
                styles.sendBtn,
                {
                  backgroundColor:
                    input.trim() && !sending && context
                      ? colors.primary[500]
                      : isDarkMode
                      ? 'rgba(255, 255, 255, 0.08)'
                      : colors.slate[200],
                },
              ]}
            >
              <Send
                size={18}
                color={
                  input.trim() && !sending && context
                    ? '#ffffff'
                    : textSecondary
                }
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
  },
  iconButton: {
    width: 40, height: 40,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apiBanner: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  apiBannerText: {
    fontSize: typography.fontSizes.xs,
    lineHeight: 16,
  },
  messagesContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
  },
  avatarLarge: {
    width: 72, height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  suggestedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  suggestChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  suggestChipText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAssistant: { justifyContent: 'flex-start' },
  avatar: {
    width: 28, height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius['2xl'],
  },
  bubbleText: {
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 6,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    minHeight: 48,
    gap: spacing.sm,
    ...shadows.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    maxHeight: 120,
    minHeight: 36,
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: spacing.xs,
    textAlignVertical: 'center',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
