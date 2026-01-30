import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../utils/api';
import auth from '@react-native-firebase/auth';
import { getErrorMessage } from '../utils/errorMapper';

type AuthUser = Record<string, unknown> | null;

type AuthActionResult = { success: boolean; error?: string };

type ProfileUpdateInput = { name?: string; bio?: string; profileImage?: string };

type AuthContextValue = {
  user: AuthUser;
  token: string | null;
  loading: boolean;
  initializing: boolean;
  register: (name: string, email: string, password: string, phone: string) => Promise<AuthActionResult>;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  loginWithFirebase: (idToken: string) => Promise<AuthActionResult>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: ProfileUpdateInput) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const refreshProfile = async () => {
    if (!token) {
      setUser(null);
      return;
    }
    const me = await authAPI.getProfile();
    setUser(me.data);
  };

  const clearAuth = async () => {
    await AsyncStorage.removeItem('authToken');
    setToken(null);
    setUser(null);

    try {
      await auth().signOut();
    } catch {
      // ignore
    }
  };

  const updateProfile = async (updates: ProfileUpdateInput): Promise<AuthActionResult> => {
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(updates);
      setUser(res.data);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: getErrorMessage(error, 'Profile update failed') };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hydrateToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);

          try {
            const me = await authAPI.getProfile();
            setUser(me.data);
          } catch (error: any) {
            const status = error?.response?.status;
            if (status === 401) {
              await clearAuth();
            }
          }
        }
      } catch (err) {
        // noop: token hydration failure shouldn't crash app
      } finally {
        setInitializing(false);
      }
    };
    hydrateToken();
  }, []);

  const register = async (
    name: string,
    email: string,
    password: string,
    phone: string
  ): Promise<AuthActionResult> => {
    setLoading(true);
    try {
      const response = await authAPI.register({ name, email, password, phone });
      const { token: newToken, user: userData } = response.data;
      
      await AsyncStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: getErrorMessage(error, 'Registration failed') };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<AuthActionResult> => {
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: userData } = response.data;
      
      await AsyncStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: getErrorMessage(error, 'Login failed') };
    } finally {
      setLoading(false);
    }
  };

  const loginWithFirebase = async (idToken: string): Promise<AuthActionResult> => {
    setLoading(true);
    try {
      const response = await authAPI.firebase({ idToken });
      const { token: newToken, user: userData } = response.data;

      await AsyncStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: getErrorMessage(error, 'Social login failed') };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, initializing, register, login, loginWithFirebase, refreshProfile, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
