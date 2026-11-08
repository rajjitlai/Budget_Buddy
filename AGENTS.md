# AGENTS.md — Budget Buddy

## What this project is

Budget Buddy is a **local-first, AI-powered personal finance mobile app** built with Expo/React Native. Users track accounts, transactions, loans, monthly budget plans, and notifications; get AI insights and a financial chat; and export/import their data. All data lives in on-device SQLite — there is **no backend**. AI features call OpenRouter/OpenAI directly from the client (optional; rule-based fallbacks exist).

- **Version:** 2.4.0 (`package.json`) — see `CHANGELOG.md`
- **License:** MIT
- **Platforms:** iOS, Android, Web (Expo)

## Tech stack

| Area | Choice |
|---|---|
| Framework | Expo SDK 54, React Native 0.81.5, React 19, TypeScript 5.9 (strict) |
| Routing | expo-router v6 — folder `app/(tabs)/` is actually a **Drawer** navigator (not tabs) |
| Animation | react-native-reanimated 4 + worklets (use this, not RN core `Animated`) |
| Storage | expo-sqlite (primary), expo-secure-store (secrets/profile), localStorage (web fallback) |
| Icons | lucide-react-native (do not add @expo/vector-icons) |
| Charts | hand-rolled with react-native-svg (no chart library) |
| AI | OpenRouter (primary) + OpenAI-compatible endpoints, user-supplied API key |
| State | React Context: `UserContext`, `ThemeContext`, `DataContext` (no Redux/Zustand) |

## Commands

```bash
npm start            # Expo dev server
npm run lint         # eslint (expo lint)
npx tsc --noEmit     # typecheck — run before considering work done
npm run android|ios  # platform targets
```

There are **no tests** yet (see `Plan.md` Phase 6).

## Project structure

```
app/                    # expo-router screens
  _layout.tsx           # root: providers (ErrorBoundary → User → Theme → Data) + Stack
  (tabs)/               # drawer screens: index (dashboard), transactions, charts,
                        #   planner, loans, notifications, insights, chat, settings
  login.tsx, signup.tsx # local-only onboarding (no real auth)
  privacy-policy.tsx, terms-of-service.tsx, help-support.tsx
components/             # feature components (TransactionItem, charts, cards, ...)
  ui/                   # primitives: ModalSheet, InputField, SelectField,
                        #   PrimaryButton, AnimatedScale, Skeleton, MarkdownView, ...
lib/
  database/sqlite.ts    # schema + init + runInTransaction helper
  services/             # all SQL lives here (accounts, transactions, monthlyPlans,
                        #   loans, notifications, ai, aiChat, dataPortability)
  utils/                # categorizer, updates, export (export.ts is dead code)
  DataContext.tsx        # refresh-key bus (NOT a data store — see below)
  UserContext.tsx       # user profile (name, currency, aiConfig) + persistence
  ThemeContext.tsx      # light/dark theme tokens
  types.ts              # shared types + formatCurrency + constants
```

## Conventions

- **SQL only in `lib/services/*`** — screens never touch the DB directly. Use parameterized queries and `runInTransaction` for writes.
- **Theme:** import tokens from `@/lib/theme` and dynamic values from `useTheme()`. Don't hardcode light-mode colors in styles.
- **Animations:** Reanimated (`FadeInDown`, `useAnimatedStyle`, shared values) for anything that moves.
- **Path alias:** `@/` → repo root (`tsconfig.json`).
- **Refresh contract:** mutations call `triggerRefresh()` from `useData()`; mounted screens refetch in `useEffect([refreshKey])`. (Known to be inefficient — `Plan.md` Phase 1 replaces this.)
- **Haptics:** wrap in `Platform.OS !== 'web'` guard.
- **Formatting:** `formatCurrency(amount, user?.currency)` from `@/lib/types`.

## Known issues

See **`Plan.md`** — Phase 0 (search-crash fix, hidden-by-default balances) and Phases 1–6 (data layer, correctness, render perf, structure, security, tests).
