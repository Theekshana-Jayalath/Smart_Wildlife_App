import { Tabs, router } from 'expo-router';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';
import { AppTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Tabs 
      screenOptions={{
        headerStyle: { backgroundColor: AppTheme.colors.header },
        headerTintColor: AppTheme.colors.background,
        tabBarStyle: { backgroundColor: AppTheme.colors.background },
        tabBarActiveTintColor: AppTheme.colors.primary,
        tabBarInactiveTintColor: AppTheme.colors.textSecondary,
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: AppTheme.spacing.md }}>
            <Text style={{ color: AppTheme.colors.danger, fontWeight: AppTheme.fontWeights.bold }}>Logout</Text>
          </TouchableOpacity>
        )
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="patrol" 
        options={{ 
          title: 'Patrol',
          tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="tracking" 
        options={{ 
          title: 'Tracking',
          tabBarIcon: ({ color }) => <Ionicons name="paw" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="incident" 
        options={{ 
          title: 'Report Incident',
          href: null, // Hides it from the tab bar but keeps it in the navigator
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: AppTheme.spacing.md }}>
              <Ionicons name="arrow-back" size={24} color={AppTheme.colors.background} />
            </TouchableOpacity>
          )
        }} 
      />
    </Tabs>
  );
}
