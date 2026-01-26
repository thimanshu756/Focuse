import { api } from './api.service';
import * as SecureStore from 'expo-secure-store';
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    User,
    ApiResponse,
} from '@/types/api.types';

class AuthService {
    async login(credentials: LoginRequest): Promise<User> {
        console.log('Login request:', credentials);
        const { data } = await api.post<ApiResponse<AuthResponse>>(
            '/auth/login',
            credentials
        );
        console.log('Login response:', data);

        const { user, tokens } = data.data;

        await SecureStore.setItemAsync('accessToken', tokens.accessToken);
        await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
        // Store user info if needed, or rely on fetching it
        await SecureStore.setItemAsync('user', JSON.stringify(user));

        return user;
    }

    async register(data: RegisterRequest): Promise<User> {
        const { data: response } = await api.post<ApiResponse<AuthResponse>>(
            '/auth/register',
            data
        );

        const { user, tokens } = response.data;

        await SecureStore.setItemAsync('accessToken', tokens.accessToken);
        await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
        await SecureStore.setItemAsync('user', JSON.stringify(user));

        return user;
    }

    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await SecureStore.deleteItemAsync('user');
        }
    }

    async getCurrentUser(): Promise<User | null> {
        const userStr = await SecureStore.getItemAsync('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    }
}

export const authService = new AuthService();
