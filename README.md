# Budget Buddy 💰

A modern, feature-rich personal finance management mobile application built with React Native and Expo. Budget Buddy helps you track your accounts, manage transactions, plan your budget, and get AI-powered financial insights.

## ✨ Features

### 📊 Dashboard
- **Net Worth Overview**: Real-time visualization of your total financial worth
- **Multiple Account Types**: Support for salary, spending, pocket money, savings, and fixed deposits
- **Quick Account Management**: Add and manage multiple financial accounts
- **AI-Powered Insights**: Get personalized financial recommendations and warnings

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

### 📅 Budget Planner
- **Monthly Planning**: Plan your monthly budget allocation
- **Essential Expenses**: Track recurring bills and utilities
- **Savings Goals**: Set and monitor savings targets
- **Allocation Management**: Distribute income across different categories

### ⚙️ Settings
- **Theme Toggle**: Switch between light and dark modes
- **Profile Management**: Manage your account settings
- **Customization**: Personalize your Budget Buddy experience

## 🛠️ Tech Stack

### Frontend
- **React Native** (0.81.5) - Cross-platform mobile framework
- **Expo** (SDK 54) - Development platform and tooling
- **TypeScript** - Type-safe development
- **React Navigation** - Navigation and routing
- **React Native Reanimated** - Smooth animations
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
│   ├── (tabs)/                   # Tab-based navigation screens
│   │   ├── index.tsx            # Dashboard/Home screen
│   │   ├── transactions.tsx     # Transaction management
│   │   ├── insights.tsx         # Analytics and insights
│   │   └── settings.tsx         # App settings
│   └── _layout.tsx              # Root layout with providers
├── components/                   # Reusable components
│   ├── AccountList.tsx          # Account list display
│   ├── AIInsightCard.tsx        # AI insight cards
│   ├── BalanceCard.tsx          # Account balance cards
│   ├── NetWorthCard.tsx         # Net worth display card
├── lib/                         # Utilities and configuration
│   ├── database/                # SQLite database setup
│   │   └── sqlite.ts            # Database initialization
│   ├── services/                # Business logic services
│   │   ├── accounts.ts          # Account management
│   │   ├── transactions.ts      # Transaction logic
│   │   └── monthlyPlans.ts      # Budget planning
│   ├── utils/                   # Helper functions
│   │   └── updates.ts           # Version and update logic
│   ├── types.ts                 # Type definitions and constants
│   ├── theme.ts                 # Theme configuration
│   └── ThemeContext.tsx         # Theme context provider
├── assets/                      # Static assets
│   ├── fonts/                   # Custom fonts
│   └── images/                  # Images and icons
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
└── metro.config.js              # Metro bundler configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **bun** package manager
- **Expo CLI** (installed globally or via npx)
- **iOS Simulator** (for Mac) or **Android Emulator** (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
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
   EXPO_PUBLIC_APP_URL=https://your-app-url.com
   ```
   
   > 🔐 Never commit `.env` files. The OpenRouter key is optional - the app works without it using rule-based insights.

4. **Start Expo development server**
   ```bash
   npm start
   # or
   expo start
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

## 🔐 Authentication

Budget Buddy uses local-first authentication and security:
- **Local SQLite**: All financial data stays on your device.
- **Secure Store**: Credentials and API keys are encrypted locally.
- **Privacy First**: No cloud syncing of your private transactions.

## 💾 Data Management

- **SQLite**: Local-first database for all user data.
- **Types & Constants**: Unified type system in `lib/types.ts`.
- **Type Safety**: Full TypeScript type definitions

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Expo Team** - For the amazing development platform
- **Lucide Icons** - For the beautiful icon library
- **React Native Community** - For the ecosystem and support

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

**Built with ❤️ using React Native and Expo — © 2026**
