import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { User } from '@/types/api.types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { Edit2, Camera, User as UserIcon, Check, X } from 'lucide-react-native';

interface ProfileHeaderProps {
    user: User;
    onUpdateProfile: (data: Partial<User>) => Promise<void>;
    onChangeAvatar: () => void;
    isLoading: boolean;
}

export const ProfileHeader = ({ user, onUpdateProfile, onChangeAvatar, isLoading }: ProfileHeaderProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name);
    const [imageError, setImageError] = useState(false);

    // Simple hashed color for avatar background
    const getAvatarColor = (id?: string) => {
        if (!id) return COLORS.primary.accent;
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
        let hash = 0;
        for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }
        try {
            await onUpdateProfile({ name });
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const handleCancel = () => {
        setName(user.name);
        setIsEditing(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                {user.avatar && !imageError ? (
                    <Image
                        source={{ uri: user.avatar }}
                        style={styles.avatar}
                        resizeMode="cover"
                        onError={(e) => {
                            console.log("Avatar load error", e.nativeEvent.error);
                            setImageError(true);
                        }}
                    />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: getAvatarColor(user.id) }]}>
                        <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase() || 'U'}</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.cameraButton} onPress={onChangeAvatar}>
                    <Camera size={16} color={COLORS.text.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.email}>{user.email}</Text>

                {isEditing ? (
                    <View style={styles.editContainer}>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            autoFocus
                        />
                        <View style={styles.editActions}>
                            <TouchableOpacity onPress={handleSave} disabled={isLoading} style={[styles.actionButton, { backgroundColor: COLORS.success }]}>
                                {isLoading ? <ActivityIndicator size="small" color="white" /> : <Check size={18} color="white" />}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCancel} disabled={isLoading} style={[styles.actionButton, { backgroundColor: COLORS.error }]}>
                                <X size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.nameContainer}>
                        <Text style={styles.name}>{user.name}</Text>
                        <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                            <Edit2 size={16} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.text.muted,
        backgroundColor: COLORS.background.card,
        marginBottom: SPACING.md,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: SPACING.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary.accent,
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: COLORS.background.card,
    },
    infoContainer: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: SPACING.xl,
    },
    email: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    name: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    editButton: {
        padding: 4,
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        width: '100%',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        maxWidth: 200,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary.accent,
        fontSize: FONT_SIZES.lg,
        paddingVertical: 4,
        color: COLORS.text.primary,
        textAlign: 'center',
    },
    editActions: {
        flexDirection: 'row',
        gap: SPACING.xs,
    },
    actionButton: {
        padding: 6,
        borderRadius: BORDER_RADIUS.pill,
    },
});
