import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../api/login';
import { useAuthStore } from '../../../store/authStore';

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Zapisujemy dane logowania i token w Zustand
      setAuth(
        {
          id: data.userId,
          email: data.email,
          name: data.name,
          role: data.role,
        },
        data.token
      );

      toast.success(`Witaj z powrotem, ${data.name}!`);

      // Przekierowanie w zależności od roli użytkownika
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/');
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Błąd logowania.';
      toast.error(errorMessage);
    },
  });
};
