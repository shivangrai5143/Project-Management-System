import { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem, removeItem, STORAGE_KEYS } from '../utils/storage';
import { demoUsers } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for saved user session
        const savedUser = getItem(STORAGE_KEYS.USER);
        if (savedUser) {
            setUser(savedUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const foundUser = demoUsers.find(
            u => u.email === email && u.password === password
        );

        if (foundUser) {
            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);
            setItem(STORAGE_KEYS.USER, userWithoutPassword);
            return { success: true };
        }

        return { success: false, error: 'Invalid email or password' };
    };

    const signup = async (name, email, password) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if email already exists
        const existingUser = demoUsers.find(u => u.email === email);
        if (existingUser) {
            return { success: false, error: 'Email already exists' };
        }

        const newUser = {
            id: `user-${Date.now()}`,
            name,
            email,
            avatar: null,
            role: 'member',
        };

        setUser(newUser);
        setItem(STORAGE_KEYS.USER, newUser);
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        removeItem(STORAGE_KEYS.USER);
    };

    const updateProfile = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        setItem(STORAGE_KEYS.USER, updatedUser);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            signup,
            logout,
            updateProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
