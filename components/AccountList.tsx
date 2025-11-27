
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { BalanceCard } from './BalanceCard';
import { Account } from '@/lib/mockData';
import { spacing } from '@/lib/theme';

interface AccountListProps {
  accounts: Account[];
  onAccountPress?: (account: Account) => void;
}

export function AccountList({ accounts, onAccountPress }: AccountListProps) {
  return (
    <View style={styles.container}>
      {accounts.map((account) => (
        <BalanceCard
          key={account.id}
          account={account}
          onPress={() => onAccountPress?.(account)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
});


