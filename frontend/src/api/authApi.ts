import { apiClient } from './client';
import { ApiResponse } from '../types/api';
import { AuthResponse, LoginPayload, RegisterPayload, UserProfileResponse } from '../types/auth';

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return res.data.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return res.data.data;
  },

  async getMe(): Promise<UserProfileResponse> {
    const res = await apiClient.get<ApiResponse<UserProfileResponse>>('/auth/me');
    return res.data.data;
  },
};

