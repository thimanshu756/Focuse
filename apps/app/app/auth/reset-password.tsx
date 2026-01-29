import { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { authService } from '@/services/auth.service';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPassword() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [isPasswordReset, setIsPasswordReset] = useState(false);

    useEffect(() => {
        const tokenParam = params.token as string;
        if (!tokenParam) {
            Alert.alert(
                'Invalid Link',
                'Invalid or missing reset token. Please request a new password reset link.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.push('/auth/forgot-password'),
                    },
                ]
            );
        } else {
            setToken(tokenParam);
        }
    }, [params]);

    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain an uppercase letter';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain a lowercase letter';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain a number';
        }
        return null;
    };

    const handleSubmit = async () => {
        if (!token) {
            Alert.alert('Error', 'Invalid reset token');
            return;
        }

        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            Alert.alert('Invalid Password', passwordError);
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword(token, password);
            setIsPasswordReset(true);
            Alert.alert(
                'Success',
                'Password reset successfully! Redirecting to login...',
                [{ text: 'OK' }]
            );
            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.replace('/auth/login');
            }, 2000);
        } catch (error: any) {
            const status = error.response?.status;
            const errorCode = error.response?.data?.error?.code;
            let errorMessage = 'Something went wrong. Please try again.';

            if (!error.response) {
                errorMessage = 'Unable to connect. Please check your internet connection.';
            } else if (status === 429) {
                errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
            } else if (errorCode === 'TOKEN_EXPIRED') {
                errorMessage = 'This reset link has expired. Please request a new password reset link.';
                Alert.alert('Link Expired', errorMessage, [
                    {
                        text: 'OK',
                        onPress: () => router.push('/auth/forgot-password'),
                    },
                ]);
                return;
            } else if (errorCode === 'INVALID_TOKEN') {
                errorMessage = 'Invalid reset token. Please request a new password reset link.';
                Alert.alert('Invalid Link', errorMessage, [
                    {
                        text: 'OK',
                        onPress: () => router.push('/auth/forgot-password'),
                    },
                ]);
                return;
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

    if (!token) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={64} color={COLORS.error} />
                        <Text style={styles.errorTitle}>Invalid Reset Link</Text>
                        <Text style={styles.errorMessage}>
                            This password reset link is invalid or has expired. Please request a new one.
                        </Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => router.push('/auth/forgot-password')}
                        >
                            <Text style={styles.buttonText}>Request New Reset Link</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (isPasswordReset) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.successContainer}>
                        <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
                        <Text style={styles.successTitle}>Password Reset Successful!</Text>
                        <Text style={styles.successMessage}>
                            Your password has been reset successfully. Redirecting to login...
                        </Text>
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
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Reset Password</Text>
                            <Text style={styles.subtitle}>Enter your new password below</Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="New Password"
                                    placeholderTextColor={COLORS.text.muted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    editable={!isLoading}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={COLORS.text.muted}
                                    />
                                </TouchableOpacity>
                            </View>

                            {password && (
                                <View style={styles.requirementsContainer}>
                                    <Text style={styles.requirementsTitle}>Password must contain:</Text>
                                    <View style={styles.requirement}>
                                        <Ionicons
                                            name={password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={16}
                                            color={password.length >= 8 ? COLORS.success : COLORS.text.muted}
                                        />
                                        <Text
                                            style={[
                                                styles.requirementText,
                                                password.length >= 8 && styles.requirementMet,
                                            ]}
                                        >
                                            At least 8 characters
                                        </Text>
                                    </View>
                                    <View style={styles.requirement}>
                                        <Ionicons
                                            name={/[A-Z]/.test(password) ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={16}
                                            color={/[A-Z]/.test(password) ? COLORS.success : COLORS.text.muted}
                                        />
                                        <Text
                                            style={[
                                                styles.requirementText,
                                                /[A-Z]/.test(password) && styles.requirementMet,
                                            ]}
                                        >
                                            One uppercase letter
                                        </Text>
                                    </View>
                                    <View style={styles.requirement}>
                                        <Ionicons
                                            name={/[a-z]/.test(password) ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={16}
                                            color={/[a-z]/.test(password) ? COLORS.success : COLORS.text.muted}
                                        />
                                        <Text
                                            style={[
                                                styles.requirementText,
                                                /[a-z]/.test(password) && styles.requirementMet,
                                            ]}
                                        >
                                            One lowercase letter
                                        </Text>
                                    </View>
                                    <View style={styles.requirement}>
                                        <Ionicons
                                            name={/[0-9]/.test(password) ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={16}
                                            color={/[0-9]/.test(password) ? COLORS.success : COLORS.text.muted}
                                        />
                                        <Text
                                            style={[
                                                styles.requirementText,
                                                /[0-9]/.test(password) && styles.requirementMet,
                                            ]}
                                        >
                                            One number
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    placeholderTextColor={COLORS.text.muted}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    editable={!isLoading}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={COLORS.text.muted}
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color={COLORS.text.primary} />
                                ) : (
                                    <Text style={styles.buttonText}>Reset Password</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.push('/auth/login')}
                                style={styles.linkButton}
                                disabled={isLoading}
                            >
                                <Text style={styles.linkText}>
                                    <Text style={styles.linkTextBold}>← Back to Sign In</Text>
                                </Text>
                            </TouchableOpacity>
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
    errorContainer: {
        alignItems: 'center',
        backgroundColor: COLORS.background.card,
        borderRadius: 16,
        padding: 24,
    },
    errorMessage: {
        color: COLORS.text.secondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 24,
        marginTop: 8,
        textAlign: 'center',
    },
    errorTitle: {
        color: COLORS.text.primary,
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
    },
    eyeIcon: {
        padding: 12,
        position: 'absolute',
        right: 4,
        top: 4,
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
        flex: 1,
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
    passwordContainer: {
        flexDirection: 'row',
        position: 'relative',
    },
    requirement: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    requirementMet: {
        color: COLORS.success,
    },
    requirementText: {
        color: COLORS.text.muted,
        fontSize: 12,
    },
    requirementsContainer: {
        backgroundColor: COLORS.background.card,
        borderRadius: 12,
        gap: 8,
        padding: 12,
    },
    requirementsTitle: {
        color: COLORS.text.secondary,
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    scrollContent: {
        flexGrow: 1,
    },
    subtitle: {
        color: COLORS.text.secondary,
        fontSize: 16,
    },
    successContainer: {
        alignItems: 'center',
        backgroundColor: COLORS.background.card,
        borderRadius: 16,
        padding: 24,
    },
    successMessage: {
        color: COLORS.text.secondary,
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    successTitle: {
        color: COLORS.text.primary,
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
    },
    title: {
        color: COLORS.text.primary,
        fontSize: 32,
        fontWeight: '600',
        marginBottom: 8,
    },
});
