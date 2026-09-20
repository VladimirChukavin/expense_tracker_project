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
import { Category } from '@/types/models';
import { CATEGORY_COLORS } from '@/lib/constants';

const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  color: z.string().min(1, 'Цвет обязателен'),
  icon: z.string().optional(),
  parent: z.number().optional().nullable(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
  categories?: Category[];
  onSubmit: (data: CategoryFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const CategoryForm = ({
  category,
  categories = [],
  onSubmit,
  onCancel,
  isLoading,
}: CategoryFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          description: category.description || '',
          color: category.color,
          icon: category.icon || '',
          parent: category.parent || null,
        }
      : {
          color: CATEGORY_COLORS[0],
          parent: null,
        },
  });

  const selectedColor = watch('color');
  const availableParents = categories.filter(c => c.id !== category?.id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Название *</Label>
        <Input
          id="name"
          placeholder="Продукты"
          {...register('name')}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Input
          id="description"
          placeholder="Покупка продуктов питания"
          {...register('description')}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label>Цвет *</Label>
        <div className="flex gap-2">
          {CATEGORY_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`w-8 h-8 rounded border-2 transition-all ${
                selectedColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        {errors.color && (
          <p className="text-sm text-red-500">{errors.color.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Иконка</Label>
        <Input
          id="icon"
          placeholder="🛒"
          {...register('icon')}
          disabled={isLoading}
        />
      </div>

      {availableParents.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="parent">Родительская категория</Label>
          <Select
            value={watch('parent')?.toString() || 'none'}
            onValueChange={(value) => setValue('parent', value === 'none' ? null : parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Нет родителя" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Нет родителя</SelectItem>
              {availableParents.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
          {isLoading ? 'Сохранение...' : category ? 'Обновить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
};
