import { Tabs, router } from 'expo-router';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';

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
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
            <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Logout</Text>
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Incident Reports',
          headerTitle: 'Incident Management',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assign"
        options={{
          title: 'Assignments',
          headerTitle: 'Patrol Assignments',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="monitor"
        options={{
          title: 'Live Monitor',
          headerTitle: 'Patrol Live Monitor',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
