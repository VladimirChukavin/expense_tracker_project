import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Expense } from '@/types/models';
import { Upload, X } from 'lucide-react';

const expenseSchema = z.object({
  amount: z.string().min(1, 'Сумма обязательна'),
  description: z.string().optional(),
  date: z.string().min(1, 'Дата обязательна'),
  category: z.number({ required_error: 'Категория обязательна' }),
  currency: z.number({ required_error: 'Валюта обязательна' }),
  tags: z.array(z.number()).optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: FormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ExpenseForm = ({ expense, onSubmit, onCancel, isLoading }: ExpenseFormProps) => {
  const [receipt, setReceipt] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    expense?.receipt || null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          amount: expense.amount,
          description: expense.description || '',
          date: expense.date,
          category: expense.category,
          currency: expense.currency,
          tags: expense.tags || [],
        }
      : {
          date: new Date().toISOString().split('T')[0],
        },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceipt(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveReceipt = () => {
    setReceipt(null);
    setPreviewUrl(null);
  };

  const onFormSubmit = (data: ExpenseFormData) => {
    const formData = new FormData();
    formData.append('amount', data.amount);
    formData.append('date', data.date);
    formData.append('category', data.category.toString());
    formData.append('currency', data.currency.toString());

    if (data.description) {
      formData.append('description', data.description);
    }

    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tag) => formData.append('tags', tag.toString()));
    }

    if (receipt) {
      formData.append('receipt', receipt);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Сумма *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="1000.00"
            {...register('amount')}
            disabled={isLoading}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Дата *</Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
            disabled={isLoading}
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Input
          id="description"
          type="text"
          placeholder="Покупка продуктов"
          {...register('description')}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Категория *</Label>
          <Input
            id="category"
            type="number"
            placeholder="1"
            {...register('category', { valueAsNumber: true })}
            disabled={isLoading}
          />
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Валюта *</Label>
          <Input
            id="currency"
            type="number"
            placeholder="1"
            {...register('currency', { valueAsNumber: true })}
            disabled={isLoading}
          />
          {errors.currency && (
            <p className="text-sm text-red-500">{errors.currency.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="receipt">Чек</Label>
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Receipt preview"
              className="max-h-48 rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemoveReceipt}
            >
              <X size={16} />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <label htmlFor="receipt" className="cursor-pointer">
                <span className="text-sm text-blue-600 hover:text-blue-500">
                  Загрузить файл
                </span>
                <input
                  id="receipt"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>
        )}
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
          {isLoading ? 'Сохранение...' : expense ? 'Обновить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
};
