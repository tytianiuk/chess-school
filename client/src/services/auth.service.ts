import api from '@/lib/api';
import { LoginRequest, RegisterRequest } from '@/lib/types';

export const AuthService = {
  async login(payload: LoginRequest) {
    const { data } = await api.post('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterRequest) {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  async getProfile() {
    const { data } = await api.get('/auth/profile');
    return data;
  },
};
