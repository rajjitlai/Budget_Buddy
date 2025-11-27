# 🐛 Budget Buddy - Debugging Guide

This document outlines all known issues in the Budget Buddy application and provides solutions to fix them.

## 🚨 Critical Issues (App Won't Run)

### 1. Missing UI Components

**Problem:** The application imports several UI components that don't exist in the codebase.

**Missing Files:**
```
components/ui/SectionHeader.tsx
components/ui/PrimaryButton.tsx
components/ui/ModalSheet.tsx
components/ui/InputField.tsx
components/ui/SelectField.tsx
```

**Files Importing These Components:**
- `app/(tabs)/index.tsx`
- `app/(tabs)/transactions.tsx`
- `app/(tabs)/insights.tsx`
- `app/(tabs)/planner.tsx`
- `app/(tabs)/settings.tsx`

**Impact:** ❌ **App will crash on startup**

**Solution:** Create the missing UI components in `components/ui/` directory.

---

### 2. Component Naming Mismatch

**Problem:** File is named `AllInsightCard.tsx` but imported as `AIInsightCard`

**Current:**
```typescript
// File: components/AllInsightCard.tsx
// Import: import { AIInsightCard } from '@/components/AIInsightCard';
```

**Impact:** ❌ **Import error, component not found**

**Solution:** 
- Option 1: Rename `AllInsightCard.tsx` to `AIInsightCard.tsx`
- Option 2: Update all imports to use `AllInsightCard`

**Recommended:** Option 1 (rename file to match semantic meaning)

---

### 3. Missing Convex Backend Configuration

**Problem:** App requires Convex backend but no Convex schema/functions are defined

**Missing:**
- `convex/` directory
- Convex schema definitions
- Convex functions for data operations
- Better Auth integration with Convex

**Impact:** ⚠️ **Authentication and data persistence won't work**

**Solution:** Set up Convex backend with proper schema and functions

---

## ⚠️ Medium Priority Issues

### 4. Environment Variables Not Set

**Problem:** `.env` file doesn't exist (only `.env.example`)

**Required Variables:**
```env
CONVEX_DEPLOYMENT=your-deployment-name
EXPO_PUBLIC_CONVEX_URL=https://your-convex-url.convex.cloud
```

**Impact:** ⚠️ **Convex connection will fail**

**Solution:** 
1. Copy `.env.example` to `.env`
2. Fill in actual Convex credentials
3. Restart development server

---

### 5. TypeScript Configuration Issues

**Problem:** `expo-env.d.ts` is in `.gitignore` but may be needed for type definitions

**Current `.gitignore`:**
```
expo-env.d.ts
```

**Impact:** ⚠️ **Potential type definition issues**

**Solution:** Review if this file should be tracked or regenerated

---

## 📝 Code Quality Issues

### 6. Line Break in Code

**File:** `app/(tabs)/index.tsx`

**Problem:** Line 59-60 has an awkward line break:
```typescript
id: Date.now().to
String(),
```

**Should be:**
```typescript
id: Date.now().toString(),
```

**Impact:** ⚠️ **Potential parsing/linting errors**

---

### 7. Line Break in Code

**File:** `app/(tabs)/index.tsx`

**Problem:** Line 122-123 has a line break:
```typescript
onPre
ss={() => setIsAddModalVisible(true)}
```

**Should be:**
```typescript
onPress={() => setIsAddModalVisible(true)}
```

---

### 8. Line Break in Code

**File:** `app/(tabs)/index.tsx`

**Problem:** Line 183-184 has a line break:
```typescript
!newAc
countType
```

**Should be:**
```typescript
!newAccountType
```

---

### 9. Line Break in Code

**File:** `lib/theme.ts`

**Problem:** Line 127-128 has a line break:
```typescript
export c
onst shadows = {
```

**Should be:**
```typescript
export const shadows = {
```

---

### 10. Line Break in Code

**File:** `lib/mockData.ts`

**Problem:** Line 112-113 has a line break:
```typescript
date: '
2024-01-10',
```

**Should be:**
```typescript
date: '2024-01-10',
```

---

### 11. Line Break in Code

**File:** `lib/mockData.ts`

**Problem:** Line 194-195 has a line break:
```typescript
{ id: 'el
ectricity', label: 'Electricity', icon: 'Zap' },
```

