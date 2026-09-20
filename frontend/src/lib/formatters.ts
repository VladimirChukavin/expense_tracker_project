import {format, parseISO} from 'date-fns';
import {ru} from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr: string = 'dd.MM.yyyy'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, {locale: ru});
};

export const formatDateTime = (date: string | Date): string => {
    return formatDate(date, 'dd.MM.yyyy HH:mm');
};

export const formatCurrency = (amount: string | number, currencySymbol: string = '₽'): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${numAmount.toFixed(2)} ${currencySymbol}`;
};

export const formatNumber = (value: number, decimals: number = 2): string => {
    return value.toFixed(decimals);
};

export const formatPercent = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

export const parseAmount = (value: string): number => {
    return parseFloat(value.replace(/[^\d.-]/g, ''));
};

export const formatRelativeDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Сегодня';
    if (diffInDays === 1) return 'Вчера';
    if (diffInDays < 7) return `${diffInDays} дн. назад`;

    return formatDate(dateObj);
};
