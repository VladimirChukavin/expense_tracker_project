import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@/stores/authStore';
import { getTokens } from '@/lib/api/interceptors';
import { LoginRequest, RegisterRequest } from '@/types/api';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };
  const queryClient = useQueryClient();
  const { login: loginStore, logout: logoutStore, setUser, isAuthenticated } = useAuthStore();

  // куда вернуться после успешного входа
  const from = location.state?.from?.pathname || '/';

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      loginStore(response.access, response.refresh, response.user);
      toast.success('Вход выполнен успешно');
      navigate(from, {replace: true});
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
      navigate(from, {replace: true});
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка регистрации';
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // blacklist refresh-токена на сервере (если он ещё есть)
      const tokens = getTokens();
      if (tokens?.refresh) {
        try {
          await authApi.logout(tokens.refresh);
        } catch {
          // даже если blacklist не удался — выходим локально
        }
      }
    },
    onSettled: () => {
      logoutStore();
      // полностью очищаем кэш, чтобы данные не попали к следующему пользователю
      queryClient.clear();
      toast.success('Выход выполнен');
      navigate('/login');
    },
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const data = await authApi.getMe();
      setUser(data);
      return data;
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
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
