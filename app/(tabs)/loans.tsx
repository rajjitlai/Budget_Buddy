import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Plus,
  Menu,
  TrendingDown,
  TrendingUp,
  Calendar,
  User,
  Trash2,
  Edit,
  Minus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, typography, spacing, shadows } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useUser } from '@/lib/UserContext';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useData } from '@/lib/DataContext';
import { formatCurrency } from '@/lib/types';
import {
  Loan,
  getLoans,
  createLoan,
  updateLoan,
  deleteLoan,
  recordRepayment,
} from '@/lib/services/loans';
import { ModalSheet } from '@/components/ui/ModalSheet';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AnimatedScale } from '@/components/ui/AnimatedScale';
import { SectionHeader } from '@/components/ui/SectionHeader';

type LoanType = 'borrowed' | 'lent';

export default function LoansScreen() {
  const { backgroundColor, textPrimary, textSecondary, cardBackground, borderColor } = useTheme();
  const { user } = useUser();
  const { refreshKey } = useData();
  const navigation = useNavigation();
  const displayCurrency = (amount: number) => formatCurrency(amount, user?.currency);

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isRepayModalVisible, setIsRepayModalVisible] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<LoanType>('borrowed');
  const [formPrincipal, setFormPrincipal] = useState('');
  const [formRemaining, setFormRemaining] = useState('');
  const [formRate, setFormRate] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formParty, setFormParty] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const loadLoans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLoans();
      setLoans(data);
    } catch (e) {
      console.error('Error loading loans:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLoans();
  }, [refreshKey]);

  const resetForm = () => {
    setFormName('');
    setFormType('borrowed');
    setFormPrincipal('');
    setFormRemaining('');
    setFormRate('');
    setFormDueDate('');
    setFormParty('');
    setFormNotes('');
    setEditingLoan(null);
  };

  const handleAdd = async () => {
    if (!formName || !formPrincipal) return;
    setSaving(true);
    try {
      const principal = parseFloat(formPrincipal) || 0;
      const remaining = formRemaining ? parseFloat(formRemaining) : principal;
      await createLoan({
        name: formName,
        type: formType,
        principal,
        remaining,
        interestRate: parseFloat(formRate) || 0,
        dueDate: formDueDate || undefined,
        lenderBorrower: formParty || undefined,
        notes: formNotes || undefined,
      });
      await loadLoans();
      setIsAddModalVisible(false);
      resetForm();
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add loan');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingLoan || !formName || !formPrincipal) return;
    setSaving(true);
    try {
      await updateLoan(editingLoan.id, {
        name: formName,
        type: formType,
        principal: parseFloat(formPrincipal) || 0,
        remaining: parseFloat(formRemaining) || 0,
        interestRate: parseFloat(formRate) || 0,
        dueDate: formDueDate || undefined,
        lenderBorrower: formParty || undefined,
        notes: formNotes || undefined,
      });
      await loadLoans();
      setIsEditModalVisible(false);
      resetForm();
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update loan');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setFormName(loan.name);
    setFormType(loan.type);
    setFormPrincipal(loan.principal.toString());
    setFormRemaining(loan.remaining.toString());
    setFormRate(loan.interestRate.toString());
    setFormDueDate(loan.dueDate ?? '');
    setFormParty(loan.lenderBorrower ?? '');
    setFormNotes(loan.notes ?? '');
    setIsEditModalVisible(true);
  };

  const openRepay = (loan: Loan) => {
    setEditingLoan(loan);
    setRepayAmount('');
    setIsRepayModalVisible(true);
  };

  const handleRepay = async () => {
    if (!editingLoan || !repayAmount) return;
    setSaving(true);
    try {
      await recordRepayment(editingLoan.id, parseFloat(repayAmount) || 0);
      await loadLoans();
      setIsRepayModalVisible(false);
      setEditingLoan(null);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to record repayment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (loan: Loan) => {
    const doDelete = async () => {
      try {
        await deleteLoan(loan.id);
        await loadLoans();
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to delete loan');
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${loan.name}"?`)) doDelete();
    } else {
      Alert.alert('Delete Loan', `Are you sure you want to delete "${loan.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const borrowed = loans.filter((l) => l.type === 'borrowed');
  const lent = loans.filter((l) => l.type === 'lent');
  const totalOwed = borrowed.reduce((s, l) => s + l.remaining, 0);
  const totalToCollect = lent.reduce((s, l) => s + l.remaining, 0);

  const isOverdue = (loan: Loan) => {
    if (!loan.dueDate) return false;
    return new Date(loan.dueDate) < new Date();
  };

  const renderLoan = (loan: Loan, index: number) => {
    const pct = loan.principal > 0 ? ((loan.principal - loan.remaining) / loan.principal) * 100 : 0;
    const overdue = isOverdue(loan);
    const accent = loan.type === 'borrowed' ? colors.error : colors.success;

    return (
      <Animated.View key={loan.id} entering={FadeInDown.delay(index * 60).springify()}>
        <View style={[styles.loanCard, { backgroundColor: cardBackground, borderColor: overdue ? colors.error : borderColor }]}>
          <View style={[styles.loanAccent, { backgroundColor: accent }]} />
          <View style={styles.loanBody}>
            <View style={styles.loanHeader}>
              <View style={styles.loanTitleRow}>
                <Text style={[styles.loanName, { color: textPrimary }]}>{loan.name}</Text>
                {overdue && (
                  <View style={[styles.overdueBadge, { backgroundColor: `${colors.error}20` }]}>
                    <Text style={[styles.overdueBadgeText, { color: colors.error }]}>Overdue</Text>
                  </View>
                )}
              </View>
              <View style={styles.loanActions}>
                <TouchableOpacity onPress={() => openRepay(loan)} style={[styles.actionBtn, { backgroundColor: `${colors.success}15` }]}>
                  <Minus size={14} color={colors.success} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openEdit(loan)} style={[styles.actionBtn, { backgroundColor: `${colors.primary[500]}15` }]}>
                  <Edit size={14} color={colors.primary[500]} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(loan)} style={[styles.actionBtn, { backgroundColor: `${colors.error}15` }]}>
                  <Trash2 size={14} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>

            {loan.lenderBorrower && (
              <View style={styles.metaRow}>
                <User size={12} color={textSecondary} />
                <Text style={[styles.metaText, { color: textSecondary }]}>{loan.lenderBorrower}</Text>
              </View>
            )}
            {loan.dueDate && (
              <View style={styles.metaRow}>
                <Calendar size={12} color={overdue ? colors.error : textSecondary} />
                <Text style={[styles.metaText, { color: overdue ? colors.error : textSecondary }]}>
                  Due {new Date(loan.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            )}

            <View style={styles.amountRow}>
              <View>
                <Text style={[styles.amountLabel, { color: textSecondary }]}>Remaining</Text>
                <Text style={[styles.amountValue, { color: accent }]}>{displayCurrency(loan.remaining)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.amountLabel, { color: textSecondary }]}>Principal</Text>
                <Text style={[styles.amountValue, { color: textPrimary }]}>{displayCurrency(loan.principal)}</Text>
              </View>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: `${accent}20` }]}>
              <View style={[styles.progressFill, { width: `${Math.min(100, pct)}%`, backgroundColor: accent }]} />
            </View>
            <Text style={[styles.pctText, { color: textSecondary }]}>{Math.round(pct)}% repaid</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderForm = () => (
    <>
      <View style={styles.typeToggle}>
        <TouchableOpacity
          onPress={() => setFormType('borrowed')}
          style={[styles.typeBtn, { backgroundColor: formType === 'borrowed' ? colors.error : `${colors.error}15`, borderColor: colors.error }]}
        >
          <TrendingDown size={14} color={formType === 'borrowed' ? '#fff' : colors.error} />
          <Text style={[styles.typeBtnText, { color: formType === 'borrowed' ? '#fff' : colors.error }]}>I Owe</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFormType('lent')}
          style={[styles.typeBtn, { backgroundColor: formType === 'lent' ? colors.success : `${colors.success}15`, borderColor: colors.success }]}
        >
          <TrendingUp size={14} color={formType === 'lent' ? '#fff' : colors.success} />
          <Text style={[styles.typeBtnText, { color: formType === 'lent' ? '#fff' : colors.success }]}>Owed to Me</Text>
        </TouchableOpacity>
      </View>
      <InputField label="Loan Name" placeholder="e.g. Home Loan" value={formName} onChangeText={setFormName} />
      <InputField label={formType === 'borrowed' ? 'Lender Name' : 'Borrower Name'} placeholder="e.g. Rahul" value={formParty} onChangeText={setFormParty} />
      <View style={styles.twoCol}>
        <View style={{ flex: 1 }}>
          <InputField label="Principal Amount" placeholder="0" value={formPrincipal} onChangeText={setFormPrincipal} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <InputField label="Remaining" placeholder="Same as principal" value={formRemaining} onChangeText={setFormRemaining} keyboardType="numeric" />
        </View>
      </View>
      <View style={styles.twoCol}>
        <View style={{ flex: 1 }}>
          <InputField label="Interest Rate (%)" placeholder="0" value={formRate} onChangeText={setFormRate} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <InputField label="Due Date (YYYY-MM-DD)" placeholder="Optional" value={formDueDate} onChangeText={setFormDueDate} />
        </View>
      </View>
      <InputField label="Notes" placeholder="Optional notes" value={formNotes} onChangeText={setFormNotes} multiline numberOfLines={2} />
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={styles.header}>
        <AnimatedScale
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={[styles.iconButton, { backgroundColor: `${colors.primary[500]}10` }]}
        >
          <Menu size={22} color={textSecondary} />
        </AnimatedScale>
        <Text style={[styles.title, { color: textPrimary }]}>Loans</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary Strip */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: `${colors.error}12`, borderColor: `${colors.error}30` }]}>
          <TrendingDown size={16} color={colors.error} />
          <Text style={[styles.summaryLabel, { color: textSecondary }]}>I Owe</Text>
          <Text style={[styles.summaryValue, { color: colors.error }]}>{displayCurrency(totalOwed)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: `${colors.success}12`, borderColor: `${colors.success}30` }]}>
          <TrendingUp size={16} color={colors.success} />
          <Text style={[styles.summaryLabel, { color: textSecondary }]}>To Collect</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>{displayCurrency(totalToCollect)}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator color={colors.primary[500]} style={{ marginTop: spacing.xl * 2 }} />
        ) : loans.length === 0 ? (
          <Animated.View entering={FadeInDown.springify()} style={[styles.emptyState, { backgroundColor: cardBackground, borderColor }]}>
            <Text style={{ fontSize: 40, marginBottom: spacing.md }}>🏦</Text>
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>No Loans Yet</Text>
            <Text style={[styles.emptySubtitle, { color: textSecondary }]}>Track money you owe or are owed</Text>
          </Animated.View>
        ) : (
          <>
            {borrowed.length > 0 && (
              <>
                <SectionHeader title="I Owe" subtitle={`${borrowed.length} loan${borrowed.length > 1 ? 's' : ''}`} />
                {borrowed.map((l, i) => renderLoan(l, i))}
              </>
            )}
            {lent.length > 0 && (
              <>
                <SectionHeader title="Owed to Me" subtitle={`${lent.length} loan${lent.length > 1 ? 's' : ''}`} />
                {lent.map((l, i) => renderLoan(l, borrowed.length + i))}
              </>
            )}
          </>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      <AnimatedScale
        onPress={() => setIsAddModalVisible(true)}
        style={[styles.fab, { backgroundColor: colors.primary[500] }]}
        haptic="heavy"
      >
        <Plus size={28} color="#fff" />
      </AnimatedScale>

      {/* Add Modal */}
      <ModalSheet visible={isAddModalVisible} onClose={() => { setIsAddModalVisible(false); resetForm(); }} title="Add Loan">
        <View style={styles.modalContent}>
          {renderForm()}
          <View style={styles.modalActions}>
            <PrimaryButton title="Cancel" onPress={() => { setIsAddModalVisible(false); resetForm(); }} variant="ghost" style={styles.cancelButton} />
            <PrimaryButton title="Add Loan" onPress={handleAdd} disabled={!formName || !formPrincipal} loading={saving} style={styles.submitButton} />
          </View>
        </View>
      </ModalSheet>

      {/* Edit Modal */}
      <ModalSheet visible={isEditModalVisible} onClose={() => { setIsEditModalVisible(false); resetForm(); }} title="Edit Loan">
        <View style={styles.modalContent}>
          {renderForm()}
          <View style={styles.modalActions}>
            <PrimaryButton title="Cancel" onPress={() => { setIsEditModalVisible(false); resetForm(); }} variant="ghost" style={styles.cancelButton} />
            <PrimaryButton title="Update" onPress={handleEdit} disabled={!formName || !formPrincipal} loading={saving} style={styles.submitButton} />
          </View>
        </View>
      </ModalSheet>

      {/* Repayment Modal */}
      <ModalSheet visible={isRepayModalVisible} onClose={() => { setIsRepayModalVisible(false); setEditingLoan(null); }} title="Record Repayment">
        <View style={styles.modalContent}>
          {editingLoan && (
            <Text style={[styles.repayInfo, { color: textSecondary }]}>
              Remaining: {displayCurrency(editingLoan.remaining)}
            </Text>
          )}
          <InputField label="Repayment Amount" placeholder="0" value={repayAmount} onChangeText={setRepayAmount} keyboardType="numeric" />
          <View style={styles.modalActions}>
            <PrimaryButton title="Cancel" onPress={() => { setIsRepayModalVisible(false); setEditingLoan(null); }} variant="ghost" style={styles.cancelButton} />
            <PrimaryButton title="Record" onPress={handleRepay} disabled={!repayAmount} loading={saving} style={styles.submitButton} />
          </View>
        </View>
      </ModalSheet>
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
  iconButton: {
    width: 40, height: 40,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    gap: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  summaryValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  scrollContent: { paddingTop: spacing.sm },
  loanCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    ...shadows.sm,
  },
  loanAccent: { width: 4 },
  loanBody: { flex: 1, padding: spacing.md },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  loanTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  loanName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  overdueBadge: {
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  overdueBadgeText: { fontSize: 10, fontWeight: typography.fontWeights.bold },
  loanActions: { flexDirection: 'row', gap: spacing.xs },
  actionBtn: {
    width: 28, height: 28,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  metaText: { fontSize: typography.fontSizes.xs },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  amountLabel: { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.medium },
  amountValue: { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold },
  progressTrack: { height: 4, borderRadius: 2, marginBottom: 4 },
  progressFill: { height: 4, borderRadius: 2 },
  pctText: { fontSize: typography.fontSizes.xs },
  emptyState: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl * 2,
    padding: spacing.xl * 2,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, marginBottom: spacing.xs },
  emptySubtitle: { fontSize: typography.fontSizes.sm, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: spacing.xl,
    width: 60, height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  modalContent: { gap: spacing.md },
  typeToggle: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xs },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, padding: spacing.md,
    borderRadius: borderRadius.xl, borderWidth: 1,
  },
  typeBtnText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold },
  twoCol: { flexDirection: 'row', gap: spacing.md },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  cancelButton: { flex: 1 },
  submitButton: { flex: 2 },
  repayInfo: { fontSize: typography.fontSizes.sm, marginBottom: spacing.xs },
});
