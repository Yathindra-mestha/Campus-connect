import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../../types';

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    syncUserProfile: (userId: string) => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('googleUser');
            return savedUser ? JSON.parse(savedUser) : null;
        }
        return null;
    });
    const [loading, setLoading] = useState(true);

    const syncUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (data && !error) {
                const updatedUser = {
                    ...user,
                    ...data,
                    login: data.id // Ensure we have a login/id
                } as User;
                setUser(updatedUser);
                localStorage.setItem('googleUser', JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error('Error syncing profile:', err);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await syncUserProfile(session.user.id);
            }
            setLoading(false);
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                syncUserProfile(session.user.id);
            } else {
                setUser(null);
                localStorage.removeItem('googleUser');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, syncUserProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
