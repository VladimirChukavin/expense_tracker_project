import {create} from 'zustand';
import {User} from '@/types/models';
import {getTokens, setTokens, clearTokens} from '@/lib/api/interceptors';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (access: string, refresh: string, user: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: !!getTokens(),
    isLoading: false,

    login: (access: string, refresh: string, user: User) => {
        setTokens({access, refresh});
        set({user, isAuthenticated: true});
    },

    logout: () => {
        clearTokens();
        set({user: null, isAuthenticated: false});
    },

    setUser: (user: User) => {
        set({user});
    },

    setLoading: (loading: boolean) => {
        set({isLoading: loading});
    },
}));
