import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { LoginRequest, LoginResponse, RegisterRequest, RefreshTokenRequest, RefreshTokenResponse } from '@/types/api';
import { User } from '@/types/models';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  refresh: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },
};
