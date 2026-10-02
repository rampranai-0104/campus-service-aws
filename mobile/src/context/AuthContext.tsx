import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  authError: null,
  login: async () => ({ success: false }),
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setAuthError(null);
      const profile = await authService.getCurrentUserProfile();
      if (profile) {
        setCurrentUser(profile);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      console.warn('[AuthContext] Session check error:', err);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const res = await authService.signIn(email, password);
      if (res.isSignedIn) {
        const profile = await authService.getCurrentUserProfile();
        setCurrentUser(profile);
        setIsAuthenticated(true);
        setIsLoadingAuth(false);
        return { success: true };
      }

      if (res.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        const err = 'Temporary password expired or requires new password.';
        setAuthError(err);
        setIsLoadingAuth(false);
        return { success: false, error: err };
      }

      const err = `Login step required: ${res.nextStep?.signInStep}`;
      setAuthError(err);
      setIsLoadingAuth(false);
      return { success: false, error: err };
    } catch (err: any) {
      console.error('[AuthContext] Login caught error:', err);
      const underlying = err?.underlyingError;
      const message =
        underlying?.message ||
        (err?.message && err.message !== 'An unknown error has occurred.' ? err.message : '') ||
        err?.name ||
        'Authentication failed. Please verify your email and password.';
      setAuthError(message);
      setIsLoadingAuth(false);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    setIsLoadingAuth(true);
    try {
      await authService.signOut();
      await storageService.clearAllCaches();
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.warn('[AuthContext] Logout warning:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const refreshProfile = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoadingAuth,
        authError,
        login,
        logout,
        refreshProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
