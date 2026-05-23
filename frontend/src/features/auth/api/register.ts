import { api } from '../../../api/axiosInstance';
import { UserRole } from '../../../types/types';

export type RegisterPayload = {
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  // Doctor-specific fields
  specialty?: string;
  city?: string;
  bio?: string | null;
  profilePicture?: string | null;
};

export type RegisterResponse = {
  message: string;
};

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const { data } = await api.post<RegisterResponse>('/api/auth/register', payload);
  return data;
};
