
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BalanceCard } from './BalanceCard';
import { Account } from '@/lib/types';
import { spacing } from '@/lib/theme';

interface AccountListProps {
  accounts: Account[];
  onAccountPress?: (account: Account) => void;
  onAccountEdit?: (account: Account) => void;
  onAccountDelete?: (account: Account) => void;
}

export function AccountList({ 
  accounts, 
  onAccountPress,
  onAccountEdit,
  onAccountDelete 
}: AccountListProps) {
  return (
    <View style={styles.container}>
      {accounts.map((account) => (
        <BalanceCard
          key={account.id}
          account={account}
          onPress={() => onAccountPress?.(account)}
          onEdit={onAccountEdit ? () => onAccountEdit(account) : undefined}
          onDelete={onAccountDelete ? () => onAccountDelete(account) : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
});


