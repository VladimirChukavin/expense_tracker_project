import {format, parseISO, isValid} from 'date-fns';
import {ru} from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr: string = 'dd.MM.yyyy'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return String(date);
    return format(dateObj, formatStr, {locale: ru});
};

export const formatDateTime = (date: string | Date): string => {
    return formatDate(date, 'dd.MM.yyyy HH:mm');
};

export const formatCurrency = (
    amount: string | number,
    currencyCode: string = 'RUB'
): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (Number.isNaN(numAmount)) return String(amount);
    try {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: 2,
        }).format(numAmount);
    } catch {
        // неизвестный код валюты — показываем как число с кодом
        return `${numAmount.toFixed(2)} ${currencyCode}`;
    }
};

export const formatNumber = (value: number, decimals: number = 2): string => {
    return value.toFixed(decimals);
};

export const formatPercent = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

export const parseAmount = (value: string): number => {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    return Number.isNaN(parsed) ? 0 : parsed;
};

export const formatRelativeDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return String(date);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Сегодня';
    if (diffInDays === 1) return 'Вчера';
    if (diffInDays < 7) return `${diffInDays} дн. назад`;

    return formatDate(dateObj);
};
