import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../../theme';
import { Button } from '../../components/ui/Button';

export default function SuccessScreen() {
  const handleReturn = () => {
    router.replace('/(ranger)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Ionicons name="checkmark-circle" size={100} color={AppTheme.colors.success} />
        
        <Text style={styles.title}>Submission Successful</Text>
        <Text style={styles.description}>
          Your incident report has been securely saved and synchronized with headquarters.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button title="Back to Dashboard" onPress={handleReturn} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: AppTheme.spacing.xl,
  },
  title: {
    ...AppTheme.typography.h2,
    color: AppTheme.colors.header,
    marginTop: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: AppTheme.spacing.xxl,
  },
  buttonContainer: {
    width: '100%',
  },
});
