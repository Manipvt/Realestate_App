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

export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    const responseData = response.data.data || response.data;
    if (responseData.token) {
      await SecureStore.setItemAsync('authToken', responseData.token);
    }
    // Convert role string to UserRole enum and fix response structure
    return {
      user: {
        ...responseData.user,
        role: responseData.user.role as UserRole,
        verified: responseData.user.isVerified || responseData.user.verified
      },
      token: responseData.token
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
      user: {
        ...responseData.user,
        role: responseData.user.role as UserRole,
        verified: responseData.user.isVerified || responseData.user.verified
      },
      token: responseData.token
    };
  },

  loadUser: async (): Promise<AuthResponse['user']> => {
    const response = await apiClient.get('/auth/me');
    const responseData = response.data.data || response.data;
    // Convert role string to UserRole enum and fix response structure
    return {
      ...responseData.user,
      role: responseData.user.role as UserRole,
      verified: responseData.user.isVerified || responseData.user.verified
    };
  },

  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync('authToken');
  },
};