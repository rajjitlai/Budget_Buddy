# Changelog

All notable changes to **Budget Buddy** will be documented in this file.

## [2.2.1] - 2026-06-15
### Added
- **Reset Budget Plan**: Added the ability to completely delete/reset the currently applied monthly budget strategy in the planner, clearing database constraints and resetting state forms.
- **Budget Ratios Visualizer**: Integrated a live, responsive 50/30/20 category segment visualizer bar that updates in real-time as users adjust income, fixed expenses, savings, and allowances.
- **Planner Suggester Chips**: Added tap-to-add category suggester chips (e.g. Rent, Groceries, Mutual Funds) at each step of the Budget Planner to avoid manual labels typing.

### Fixed
- **Data Export**: Replaced `FileSystem.documentDirectory` with `FileSystem.cacheDirectory` in dataPortability.ts to resolve Native/Android Sharing API permission/FileProvider issues in standalone APKs.
- **EAS Build Config Plugin**: Removed invalid config plugin entries for expo-sharing and expo-document-picker from app.json to fix EAS compilation checks.
- **Biometrics Cleanup**: Removed all legacy references, setting attributes, and descriptions of FaceID/TouchID/Fingerprint locking, as this is better managed by OS-level app locks.

## [2.2.0] - 2026-05-09
### Added
- **Loans Tracker**: New dedicated drawer screen to track money you owe (borrowed) and money owed to you (lent). Features: principal/remaining balance, interest rate, due date, lender/borrower name, repayment recording, progress bar, overdue badge, and summary strip showing total owed vs total to collect.
- **AI Alerts / Notifications**: New Notifications screen with persistent SQLite storage. Automatically generates smart alerts on each data load — high spending warnings (>80% of salary), category spike warnings (>50% of total expenses), savings milestone success, and no-transaction nudges. Deduplicates by title per day. Bell icon on Dashboard header shows red unread count badge. Drawer item also shows unread badge. Mark all read, delete individual, clear all supported.
- **AI Chat**: New full-screen conversational AI assistant drawer tab. Injects live financial context (net worth, monthly income/expenses, savings rate, top categories) into the system prompt. Falls back to smart offline responses when no API key is configured. Suggested prompts on empty state. Typing indicator while AI responds.
- **Persistent AI Chat History**: Chat messages stored in a `chat_messages` SQLite table. Full history loads on mount, each message saved on send. "Clear chat" trash button in header wipes history with haptic feedback.
- **AI Mode Toggle**: ⚡ button in the AI Chat header instantly switches between live AI (API) and rule-based offline responses — useful when hitting rate limits. Red `ZapOff` icon and banner indicate offline mode.
- **Smart Planner — AI Suggest**: "✨ AI Suggest Allocations" button on the income step of the Budget Planner. Analyzes last 3 months of transaction history to auto-fill fixed costs, savings goals, and allowances. Falls back to the 50/30/20 rule when no transaction history exists.
- **AI Configuration — Custom Instructions**: New multiline field in Settings → AI Configuration. User-defined instructions appended to the system prompt (e.g. "Always use INR", "Focus on debt reduction").
- **AI Configuration — Model Selection**: Editable model name field with provider-aware placeholder and a link to OpenRouter/OpenAI model directories.
- **AI Finance Guardrails**: Hardened system prompt strictly limits AI responses to personal finance topics only. Off-topic questions receive a fixed refusal. Jailbreak-resistant phrasing included.

### Fixed
- **Notification Badge — Real-time**: Replaced 30-second polling with reactive `notifRefreshKey` in `DataContext`. Dashboard bell badge and drawer badge update instantly when notifications are marked read, deleted, or cleared.
- **AI API Key Not Saving**: Fixed `updateUser` not being destructured from `useUser()` in `settings.tsx` — caused silent save failure.
- **AI Config Fields Empty on Load**: Added `useEffect([user])` to sync AI config form fields after `UserContext` finishes loading from SecureStore — fields were always empty due to `null` user at `useState` init time.
- **OpenRouter 400 Error**: Folded system prompt into the first user message instead of using the `system` role — free Gemma models on OpenRouter reject `system`-role messages.
- **OpenRouter 404 Error**: Switched default model from non-existent `google/gemma-3n-e2b-it:free` to `google/gemma-2-9b-it:free`.

### Fixed (internal)
- `sqlite.ts`: Added `chat_messages` table via `CREATE TABLE IF NOT EXISTS` — safe migration, no data loss.
- `DataContext.tsx`: Added `notifRefreshKey` + `triggerNotifRefresh` for reactive badge propagation without polling.
- All version fallback strings updated from `2.1.0` → `2.2.0` across `_layout.tsx`, `updates.ts`, `dataPortability.ts`, and `README.md`.

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
