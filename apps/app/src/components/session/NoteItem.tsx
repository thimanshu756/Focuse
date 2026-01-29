/**
 * NoteItem
 * Individual note display with swipe-to-delete
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Lightbulb, CheckSquare, Sparkles, MessageCircle, Trash2 } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import type { Note, NoteType } from '@/types/notes.types';

interface NoteItemProps {
    note: Note;
    onDelete: (noteId: string) => void;
}

// Icon mapping for note types
const NOTE_ICONS: Record<NoteType, { icon: typeof Lightbulb; color: string }> = {
    idea: { icon: Lightbulb, color: '#FBBF24' }, // Yellow
    task: { icon: CheckSquare, color: '#3B82F6' }, // Blue
    insight: { icon: Sparkles, color: '#A855F7' }, // Purple
    general: { icon: MessageCircle, color: '#6B7280' }, // Gray
};

const DELETE_THRESHOLD = -80;

export function NoteItem({ note, onDelete }: NoteItemProps) {
    const translateX = useSharedValue(0);
    const itemHeight = useSharedValue(80);
    const opacity = useSharedValue(1);

    const { icon: Icon, color } = NOTE_ICONS[note.type];

    const handleDelete = () => {
        // Animate out then delete
        opacity.value = withTiming(0, { duration: 200 });
        itemHeight.value = withTiming(0, { duration: 200 }, () => {
            runOnJS(onDelete)(note.id);
        });
    };

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            // Only allow swiping left
            if (event.translationX < 0) {
                translateX.value = Math.max(event.translationX, -120);
            }
        })
        .onEnd((event) => {
            if (event.translationX < DELETE_THRESHOLD) {
                // Delete if swiped past threshold
                translateX.value = withTiming(-300, { duration: 200 });
                runOnJS(handleDelete)();
            } else {
                // Snap back
                translateX.value = withSpring(0);
            }
        });

    const animatedItemStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const animatedContainerStyle = useAnimatedStyle(() => ({
        height: itemHeight.value,
        opacity: opacity.value,
        overflow: 'hidden',
    }));

    const animatedDeleteStyle = useAnimatedStyle(() => ({
        opacity: Math.min(1, -translateX.value / 80),
    }));

    // Format timestamp
    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Animated.View style={animatedContainerStyle}>
            {/* Delete background */}
            <Animated.View style={[styles.deleteBackground, animatedDeleteStyle]}>
                <Trash2 size={24} color={COLORS.text.white} />
                <Text style={styles.deleteText}>Delete</Text>
            </Animated.View>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.noteContainer, animatedItemStyle]}>
                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                        <Icon size={18} color={color} />
                    </View>

                    {/* Content */}
                    <View style={styles.contentContainer}>
                        <Text style={styles.noteContent} numberOfLines={2}>
                            {note.content}
                        </Text>
                        <Text style={styles.noteTime}>{formatTime(note.createdAt)}</Text>
                    </View>
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    deleteBackground: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: SPACING.sm,
        width: 100,
        backgroundColor: COLORS.error,
        borderRadius: BORDER_RADIUS.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
    },
    deleteText: {
        color: COLORS.text.white,
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    contentContainer: {
        flex: 1,
    },
    noteContent: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.white,
        lineHeight: 22,
        marginBottom: SPACING.xs,
    },
    noteTime: {
        fontSize: FONT_SIZES.xs,
        color: 'rgba(255, 255, 255, 0.4)',
    },
});
