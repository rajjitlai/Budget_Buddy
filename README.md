# Budget Buddy 💰

A modern, feature-rich personal finance management mobile application built with React Native and Expo. Budget Buddy helps you track your accounts, manage transactions, plan your budget, and get AI-powered financial insights.

## ✨ Features

### 🎬 Dashboard (V3 Cinematic)
- **Cinematic Experience**: Dynamic, collapsible animated headers and staggered entry animations.
- **Account Carousel**: Interactive horizontal scrolling for accounts with premium scale feedback.
- **Floating Action Button (FAB)**: Unified entry point for rapid transaction and account management.
- **Net Worth Overview**: Real-time glassmorphic visualization of your total financial worth.
- **AI-Powered Insights**: Get personalized financial recommendations and warnings directly on your home feed.

### 💸 Transaction Management
- **Multi-Type Transactions**: Track expenses, income, and transfers between accounts
- **Category-Based Organization**: Organize transactions by categories (food, utilities, entertainment, etc.)
- **Transaction History**: View and filter your complete transaction history
- **Quick Entry**: Fast transaction entry with smart defaults

### 📈 Insights & Analytics
- **Spending Analysis**: Visual breakdown of your spending patterns
- **Category-wise Reports**: Understand where your money goes
- **Trend Analysis**: Track your financial trends over time
- **Smart Recommendations**: AI-driven suggestions for better financial health

### 📅 Dynamic Budget Planner
- **Custom Planning Strategy**: No longer limited to presets—add your own custom fields for any category.
- **Flexible Step Wizard**: A cinematic, multi-step flow to design your monthly strategy.
- **Savings & Goal Tracking**: Prioritize future goals with dynamic savings targets.
- **Allocation Real-time Summary**: Instantly see how your strategy affects your leftover funds.

### ⚙️ Premium Experience
- **Sidebar (Drawer) Navigation**: Full-height navigation menu with deep glassmorphism and intuitive gesture support.
- **Haptic Interaction System**: Squishy, spring-based feedback on every press with native haptics.
- **Theme Toggle**: Full light and dark mode support with system-aware transitions.

## 🛠️ Tech Stack

### Frontend
- **React Native** (0.81.5) - Cross-platform mobile framework
- **Expo** (SDK 54) - Development platform and tooling
- **React 19** - Modern component-driven UI
- **TypeScript** - Type-safe development
- **React Navigation** - Drawer and stack navigation
- **React Native Reanimated** - Smooth, spring-based animations
- **Lucide React Native** - Beautiful icon library

### Backend & Services
- **SQLite** (`expo-sqlite`) - Local-first database storage
- **AI Insights** (OpenRouter) - Intelligent financial recommendations
- **Expo Secure Store** - Secure local settings storage
- **Expo File System** - Data export and management

### UI/UX
- **Custom Theme System** - Comprehensive design tokens
- **Dark Mode Support** - System-aware theme switching
- **Haptic Feedback** - Enhanced user interaction
- **Smooth Animations** - Polished user experience

## 📁 Project Structure

```
Budget_Buddy/
├── app/                          # Application screens and navigation
│   ├── (tabs)/                   # Sidebar (Drawer) navigation screens
│   │   ├── index.tsx            # Dashboard/Home screen
│   │   ├── transactions.tsx     # Transaction management
│   │   ├── charts.tsx           # Spending Analysis
│   │   ├── planner.tsx          # Budget Strategy
│   │   ├── insights.tsx         # AI Recommendations
│   │   ├── settings.tsx         # App preferences
│   │   └── _layout.tsx          # Drawer layout configuration
│   ├── _layout.tsx              # Root layout with providers
│   └── help-support.tsx         # Support and FAQ center
├── components/                   # Reusable components
├── lib/                         # Utilities and configuration
│   ├── database/                # SQLite database setup
│   ├── services/                # Business logic services
│   ├── utils/                   # Helper functions
│   ├── types.ts                 # Type definitions and constants
│   ├── theme.ts                 # Theme configuration
│   └── ThemeContext.tsx         # Theme context provider
├── assets/                      # Static assets
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── LICENSE                      # MIT License
└── metro.config.js              # Metro bundler configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **bun** package manager
- **Expo Go** app on your physical device or an emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajjitlai/Budget_Buddy.git
   cd Budget_Buddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # AI (OpenRouter - Optional, uses rule-based fallback if not set)
   EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-key
   ```
   
   > 🔐 Never commit `.env` files. The OpenRouter key is optional - the app works without it using rule-based insights.

4. **Start Expo development server**
   ```bash
   npm start
   ```

5. **Run on your device**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## 🐛 Known Issues & Debugging

### Environment Configuration

Missing or incorrect environment variables will cause:
- AI service failures
- Runtime crashes

## 📦 Dependencies

### Core Dependencies
```json
{
  "expo": "^54.0.20",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo-sqlite": "~16.0.10"
}
```

### UI & Navigation
```json
{
  "@react-navigation/native": "^7.1.6",
  "@react-navigation/bottom-tabs": "^7.3.10",
  "react-native-reanimated": "~4.1.1",
  "react-native-gesture-handler": "~2.28.0",
  "lucide-react-native": "^0.555.0"
}
```

## 🎨 Theme System

Budget Buddy uses a comprehensive theme system with:
- **Color Palette**: Emerald primary with slate neutrals
- **Typography**: Responsive font sizes and weights
- **Spacing**: Consistent spacing scale
- **Shadows**: Elevation system for depth
- **Border Radius**: Rounded corner system
- **Dark Mode**: Full dark mode support

## 📱 Supported Platforms

- ✅ **iOS** (iPhone & iPad)
- ✅ **Android** (Phone & Tablet)
- ✅ **Web** (via Expo Web)

## 🔐 Authentication & Privacy

Budget Buddy uses local-first authentication and security:
- **Local SQLite**: All financial data stays on your device.
- **Secure Store**: Credentials and API keys are encrypted locally.
- **Privacy First**: No cloud syncing of your private transactions.
- **Biometrics**: Support for FaceID/TouchID/Fingerprint locking.

## 💾 Data Portability

- **JSON Export**: Export your entire financial history to a JSON file.
- **JSON Import**: Restore your data from a previously exported backup.
- **SQLite**: Direct access to local-first database for advanced users.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** - For the amazing development platform
- **Lucide Icons** - For the beautiful icon library
- **React Native Community** - For the ecosystem and support

---

**Built with ❤️ using React Native and Expo — v2.1.0 — © 2026**
