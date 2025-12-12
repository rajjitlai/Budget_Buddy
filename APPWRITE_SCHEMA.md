# Appwrite Database Schema for Budget Buddy

This document provides the complete schema configuration for all Appwrite collections used in the Budget Buddy application.

## Collections Overview

The application uses **3 collections**:
1. `accounts` - User financial accounts
2. `transactions` - Financial transactions (expenses, income, transfers)
3. `monthlyPlans` - Monthly budget plans

---

## Collection 1: `accounts`

**Collection ID:** `accounts` (or set via `EXPO_PUBLIC_APPWRITE_COLLECTION_ACCOUNTS`)

### Attributes

| Attribute Name | Type | Size | Required | Array | Default | Example |
|---------------|------|------|----------|-------|---------|---------|
| `name` | string | 255 | ✅ Yes | ❌ No | - | "Emergency Fund" |
| `type` | string | 50 | ✅ Yes | ❌ No | - | "savings" |
| `balance` | double | - | ✅ Yes | ❌ No | 0 | 50000.00 |
| `icon` | string | 50 | ✅ Yes | ❌ No | "Wallet" | "PiggyBank" |
| `color` | string | 20 | ✅ Yes | ❌ No | - | "#10b981" |
| `userId` | string | 36 | ✅ Yes | ❌ No | - | Auto-set |

### Type Enum Values

The `type` attribute accepts one of these values:
- `salary` - Salary Account
- `spending` - Spending Account
- `pocket` - Pocket Money
- `savings` - Savings Account
- `fd` - Fixed Deposit
- `custom` - Custom Account

### Indexes

| Index ID | Type | Attributes | Orders |
|----------|------|------------|--------|
| `idx_userId` | key | `userId` | ASC |
| `idx_createdAt` | key | `$createdAt` | DESC |

### Permissions

- **Create:** `users` (authenticated users can create their own accounts)
- **Read:** `users` (users can only read their own accounts)
- **Update:** `users` (users can only update their own accounts)
- **Delete:** `users` (users can only delete their own accounts)

**Permission Rules:**
```
read("userId = request.auth.uid")
write("userId = request.auth.uid")
delete("userId = request.auth.uid")
```

---

## Collection 2: `transactions`

**Collection ID:** `transactions` (or set via `EXPO_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS`)

### Attributes

| Attribute Name | Type | Size | Required | Array | Default | Example |
|---------------|------|------|----------|-------|---------|---------|
| `amount` | double | - | ✅ Yes | ❌ No | - | 1500.00 |
| `category` | string | 50 | ✅ Yes | ❌ No | - | "food" |
| `sourceAccountId` | string | 36 | ✅ Yes | ❌ No | - | Account $id |
| `destinationAccountId` | string | 36 | ❌ No | ❌ No | null | Account $id |
| `notes` | string | 500 | ❌ No | ❌ No | "" | "Grocery shopping" |
| `date` | datetime | - | ✅ Yes | ❌ No | - | ISO 8601 format |
| `type` | string | 20 | ✅ Yes | ❌ No | - | "expense" |
| `userId` | string | 36 | ✅ Yes | ❌ No | - | Auto-set |

### Type Enum Values

The `type` attribute accepts one of these values:
- `expense` - Money spent
- `income` - Money received
- `transfer` - Transfer between accounts

### Category Values

Common category IDs used:
- `food` - Food & Dining
- `transport` - Transportation
- `shopping` - Shopping
- `entertainment` - Entertainment
- `bills` - Bills & Utilities
- `healthcare` - Healthcare
- `education` - Education
- `transfer` - Transfer
- `salary` - Salary
- `other` - Other

### Indexes

| Index ID | Type | Attributes | Orders |
|----------|------|------------|--------|
| `idx_userId` | key | `userId` | ASC |
| `idx_date` | key | `date` | DESC |
| `idx_type` | key | `type` | ASC |
| `idx_sourceAccount` | key | `sourceAccountId` | ASC |
| `idx_destinationAccount` | key | `destinationAccountId` | ASC |
| `idx_userId_date` | key | `userId`, `date` | ASC, DESC |

### Permissions

- **Create:** `users` (authenticated users can create their own transactions)
- **Read:** `users` (users can only read their own transactions)
- **Update:** `users` (users can only update their own transactions)
- **Delete:** `users` (users can only delete their own transactions)

**Permission Rules:**
```
read("userId = request.auth.uid")
write("userId = request.auth.uid")
delete("userId = request.auth.uid")
```

---

## Collection 3: `monthlyPlans`

**Collection ID:** `monthlyPlans` (or set via `EXPO_PUBLIC_APPWRITE_COLLECTION_MONTHLY_PLANS`)

### Attributes

| Attribute Name | Type | Size | Required | Array | Default | Example |
|---------------|------|------|----------|-------|---------|---------|
| `salary` | double | - | ✅ Yes | ❌ No | 0 | 50000.00 |
| `essentials` | object | - | ✅ Yes | ❌ No | {} | See below |
| `allocations` | object | - | ✅ Yes | ❌ No | {} | See below |
| `month` | string | 10 | ✅ Yes | ❌ No | - | "2025-12" |
| `year` | integer | - | ✅ Yes | ❌ No | - | 2025 |
| `userId` | string | 36 | ✅ Yes | ❌ No | - | Auto-set |

### Essentials Object Structure

```json
{
  "electricity": 0.0,
  "internet": 0.0,
  "mobile": 0.0,
  "food": 0.0,
  "utilities": 0.0
}
```

