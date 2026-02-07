import Reactotron from 'reactotron-react-native';
import { Platform } from 'react-native';

// Initialize Reactotron (only called when __DEV__ is true from _layout.tsx)
Reactotron.configure({
    name: 'FOCUSE',
    host: Platform.OS === 'ios' ? 'localhost' : '192.168.1.26',
    port: 9090,
})
    .useReactNative({
        networking: {
            ignoreUrls: /symbolicate/,
        },
        asyncStorage: true,
        storybook: false,
        errors: { veto: (_) => false },
        editor: false,
    })
    .connect();

// Log successful connection attempt
console.log('[Reactotron] Attempting to connect...');

// Extend console to also log to Reactotron
const yeOldeConsoleLog = console.log;
console.log = (...args: any[]) => {
    yeOldeConsoleLog(...args);
    Reactotron.log?.(...args);
};

const yeOldeConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
    yeOldeConsoleWarn(...args);
    Reactotron.warn?.([...args].join(' '));
};

const yeOldeConsoleError = console.error;
console.error = (...args: any[]) => {
    yeOldeConsoleError(...args);
    Reactotron.error?.([...args].join(' '), null);
};

export default Reactotron;
