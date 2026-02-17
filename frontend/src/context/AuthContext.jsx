import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithCustomToken
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

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
    const [error, setError] = useState(null);

    useEffect(() => {
        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in, fetch user profile from Firestore
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setUser({
                            id: firebaseUser.uid,
                            ...userDoc.data(),
                        });
                    } else {
                        // User doc doesn't exist, create basic profile
                        const userData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                            avatar: firebaseUser.photoURL || null,
                            role: 'user',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };
                        await setDoc(userDocRef, userData);
                        setUser({ id: firebaseUser.uid, ...userData });
                    }
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                    });
                }
            } else {
                // User is signed out
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        setError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (err) {
            console.error('Login error:', err);
            let errorMessage = 'Login failed';

            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password';
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            } else if (err.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your connection.';
            }

            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const signup = async (name, email, password) => {
        setError(null);
        try {
            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Create user profile in Firestore
            const userDocRef = doc(db, 'users', userCredential.user.uid);
            const userData = {
                uid: userCredential.user.uid,
                email: email.toLowerCase(),
                name,
                avatar: null,
                role: 'user',
                gitHubUsername: null,
                standupSettings: {
                    enabled: true,
                    standupTime: '09:00',
                    snoozeDuration: 30,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, userData);

            return { success: true, user: userCredential.user };
        } catch (err) {
            console.error('Signup error:', err);
            let errorMessage = 'Signup failed';

            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'Email already exists';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            }

            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setError(null);
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const updateProfile = async (updates) => {
        if (!user) return;

        try {
            const userDocRef = doc(db, 'users', user.id);
            await setDoc(userDocRef, {
                ...updates,
                updatedAt: new Date().toISOString(),
            }, { merge: true });

            setUser({ ...user, ...updates });
        } catch (err) {
            console.error('Update profile error:', err);
        }
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

