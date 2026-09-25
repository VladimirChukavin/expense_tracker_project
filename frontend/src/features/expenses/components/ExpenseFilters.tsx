import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { CategorySelector } from '@/features/categories/components/CategorySelector';
import { ExpenseFilters as ExpenseFiltersType } from '@/types/api';

interface ExpenseFiltersProps {
  onFilterChange: (filters: ExpenseFiltersType) => void;
}

export const ExpenseFilters = ({ onFilterChange }: ExpenseFiltersProps) => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const { categories } = useCategories();

  const handleApplyFilters = () => {
    const filters: ExpenseFiltersType = {};

    if (dateFrom) filters.date_from = format(dateFrom, 'yyyy-MM-dd');
    if (dateTo) filters.date_to = format(dateTo, 'yyyy-MM-dd');

    const min = parseFloat(minAmount);
    const max = parseFloat(maxAmount);
    if (minAmount && !Number.isNaN(min)) filters.min_amount = min;
    if (maxAmount && !Number.isNaN(max)) filters.max_amount = max;
    if (search) filters.search = search;
    if (categoryId) filters.category = categoryId;

    onFilterChange(filters);
  };

  const handleReset = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setMinAmount('');
    setMaxAmount('');
    setSearch('');
    setCategoryId(undefined);
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Поиск</Label>
          <Input
            placeholder="Описание расхода..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Категория</Label>
          <CategorySelector
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
            label={undefined}
          />
        </div>

        <div className="space-y-2">
          <Label>Дата от</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateFrom && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, 'PPP', { locale: ru }) : 'Выберите дату'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Дата до</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateTo && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, 'PPP', { locale: ru }) : 'Выберите дату'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Сумма от</Label>
          <Input
            type="number"
            placeholder="0"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Сумма до</Label>
          <Input
            type="number"
            placeholder="0"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApplyFilters}>Применить фильтры</Button>
        <Button variant="outline" onClick={handleReset}>
          <X size={16} className="mr-2" />
          Сбросить
        </Button>
      </div>
    </div>
  );
};
