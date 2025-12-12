
import { databases, COLLECTIONS, requireAuth, ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { MonthlyPlan } from '@/lib/mockData';

export interface MonthlyPlanDocument extends MonthlyPlan {
  $id: string;
  userId: string;
  month: string; // YYYY-MM format
  year: number;
  $createdAt: string;
  $updatedAt: string;
}

/**
 * Get monthly plan for a specific month
 */
export async function getMonthlyPlan(
  month: string,
  year: number
): Promise<MonthlyPlanDocument | null> {
  const userId = await requireAuth();

  try {
    const response = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      COLLECTIONS.MONTHLY_PLANS,
      [
        Query.equal('userId', userId),
        Query.equal('month', month),
        Query.equal('year', year),
        Query.limit(1),
      ]
    );

    if (response.documents.length === 0) {
      return null;
    }

    const doc = response.documents[0];
    
    // Parse JSON strings back to objects
    return {
      ...doc,
      essentials: typeof doc.essentials === 'string' 
        ? JSON.parse(doc.essentials) 
        : doc.essentials,
      allocations: typeof doc.allocations === 'string'
        ? JSON.parse(doc.allocations)
        : doc.allocations,
    } as unknown as MonthlyPlanDocument;
  } catch (error) {
    console.error('Error getting monthly plan:', error);
    return null;
  }
}

/**
 * Get current month's plan
 */
export async function getCurrentMonthlyPlan(): Promise<MonthlyPlanDocument | null> {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return getMonthlyPlan(month, now.getFullYear());
}

/**
 * Create or update monthly plan
 */
export async function upsertMonthlyPlan(
  month: string,
  year: number,
  planData: MonthlyPlan
): Promise<MonthlyPlanDocument> {
  const userId = await requireAuth();

  // Check if plan exists
  const existing = await getMonthlyPlan(month, year);

  // Convert objects to JSON strings for Appwrite storage
  const documentData = {
    salary: planData.salary,
    essentials: JSON.stringify(planData.essentials),
    allocations: JSON.stringify(planData.allocations),
    month,
    year,
  };

  if (existing) {
    // Update existing plan
    const updated = await databases.updateDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      COLLECTIONS.MONTHLY_PLANS,
      existing.$id,
      documentData
    );

    // Parse JSON strings back to objects
    return {
      ...updated,
      essentials: JSON.parse(updated.essentials as string),
      allocations: JSON.parse(updated.allocations as string),
    } as unknown as MonthlyPlanDocument;
  } else {
    // Create new plan
    const created = await databases.createDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      COLLECTIONS.MONTHLY_PLANS,
      ID.unique(),
      {
        ...documentData,
        userId,
      }
    );

    // Parse JSON strings back to objects
    return {
      ...created,
      essentials: JSON.parse(created.essentials as string),
      allocations: JSON.parse(created.allocations as string),
    } as unknown as MonthlyPlanDocument;
  }
}

/**
 * Get all monthly plans for the current user
 */
export async function getAllMonthlyPlans(): Promise<MonthlyPlanDocument[]> {
  const userId = await requireAuth();

  const response = await databases.listDocuments(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    COLLECTIONS.MONTHLY_PLANS,
    [
      Query.equal('userId', userId),
      Query.orderDesc('year'),
      Query.orderDesc('month'),
    ]
  );

  // Parse JSON strings back to objects for all documents
  return response.documents.map((doc) => ({
    ...doc,
    essentials: typeof doc.essentials === 'string'
      ? JSON.parse(doc.essentials)
      : doc.essentials,
    allocations: typeof doc.allocations === 'string'
      ? JSON.parse(doc.allocations)
      : doc.allocations,
  })) as unknown as MonthlyPlanDocument[];
}

/**
 * Delete a monthly plan
 */
export async function deleteMonthlyPlan(planId: string): Promise<void> {
  await requireAuth();

  await databases.deleteDocument(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    COLLECTIONS.MONTHLY_PLANS,
    planId
  );
}

