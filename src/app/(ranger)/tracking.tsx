import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function TrackingScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Ionicons name="paw-outline" size={64} color={theme.primary} />
        <Text style={[styles.title, { color: theme.textPrimary }]}>Species Tracking</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Track wildlife movements and endangered species activity in real-time.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginTop: 16 },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 8 },
});
