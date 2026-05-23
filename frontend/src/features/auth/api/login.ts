import { api } from '../../../api/axiosInstance';
import { AuthResponse } from '../../../types/types';

export type LoginPayload = {
  email: string;
  password: string;
};

export const loginUser = async ({ email, password }: LoginPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/api/auth/login', {
    email,
    password,
  });
  return data;
};
