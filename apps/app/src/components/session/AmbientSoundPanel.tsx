import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    PanResponder,
} from 'react-native';
import {
    X,
    Volume2,
    VolumeX,
    Crown,
    Play,
    Pause,
    TreeDeciduous,
    Waves,
    Coffee,
    Bird,
} from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import type { AmbientSoundType } from '@/hooks/useAmbientSound';

interface SoundOption {
    id: AmbientSoundType;
    label: string;
    isPro: boolean;
}

interface AmbientSoundPanelProps {
    visible: boolean;
    currentSound: AmbientSoundType;
    volume: number;
    isPlaying: boolean;
    availableSounds: SoundOption[];
    isPro?: boolean;
    onSelectSound: (soundId: AmbientSoundType) => void;
    onVolumeChange: (volume: number) => void;
    onTogglePlay: () => void;
    onClose: () => void;
    onUpgrade?: () => void;
}

// Icon mapping for sounds
const SOUND_ICONS: Record<AmbientSoundType, typeof TreeDeciduous> = {
    silent: VolumeX,
    forest: TreeDeciduous,
    ocean: Waves,
    cafe: Coffee,
    birds: Bird,
};

export function AmbientSoundPanel({
    visible,
    currentSound,
    volume,
    isPlaying,
    availableSounds,
    isPro = false,
    onSelectSound,
    onVolumeChange,
    onTogglePlay,
    onClose,
    onUpgrade,

}: AmbientSoundPanelProps) {
    console.log('AmbientSoundPanel', { visible, currentSound, volume, isPlaying, availableSounds, isPro });
    console.log('availableSounds', availableSounds);
    const sliderWidth = useRef(0);
    const [isDragging, setIsDragging] = useState(false);
    const [localVolume, setLocalVolume] = useState(volume);
    const lastVolumeUpdate = useRef(0);
    const volumeUpdateInterval = 50; // Update audio volume max every 50ms

    // Throttled volume change to prevent audio stuttering
    const throttledVolumeChange = useCallback((newVolume: number) => {
        const now = Date.now();
        if (now - lastVolumeUpdate.current >= volumeUpdateInterval) {
            onVolumeChange(newVolume);
            lastVolumeUpdate.current = now;
        }
    }, [onVolumeChange]);

    // Update local volume when prop changes (but not during drag)
    React.useEffect(() => {
        if (!isDragging) {
            setLocalVolume(volume);
        }
    }, [volume, isDragging]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (event) => {
                setIsDragging(true);
                const locationX = event.nativeEvent.locationX;
                if (sliderWidth.current > 0) {
                    const newVolume = Math.max(0, Math.min(1, locationX / sliderWidth.current));
                    setLocalVolume(newVolume); // Update UI immediately
                    throttledVolumeChange(newVolume); // Throttled audio update
                }
            },
            onPanResponderMove: (event) => {
                const locationX = event.nativeEvent.locationX;
                if (sliderWidth.current > 0) {
                    const newVolume = Math.max(0, Math.min(1, locationX / sliderWidth.current));
                    setLocalVolume(newVolume); // Update UI immediately
                    throttledVolumeChange(newVolume); // Throttled audio update
                }
            },
            onPanResponderRelease: () => {
                setIsDragging(false);
                // Final update with exact value
                onVolumeChange(localVolume);
            },
            onPanResponderTerminate: () => {
                setIsDragging(false);
                // Final update with exact value
                onVolumeChange(localVolume);
            },
        })
    ).current;

    const renderSoundOption = ({ item }: { item: SoundOption }) => {
        const Icon = SOUND_ICONS[item.id];
        const isSelected = currentSound === item.id;
        const isLocked = item.isPro && !isPro;

        return (
            <TouchableOpacity
                style={[
                    styles.soundOption,
                    isSelected && styles.soundOptionSelected,
                    isLocked && styles.soundOptionLocked,
                ]}
                onPress={() => {
                    if (isLocked) {
                        onUpgrade?.();
                    } else {
                        onSelectSound(item.id);
                    }
                }}
                activeOpacity={0.7}
            >
                <View
                    style={[
                        styles.soundIconContainer,
                        isSelected && styles.soundIconContainerSelected,
                    ]}
                >
                    <Icon
                        size={24}
                        color={isSelected ? COLORS.text.primary : 'rgba(255, 255, 255, 0.6)'}
                    />
                </View>
                <Text
                    style={[
                        styles.soundLabel,
                        isSelected && styles.soundLabelSelected,
                    ]}
                >
                    {item.label}
                </Text>
                {isLocked && (
                    <View style={styles.proBadge}>
                        <Crown size={12} color={COLORS.warning} />
                    </View>
                )}
                {isSelected && !isLocked && item.id !== 'silent' && (
                    <View style={styles.playingIndicator}>
                        <View style={[styles.playingDot, isPlaying && styles.playingDotActive]} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
            <View style={styles.overlay}>
                <View style={styles.panelContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Volume2 size={20} color={COLORS.primary.accent} />
                            <Text style={styles.title}>Ambient Sound</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <X size={24} color="rgba(255, 255, 255, 0.6)" />
                        </TouchableOpacity>
                    </View>

                    {/* Sound Grid */}
                    <FlatList
                        data={availableSounds}
                        keyExtractor={(item) => item.id}
                        renderItem={renderSoundOption}
                        numColumns={3}
                        columnWrapperStyle={styles.soundRow}
                        contentContainerStyle={styles.soundGrid}
                        scrollEnabled={false}
                    />

                    {/* Volume Control */}
                    {currentSound !== 'silent' && (
                        <View style={styles.volumeContainer}>
                            <View style={styles.volumeHeader}>
                                <Text style={styles.volumeLabel}>Volume</Text>
                                <Text style={styles.volumeValue}>{Math.round(localVolume * 100)}%</Text>
                            </View>
                            <View style={styles.sliderRow}>
                                <VolumeX size={18} color="rgba(255, 255, 255, 0.4)" />
                                <View
                                    {...panResponder.panHandlers}
                                    style={styles.volumeBarContainer}
                                    onLayout={(event) => {
                                        sliderWidth.current = event.nativeEvent.layout.width;
                                    }}
                                >
                                    <View style={[
                                        styles.volumeBarBackground,
                                        isDragging && styles.volumeBarBackgroundActive
                                    ]}>
                                        <View
                                            style={[
                                                styles.volumeBarFill,
                                                { width: `${localVolume * 100}%` },
                                                isDragging && styles.volumeBarFillActive
                                            ]}
                                        />
                                        <View
                                            style={[
                                                styles.volumeThumb,
                                                { left: `${localVolume * 100}%` },
                                                isDragging && styles.volumeThumbActive
                                            ]}
                                        />
                                    </View>
                                </View>
                                <Volume2 size={18} color="rgba(255, 255, 255, 0.4)" />
                            </View>

                            {/* Play/Pause Button */}
                            <TouchableOpacity
                                style={styles.playPauseButton}
                                onPress={onTogglePlay}
                                activeOpacity={0.8}
                            >
                                {isPlaying ? (
                                    <>
                                        <Pause size={20} color={COLORS.text.primary} />
                                        <Text style={styles.playPauseText}>Pause</Text>
                                    </>
                                ) : (
                                    <>
                                        <Play size={20} color={COLORS.text.primary} />
                                        <Text style={styles.playPauseText}>Play</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Pro Upsell */}
                    {!isPro && (
                        <TouchableOpacity
                            style={styles.proUpsell}
                            onPress={onUpgrade}
                            activeOpacity={0.8}
                        >
                            <Crown size={16} color={COLORS.warning} />
                            <Text style={styles.proUpsellText}>
                                Unlock all sounds with Pro
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    panelContainer: {
        backgroundColor: '#1a1a2e',
        borderTopLeftRadius: BORDER_RADIUS.lg,
        borderTopRightRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        paddingBottom: SPACING.xxxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '700',
        color: COLORS.text.white,
    },
    closeButton: {
        padding: SPACING.xs,
    },
    soundGrid: {
        marginBottom: SPACING.lg,
    },
    soundRow: {
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    soundOption: {
        flex: 1,
        alignItems: 'center',
        padding: SPACING.md,
        marginHorizontal: SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        position: 'relative',
    },
    soundOptionSelected: {
        backgroundColor: `${COLORS.primary.accent}20`,
        borderColor: COLORS.primary.accent,
    },
    soundOptionLocked: {
        opacity: 0.6,
    },
    soundIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    soundIconContainerSelected: {
        backgroundColor: COLORS.primary.accent,
    },
    soundLabel: {
        fontSize: FONT_SIZES.sm,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '500',
    },
    soundLabelSelected: {
        color: COLORS.text.white,
        fontWeight: '600',
    },
    proBadge: {
        position: 'absolute',
        top: SPACING.xs,
        right: SPACING.xs,
    },
    playingIndicator: {
        position: 'absolute',
        top: SPACING.xs,
        right: SPACING.xs,
    },
    playingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(215, 245, 10, 0.3)',
    },
    playingDotActive: {
        backgroundColor: COLORS.primary.accent,
    },
    volumeContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    volumeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    volumeLabel: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.white,
    },
    volumeValue: {
        fontSize: FONT_SIZES.sm,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    volumeBarContainer: {
        flex: 1,
        height: 32,
        justifyContent: 'center',
    },
    volumeBarBackground: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        position: 'relative',
        overflow: 'visible',
    },
    volumeBarBackgroundActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    volumeBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary.accent,
        borderRadius: 4,
    },
    volumeBarFillActive: {
        backgroundColor: COLORS.primary.light,
    },
    volumeThumb: {
        position: 'absolute',
        top: '50%',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.text.white,
        marginTop: -10,
        marginLeft: -10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    volumeThumbActive: {
        transform: [{ scale: 1.3 }],
        shadowOpacity: 0.5,
    },
    playPauseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary.accent,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.pill,
        gap: SPACING.sm,
    },
    playPauseText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    proUpsell: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    proUpsellText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.warning,
    },
});
