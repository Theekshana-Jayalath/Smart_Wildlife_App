import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#1565C0',
  darkBlue: '#0D47A1',
  lightBlue: '#E3F2FD',
  white: '#FFFFFF',
  slate: '#546E7A',
  border: '#D9E5EF',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  // Auto-login check when app opens
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await redirectUserBasedOnRole(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  async function redirectUserBasedOnRole(userId: string) {
    try {
      const docRef = doc(db, 'user_roles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userRole = docSnap.data().role;
        if (userRole === 'ranger') {
          router.replace('/(ranger)');
        } else if (userRole === 'manager') {
          router.replace('/(manager)/reports' as any);
        } else if (userRole === 'researcher') {
          router.replace('/(researcher)/reports');
        } else {
          Alert.alert('Error', 'Unknown role.');
          setLoading(false);
        }
      } else {
        Alert.alert('Role Error', 'Could not find your role. Contact Admin.');
        setLoading(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  }

  // Manual Sign In
  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await redirectUserBasedOnRole(userCredential.user.uid);
    } catch (error: any) {
      Alert.alert('Login Failed', 'Incorrect email or password. Please try again.');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Authenticating...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="leaf" size={46} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Smart Wildlife</Text>
          <Text style={styles.subtitle}>Conservation & Protection System</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.loginHeading}>Sign In to your account</Text>
          
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={COLORS.slate} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={COLORS.slate}
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.slate} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.slate}
              onChangeText={setPassword}
              value={password}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={signInWithEmail}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Log In</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          {/* Clean Modern Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>COMMUNITY ALERT</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Beautiful Quick Report Button */}
          <TouchableOpacity 
            style={styles.publicReportButton}
            onPress={() => router.push('/public-report')}
            activeOpacity={0.85}
          >
            <View style={styles.publicReportIconBg}>
              <Ionicons name="megaphone" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.publicReportTextContainer}>
              <Text style={styles.publicReportTitle}>Report Wildlife Incident</Text>
              <Text style={styles.publicReportSubtitle}>Quick report for villagers (No login needed)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>Secure Access for Authorized Wildlife Personnel</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: COLORS.darkBlue 
  },
  container: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: COLORS.white 
  },
  loadingText: { 
    textAlign: 'center', 
    marginTop: 15, 
    color: COLORS.slate, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  headerContainer: { 
    alignItems: 'center', 
    marginBottom: 28, 
    paddingHorizontal: 20 
  },
  iconContainer: { 
    width: 82, 
    height: 82, 
    borderRadius: 41, 
    backgroundColor: 'rgba(255,255,255,0.18)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  title: { 
    fontSize: 30, 
    fontWeight: '900', 
    color: COLORS.white, 
    marginBottom: 4, 
    letterSpacing: 0.5 
  },
  subtitle: { 
    fontSize: 13.5, 
    color: COLORS.lightBlue, 
    fontWeight: '500', 
    letterSpacing: 0.8 
  },
  formContainer: { 
    backgroundColor: COLORS.white, 
    marginHorizontal: 20, 
    borderRadius: 20, 
    padding: 24, 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 10 
  },
  loginHeading: { 
    fontSize: 17, 
    fontWeight: '700', 
    color: COLORS.darkBlue, 
    marginBottom: 18, 
    textAlign: 'center' 
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F5F8FB', 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 10, 
    marginBottom: 14, 
    paddingHorizontal: 14 
  },
  inputIcon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    height: 48, 
    fontSize: 15, 
    color: '#0F172A' 
  },
  button: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.primary, 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 6 
  },
  buttonText: { 
    color: COLORS.white, 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  publicReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  publicReportIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  publicReportTextContainer: {
    flex: 1,
  },
  publicReportTitle: {
    color: COLORS.darkBlue,
    fontWeight: '700',
    fontSize: 14.5,
  },
  publicReportSubtitle: {
    color: COLORS.primary,
    fontSize: 11.5,
    marginTop: 2,
  },
  footerText: { 
    textAlign: 'center', 
    color: 'rgba(255,255,255,0.7)', 
    fontSize: 12, 
    position: 'absolute', 
    bottom: 20, 
    width: '100%' 
  }
});
