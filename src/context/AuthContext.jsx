import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, reload } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  // Listen to auth state changes and restore simulated session if any
  useEffect(() => {
    const savedMockUser = localStorage.getItem("mock_user");
    if (savedMockUser) {
      setUser(JSON.parse(savedMockUser));
      setLoading(false);
    } else {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [auth]);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.removeItem("mock_user");
    } catch (err) {
      // If Firebase key is invalid/missing, fallback to mock successful login
      if (err.code === 'auth/invalid-api-key' || err.message.includes('api-key-not-valid') || err.message.includes('apiKey')) {
        const mockUser = {
          email,
          displayName: email.split('@')[0],
          uid: 'mock-user-id'
        };
        localStorage.setItem("mock_user", JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        throw err;
      }
    }
  };

  const register = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      localStorage.removeItem("mock_user");
    } catch (err) {
      // If Firebase key is invalid/missing, fallback to mock successful registration
      if (err.code === 'auth/invalid-api-key' || err.message.includes('api-key-not-valid') || err.message.includes('apiKey')) {
        const mockUser = {
          email,
          displayName: name,
          uid: 'mock-user-id'
        };
        localStorage.setItem("mock_user", JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        throw err;
      }
    }
  };

  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await reload(currentUser);
        setUser({ ...currentUser });
      } catch (err) {
        console.error('refreshUser error:', err);
      }
    }
  };

  const updateUserProfile = async (displayName) => {
    if (user?.uid === 'mock-user-id') {
      const updatedUser = { ...user, displayName };
      localStorage.setItem('mock_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found.');
    }

    await updateProfile(currentUser, { displayName });
    await refreshUser();
  };

  const logout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase logout error (safe to ignore if mock):", error);
    } finally {
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      setLoggingOut(false);
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loggingOut, refreshUser, updateUserProfile }}>
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
