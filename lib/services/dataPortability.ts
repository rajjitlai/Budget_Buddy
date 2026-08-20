
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getAccounts } from './accounts';
import { getTransactions } from './transactions';
import { getAllMonthlyPlans } from './monthlyPlans';
import { getLoans } from './loans';
import { getNotifications } from './notifications';
import { getChatHistory } from './aiChat';
import { getDatabase } from '@/lib/database/sqlite';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface ExportData {
  version: string;
  timestamp: string;
  accounts: any[];
  transactions: any[];
  monthlyPlans: any[];
  loans?: any[];
  notifications?: any[];
  chatMessages?: any[];
}

/**
 * Export all user data to a JSON file
 */
export async function exportData(): Promise<void> {
  try {
    const accounts = await getAccounts();
    const transactions = await getTransactions();
    const monthlyPlans = await getAllMonthlyPlans();
    const loans = await getLoans();
    const notifications = await getNotifications();
    const chatMessages = await getChatHistory();

    const data: ExportData = {
      version: Constants.expoConfig?.version || '2.3.1',
      timestamp: new Date().toISOString(),
      accounts,
      transactions,
      monthlyPlans,
      loans,
      notifications,
      chatMessages,
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
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      
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
  } catch (error: any) {
    console.error('Error exporting data:', error);
    throw new Error(`Failed to export data: ${error?.message || error}`);
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

    // Clear and restore data inside a single transaction
    await db.withTransactionAsync(async () => {
      // Clear existing tables
      await db.runAsync('DELETE FROM transactions');
      await db.runAsync('DELETE FROM accounts');
      await db.runAsync('DELETE FROM monthly_plans');
      await db.runAsync('DELETE FROM loans');
      await db.runAsync('DELETE FROM notifications');
      await db.runAsync('DELETE FROM chat_messages');

      // Import accounts (ensuring last_updated constraint is satisfied)
      for (const account of data.accounts) {
        const lastUpdated = account.last_updated || account.lastUpdated || new Date().toISOString();
        await db.runAsync(
          'INSERT INTO accounts (id, name, type, balance, icon, color, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [account.$id || account.id, account.name, account.type, account.balance, account.icon, account.color, lastUpdated]
        );
      }

      // Import monthly plans
      if (data.monthlyPlans && Array.isArray(data.monthlyPlans)) {
        for (const plan of data.monthlyPlans) {
          await db.runAsync(
            'INSERT INTO monthly_plans (id, salary, essentials, allocations, month, year) VALUES (?, ?, ?, ?, ?, ?)',
            [
              plan.$id || plan.id,
              plan.salary,
              typeof plan.essentials === 'string' ? plan.essentials : JSON.stringify(plan.essentials),
              typeof plan.allocations === 'string' ? plan.allocations : JSON.stringify(plan.allocations),
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
            transaction.sourceAccountId || transaction.source_account_id,
            transaction.destinationAccountId || transaction.destination_account_id || null,
            transaction.notes || null,
            transaction.date,
            transaction.type,
          ]
        );
      }

      // Import loans if present
      if (data.loans && Array.isArray(data.loans)) {
        for (const loan of data.loans) {
          await db.runAsync(
            `INSERT INTO loans (id, name, type, principal, remaining, interest_rate, due_date, lender_borrower, notes, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              loan.id,
              loan.name,
              loan.type,
              loan.principal,
              loan.remaining,
              loan.interestRate ?? loan.interest_rate ?? 0,
              loan.dueDate ?? loan.due_date ?? null,
              loan.lenderBorrower ?? loan.lender_borrower ?? null,
              loan.notes ?? null,
              loan.createdAt ?? loan.created_at ?? new Date().toISOString(),
            ]
          );
        }
      }

      // Import notifications if present
      if (data.notifications && Array.isArray(data.notifications)) {
        for (const notif of data.notifications) {
          await db.runAsync(
            'INSERT INTO notifications (id, title, body, type, read, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [
              notif.id,
              notif.title,
              notif.body,
              notif.type,
              notif.read ? 1 : 0,
              notif.createdAt ?? notif.created_at ?? new Date().toISOString(),
            ]
          );
        }
      }

      // Import chat messages if present
      if (data.chatMessages && Array.isArray(data.chatMessages)) {
        for (const msg of data.chatMessages) {
          await db.runAsync(
            'INSERT INTO chat_messages (id, role, content, created_at) VALUES (?, ?, ?, ?)',
            [
              msg.id,
              msg.role,
              msg.content,
              msg.timestamp ?? msg.createdAt ?? msg.created_at ?? new Date().toISOString(),
            ]
          );
        }
      }
    });
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Failed to import data. Please check if the file is a valid Budget Buddy backup.');
  }
}
