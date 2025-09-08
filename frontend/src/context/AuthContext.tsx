import React, { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import apiService from '../services/api';
import type { User, LoginData, RegisterData } from '../services/api';
import { AuthContext } from './AuthContextDefinition';
import axios from 'axios';

interface AuthProviderProps {
  children: ReactNode;
}

const REFRESH_TOKEN_BEFORE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<number | null>(null);

  const isAuthenticated = !!user;

  const setupTokenRefresh = (expiryTime: number) => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
    }

    // Calculate when to refresh (5 minutes before expiry)
    const timeUntilRefresh = expiryTime - Date.now() - REFRESH_TOKEN_BEFORE_EXPIRY_MS;
    
    // Only set up refresh if the token isn't already expired or about to expire
    if (timeUntilRefresh <= 0) {
      refreshTokens();
      return;
    }

    // Set timer to refresh token before it expires
    refreshTimerRef.current = window.setTimeout(refreshTokens, timeUntilRefresh);
  };

  const refreshTokens = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return;

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken, accessTokenExpiry } = response.data.data.tokens;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('accessTokenExpiry', accessTokenExpiry.toString());

      // Set up the next refresh
      setupTokenRefresh(accessTokenExpiry);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // On refresh failure, log the user out
      logout();
    }
  };

  const login = async (data: LoginData) => {
    const response = await apiService.login(data);
    const { user: userData, tokens } = response.data;
    
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('accessTokenExpiry', tokens.accessTokenExpiry.toString());
    setUser(userData);
    
    // Set up token refresh
    setupTokenRefresh(tokens.accessTokenExpiry);
  };

  const register = async (data: RegisterData) => {
    const response = await apiService.register(data);
    const { user: userData, tokens } = response.data;
    
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('accessTokenExpiry', tokens.accessTokenExpiry.toString());
    setUser(userData);
    
    // Set up token refresh
    setupTokenRefresh(tokens.accessTokenExpiry);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessTokenExpiry');
    
    // Clear any refresh timers
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const expiryStr = localStorage.getItem('accessTokenExpiry');
      
      if (token && expiryStr) {
        const expiry = parseInt(expiryStr, 10);
        
        // Check if token is expired
        if (Date.now() >= expiry) {
          // Token is expired, try to refresh
          try {
            await refreshTokens();
          } catch (error) {
            console.error('Failed to refresh expired token:', error);
            logout();
            setIsLoading(false);
            return;
          }
        } else {
          // Token is still valid, set up refresh timer
          setupTokenRefresh(expiry);
        }
        
        try {
          const response = await apiService.getCurrentUser();
          setUser(response.data.user);
        } catch (error) {
          console.error('Failed to get current user:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
    
    // Cleanup function to clear timer when component unmounts
    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
