/**
 * Centralized color palette for the Smart Wildlife Conservation App
 * specifically focusing on the Ranger module features.
 */
export const AppColors = {
  primaryBlue: '#1565C0',
  darkBlue: '#0D47A1',
  lightBlue: '#E3F2FD',
  cleanWhite: '#FFFFFF',
  slateGray: '#546E7A',
  alertRed: '#D32F2F',
  safeGreen: '#2E7D32',
  warningYellow: '#F57F17',
};

// Aliases based on usage intent for easier mapping
export const ThemeColors = {
  primary: AppColors.primaryBlue, // Main buttons, Submit buttons, Active tabs, Primary actions
  header: AppColors.darkBlue, // Top navigation/header, Strong accents
  selected: AppColors.lightBlue, // Selected items, Soft backgrounds, Information cards
  background: AppColors.cleanWhite, // Main background, Cards, Input backgrounds
  textSecondary: AppColors.slateGray, // Secondary text, Descriptions, Inactive icons
  danger: AppColors.alertRed, // Danger alerts, High-risk indicators, Delete/destructive actions, Error messages
  success: AppColors.safeGreen, // Success states, Successful submission, Synchronization completed
  warning: AppColors.warningYellow, // Pending synchronization, GPS warnings, Offline warnings
};
