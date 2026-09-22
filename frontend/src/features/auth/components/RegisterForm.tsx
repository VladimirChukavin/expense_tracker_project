import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '../hooks/useAuth';

const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  username: z.string().min(3, 'Минимум 3 символа'),
  password: z.string().min(6, 'Минимум 6 символов'),
  password2: z.string().min(6, 'Минимум 6 символов'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  agreeToTerms: z.boolean().refine((value) => value, {
    message: 'Необходимо согласиться с условиями',
  }),
}).refine((data) => data.password === data.password2, {
  message: 'Пароли не совпадают',
  path: ['password2'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const { register: registerUser, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@mail.com"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Имя пользователя</Label>
        <Input
          id="username"
          type="text"
          placeholder="username"
          {...register('username')}
          disabled={isLoading}
        />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Имя</Label>
          <Input
            id="first_name"
            type="text"
            placeholder="Иван"
            {...register('first_name')}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Фамилия</Label>
          <Input
            id="last_name"
            type="text"
            placeholder="Иванов"
            {...register('last_name')}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password2">Подтверждение пароля</Label>
        <Input
          id="password2"
          type="password"
          placeholder="••••••••"
          {...register('password2')}
          disabled={isLoading}
        />
        {errors.password2 && (
          <p className="text-sm text-red-500">{errors.password2.message}</p>
        )}
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="agreeToTerms"
          {...register('agreeToTerms')}
          disabled={isLoading}
        />
        <div className="text-sm leading-relaxed">
          <Label htmlFor="agreeToTerms" className="font-normal cursor-pointer">
            Я согласен с{' '}
            <a
              href="/terms-of-service.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              пользовательским соглашением
            </a>
            {' '}и{' '}
            <a
              href="/privacy-policy.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              политикой обработки данных
            </a>
          </Label>
          {errors.agreeToTerms && (
            <p className="text-sm text-red-500 mt-1">{errors.agreeToTerms.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>
    </form>
  );
};
