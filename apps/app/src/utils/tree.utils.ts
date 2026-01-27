export type TreeType = 'basic' | 'premium' | 'elite' | 'dead';
export type TreeStage = 'seed' | 'sapling' | 'tree' | 'dead';

export const getTreeType = (duration: number, status: string): TreeType => {
    if (status !== 'COMPLETED') return 'dead';
    if (duration > 45 * 60) return 'elite';
    if (duration > 15 * 60) return 'premium';
    return 'basic';
};

export const getTreeEmoji = (type: TreeType): string => {
    switch (type) {
        case 'elite': return '🌳';
        case 'premium': return '🌲';
        case 'basic': return '🌱';
        case 'dead': return '🥀';
        default: return '🌱';
    }
};

export const getTreeLabel = (type: TreeType): string => {
    switch (type) {
        case 'elite': return 'Elite Tree';
        case 'premium': return 'Premium Tree';
        case 'basic': return 'Basic Tree';
        case 'dead': return 'Withered Tree';
        default: return 'Tree';
    }
};

export const getTreeColor = (type: TreeType): string => {
    switch (type) {
        case 'elite': return '#059669'; // Emerald 600
        case 'premium': return '#16A34A'; // Green 600
        case 'basic': return '#84CC16'; // Lime 500
        case 'dead': return '#78716C'; // Stone 500
        default: return '#10B981';
    }
};
