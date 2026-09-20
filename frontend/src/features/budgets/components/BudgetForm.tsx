import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Budget } from '@/types/models';
import { BUDGET_PERIODS } from '@/lib/constants';

const budgetSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  amount: z.string().min(1, 'Сумма обязательна'),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  start_date: z.string().min(1, 'Дата начала обязательна'),
  end_date: z.string().min(1, 'Дата окончания обязательна'),
  category: z.number().optional().nullable(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  budget?: Budget;
  onSubmit: (data: BudgetFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const BudgetForm = ({ budget, onSubmit, onCancel, isLoading }: BudgetFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget
      ? {
          name: budget.name,
          amount: budget.amount,
          period: budget.period,
          start_date: budget.start_date,
          end_date: budget.end_date,
          category: budget.category || null,
        }
      : {
          period: 'monthly',
          start_date: new Date().toISOString().split('T')[0],
          category: null,
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Название *</Label>
        <Input
          id="name"
          placeholder="Месячный бюджет"
          {...register('name')}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Сумма *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="50000.00"
            {...register('amount')}
            disabled={isLoading}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="period">Период *</Label>
          <Select
            value={watch('period')}
            onValueChange={(value: any) => setValue('period', value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_PERIODS.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.period && (
            <p className="text-sm text-red-500">{errors.period.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Дата начала *</Label>
          <Input
            id="start_date"
            type="date"
            {...register('start_date')}
            disabled={isLoading}
          />
          {errors.start_date && (
            <p className="text-sm text-red-500">{errors.start_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">Дата окончания *</Label>
          <Input
            id="end_date"
            type="date"
            {...register('end_date')}
            disabled={isLoading}
          />
          {errors.end_date && (
            <p className="text-sm text-red-500">{errors.end_date.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Категория (опционально)</Label>
        <Input
          id="category"
          type="number"
          placeholder="Оставьте пустым для всех категорий"
          {...register('category', {
            setValueAs: (v) => v === '' ? null : parseInt(v)
          })}
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">
          Оставьте пустым для бюджета на все расходы
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Отмена
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Сохранение...' : budget ? 'Обновить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
};
