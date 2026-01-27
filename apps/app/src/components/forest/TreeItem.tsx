import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Session } from '@/types/api.types';
import { getTreeType } from '@/utils/tree.utils';
import { COLORS, BORDER_RADIUS } from '@/constants/theme';
import { format } from 'date-fns';
import { TreeAnimation } from './TreeAnimation';

interface TreeItemProps {
    session: Session;
    onPress: (session: Session) => void;
    size?: number;
}

export function TreeItem({ session, onPress, size = 80 }: TreeItemProps) {
    const type = getTreeType(session.duration, session.status);
    const isDead = type === 'dead';

    return (
        <Pressable
            onPress={() => onPress(session)}
            style={({ pressed }) => [
                styles.container,
                { width: size },
                pressed && { opacity: 0.9, transform: [{ scale: 0.95 }] }
            ]}
        >
            <View style={[styles.treeContainer, { height: size + 20 }]}>
                <TreeAnimation treeType={type} isDead={isDead} />
            </View>
            {/* <Text style={styles.time} numberOfLines={1}>
                {format(new Date(session.startTime), 'HH:mm')}
            </Text> */}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        margin: 8,
    },
    treeContainer: {
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        // overflow: 'hidden', // Don't clip animations
    },
    time: {
        marginTop: -4,
        fontSize: 10,
        color: COLORS.text.secondary,
        textAlign: 'center',
        fontWeight: '500',
    },
});
