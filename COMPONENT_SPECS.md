# Missing UI Components Specification

This document specifies the interface and expected behavior for each missing UI component.

## 1. SectionHeader Component

**File:** `components/ui/SectionHeader.tsx`

**Props Interface:**
```typescript
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}
```

**Usage Examples:**
```typescript
// From index.tsx
<SectionHeader
  title="Your Accounts"
  subtitle={`${accounts.length} accounts`}
  actionLabel="See all"
  onAction={() => {}}
/>

// From index.tsx with icon
<SectionHeader
  title="Budget Buddy AI Insights"
  subtitle="Personalized recommendations"
  icon={<Sparkles size={20} color={colors.primary[500]} />}
/>
```

**Expected Behavior:**
- Display title prominently
- Show optional subtitle below title
- Show optional action button/link on the right
- Support optional icon next to title
- Respect theme (light/dark mode)

---

## 2. PrimaryButton Component

**File:** `components/ui/PrimaryButton.tsx`

**Props Interface:**
```typescript
interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}
```

**Usage Examples:**
```typescript
// From index.tsx - Outline variant with icon
<PrimaryButton
  title="Add Account"
  onPress={() => setIsAddModalVisible(true)}
  variant="outline"
  icon={<Plus size={18} color={colors.primary[500]} />}
  fullWidth
/>

// From index.tsx - Ghost variant
<PrimaryButton
  title="Cancel"
  onPress={() => setIsAddModalVisible(false)}
  variant="ghost"
  style={styles.cancelButton}
/>

// From index.tsx - Primary variant (default)
<PrimaryButton
  title="Add Account"
  onPress={handleAddAccount}
  disabled={!newAccountName || !newAccountType || !newAccountBalance}
  style={styles.submitButton}
/>
```

**Expected Behavior:**
- Three variants: primary (filled), outline, ghost (text only)
- Support icon on the left side
- Support full width or auto width
- Disabled state with reduced opacity
- Haptic feedback on press (mobile only)
- Respect theme colors

---

## 3. ModalSheet Component

**File:** `components/ui/ModalSheet.tsx`

**Props Interface:**
```typescript
interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

**Usage Example:**
```typescript
// From index.tsx
<ModalSheet
  visible={isAddModalVisible}
  onClose={() => setIsAddModalVisible(false)}
  title="Add New Account"
>
  <View style={styles.modalContent}>
    {/* Form fields */}
  </View>
</ModalSheet>
```

**Expected Behavior:**
- Bottom sheet modal on mobile
- Centered modal on web
- Animated slide-up entrance
- Backdrop with dismiss on tap
- Close button or swipe-down gesture
- Respect theme (background, text colors)
- Safe area aware

---

## 4. InputField Component

**File:** `components/ui/InputField.tsx`

**Props Interface:**
```typescript
interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  multiline?: boolean;
  error?: string;
}
```

**Usage Examples:**
```typescript
// From index.tsx - Text input
<InputField
  label="Account Name"
  placeholder="e.g., Emergency Fund"
  value={newAccountName}
  onChangeText={setNewAccountName}
/>

// From index.tsx - Numeric input
<InputField
  label="Initial Balance"
  placeholder="0"
  value={newAccountBalance}
  onChangeText={setNewAccountBalance}
  keyboardType="numeric"
/>
```

**Expected Behavior:**
- Label above input field
- Placeholder text in input
- Support different keyboard types
- Error state with red border and error message
- Focus state with primary color border
- Respect theme colors
- Auto-capitalize based on keyboard type

---

## 5. SelectField Component

**File:** `components/ui/SelectField.tsx`

**Props Interface:**
```typescript
interface SelectOption {
  id: string;
  label: string;
  icon?: string;
}

interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}
```

**Usage Example:**
```typescript
// From index.tsx
<SelectField
  label="Account Type"
  options={accountTypes}
  value={newAccountType}
  onChange={setNewAccountType}
  placeholder="Select account type"
/>
```

**Where `accountTypes` is:**
```typescript
export const accountTypes = [
  { id: 'salary', label: 'Salary Account', icon: 'Wallet' },
  { id: 'spending', label: 'Spending Account', icon: 'CreditCard' },
  { id: 'pocket', label: 'Pocket Money', icon: 'Coins' },
  { id: 'savings', label: 'Savings Account', icon: 'PiggyBank' },
  { id: 'fd', label: 'Fixed Deposit', icon: 'Landmark' },
  { id: 'custom', label: 'Custom Account', icon: 'Folder' },
];
```

**Expected Behavior:**
- Label above select field
- Placeholder when no value selected
- Dropdown/picker on press
- Display selected option label
- Show icon if provided in option
- Error state with red border
- Respect theme colors
- Platform-specific picker (iOS wheel, Android dropdown)

---

## Design Guidelines

### Colors
Use theme colors from `lib/theme.ts`:
- Primary: `colors.primary[500]` (#10b981)
- Background: `backgroundColor` from theme context
- Text: `textPrimary`, `textSecondary` from theme context
- Card: `cardBackground` from theme context

### Typography
Use typography from `lib/theme.ts`:
- Font sizes: `typography.fontSizes.*`
- Font weights: `typography.fontWeights.*`

### Spacing
Use spacing from `lib/theme.ts`:
- Padding/margins: `spacing.*`

### Border Radius
Use border radius from `lib/theme.ts`:
- Rounded corners: `borderRadius.*`

### Shadows
Use shadows from `lib/theme.ts`:
- Elevation: `shadows.*`

### Animations
Use `react-native-reanimated` for:
- Fade in/out
- Slide animations
- Scale effects

### Haptics
Use `expo-haptics` for:
- Button presses
- Selection feedback
- Success/error feedback

---

## Implementation Priority

1. **InputField** - Most basic, used in multiple places
2. **PrimaryButton** - Core interaction component
3. **SelectField** - Form component
4. **SectionHeader** - Layout component
5. **ModalSheet** - Complex component with animations

---

## Testing Checklist

For each component:
- [ ] Renders correctly in light mode
- [ ] Renders correctly in dark mode
- [ ] Props are properly typed
- [ ] Handles user interaction
- [ ] Respects disabled state (if applicable)
- [ ] Animations are smooth
- [ ] Accessible (screen reader friendly)
- [ ] Works on iOS
- [ ] Works on Android
- [ ] Works on Web

---

## Example Component Structure

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { spacing, typography, borderRadius } from '@/lib/theme';

interface ComponentProps {
  // Props here
}

export function ComponentName({ ...props }: ComponentProps) {
  const { isDarkMode, backgroundColor, textPrimary } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textPrimary }]}>
        {/* Content */}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  text: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
});
```
