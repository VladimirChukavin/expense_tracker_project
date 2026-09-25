import {Navigate, useLocation} from 'react-router-dom';
import {useAuthStore} from '@/stores/authStore';
import * as React from 'react';

interface PrivateRouteProps {
    children: React.ReactNode;
}

export const PrivateRoute = ({children}: PrivateRouteProps) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        // запоминаем, откуда пришли — после логина вернём пользователя назад
        return <Navigate to="/login" replace state={{from: location}}/>;
    }

    return <>{children}</>;
};
