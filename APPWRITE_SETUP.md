# Appwrite Integration Guide for Budget Buddy

## 📋 Database Schemas

### Collection: `accounts`
**Collection ID:** `accounts`

**Attributes:**
- `name` (String, 255, required) - Account name
- `type` (String, 50, required, enum: salary|spending|pocket|savings|fd|custom) - Account type
- `balance` (Double, required) - Current balance
- `icon` (String, 50, required) - Icon identifier
- `color` (String, 20, required) - Hex color code
- `userId` (String, 255, required) - User ID (from auth)

**Indexes:**
- `userId` (ASC) - For querying user's accounts
- `userId_type` (ASC, ASC) - Composite index for filtering by user and type

**Permissions:**
- Create: Users (authenticated)
- Read: Users (own documents)
- Update: Users (own documents)
- Delete: Users (own documents)

---

### Collection: `transactions`
**Collection ID:** `transactions`

**Attributes:**
- `amount` (Double, required) - Transaction amount
- `category` (String, 100, required) - Transaction category
- `sourceAccountId` (String, 255, required) - Source account ID
- `destinationAccountId` (String, 255, optional) - Destination account ID (for transfers)
- `notes` (String, 500, optional) - Transaction notes
- `date` (DateTime, required) - Transaction date
- `type` (String, 50, required, enum: expense|income|transfer) - Transaction type
- `userId` (String, 255, required) - User ID (from auth)

**Indexes:**
- `userId` (ASC) - For querying user's transactions
- `userId_date` (ASC, DESC) - Composite index for sorting by date
- `userId_type` (ASC, ASC) - For filtering by type
- `sourceAccountId` (ASC) - For account-specific queries

**Permissions:**
- Create: Users (authenticated)
- Read: Users (own documents)
- Update: Users (own documents)
- Delete: Users (own documents)

---

### Collection: `monthlyPlans`
**Collection ID:** `monthlyPlans`

**Attributes:**
- `salary` (Double, required) - Monthly salary
- `essentials` (Object, required) - Essentials object:
  - `electricity` (Double)
  - `internet` (Double)
  - `mobile` (Double)
  - `food` (Double)
  - `utilities` (Double)
- `allocations` (Object, required) - Allocations object:
  - `spending` (Double)
  - `salaryBuffer` (Double)
  - `savings` (Double)
  - `emergency` (Double)
- `month` (String, 20, required) - Month identifier (YYYY-MM format)
- `year` (Integer, required) - Year
- `userId` (String, 255, required) - User ID (from auth)

**Indexes:**
- `userId` (ASC) - For querying user's plans
- `userId_month_year` (ASC, ASC, ASC) - Composite index for specific month/year

**Permissions:**
- Create: Users (authenticated)
- Read: Users (own documents)
- Update: Users (own documents)
- Delete: Users (own documents)

---

## 🔐 Authentication Setup

Appwrite uses its own authentication system. We'll use:
- Email/Password authentication
- Session management via Appwrite SDK
- Secure storage for session tokens

---

## 📦 Required Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
```

---

## 🚀 Setup Steps

1. **Create Appwrite Project**
   - Go to https://cloud.appwrite.io
   - Create a new project
   - Note your Project ID

2. **Create Database**
   - Create a new database
   - Note your Database ID

3. **Create Collections**
   - Create `accounts` collection with attributes above
   - Create `transactions` collection with attributes above
   - Create `monthlyPlans` collection with attributes above

4. **Set Permissions**
   - Configure permissions for each collection
   - Use "Users" role with appropriate access

5. **Install Dependencies**
   ```bash
   npm install appwrite react-native-url-polyfill
   ```

6. **Configure Environment**
   - Add environment variables to `.env` file
   - Update `app.json` to include environment variables

---

## 📝 Notes

- AI Insights are computed client-side based on account and transaction data
- User ID is automatically added from Appwrite auth session
- All timestamps use ISO 8601 format
- Currency amounts are stored as doubles (floating point numbers)

