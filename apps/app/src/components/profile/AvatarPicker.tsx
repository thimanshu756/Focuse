import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { X, Check } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

interface AvatarPickerProps {
    visible: boolean;
    currentAvatar?: string | null;
    onClose: () => void;
    onSave: (avatar: string) => Promise<void>;
}

const AVATAR_URLS = [
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_1.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_2.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_3.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_4.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_5.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_6.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_7.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_8.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_9.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_10.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_11.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_12.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_13.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_14.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_15.png',
];

export const AvatarPicker = ({ visible, currentAvatar, onClose, onSave }: AvatarPickerProps) => {
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar || null);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!selectedAvatar) return;
        setSaving(true);
        try {
            await onSave(selectedAvatar);
            onClose();
        } catch (error) {
            // Error handled by parent usually
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Choose Your Avatar</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={COLORS.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>Select an avatar to represent you</Text>

                    <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
                        {AVATAR_URLS.map((url, index) => {
                            const isSelected = selectedAvatar === url;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.avatarItem, isSelected && styles.avatarSelected]}
                                    onPress={() => setSelectedAvatar(url)}
                                >
                                    <Image source={{ uri: url }} style={styles.avatarImage} />
                                    {isSelected && (
                                        <View style={styles.checkOverlay}>
                                            <Check size={20} color={COLORS.primary.accent} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <View style={styles.footer}>
                        <Button
                            title="Cancel"
                            variant="secondary"
                            onPress={onClose}
                            style={{ flex: 1 }}
                            disabled={saving}
                        />
                        <Button
                            title={saving ? "Saving..." : "Save Avatar"}
                            variant="primary"
                            onPress={handleSave}
                            style={{ flex: 1 }}
                            disabled={!selectedAvatar || saving}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    subtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        marginBottom: SPACING.lg,
    },
    closeButton: {
        padding: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: SPACING.md,
        paddingBottom: SPACING.xl,
    },
    avatarItem: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: BORDER_RADIUS.pill,
        backgroundColor: '#F3F4F6',
        padding: 2,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    avatarSelected: {
        borderColor: COLORS.primary.accent,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: BORDER_RADIUS.pill,
    },
    checkOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.pill,
    },
    footer: {
        flexDirection: 'row',
        gap: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.text.muted + '40', // light border
    },
});
