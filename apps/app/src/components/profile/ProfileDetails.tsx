import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { User } from '@/types/api.types';
import { Globe, Mail, ChevronDown } from 'lucide-react-native';

interface ProfileDetailsProps {
    user: User;
    onUpdateProfile: (data: Partial<User>) => Promise<void>;
}

const TIMEZONES = [
    { value: 'America/New_York', label: 'New York (GMT-5)' },
    { value: 'America/Chicago', label: 'Chicago (GMT-6)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
    { value: 'Asia/Kolkata', label: 'India (GMT+5:30)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
    { value: 'Australia/Sydney', label: 'Sydney (GMT+11)' },
];

export const ProfileDetails = ({ user, onUpdateProfile }: ProfileDetailsProps) => {
    const [timezoneModalVisible, setTimezoneModalVisible] = useState(false);

    const handleTimezoneSelect = async (timezone: string) => {
        setTimezoneModalVisible(false);
        if (timezone !== user.timezone) {
            await onUpdateProfile({ timezone });
        }
    };

    const currentTimezoneLabel = TIMEZONES.find(t => t.value === user.timezone)?.label || user.timezone || 'Select Timezone';

    return (
        <View style={styles.card}>
            <Text style={styles.headerTitle}>Profile Details</Text>

            <View style={styles.item}>
                <View style={styles.labelRow}>
                    <Mail size={16} color={COLORS.text.secondary} />
                    <Text style={styles.label}>Email</Text>
                </View>
                <View style={[styles.valueContainer, styles.readOnly]}>
                    <Text style={styles.valueText}>{user.email}</Text>
                </View>
                <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            <View style={styles.item}>
                <View style={styles.labelRow}>
                    <Globe size={16} color={COLORS.text.secondary} />
                    <Text style={styles.label}>Timezone</Text>
                </View>
                <TouchableOpacity
                    style={styles.valueContainer}
                    onPress={() => setTimezoneModalVisible(true)}
                >
                    <Text style={styles.valueText}>{currentTimezoneLabel}</Text>
                    <ChevronDown size={16} color={COLORS.text.secondary} />
                </TouchableOpacity>
                <Text style={styles.helperText}>Used for session timestamps</Text>
            </View>

            <Modal
                visible={timezoneModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setTimezoneModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setTimezoneModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Timezone</Text>
                        <ScrollView style={styles.timezoneList}>
                            {TIMEZONES.map((tz) => (
                                <TouchableOpacity
                                    key={tz.value}
                                    style={[
                                        styles.timezoneItem,
                                        user.timezone === tz.value && styles.timezoneSelected
                                    ]}
                                    onPress={() => handleTimezoneSelect(tz.value)}
                                >
                                    <Text style={[
                                        styles.timezoneText,
                                        user.timezone === tz.value && styles.timezoneTextSelected
                                    ]}>
                                        {tz.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
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
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: SPACING.lg,
    },
    item: {
        marginBottom: SPACING.lg,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text.secondary,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.text.muted,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        backgroundColor: '#FFFFFF',
    },
    readOnly: {
        backgroundColor: '#F3F4F6',
        borderColor: '#E5E7EB',
    },
    valueText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.primary,
    },
    helperText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.muted,
        marginTop: SPACING.xs,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    modalContent: {
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
        textAlign: 'center',
        color: COLORS.text.primary,
    },
    timezoneList: {
        width: '100%',
    },
    timezoneItem: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    timezoneSelected: {
        backgroundColor: COLORS.primary.soft,
    },
    timezoneText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.primary,
    },
    timezoneTextSelected: {
        fontWeight: 'bold',
    },
});
