import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category } from '@/types/models';
import { Label } from '@/components/ui/label';

interface CategorySelectorProps {
  categories: Category[];
  value?: number;
  onChange: (categoryId: number) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export const CategorySelector = ({
  categories,
  value,
  onChange,
  disabled = false,
  label = 'Категория',
  placeholder = 'Выберите категорию',
}: CategorySelectorProps) => {
  const buildCategoryTree = (parentId: number | null = null, level: number = 0): JSX.Element[] => {
    const children = categories.filter(c => c.parent === parentId);
    const result: JSX.Element[] = [];

    children.forEach(category => {
      const prefix = '  '.repeat(level);
      result.push(
        <SelectItem key={category.id} value={category.id.toString()}>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: category.color }}
            />
            <span>{prefix}{category.name}</span>
          </div>
        </SelectItem>
      );

      result.push(...buildCategoryTree(category.id, level + 1));
    });

    return result;
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select
        value={value?.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {buildCategoryTree()}
        </SelectContent>
      </Select>
    </div>
  );
};
