import { apiClient } from './client';
import * as SecureStore from 'expo-secure-store';
import { UserRole } from '@/types/user.types';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    verified: boolean;
    avatar?: string;
    sellerProfile?: any;
    buyerProfile?: any;
    createdAt: string;
  };
  token: string;
}

const normalizeAvatar = (avatar: unknown): string | undefined => {
  if (!avatar) return undefined;
  if (typeof avatar === 'string') return avatar;
  if (typeof avatar === 'object') {
    const media = avatar as { url?: unknown; secure_url?: unknown };
    if (typeof media.url === 'string') return media.url;
    if (typeof media.secure_url === 'string') return media.secure_url;
  }
  return undefined;
};

const mapAuthUser = (user: any): AuthResponse['user'] => ({
  ...user,
  role: user.role as UserRole,
  verified: user.isVerified || user.verified,
  avatar: normalizeAvatar(user.avatar),
});

export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    const responseData = response.data.data || response.data;
    if (responseData.token) {
      await SecureStore.setItemAsync('authToken', responseData.token);
    }
    // Convert role string to UserRole enum and fix response structure
    return {
      user: mapAuthUser(responseData.user),
      token: responseData.token,
    };
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    const responseData = response.data.data || response.data;
    if (responseData.token) {
      await SecureStore.setItemAsync('authToken', responseData.token);
    }
    // Convert role string to UserRole enum and fix response structure
    return {
      user: mapAuthUser(responseData.user),
      token: responseData.token,
    };
  },

  loadUser: async (): Promise<AuthResponse['user']> => {
    const response = await apiClient.get('/auth/me');
    const responseData = response.data.data || response.data;
    // Convert role string to UserRole enum and fix response structure
    return mapAuthUser(responseData.user);
  },

  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync('authToken');
  },
};