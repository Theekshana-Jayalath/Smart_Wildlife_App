import { Tabs, router } from 'expo-router';
import { TouchableOpacity, Text, Alert } from 'react-native';
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
            <Text style={{ color: 'red', fontWeight: 'bold' }}>Logout</Text>
          </TouchableOpacity>
        )
      }}
    />
  );
}
