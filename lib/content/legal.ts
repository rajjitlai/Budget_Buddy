export interface LegalDocumentData {
  lastUpdated: string;
  sections: {
    title: string;
    paragraphs: string[];
  }[];
}

export const privacyPolicy: LegalDocumentData = {
  lastUpdated: 'May 2026',
  sections: [
    {
      title: '1. Information We Collect',
      paragraphs: [
        'Budget Buddy collects the following information to provide you with financial management services:',
        '• Account information (account names, types, balances)',
        '• Transaction data (amounts, categories, dates, notes)',
        '• Monthly budget plans and allocations',
        '• User account information (name, email) for authentication',
      ],
    },
    {
      title: '2. How We Use Your Information',
      paragraphs: [
        'We use your information to:',
        '• Provide financial tracking and budgeting features',
        '• Generate AI-powered financial insights and recommendations',
        '• Calculate and display your net worth and account balances',
        '• Maintain your account and provide customer support',
      ],
    },
    {
      title: '3. Data Storage and Security',
      paragraphs: [
        'Your financial data is stored locally on your device using a secure SQLite database. We implement the following security measures:',
        '• Local-only data storage (we never see your financial data)',
        '• Secure credential storage for settings using Expo SecureStore',
        '• No tracking or third-party analytics',
      ],
    },
    {
      title: '4. Third-Party Services',
      paragraphs: [
        'Budget Buddy uses the following third-party services only when explicitly requested:',
        '• OpenRouter (optional): For AI-powered insights generation',
        'We do not share your raw financial data with any third-party services unless you use the AI insights feature, in which case only anonymized spending summaries are sent.',
      ],
    },
    {
      title: '5. Your Rights',
      paragraphs: [
        'You have the right to:',
        '• Access your personal and financial data',
        '• Update or correct your information',
        '• Delete your account and all associated data',
        '• Export your data at any time',
      ],
    },
    {
      title: '6. Data Retention',
      paragraphs: [
        'We retain your data for as long as your account is active. When you delete your account, all associated data is permanently removed from our systems.',
      ],
    },
    {
      title: "7. Children's Privacy",
      paragraphs: [
        'Budget Buddy is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13.',
      ],
    },
    {
      title: '8. Changes to This Policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this policy.',
      ],
    },
    {
      title: '9. Contact Us',
      paragraphs: [
        'If you have questions about this Privacy Policy or our data practices, please contact us through the Help & Support section in the app settings.',
      ],
    },
  ],
};

export const termsOfService: LegalDocumentData = {
  lastUpdated: 'May 2026',
  sections: [
    {
      title: '1. Acceptance of Terms',
      paragraphs: [
        'By accessing and using Budget Buddy, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use the application.',
      ],
    },
    {
      title: '2. Description of Service',
      paragraphs: [
        'Budget Buddy is a personal finance management application that helps you track accounts, manage transactions, plan budgets, and receive AI-powered financial insights. The service is provided "as is" for your personal use.',
      ],
    },
    {
      title: '3. User Accounts',
      paragraphs: [
        'To use Budget Buddy, you must:',
        '• Create an account with accurate and complete information',
        '• Maintain the security of your account credentials',
        '• Be responsible for all activities under your account',
        '• Notify us immediately of any unauthorized access',
      ],
    },
    {
      title: '4. Acceptable Use',
      paragraphs: [
        'You agree not to:',
        '• Use the service for any illegal or unauthorized purpose',
        "• Attempt to gain unauthorized access to the service or other users' accounts",
        '• Interfere with or disrupt the service or servers',
        '• Use automated systems to access the service without permission',
      ],
    },
    {
      title: '5. Financial Information',
      paragraphs: [
        'Budget Buddy is a tool to help you manage your finances. However:',
        '• We do not provide financial, investment, or tax advice',
        '• All financial decisions are your sole responsibility',
        '• AI insights are recommendations only, not professional advice',
        '• Consult a qualified financial advisor for personalized advice',
      ],
    },
    {
      title: '6. Data Accuracy',
      paragraphs: [
        'You are responsible for the accuracy of all financial data you enter into Budget Buddy. We are not liable for any errors, omissions, or inaccuracies in the data you provide.',
      ],
    },
    {
      title: '7. Service Availability',
      paragraphs: [
        'We strive to provide reliable service but do not guarantee uninterrupted or error-free operation. The service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.',
      ],
    },
    {
      title: '8. Limitation of Liability',
      paragraphs: [
        'Budget Buddy is provided "as is" without warranties of any kind. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the service, including but not limited to financial losses or data loss.',
      ],
    },
    {
      title: '9. Intellectual Property',
      paragraphs: [
        'All content, features, and functionality of Budget Buddy are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any part of the service without our permission.',
      ],
    },
    {
      title: '10. Termination',
      paragraphs: [
        'We reserve the right to terminate or suspend your account at any time for violation of these terms. You may also delete your account at any time through the settings.',
      ],
    },
    {
      title: '11. Changes to Terms',
      paragraphs: [
        'We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.',
      ],
    },
    {
      title: '12. Governing Law',
      paragraphs: [
        'These terms are governed by applicable laws. Any disputes will be resolved through appropriate legal channels.',
      ],
    },
    {
      title: '13. Contact',
      paragraphs: [
        'For questions about these Terms of Service, please contact us through the Help & Support section in the app settings.',
      ],
    },
  ],
};
