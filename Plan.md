# Plan.md — Budget Buddy fix & optimization roadmap

Status legend: ☐ todo · ☑ done · ◐ in progress

---

## Phase 0 — Reported bug fixes (current)

### 0.1 Search crash in transaction history — ☑ fixed

**Root cause (confirmed):** Temporal Dead Zone error in `app/(tabs)/transactions.tsx`.
`filteredTransactions` runs during render (line ~170) and its filter callback calls
`getAccountById` — but `const getAccountById` was declared *later* in the component
body (line ~395). The callback only touches it when `searchQuery.trim()` is
non-empty, so typing in the search box threw:

```
ReferenceError: Cannot access 'getAccountById' before initialization
```

**Fix:**
- Move `getAccountById` above the filter.
- Wrap the filter in `useMemo` (deps: `transactions`, `accounts`, `filterType`, `filterAccount`, `searchQuery`).
- Build an `accountsById` `Map` once per memo instead of `accounts.find()` per row (removes O(rows×accounts) per keystroke).

**Acceptance:** typing in History search filters results and never crashes; `npx tsc --noEmit` clean.

### 0.2 Dashboard amounts hidden by default — ☑ fixed

**Root cause (confirmed):** `components/NetWorthCard.tsx` and `components/BalanceCard.tsx`
each had local `useState(true)` — per-card, always visible on mount, not shared, not persisted.

**Fix (shared persisted toggle):**
- `lib/UserContext.tsx`: add `balancesHidden?: boolean` to `UserProfile`; context exposes
  `balancesHidden` (resolves `undefined → true`, so **existing users default to hidden**)
  and `toggleBalances()`; persisted through the existing `updateUser`/profile storage.
- `components/NetWorthCard.tsx`, `components/BalanceCard.tsx`: drop local state; eye button
  reads shared state and calls `toggleBalances()` — one tap toggles **all** dashboard balances.
- Month income/expense/savings analytics cards remain visible (intentional scope).

**Acceptance:** fresh launch shows `Rs. ••••••` on net-worth hero and account cards; one eye
tap reveals/hides everything; choice survives app restart; `npx tsc --noEmit` clean.

---

## Phase 1 — Data layer (highest impact) — ☑ done

- ☑ Turn `DataProvider` (`lib/DataContext.tsx`) into a real cache: load accounts/transactions/monthly plan once; expose selectors + an invalidation API instead of a bare `refreshKey` counter.
- ☑ Memoize context `value` objects with `useMemo`: `DataContext.tsx:25`, `UserContext.tsx:110`, `ThemeContext.tsx:119` — currently fresh objects every render, re-rendering every consumer on any provider state change.
- ☑ Stop setting `loading = true` on background refreshes (`index.tsx:163`, `charts.tsx:106`, `insights.tsx:283`, `planner.tsx:472`) — spinner flash unmounts content and replays `entering` animations on every mutation.
- ☑ Give `transactions.tsx` history effect a `refreshKey` dep (currently `[activeTab]` only → stale list, patched with scattered manual `loadTransactions()` calls).
- ☑ Unify the refresh contract: `loans.tsx` mutations never call `triggerRefresh()`.
- ☑ All 9 screens consume the cache (dashboard/chat migrated last); `insights.tsx` AI generation runs from committed context data with signature dedup.

**Acceptance:** one saved transaction causes a single coordinated refresh; no full-screen
spinner on background updates; context consumers don't re-render on unrelated key changes.

## Phase 2 — Correctness — ☑ done

- ☑ **Insights stale state:** AI generation now runs in an effect fed only by committed context data, with signature dedup + in-flight guard + `AbortController` wired to `generateAIInsights`.
- ☑ **AI call churn:** per-day insights cache in `settings` table (`ai.ts`, key `ai_insights_cache`) — paid API called at most once/day; `AbortController` + 45s cap for insights loop (`ai.ts`), 60s cap for chat loop (`aiChat.ts`).
- ☑ **SQL precedence bug:** `transactions.ts` accountId filter parenthesized: `(source = ? OR destination = ?) AND type = ?`.
- ☑ **`OFFSET` without `LIMIT`:** emits `LIMIT -1 OFFSET ?` when no limit given.
- ☑ **Hot path:** budget-alert now a single `SUM(amount)` over the month's date range, run *outside* the write transaction (was full-table read + JS filter inside it).
- ☑ **N+1 balance updates:** atomic `UPDATE accounts SET balance = balance + ?` with `AND balance + ? >= 0` overdraft guard (name fetched only on failure); reversals use sign-flipped deltas.
- ☑ **Indexes:** `transactions(date/source/dest/type_date)`, `monthly_plans(year, month)`, `notifications(read/created)`, `chat(created)` — migration v1.
- ☑ **Migrations:** `PRAGMA user_version` runner (v1 indexes, v2 month-key conversion) + race-safe promise-memoized `initDatabase`.
- ☑ **Locale month keys:** `monthly_plans.month` now `'YYYY-MM'` (`monthKey()` helper; planner updated); migration v2 converts legacy locale names (English match + same-device locale regen).
- ☑ **Whitelist columns** in `accounts.ts` dynamic `SET` (fixed column map; skips `undefined`).
- Verified: `npx tsc --noEmit` clean; 16/16 SQL behavior checks passed against real SQLite (parens, OFFSET, SUM range, overdraft guard, whitelist, YYYY-MM upsert, migration conversion).

**Acceptance:** `npx tsc --noEmit` clean; manual regression of transaction CRUD, budget
warnings, insights generation, planner save/load on a database with existing data.

