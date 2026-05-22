import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
            if (typeof window !== 'undefined') {
                const savedUser = localStorage.getItem('googleUser');
                if (savedUser) {
                    const parsedUser = JSON.parse(savedUser);
                    if (parsedUser && (parsedUser.id === userId || parsedUser.login === userId)) {
                        setUser(parsedUser);
                    }
                }
            }
        } catch (err) {
            console.error('Error syncing profile locally:', err);
        }
    };

    useEffect(() => {
        const initAuth = () => {
            if (typeof window !== 'undefined') {
                const savedUser = localStorage.getItem('googleUser');
                if (savedUser) {
                    try {
                        setUser(JSON.parse(savedUser));
                    } catch (e) {
                        console.error('Failed to parse googleUser', e);
                    }
                }
            }
            setLoading(false);
        };
        initAuth();
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
