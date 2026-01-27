import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { Session } from '@/types/api.types';
import { getTreeType, getTreeLabel, getTreeColor } from '@/utils/tree.utils';
import Ionicons from '@expo/vector-icons/Ionicons';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { TreeAnimation } from './TreeAnimation';

interface TreeDetailModalProps {
    session: Session | null;
    visible: boolean;
    onClose: () => void;
}

export function TreeDetailModal({ session, visible, onClose }: TreeDetailModalProps) {
    if (!session) return null;

    const type = getTreeType(session.duration, session.status);
    const label = getTreeLabel(type);
    const color = getTreeColor(type);
    const durationMin = Math.round(session.duration / 60);
    const isDead = type === 'dead';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                <Pressable style={styles.backdrop} onPress={onClose} />

                <View style={styles.modalContent}>
                    <View style={[styles.header, { backgroundColor: `${color}15` }]}>
                        <View style={styles.headerTree}>
                            <TreeAnimation treeType={type} isDead={isDead} />
                        </View>
                    </View>

                    <View style={styles.body}>
                        <Text style={styles.title}>{label}</Text>
                        <Text style={styles.date}>
                            {format(new Date(session.startTime), 'MMMM d, yyyy • HH:mm')}
                        </Text>

                        <View style={styles.statsContainer}>
                            {session.description ? (
                                <View style={styles.statRow}>
                                    <Ionicons name="clipboard-outline" size={20} color={COLORS.text.secondary} />
                                    <Text style={styles.statText} numberOfLines={1}>
                                        Task: {session.description}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.statRow}>
                                    <Ionicons name="leaf-outline" size={20} color={COLORS.text.secondary} />
                                    <Text style={styles.statText}>General Focus Session</Text>
                                </View>
                            )}

                            <View style={styles.statRow}>
                                <Ionicons name="time-outline" size={20} color={COLORS.text.secondary} />
                                <Text style={styles.statText}>
                                    {durationMin} min focused
                                </Text>
                            </View>

                            <View style={styles.statRow}>
                                <Ionicons
                                    name={isDead ? 'close-circle' : 'checkmark-circle'}
                                    size={20}
                                    color={isDead ? COLORS.error : COLORS.success}
                                />
                                <Text style={[styles.statText, { color: isDead ? COLORS.error : COLORS.success, fontWeight: '500' }]}>
                                    {isDead ? 'Session incomplete' : 'Session completed'}
                                </Text>
                            </View>
                        </View>

                        {!isDead && (
                            <View style={styles.progressContainer}>
                                <View style={styles.progressHeader}>
                                    <Text style={styles.progressLabel}>Progress: 100%</Text>
                                    <Text style={styles.progressValue}>{durationMin}/{durationMin} min</Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: '100%', backgroundColor: COLORS.success }]} />
                                </View>
                            </View>
                        )}

                        {isDead && (
                            <View style={[styles.noteContainer, { backgroundColor: '#FEF2F2' }]}>
                                <Text style={[styles.noteText, { color: COLORS.error }]}>
                                    This session was not completed. Consistency is key!
                                </Text>
                            </View>
                        )}

                        <Button title="Close" onPress={onClose} style={styles.button} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        width: '85%',
        backgroundColor: COLORS.background.card,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    header: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: SPACING.lg,
    },
    headerTree: {
        width: 150,
        height: 180,
    },
    body: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: 4,
        textAlign: 'center',
    },
    date: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    statsContainer: {
        width: '100%',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    statText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.primary,
        flex: 1,
    },
    progressContainer: {
        width: '100%',
        backgroundColor: COLORS.background.tertiary || '#E9F0FF', // Fallback if tertiary not defined
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        gap: SPACING.xs,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    progressValue: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: BORDER_RADIUS.pill,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: BORDER_RADIUS.pill,
    },
    noteContainer: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.lg,
    },
    noteLabel: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.text.secondary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    noteText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.primary,
        lineHeight: 20,
    },
    button: {
        width: '100%',
    },
});
