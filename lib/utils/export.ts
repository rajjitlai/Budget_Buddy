
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAccounts } from '@/lib/services/accounts';
import { getTransactions } from '@/lib/services/transactions';
import { getCurrentMonthlyPlan } from '@/lib/services/monthlyPlans';
import { Platform } from 'react-native';

/**
 * Export all app data to a JSON file
 */
export async function exportDataAsJSON(): Promise<void> {
  try {
    const accounts = await getAccounts();
    const transactions = await getTransactions();
    const monthlyPlan = await getCurrentMonthlyPlan();

    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      accounts,
      transactions,
      monthlyPlan,
    };

    const fileName = \`budget_buddy_export_\${new Date().getTime()}.json\`;
    const filePath = \`\${FileSystem.cacheDirectory}\${fileName}\`;

    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data, null, 2));

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export Budget Buddy Data',
        UTI: 'public.json',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}

/**
 * Export transactions to a CSV file
 */
export async function exportTransactionsToCSV(): Promise<void> {
  try {
    const transactions = await getTransactions();
    
    if (transactions.length === 0) {
      throw new Error('No transactions to export');
    }

    const headers = ['Date', 'Type', 'Amount', 'Category', 'Source Account', 'Destination Account', 'Notes'];
    const rows = transactions.map(t => [
      t.date,
      t.type,
      t.amount,
      t.category,
      t.sourceAccountId,
      t.destinationAccountId || '',
      t.notes.replace(/,/g, ';'), // Prevent CSV breaking
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const fileName = \`transactions_export_\${new Date().getTime()}.csv\`;
    const filePath = \`\${FileSystem.cacheDirectory}\${fileName}\`;

    await FileSystem.writeAsStringAsync(filePath, csvContent);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Transactions CSV',
        UTI: 'public.comma-separated-values-text',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}