## Phase 3 — Render performance — ☑ done

- ☑ `React.memo` on `TransactionItem`, `MarkdownView`, `AIInsightCard`.
- ☑ `useCallback` for FlatList `renderItem` in `transactions.tsx` + stable `handleEdit`/`handleDelete`/`getAccountById`; `TransactionItem` `onEdit`/`onDelete` now receive the transaction (stable callbacks instead of per-row closures); `extraData={accountsById}`.
- ☑ Chat: `ScrollView.map` → `FlatList` with memoized `ChatBubble` + `useCallback` renderItem; markdown parsing cached (LRU `parseBlocks` cache, 100 entries) on top of memoized `MarkdownView`; input bar extracted to `ChatInputBar` (local input/focus state + keyboard handling) so typing no longer re-renders history; `EmptyState` extracted.
- ☑ `Intl.NumberFormat` instances cached in `formatCurrency` (keyed by locale).
- ☑ Chart geometry memoized: `PieChart` slices, `LineChart` points (`useMemo`), stable gradient id (module counter instead of `Math.random()`), `StackedBarChart` zero-total NaN guard + memoized segments.
- ☑ Nested `ScrollView`s removed (AdvancedCharts content flattened).
- ☑ Categorizer: per-keystroke `new RegExp` eliminated (plain `includes` — strictly equivalent since keywords are lowercase and regex ⊆ substring).
- ☑ `AnimatedCounter`: throttled to ≤20 updates/s (no per-frame `setState`), ref-based deps; `Skeleton` shimmer loop stopped on unmount.
- ☑ `planner.tsx` `Math.random()` ids → monotonic `plan-row-N` counter.
- Verified: `npx tsc --noEmit` + eslint clean on all touched files.

**Acceptance:** typing in search/chat stays at 60fps with 500 transactions; no `NaN` in
charts when data is empty.

## Phase 4 — Structure & duplication

- ☐ Extract the duplicated transaction form (`transactions.tsx:399-578` ≈ `:849-989`) into
  one shared component (follow `loans.tsx` `renderForm()` pattern).
- ☐ Extract duplicated account Add/Edit modals (`index.tsx:560-635` vs `:646-705`).
- ☐ Deduplicate legal/FAQ content: Privacy, Terms, FAQ, `openEmail` are copy-pasted between
  `settings.tsx` and standalone screens → single source modules.
- ☐ Split `settings.tsx` (1,793 lines, 16 `useState`, 0 memo) into `components/settings/*`.
- ☐ Shared account-row mapping (copy-pasted in 4 screens) and month-aggregation selectors
  (4 implementations) → `lib/` helpers.
- ☐ Delete dead code: `components/BudgetHealthCard.tsx`, `Avatar.tsx`, `AccountList.tsx`,
  `lib/utils/export.ts` (crashes on null notes + broken CSV), `lib/services/index.ts`,
  unused imports/state/styles; never-called `validate()` in `login.tsx`/`signup.tsx`.
- ☐ Remove ~10 unused deps (`expo-blur`, `expo-symbols`, `expo-image`, `expo-font`,
  `@expo/vector-icons`, `react-native-webview`, `@react-native-community/slider`,
  `@react-navigation/bottom-tabs`, `@react-navigation/elements`, `expo-system-ui`).
- ☐ Unify primitives: scale-on-press implemented 4×; `SelectField` duplicates `ModalSheet`
  internals; add a `Card` shell + `ScreenHeader` (copy-pasted across 9 screens).

**Acceptance:** `settings.tsx` and `transactions.tsx` each under ~900 lines; `npm run lint`
clean; no behavior change.

## Phase 5 — Security & release hygiene

- ☐ Remove `EXPO_PUBLIC_OPENROUTER_API_KEY` client-bundle key path (`ai.ts:240`,
  `aiChat.ts:52`) — user-supplied key only, or a tiny proxy.
- ☐ Stop storing the user AI key in plaintext `localStorage` on web (`UserContext.tsx:16`).
- ☐ `npm audit fix` — 47 vulns (1 critical `shell-quote`, 15 high) in the tooling chain.
- ☐ `eas.json`: production/preview must build **AAB**, not APK (Play Store requirement).
- ☐ Add explicit `babel.config.js` with `react-native-worklets/plugin` (last).
- ☐ `app.json`: replace generic `"scheme": "myapp"`, add `ios.bundleIdentifier`, `runtimeVersion`.
- ☐ Fix `updates.ts` version compare (`Number('1-beta')` → NaN → updates never reported).
- ☐ Remove the web `console.warn` monkey-patch (`app/_layout.tsx:14-25`).

**Acceptance:** no secrets in the shipped bundle; `npm audit` clean; EAS preview build
produces an installable AAB.

## Phase 6 — Quality gates

- ☐ Add jest-expo + @testing-library/react-native; smoke tests for services (SQL) and the
  transaction form/search filter.
- ☐ Add Prettier; type-aware ESLint rules.
- ☐ CI: `npm ci && npx tsc --noEmit && npm run lint && npm test` on PR.
- ☐ Fix type-safety gaps: `any` inventory in `lib/services/*`, `Transaction.notes` nullability
  mismatch (`types.ts:20` vs nullable DB column), consolidate `Loan`/`AppNotification`/
  `ChatMessage` types into `lib/types.ts`.

**Acceptance:** CI green on a PR; `tsc --noEmit` and lint enforced.

---

### Suggested order

**Phase 0 (done) → 1 → 2 → 3** deliver the bulk of the perceived performance and
correctness wins; **4 → 5 → 6** then make the codebase safe to keep changing.
