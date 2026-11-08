import { Linking } from 'react-native';

export const SUPPORT_EMAIL = 'rajjitlai@mail.com';

export function openSupportEmail(): void {
  const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Budget Buddy Support Request')}&body=${encodeURIComponent('Please describe your issue or question:')}`;
  Linking.openURL(mailtoUrl).catch((err) => {
    console.error('Error opening email:', err);
  });
}

function openExternalUrl(url: string, errorLabel: string): void {
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  Linking.openURL(fullUrl).catch((err) => {
    console.error(`Error opening ${errorLabel}:`, err);
  });
}

export function openGithubRepo(): void {
  openExternalUrl('https://github.com/rajjitlai/Budget_Buddy', 'Github');
}

export function openDocumentation(): void {
  openExternalUrl('https://budgetbuddy.app/docs', 'documentation');
}