**Should be:**
```typescript
{ id: 'electricity', label: 'Electricity', icon: 'Zap' },
```

---

## 🔧 Step-by-Step Fix Guide

### Phase 1: Fix Code Syntax Errors

1. **Fix line breaks in `app/(tabs)/index.tsx`:**
   - Line 59-60: `Date.now().toString()`
   - Line 122-123: `onPress`
   - Line 183-184: `!newAccountType`

2. **Fix line breaks in `lib/theme.ts`:**
   - Line 127-128: `export const shadows`

3. **Fix line breaks in `lib/mockData.ts`:**
   - Line 112-113: `date: '2024-01-10'`
   - Line 194-195: `id: 'electricity'`

### Phase 2: Fix Component Issues

4. **Rename component file:**
   ```bash
   mv components/AllInsightCard.tsx components/AIInsightCard.tsx
   ```

5. **Create missing UI components directory:**
   ```bash
   mkdir components/ui
   ```

6. **Create missing UI components:**
   - `SectionHeader.tsx`
   - `PrimaryButton.tsx`
   - `ModalSheet.tsx`
   - `InputField.tsx`
   - `SelectField.tsx`

### Phase 3: Backend Setup

7. **Initialize Convex:**
   ```bash
   npx convex dev
   ```

8. **Create Convex schema:**
   - Define account schema
   - Define transaction schema
   - Define user schema

9. **Set up Better Auth with Convex:**
   - Configure auth tables
   - Set up auth functions

### Phase 4: Environment Configuration

10. **Create `.env` file:**
    ```bash
    cp .env.example .env
    ```

11. **Fill in Convex credentials:**
    - Get deployment URL from Convex dashboard
    - Update `.env` with actual values

### Phase 5: Testing

12. **Clear cache and restart:**
    ```bash
    npx expo start -c
    ```

13. **Test each screen:**
    - Dashboard
    - Transactions
    - Insights
    - Planner
    - Settings

---

## 🎯 Priority Order

1. ✅ **Fix syntax errors** (Phase 1) - 5 minutes
2. ✅ **Create UI components** (Phase 2) - 30-60 minutes
3. ✅ **Set up Convex backend** (Phase 3) - 30-45 minutes
4. ✅ **Configure environment** (Phase 4) - 5 minutes
5. ✅ **Test and verify** (Phase 5) - 15 minutes

**Total Estimated Time:** 1.5 - 2 hours

---

## 📋 Checklist

### Before Starting
- [ ] Node.js installed (v18+)
- [ ] Expo CLI available
- [ ] Convex account created
- [ ] Code editor ready

### Syntax Fixes
- [ ] Fixed `index.tsx` line breaks
- [ ] Fixed `theme.ts` line breaks
- [ ] Fixed `mockData.ts` line breaks

### Component Fixes
- [ ] Renamed `AllInsightCard.tsx` to `AIInsightCard.tsx`
- [ ] Created `components/ui/` directory
- [ ] Created `SectionHeader.tsx`
- [ ] Created `PrimaryButton.tsx`
- [ ] Created `ModalSheet.tsx`
- [ ] Created `InputField.tsx`
- [ ] Created `SelectField.tsx`

### Backend Setup
- [ ] Convex initialized
- [ ] Schema defined
- [ ] Auth configured
- [ ] Functions created

### Configuration
- [ ] `.env` file created
- [ ] Convex URL configured
- [ ] Deployment name set

### Testing
- [ ] App starts without errors
- [ ] Dashboard loads
- [ ] Can add accounts
- [ ] Can add transactions
- [ ] Theme toggle works
- [ ] Navigation works

---

## 🆘 Common Errors & Solutions

### Error: "Cannot find module '@/components/ui/...'"
**Solution:** Create the missing UI components

### Error: "Cannot find module '@/components/AIInsightCard'"
**Solution:** Rename `AllInsightCard.tsx` to `AIInsightCard.tsx`

### Error: "Convex client not configured"
**Solution:** Set up `.env` file with Convex credentials

### Error: "Unexpected token" or syntax errors
**Solution:** Fix the line break issues in the code files

### Error: "Better Auth not configured"
**Solution:** Set up Convex backend with Better Auth integration

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Convex Documentation](https://docs.convex.dev/)
- [Better Auth Documentation](https://www.better-auth.com/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated:** 2025-11-27
**Status:** 🔴 Critical issues present - app won't run without fixes
