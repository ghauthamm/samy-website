import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const signup = async (email, password, role = 'user', userData = {}) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await set(ref(database, `users/${user.uid}`), {
            email: user.email,
            role: role,
            createdAt: new Date().toISOString(),
            ...userData
        });

        return userCredential;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in database
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            // Create new user record if first time login
            await set(userRef, {
                email: user.email,
                name: user.displayName,
                role: 'user', // Default role
                photoURL: user.photoURL,
                createdAt: new Date().toISOString(),
                provider: 'google'
            });
        }

        return result;
    };

    const logout = () => {
        return signOut(auth);
    };

    const getUserRole = async (uid) => {
        const userRef = ref(database, `users/${uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            return snapshot.val().role;
        }
        return 'user';
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);

                // Hardcode roles for demo accounts
                if (user.email === 'admin@samytrends.com') {
                    setUserRole('admin');
                } else if (user.email === 'cashier@samytrends.com') {
                    setUserRole('cashier');
                } else {
                    const role = await getUserRole(user.uid);
                    setUserRole(role);
                }
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
