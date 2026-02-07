import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { authService } from '@/services/auth.service';
import { GoogleSignInWrapper } from '@/components/auth/GoogleSignInWrapper';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({ name, email, password });
      router.replace('/(tabs)');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Something went wrong. Please try again.';

      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Start your focus journey today
              </Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={COLORS.text.muted}
                value={name}
                onChangeText={setName}
                editable={!isLoading}
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.text.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.text.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.text.primary} />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.linkButton}
                disabled={isLoading}
              >
                <Text style={styles.linkText}>
                  Already have an account?{' '}
                  <Text style={styles.linkTextBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>

              {/* Google Sign In */}
              <View style={{ marginTop: 8 }}>
                <GoogleSignInWrapper mode="signup" />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.primary.accent,
    borderRadius: 12,
    marginTop: 8,
    padding: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: COLORS.background.gradient,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  form: {
    gap: 16,
  },
  header: {
    marginBottom: 40,
  },
  input: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    color: COLORS.text.primary,
    fontSize: 16,
    padding: 16,
  },
  keyboardView: {
    flex: 1,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  linkTextBold: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  subtitle: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 8,
  },
});
