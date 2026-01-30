import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Text, Linking } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import config from '@/constants/config';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { authService } from '@/services/auth.service';
import { User } from '@/types/api.types';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { SubscriptionCard } from '@/components/profile/SubscriptionCard';
import { ProfileDetails } from '@/components/profile/ProfileDetails';
import { AvatarPicker } from '@/components/profile/AvatarPicker';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, setUser, checkAuth } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);


    console.log("user. -?", user);

    // Initial load handled by layout, but we can refresh
    useFocusEffect(
        useCallback(() => {
            // Optional: refresh on focus if needed, but layout handles initial auth check
            // checkAuth(); 
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await checkAuth(); // Refreshes user from API
        setRefreshing(false);
    };

    const handleUpdateProfile = async (data: Partial<User>) => {
        setLoading(true);
        try {
            const updatedUser = await authService.updateProfile(data);
            // setUser(updatedUser); // Update global store

            // If timezone was updated, silently refresh user data from server
            if (data.timezone) {
                await checkAuth(); // Silently refresh user data
            }
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (data: any) => {
        setLoading(true);
        try {
            await authService.changePassword(data);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async () => {
        try {
            setLoading(true);

            // Get current access token from SecureStore
            const token = await SecureStore.getItemAsync('accessToken');

            if (!token) {
                Alert.alert(
                    'Authentication Error',
                    'Please log in again to upgrade your subscription.',
                    [{ text: 'OK' }]
                );
                return;
            }

            // Construct pricing URL with token and source parameters
            const pricingUrl = `${config.webUrl}/pricing?token=${encodeURIComponent(token)}&source=mobile`;

            console.log('[Mobile Payment] Opening web pricing page:', pricingUrl);

            // Check if URL can be opened
            const canOpen = await Linking.canOpenURL(pricingUrl);

            if (!canOpen) {
                throw new Error('Cannot open web browser');
            }

            // Open pricing page in browser
            await Linking.openURL(pricingUrl);

            console.log('[Mobile Payment] Successfully opened pricing page');
        } catch (error: any) {
            console.error('[Mobile Payment] Failed to open pricing page:', error);

            Alert.alert(
                'Unable to Open Browser',
                'Please ensure you have a default browser app installed and try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await authService.logout();
                    router.replace('/auth/login');
                }
            }
        ]);
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <ProfileHeader
                    user={user}
                    onUpdateProfile={handleUpdateProfile}
                    onChangeAvatar={() => setAvatarPickerVisible(true)}
                    isLoading={loading}
                />

                <View style={styles.section}>
                    <ProfileDetails
                        user={user}
                        onUpdateProfile={handleUpdateProfile}
                    />

                    <SubscriptionCard
                        user={user}
                        onUpgrade={handleUpgrade}
                    />

                    <SecuritySettings
                        onChangePassword={handleChangePassword}
                        isLoading={loading}
                    />

                    <View style={styles.dangerZone}>
                        <Button
                            title="Logout"
                            onPress={handleLogout}
                            variant="secondary"
                            style={styles.logoutButton}
                        />
              
                    </View>
                    <Text style={styles.version}>Version 1.0.0</Text>
                </View>

            </ScrollView>

            <AvatarPicker
                visible={avatarPickerVisible}
                currentAvatar={user.avatar}
                onClose={() => setAvatarPickerVisible(false)}
                onSave={async (avatar) => {
                    await handleUpdateProfile({ avatar });
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.gradient,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: SPACING.xl,
    },
    section: {
        paddingHorizontal: SPACING.md,
    },
    dangerZone: {
        marginTop: SPACING.xl,
        gap: SPACING.md,
    },
    logoutButton: {
        borderColor: COLORS.error,
    },
    deleteButton: {
        marginTop: SPACING.xs,
    },
    version: {
        textAlign: 'center',
        marginTop: SPACING.xl,
        color: COLORS.text.muted,
        fontSize: FONT_SIZES.xs,
    }
});
