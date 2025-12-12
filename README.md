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
- **Appwrite** - Backend-as-a-Service for authentication and database
- **Expo Secure Store** - Secure credential storage

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
│   │   ├── planner.tsx          # Budget planning
│   │   └── settings.tsx         # App settings
│   └── _layout.tsx              # Root layout with providers
├── components/                   # Reusable components
│   ├── AccountList.tsx          # Account list display
│   ├── AllInsightCard.tsx       # AI insight cards (typo: should be AIInsightCard)
│   ├── BalanceCard.tsx          # Account balance cards
│   ├── CircularProgress.tsx     # Circular progress indicator
│   ├── NetWorthCard.tsx         # Net worth display card
│   └── StackedBarChart.tsx      # Chart component
├── lib/                         # Utilities and configuration
││   ├── mockData.ts              # Mock data and type definitions
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
- **Appwrite Account** (for backend services)

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
   # Appwrite
   EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
   EXPO_PUBLIC_APPWRITE_COLLECTION_ACCOUNTS=accounts
   EXPO_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS=transactions
   EXPO_PUBLIC_APPWRITE_COLLECTION_MONTHLY_PLANS=monthlyPlans

   # AI (OpenRouter - Optional, uses rule-based fallback if not set)
   EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-key
   EXPO_PUBLIC_APP_URL=https://your-app-url.com
   ```
   
   > 🔐 Never commit `.env` files. The OpenRouter key is optional - the app works without it using rule-based insights. See `OPENROUTER_SETUP.md` for detailed setup instructions.

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

### Appwrite Database Setup

Create the following collections in your Appwrite project (IDs can be customized, just keep the values in `.env` in sync):

| Collection | Required Attributes (type) |
|------------|----------------------------|
| `accounts` | `name` (string), `type` (enum), `balance` (float), `icon` (string), `color` (string), `userId` (string) |
| `transactions` | `amount` (float), `category` (string), `sourceAccountId` (string), `destinationAccountId` (string, optional), `notes` (string), `date` (datetime), `type` (enum), `userId` (string) |
| `monthlyPlans` | `salary` (float), `essentials` (object), `allocations` (object), `month` (string), `year` (integer), `userId` (string) |

Make sure the API keys used by the app have read/write access to these collections.

## 🐛 Known Issues & Debugging

### Missing UI Components

The application currently has **missing UI component files** that are imported but not implemented:

**Missing Components:**
- `components/ui/SectionHeader.tsx`
- `components/ui/PrimaryButton.tsx`
- `components/ui/ModalSheet.tsx`
- `components/ui/InputField.tsx`
- `components/ui/SelectField.tsx`
- `components/AIInsightCard.tsx` (imported as `AllInsightCard.tsx` - naming mismatch)

**Impact:** The app will fail to build/run until these components are created.

### Component Naming Issue

- File: `components/AllInsightCard.tsx`
- Should be: `components/AIInsightCard.tsx`
- The import statements expect `AIInsightCard` but the file is named `AllInsightCard`

### Appwrite Backend Setup

The app requires an Appwrite backend to be set up and configured. Without proper Appwrite setup:
- Authentication won't work
- Data persistence will fail
- All features will be unavailable

See `APPWRITE_SCHEMA.md` for complete database schema setup instructions.

### Environment Configuration

Missing or incorrect environment variables will cause:
- Appwrite connection failures
- Authentication errors
- Runtime crashes

## 📦 Dependencies

### Core Dependencies
```json
{
  "expo": "^54.0.20",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "appwrite": "^21.4.0"
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

Budget Buddy uses Appwrite for:
- Secure user authentication
- Session management
- Protected routes
- Secure credential storage

## 💾 Data Management

- **Appwrite**: Backend-as-a-Service for authentication and database
- **Mock Data**: Development data for testing
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
- **Appwrite** - For the backend infrastructure and authentication
- **Lucide Icons** - For the beautiful icon library
- **React Native Community** - For the ecosystem and support

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

**Built with ❤️ using React Native and Expo**
