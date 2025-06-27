import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Shield, Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        console.log('Sign Up Error:', error);
        Alert.alert('Sign Up Failed', error.message || JSON.stringify(error));
      } else {
        Alert.alert(
          'Success', 
          'Account created successfully! Please check your email for verification.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/login')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Shield color="#2563eb" size={48} />
              <Text style={styles.logoText}>Drivacy</Text>
            </View>
            <Text style={styles.subtitle}>Privacy-first ride hailing</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.description}>
              Join Drivacy for secure and private rides
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <User color="#6b7280" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor="#9ca3af"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Mail color="#6b7280" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock color="#6b7280" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff color="#6b7280" size={20} />
                  ) : (
                    <Eye color="#6b7280" size={20} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <Lock color="#6b7280" size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? (
                    <EyeOff color="#6b7280" size={20} />
                  ) : (
                    <Eye color="#6b7280" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.signUpButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  eyeButton: {
    padding: 4,
  },
  signUpButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  signUpButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  signUpButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#2563eb',
  },
});