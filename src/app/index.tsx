import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../services/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true); // Start loading immediately

  // Auto-login check when app opens
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await redirectUserBasedOnRole(session.user.id);
    } else {
      setLoading(false); // No session, stop loading and show login form
    }
  }

  async function redirectUserBasedOnRole(userId: string) {
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleError || !roleData) {
      Alert.alert('Role Error', 'Could not find your role. Please contact Admin.');
      setLoading(false);
      return;
    }

    const userRole = roleData.role;
    if (userRole === 'ranger') {
      router.replace('/(ranger)/patrol');
    } else if (userRole === 'manager') {
      router.replace('/(manager)/assign');
    } else if (userRole === 'researcher') {
      router.replace('/(researcher)/reports');
    } else {
      Alert.alert('Error', 'Unknown role.');
      setLoading(false);
    }
  }

  // Manual Sign In
  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      Alert.alert('Login Failed', authError.message);
      setLoading(false);
      return;
    }

    await redirectUserBasedOnRole(authData.user.id);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Checking login status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Wildlife App</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={signInWithEmail} 
      >
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 40, textAlign: 'center', color: '#2e7d32' },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  button: { backgroundColor: '#2e7d32', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});
