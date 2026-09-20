import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@/stores/authStore';
import { LoginRequest, RegisterRequest } from '@/types/api';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const navigate = useNavigate();
  const { login: loginStore, logout: logoutStore, setUser, isAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      loginStore(response.access, response.refresh, response.user);
      toast.success('Вход выполнен успешно');
      navigate('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка входа';
      toast.error(message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      loginStore(response.access, response.refresh, response.user);
      toast.success('Регистрация успешна');
      navigate('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка регистрации';
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logoutStore();
      toast.success('Выход выполнен');
      navigate('/login');
    },
    onError: () => {
      logoutStore();
      navigate('/login');
    },
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => {
      setUser(data);
    },
    onError: () => {
      logoutStore();
    },
  });

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    user,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    isAuthenticated,
  };
};
