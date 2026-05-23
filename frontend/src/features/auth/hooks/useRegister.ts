import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../api/register';

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      toast.success(data.message || 'Konto zarejestrowane pomyślnie!');
      navigate('/login');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Błąd rejestracji.';
      toast.error(errorMessage);
    },
  });
};
