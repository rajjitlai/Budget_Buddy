# Changelog

All notable changes to **Budget Buddy** will be documented in this file.

## [2.1.2] - 2026-05-09
### Added
- **Dashboard Analytics Strip**: New "This Month" row between Net Worth and Accounts showing Income, Expenses, and Savings Rate — computed live from loaded transactions via `useMemo`, zero extra DB calls.
- **AI Insights Subtitle**: Dynamically shows "Using AI Intelligence" when an API key is configured, or "Using custom calculations" otherwise.

### Fixed
- **Planner Crash ("Something Went Wrong")**: Fixed `ReferenceError` in `SummaryItem` component — `displayCurrency` was called from outer scope; now accepts `currency` prop and calls `formatCurrency` directly.
- **Transaction Warning Crash ("Cannot read property")**: Added optional chaining on `result?.warning` so the budget alert check never throws when `runInTransaction` returns without the augmented field.
- **Amounts Hidden by Default**: `NetWorthCard` and `BalanceCard` now initialise with `isVisible = false` so all balances are masked until the user taps the eye icon.
- **Dashboard — Removed "See All / See Less"**: The My Accounts horizontal scroll now renders all accounts without a toggle, as the controls were redundant and confusing.
- **Account Deletion**: Added a **Delete Account** button to the Edit Account modal. If the account has linked transactions, shows a count and offers a **Force Delete** option (cascades to all transactions). Clean accounts are deleted with a simple confirmation.
- **Category Chips Full Width**: Moved the category suggestion chip row out of the half-width Category column to span the full form width — applies to both the Add and Edit transaction forms.
- **Check for Updates — Manual Feedback**: Separated the auto-check on mount (silent) from the manual button press. The button now shows an `Alert` with "Up to date!" or "Update available — vX.X.X" with a link to the release.
- **Analytics — Income/Expense Focus**: Added three new analytics sections at the top of the Charts screen: **This Month's Cash Flow** (income, expense, net cards + savings rate bar), **Budget vs Actual** (planned vs real spend progress bar, shown only when a monthly plan exists), preceding the existing monthly trend and category charts.
- **Net Worth Trend — Accurate Data**: Rewrote the trend chart to anchor on the real current account balance and derive prior months by reversing transaction cash flow — previously always showed Rs. 0.
- **Savings Rate NaN**: Added `|| 0` guards on `allocations.savings` and `allocations.emergency` in `AdvancedCharts` — prevents `NaN%` and `Rs. NaN saved` when those keys are absent from the stored plan.
- **Advanced Charts Setting on Web**: `insights.tsx` and `settings.tsx` now use `localStorage` instead of `SecureStore` on web, fixing `getValueWithKeyAsync is not a function` crash when visiting the AI Insights page.
- **Skeleton Animation on Web**: `shimmerValue` moved to `useRef` to prevent recreation on every render; `useNativeDriver` disabled on web to fix the unsupported driver warning.
- **Bento Row Removed**: Removed the Health + AI Advice bento row from the dashboard (persistent alignment issue). Cleaned up all related unused imports, styles, state, and loader functions.

### Fixed (internal)
- Removed broken `export * from './auth'` in `lib/services/index.ts` — `auth.ts` never existed, causing potential module resolution errors.
- Removed duplicate `historyHeader` / `historyHeaderContent` style keys in `transactions.tsx`.
- Fixed `parseFloat(undefined)` in planner `handleSave` via nullish coalescing.
- Suppressed known `@react-navigation/drawer` web warnings (`props.pointerEvents deprecated`, `Unexpected text node`) via a `console.warn` patch in `_layout.tsx` — web-only, passes all other warnings through.

## [2.1.1] - 2026-05-08
### Fixed
- **Modal Animation**: Replaced glitchy spring dismiss with a smooth `withTiming` slide-down; tuned open spring to `damping: 30, stiffness: 250` for a natural feel.
- **Dashboard AI Advice Card**: Removed `height: '100%'` that caused the card to stretch across the full page; replaced with `minHeight: 120`.
- **Settings – Check for Updates**: Added a manual "Check for Updates" button in the About section with a loading state and haptic feedback on success.

## [2.1.0] - 2026-05-08
### Added
- **Cinematic UI System**: Implemented multi-layered shadows, glassmorphic blur tokens, and premium border radii.
- **AnimatedScale Component**: Spring-based interaction system for consistent tactile feedback.
- **Dashboard Account Carousel**: Horizontal scrolling account cards with staggered entry animations.
- **Floating Action Button (FAB)**: Unified entry point for all major budget interactions.
- **Bento Grid Dashboard**: Restructured the home screen into a modern, clustered card layout.
- **Skeleton Shimmers**: Replaced legacy loading spinners with hardware-accelerated shimmering skeletons.
- **Dynamic Planner (v2)**: Completely rebuilt the planner to allow user-defined categories and fields.
- **Floating Glass Navigation**: A modern, icon-only tab bar with background blur effects.
- **Strategy Guide**: Added 50/30/20 live calculator in the Planner.

## [1.1.0] - 2026-05-07
### Added
- **AI Insights v1**: Initial integration with OpenRouter for financial advice.
- **Multi-Account Support**: Ability to track multiple accounts (Savings, Salary, etc.).
- **Transaction History**: List view of all financial activities.

---
*Built with ❤️ by the Budget Buddy Team*
