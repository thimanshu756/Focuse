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

    async forgotPassword(email: string): Promise<void> {
        await api.post('/auth/forgot-password', { email: email.toLowerCase().trim() });
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        await api.post('/auth/reset-password', { token, newPassword });
    }

    /**
     * Google OAuth Authentication
     *
     * Authenticates user with Google ID token.
     * The backend will verify the token and either:
     * - Create a new user account
     * - Link Google to an existing email/password account
     * - Log in an existing Google user
     *
     * @param idToken - Google ID token from Google Sign-In
     * @param timezone - User's timezone (optional, defaults to device timezone)
     * @returns User object and metadata (isNewUser, isLinked)
     */
    async googleAuth(idToken: string, timezone?: string): Promise<{
        user: User;
        isNewUser: boolean;
        isLinked: boolean;
    }> {
        const { data: response } = await api.post<ApiResponse<{
            user: User;
            tokens: {
                accessToken: string;
                refreshToken: string;
            };
        }>>('/auth/google', {
            idToken,
            timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        });

        console.log('Google auth response:', response);
        const { user, tokens } = response.data;
        const { isNewUser, isLinked } = (response as any).meta || {};

        // Store tokens
        await SecureStore.setItemAsync('accessToken', tokens.accessToken);
        await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
        await SecureStore.setItemAsync('user', JSON.stringify(user));

        return {
            user,
            isNewUser: isNewUser || false,
            isLinked: isLinked || false,
        };
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
