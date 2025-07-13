import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { AuthContextType, User } from '../types';
import Spinner from '../components/Spinner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};

// Mock user data for safe AuthContext (independent of DataContext)
const mockUsers: User[] = [
    {
        id: '1',
        email: 'admin@pffpnc.com',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        firstName: 'Admin',
        lastName: 'User',
        createdAt: new Date().toISOString()
    }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Safe user lookup without DataContext dependency
    const getUserByEmail = (email: string): User | undefined => {
        return mockUsers.find(u => u.email === email);
    };

    const addUser = (newUser: Omit<User, 'id' | 'createdAt'>): User => {
        const user: User = {
            ...newUser,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        mockUsers.push(user);
        return user;
    };

    useEffect(() => {
        // Check for a logged-in user in session storage on initial load
        try {
            const storedUser = sessionStorage.getItem('pffpnc-user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                // Re-validate user against data source
                const validatedUser = getUserByEmail(parsedUser.email);
                if (validatedUser && validatedUser.status === 'active') {
                    setUser(validatedUser);
                }
            }
        } catch (error) {
            console.error("Failed to parse user from session storage", error);
            sessionStorage.removeItem('pffpnc-user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password?: string): Promise<boolean> => {
        const foundUser = getUserByEmail(email);

        if (foundUser && foundUser.password === password) {
            if (foundUser.status === 'pending') {
                throw new Error("Your account is pending approval by an administrator.");
            }
            if (foundUser.status === 'active') {
                const { password, ...userToStore } = foundUser;
                setUser(userToStore);
                sessionStorage.setItem('pffpnc-user', JSON.stringify(userToStore));
                return true;
            }
        }
        return false;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        sessionStorage.removeItem('pffpnc-user');
    }, []);

    const register = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
        const existingUser = getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        const newUser = addUser(userData);
        return newUser;
    }, []);

    if (loading) {
        return <Spinner />;
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            register,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};
