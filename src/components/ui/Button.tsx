import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { AppTheme } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = ({ title, loading, variant = 'primary', disabled, style, ...props }: ButtonProps) => {
  const getBackgroundColor = () => {
    if (disabled) return AppTheme.colors.textSecondary;
    if (variant === 'primary') return AppTheme.colors.primary;
    if (variant === 'secondary') return AppTheme.colors.header;
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled) return AppTheme.colors.background;
    if (variant === 'outline') return AppTheme.colors.primary;
    return AppTheme.colors.background;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && { borderWidth: 1, borderColor: AppTheme.colors.primary },
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: AppTheme.dimensions.buttonHeight,
    borderRadius: AppTheme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: AppTheme.spacing.lg,
  },
  text: {
    ...AppTheme.typography.buttonText,
  },
});
