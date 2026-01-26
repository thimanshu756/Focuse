export const randomBytes = (size) => {
    const bytes = new Uint8Array(size);
    // This is a dummy implementation; for production security, use react-native-get-random-values or expo-crypto
    for (let i = 0; i < size; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
};

export const createHash = () => {
    return {
        update: () => ({
            digest: () => ''
        })
    }
}

export default {
    randomBytes,
    createHash,
};
