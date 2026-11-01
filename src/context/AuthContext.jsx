import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getActiveUser,
  setActiveUser,
  clearActiveUser,
  getUserByEmail,
  createUser,
  updateUser as updateStorageUser,
  getUsers
} from '../services/storageService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getActiveUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial active session
    const user = getActiveUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const user = getUserByEmail(email);
    if (!user) {
      throw new Error('No account found with this email address.');
    }
    if (user.password !== password) {
      throw new Error('Incorrect password. For demo accounts, use: password123');
    }
    setActiveUser(user);
    setCurrentUser(user);
    return user;
  };

  const register = (userData) => {
    const newUser = createUser(userData);
    setActiveUser(newUser);
    setCurrentUser(newUser);
    return newUser;
  };

  const logout = () => {
    clearActiveUser();
    setCurrentUser(null);
  };

  const updateProfile = (updates) => {
    if (!currentUser) return null;
    const updated = updateStorageUser(currentUser.id, updates);
    setCurrentUser(updated);
    return updated;
  };

  // Demo utility for examiners/professors: switch between demo profiles instantly
  const switchDemoAccount = (email) => {
    const user = getUserByEmail(email);
    if (user) {
      setActiveUser(user);
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const isCandidate = currentUser?.role === 'candidate';
  const isRecruiter = currentUser?.role === 'recruiter';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        register,
        logout,
        updateProfile,
        switchDemoAccount,
        isCandidate,
        isRecruiter,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

