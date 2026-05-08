
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAccounts, createAccount } from './accounts';
import { getTransactions, createTransaction } from './transactions';
import { getAllMonthlyPlans, saveMonthlyPlan } from './monthlyPlans';
import { getDatabase } from '@/lib/database/sqlite';
import { Platform } from 'react-native';

export interface ExportData {
  version: string;
  timestamp: string;
  accounts: any[];
  transactions: any[];
  monthlyPlans: any[];
}

/**
 * Export all user data to a JSON file
 */
export async function exportData(): Promise<void> {
  try {
    const accounts = await getAccounts();
    const transactions = await getTransactions();
    const monthlyPlans = await getAllMonthlyPlans();

    const data: ExportData = {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      accounts,
      transactions,
      monthlyPlans,
    };

    const jsonString = JSON.stringify(data, null, 2);
    
    if (Platform.OS === 'web') {
      // For web, create a download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget_buddy_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For native, use FileSystem and Sharing
      const fileName = `budget_buddy_backup_${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Budget Buddy Data',
          UTI: 'public.json',
        });
      }
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
}

/**
 * Import user data from a JSON string
 */
export async function importData(jsonString: string): Promise<void> {
  try {
    const data = JSON.parse(jsonString) as ExportData;
    
    if (!data.accounts || !data.transactions) {
      throw new Error('Invalid backup file format');
    }

    const db = await getDatabase();

    // WARNING: This clears existing data
    await db.withTransactionAsync(async () => {
      // Clear existing tables
      await db.runAsync('DELETE FROM transactions');
      await db.runAsync('DELETE FROM accounts');
      await db.runAsync('DELETE FROM monthly_plans');

      // Import accounts
      for (const account of data.accounts) {
        await db.runAsync(
          'INSERT INTO accounts (id, name, type, balance, icon, color) VALUES (?, ?, ?, ?, ?, ?)',
          [account.$id || account.id, account.name, account.type, account.balance, account.icon, account.color]
        );
      }

      // Import monthly plans
      if (data.monthlyPlans) {
        for (const plan of data.monthlyPlans) {
          await db.runAsync(
            'INSERT INTO monthly_plans (id, salary, essentials, allocations, month, year) VALUES (?, ?, ?, ?, ?, ?)',
            [
              plan.$id || plan.id,
              plan.salary,
              JSON.stringify(plan.essentials),
              JSON.stringify(plan.allocations),
              plan.month,
              plan.year,
            ]
          );
        }
      }

      // Import transactions
      for (const transaction of data.transactions) {
        await db.runAsync(
          'INSERT INTO transactions (id, amount, category, source_account_id, destination_account_id, notes, date, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            transaction.$id || transaction.id,
            transaction.amount,
            transaction.category,
            transaction.sourceAccountId,
            transaction.destinationAccountId || null,
            transaction.notes,
            transaction.date,
            transaction.type,
          ]
        );
      }
    });
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Failed to import data. Please check if the file is a valid Budget Buddy backup.');
  }
}
