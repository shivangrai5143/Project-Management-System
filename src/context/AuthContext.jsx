import { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem, removeItem, STORAGE_KEYS } from '../utils/storage';
import { authApi, getToken } from '../utils/api';
import { demoUsers } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Check if we should use API (backend available) or localStorage fallback
const USE_API = false; // Set to true when backend is deployed

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            if (USE_API && getToken()) {
                // Try to get user from API
                try {
                    const data = await authApi.getMe();
                    setUser(data.user);
                } catch (err) {
                    // Token invalid, clear it
                    authApi.logout();
                    // Fall back to localStorage
                    const savedUser = getItem(STORAGE_KEYS.USER);
                    if (savedUser) setUser(savedUser);
                }
            } else {
                // Use localStorage (current behavior)
                const savedUser = getItem(STORAGE_KEYS.USER);
                if (savedUser) {
                    setUser(savedUser);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        setError(null);

        if (USE_API) {
            // Use API
            try {
                const data = await authApi.login(email, password);
                setUser(data.user);
                // Also save to localStorage for backward compatibility
                setItem(STORAGE_KEYS.USER, data.user);
                return { success: true };
            } catch (err) {
                setError(err.message);
                return { success: false, error: err.message };
            }
        } else {
            // Use localStorage (demo mode)
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
        }
    };

    const signup = async (name, email, password) => {
        setError(null);

        if (USE_API) {
            // Use API
            try {
                const data = await authApi.register(email, password, name);
                setUser(data.user);
                setItem(STORAGE_KEYS.USER, data.user);
                return { success: true };
            } catch (err) {
                setError(err.message);
                return { success: false, error: err.message };
            }
        } else {
            // Use localStorage (demo mode)
            await new Promise(resolve => setTimeout(resolve, 500));

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
        }
    };

    const logout = () => {
        setUser(null);
        setError(null);
        removeItem(STORAGE_KEYS.USER);
        if (USE_API) {
            authApi.logout();
        }
    };

    const updateProfile = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        setItem(STORAGE_KEYS.USER, updatedUser);
        // TODO: Add API call to update profile when backend is ready
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            error,
            login,
            signup,
            logout,
            updateProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
