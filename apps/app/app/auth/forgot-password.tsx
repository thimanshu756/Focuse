import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { authService } from '@/services/auth.service';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            await authService.forgotPassword(email);
            setIsEmailSent(true);
            Alert.alert(
                'Email Sent',
                "If that email exists, you'll receive a password reset link shortly.",
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            const status = error.response?.status;
            let errorMessage = 'Something went wrong. Please try again.';

            if (!error.response) {
                errorMessage = 'Unable to connect. Please check your internet connection.';
            } else if (status === 429) {
                errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
            } else {
                errorMessage =
                    error.response?.data?.error?.message ||
                    error.response?.data?.message ||
                    errorMessage;
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = () => {
        setIsEmailSent(false);
        setEmail('');
    };

    if (isEmailSent) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.successContainer}>
                        <View style={styles.successIconContainer}>
                            <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
                        </View>
                        <Text style={styles.successTitle}>Check your email</Text>
                        <Text style={styles.successMessage}>
                            We've sent a password reset link to{' '}
                            <Text style={styles.emailText}>{email}</Text>
                        </Text>
                        <Text style={styles.helperText}>
                            If you don't see the email, check your spam folder or try again.
                        </Text>
                    </View>

                    <View style={styles.buttonGroup}>
                        <TouchableOpacity style={styles.button} onPress={handleResend}>
                            <Text style={styles.buttonText}>Resend Email</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push('/auth/login')}
                        >
                            <Text style={styles.secondaryButtonText}>Back to Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subtitle}>
                            Enter your email address and we'll send you a link to reset your password
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.infoBox}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.info} />
                            <Text style={styles.infoText}>
                                Enter your email address and we'll send you a link to reset your password.
                            </Text>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={COLORS.text.muted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                            autoFocus
                        />

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={COLORS.text.primary} />
                            ) : (
                                <Text style={styles.buttonText}>Send Reset Link</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.linkButton}
                            disabled={isLoading}
                        >
                            <Text style={styles.linkText}>
                                <Text style={styles.linkTextBold}>← Back to Sign In</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    buttonGroup: {
        gap: 12,
        marginTop: 24,
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
    emailText: {
        fontWeight: '600',
    },
    form: {
        gap: 16,
    },
    header: {
        marginBottom: 40,
    },
    helperText: {
        color: COLORS.text.muted,
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
    infoBox: {
        alignItems: 'center',
        backgroundColor: COLORS.background.card,
        borderColor: COLORS.info,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 12,
        padding: 12,
    },
    infoText: {
        color: COLORS.text.secondary,
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
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
    secondaryButton: {
        alignItems: 'center',
        backgroundColor: COLORS.background.card,
        borderRadius: 12,
        padding: 16,
    },
    secondaryButtonText: {
        color: COLORS.text.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        color: COLORS.text.secondary,
        fontSize: 16,
        lineHeight: 22,
    },
    successContainer: {
        alignItems: 'center',
        backgroundColor: COLORS.background.card,
        borderRadius: 16,
        padding: 24,
    },
    successIconContainer: {
        marginBottom: 16,
    },
    successMessage: {
        color: COLORS.text.secondary,
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
        textAlign: 'center',
    },
    successTitle: {
        color: COLORS.text.primary,
        fontSize: 20,
        fontWeight: '600',
    },
    title: {
        color: COLORS.text.primary,
        fontSize: 32,
        fontWeight: '600',
        marginBottom: 8,
    },
});
