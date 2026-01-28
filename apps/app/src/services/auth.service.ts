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

    async updateProfile(data: Partial<User>): Promise<User> {
        const { data: response } = await api.patch<ApiResponse<User>>(
            '/auth/update-profile',
            data
        );
        const user = response.data;
        await SecureStore.setItemAsync('user', JSON.stringify(user));
        return user;
    }

    async changePassword(data: { currentPassword?: string; newPassword?: string }): Promise<void> {
        await api.post('/auth/change-password', data);
    }

    async deleteAccount(): Promise<void> {
        await api.delete('/auth/delete-account');
        await this.logout();
    }

    async getMe(): Promise<User> {
        const { data: response } = await api.get<ApiResponse<{ user: User }>>('/auth/me');
        // Handle both structure possibilities based on web hook findings
        const user = (response.data as any).user || response.data;

        await SecureStore.setItemAsync('user', JSON.stringify(user));
        return user;
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

/**
 * Check if user is authenticated (has valid access token)
 */
export async function isAuthenticated(): Promise<boolean> {
    try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        return !!accessToken;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}