All values are `double` type.

### Allocations Object Structure

```json
{
  "spending": 0.0,
  "salaryBuffer": 0.0,
  "savings": 0.0,
  "emergency": 0.0
}
```

All values are `double` type.

### Month Format

The `month` attribute follows the format: `YYYY-MM` (e.g., "2025-12", "2026-01")

### Indexes

| Index ID | Type | Attributes | Orders |
|----------|------|------------|--------|
| `idx_userId` | key | `userId` | ASC |
| `idx_month_year` | key | `month`, `year` | ASC, DESC |
| `idx_userId_month_year` | key | `userId`, `month`, `year` | ASC, ASC, DESC |

### Permissions

- **Create:** `users` (authenticated users can create their own plans)
- **Read:** `users` (users can only read their own plans)
- **Update:** `users` (users can only update their own plans)
- **Delete:** `users` (users can only delete their own plans)

**Permission Rules:**
```
read("userId = request.auth.uid")
write("userId = request.auth.uid")
delete("userId = request.auth.uid")
```

---

## Setup Instructions

### Step 1: Create Database

1. Go to your Appwrite Console
2. Navigate to **Databases**
3. Create a new database (or use existing)
4. Note the Database ID and set it in `.env` as `EXPO_PUBLIC_APPWRITE_DATABASE_ID`

### Step 2: Create Collections

For each collection (`accounts`, `transactions`, `monthlyPlans`):

1. Click **Create Collection**
2. Enter the Collection ID (e.g., `accounts`)
3. Set Collection Name (e.g., "Accounts")
4. Click **Create**

### Step 3: Add Attributes

For each collection, add all attributes listed above:

1. Go to the collection
2. Click **Attributes** tab
3. Click **Create Attribute**
4. Select the attribute type
5. Enter attribute name and configuration
6. Click **Create**

**Important Notes:**
- For `double` type attributes, set **Min** to `0` if appropriate
- For `string` type attributes, set the **Size** limit
- For `datetime` type, ensure it accepts ISO 8601 format
- For `object` type (monthlyPlans), ensure the structure matches the schema

### Step 4: Create Indexes

For each collection, create the indexes listed:

1. Go to the collection
2. Click **Indexes** tab
3. Click **Create Index**
4. Enter Index ID
5. Select Index Type (usually `key`)
6. Add attributes and orders
7. Click **Create**

### Step 5: Set Permissions

For each collection:

1. Go to the collection
2. Click **Settings** tab
3. Scroll to **Permissions**
4. Add the following permissions:

**For Create Permission:**
- Role: `users`
- Permission: `create`

**For Read Permission:**
- Role: `users`
- Permission: `read`
- Add rule: `userId = request.auth.uid`

**For Update Permission:**
- Role: `users`
- Permission: `update`
- Add rule: `userId = request.auth.uid`

**For Delete Permission:**
- Role: `users`
- Permission: `delete`
- Add rule: `userId = request.auth.uid`

### Step 6: Verify Environment Variables

Ensure your `.env` file has:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
EXPO_PUBLIC_APPWRITE_COLLECTION_ACCOUNTS=accounts
EXPO_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS=transactions
EXPO_PUBLIC_APPWRITE_COLLECTION_MONTHLY_PLANS=monthlyPlans
```

---

## Data Validation Notes

### Accounts Collection
- `balance` should never be negative (enforced in application logic)
- `type` must be one of the enum values
- `color` should be a valid hex color code (e.g., "#10b981")

### Transactions Collection
- `amount` must be positive
- `destinationAccountId` is required only when `type` is `transfer`
- `date` should be in ISO 8601 format (e.g., "2025-12-12T10:30:00.000Z")
- Balance validation is enforced in application logic (prevents negative balances)

### Monthly Plans Collection
- `month` format must be `YYYY-MM`
- `year` must match the year in `month`
- `essentials` and `allocations` objects must have all required keys
- All numeric values in objects should be non-negative

---

## Migration Notes

If you're migrating from an existing setup:

1. **Backup existing data** before making schema changes
2. **Add new attributes** one at a time
3. **Update indexes** after adding attributes
4. **Test permissions** after changes
5. **Verify data integrity** after migration

---

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Verify user is authenticated
   - Check permission rules match `userId = request.auth.uid`
   - Ensure user has `users` role

2. **Missing Attributes**
   - Verify all attributes are created
   - Check attribute types match schema
   - Ensure required attributes are marked as required

3. **Index Errors**
   - Verify indexes are created
   - Check index attributes exist
   - Ensure index orders match query patterns

4. **Object Structure Errors**
   - For `monthlyPlans`, verify object structure matches exactly
   - All keys in `essentials` and `allocations` must be present
   - Values must be numeric (double)

---

## Quick Reference

### Collection IDs
- Accounts: `accounts`
- Transactions: `transactions`
- Monthly Plans: `monthlyPlans`

### Required Environment Variables
- `EXPO_PUBLIC_APPWRITE_ENDPOINT`
- `EXPO_PUBLIC_APPWRITE_PROJECT_ID`
- `EXPO_PUBLIC_APPWRITE_DATABASE_ID`
- `EXPO_PUBLIC_APPWRITE_COLLECTION_ACCOUNTS`
- `EXPO_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS`
- `EXPO_PUBLIC_APPWRITE_COLLECTION_MONTHLY_PLANS`

---

**Last Updated:** December 2025
**Schema Version:** 1.0.0

