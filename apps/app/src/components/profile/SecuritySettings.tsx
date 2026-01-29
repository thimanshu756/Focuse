import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { Lock, Eye, EyeOff, X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

interface SecuritySettingsProps {
    onChangePassword: (data: { currentPassword?: string; newPassword?: string }) => Promise<void>;
    isLoading: boolean;
}

export const SecuritySettings = ({ onChangePassword, isLoading }: SecuritySettingsProps) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        try {
            await onChangePassword({ currentPassword, newPassword });
            Alert.alert('Success', 'Password changed successfully');
            setModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            Alert.alert('Error', 'Failed to change password. Please check your current password.');
        }
    };

    return (
        <>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Lock size={20} color={COLORS.primary.accent} />
                    <Text style={styles.title}>Security</Text>
                </View>
                <Text style={styles.description}>
                    Manage your password and security settings to keep your account safe.
                </Text>
                <Button
                    title="Change Password"
                    onPress={() => setModalVisible(true)}
                    variant="secondary"
                    style={styles.button}
                />
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Change Password</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={COLORS.text.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Current Password (Optional if newly registered)</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry={!showPassword}
                                    placeholder="Enter current password"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showPassword}
                                    placeholder="Enter new password"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Confirm New Password</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                    placeholder="Confirm new password"
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.togglePassword} onPress={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={18} color={COLORS.text.secondary} /> : <Eye size={18} color={COLORS.text.secondary} />}
                            <Text style={styles.toggleText}>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</Text>
                        </TouchableOpacity>


                        <Button
                            title={isLoading ? "Updating..." : "Update Password"}
                            onPress={handleSubmit}
                            disabled={isLoading}
                            variant="primary"
                            style={{ marginTop: SPACING.lg }}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.background.card,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.text.muted,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    description: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        marginBottom: SPACING.lg,
    },
    button: {
        width: '100%',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background.card,
        borderTopLeftRadius: BORDER_RADIUS.lg,
        borderTopRightRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        minHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    modalTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    formGroup: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.text.muted,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        backgroundColor: '#F9FAFB',
    },
    input: {
        flex: 1,
        height: 48,
        color: COLORS.text.primary,
    },
    togglePassword: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginBottom: SPACING.md,
        alignSelf: 'flex-end',
    },
    toggleText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.secondary,
    }
});
