# Changelog

All notable changes to Budget Buddy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.3.1] - 2026-08-20

### Added
- **Centered 2-Column Account Grid Popup**: Replaced the account selection bottom sheet with a centered, spring-animated popup dialog featuring a 2-column interactive grid with account icons, theme colors, balances, and active checkmark badges.
- **WhatsApp-Style Reactive Keyboard Elevation**: Integrated `useAnimatedKeyboard` from `react-native-reanimated` across AI Chat and Transaction creation forms to smoothly lift input fields at 60fps above the Android soft keyboard.
- **Auto-Scroll on Input Focus**: Added smart focus listeners on chat inputs and transaction notes to automatically scroll fields and action buttons into full view when the keyboard opens.
- **Multi-Model AI Connect & Fallbacks**: Integrated `openrouter/free` auto-routing with fallback support for Google Gemma 4 (`google/gemma-4-26b-a4b-it:free`), NVIDIA Nemotron 3.5 (`nvidia/nemotron-3.5-lightning:free`), and GLM 5.2 (`z-ai/glm-5.2:free`).
- **Markdown Output Formatting**: Added native markdown preview across AI Chat and AI Insights supporting headings, bold/italics, bulleted and numbered lists, code blocks with syntax styling, inline code chips, and blockquotes.
- **Dynamic Category Analysis & SVG Pie Chart**: Automatic transaction title & notes category inference with deterministic color palette generation and interactive Donut/Pie charts.
- **Animated Number Counter**: Built an animated ticker counter component (`AnimatedCounter.tsx`) for smooth balance roll-ups.
- **Hero & Balance Card Gradients**: Added linear gradient meshes and ambient glow highlights to NetWorthCard and BalanceCards.
- **Glowing Area Line Charts**: Added SVG gradient fills under the curve in financial trend charts.
- **Category Glow Rings**: Category-tinted circular icon rings for transaction list items.
- **Savings Milestone Celebration Banner**: Added dynamic savings tier achievement cards on the home dashboard.
- **In-App Changelog Viewer**: Added a dedicated Changelog section in Settings to track version updates starting from v2.3.1.
- **1-Tap AI Model Presets**: Added quick model preset selection chips in Settings for instant AI configuration.

### Changed
- **Dashboard FAB Action**: Tapping the floating action button (+) on the home dashboard now directly opens transaction addition (`/(tabs)/transactions`).
- **Modal Design**: Replaced bottom slide-up sheets with centered, spring-animated popup dialog overlays across mobile and web.
- **Chat Input Bar**: Upgraded chat text input with active focus borders, centered vertical alignment, and dynamic safe-area insets.
- **AI Domain Enforcement**: Enforced strict personal finance guardrails preventing off-topic or code generation responses.

### Optimized
- **Android Modal Scroll Stability**: Added `nestedScrollEnabled={true}`, `showsVerticalScrollIndicator={true}`, and `overScrollMode="always"` to modal sheet dialogs, eliminating touch-interception freezes in long modals (Changelog, Privacy, Terms, Help).
- **Multi-Device Navigation Support**: Integrated dynamic `useSafeAreaInsets` for bottom padding across tab screens, accommodating both Android 3-button navigation bars and gesture navigation pills.
- **Gesture Conflict Prevention**: Configured drawer edge swipe width (`swipeEdgeWidth: 35`) to prevent conflict with Android system back gestures.
- **Android Back Handling**: Added hardware back button dismissal for all popup dialogs.

### Fixed
- **Reanimated Frozen Ref Crash**: Fixed `[Error: You attempted to set the key current with the value undefined on an object that is meant to be immutable and has been frozen.]` by wrapping scrollable containers in animated padding views with standard React refs.
- **Reanimated Opacity Warning**: Resolved `[Reanimated] Property "opacity" of AnimatedComponent(View) may be overwritten by a layout animation` by decoupling timing opacity from layout entering/exiting animations.
- **Loan Partial Updates**: Fixed SQL update query parameter mapping so partial updates (e.g. remaining balance) do not overwrite loan names or principal amounts.
- **Data Portability & Restore**: Added `last_updated` column and extended JSON export/import to restore all database tables (`accounts`, `transactions`, `monthly_plans`, `loans`, `notifications`, `chat_messages`) atomically.
- **Template Literal Backtick Syntax**: Removed illegal escaped backticks in CSV and JSON export utilities.
- **Version Number Consistency**: Synchronized all version references across `package.json`, `app.json`, sidebar drawer header, settings footer, and update checkers to `2.3.1`.
