import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { AuthService } from '../api/services/AuthService';
import type { JwtResponse } from '../api/models/JwtResponse';
import type { LoginRequest } from '../api/models/LoginRequest';
import type { SignupRequest } from '../api/models/SignupRequest';
import { OpenAPI } from '../api/core/OpenAPI';
import { jwtDecode } from 'jwt-decode';

interface DecodedJwt {
  id: string;
  sub: string; // email
  fullName: string; // The backend now provides this
  roles: { authority: string }[]; // Directly use the correct structure
  permissions?: string[];
  organizationRoles?: any[];
  exp: number;
  iat: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: JwtResponse | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (details: SignupRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<JwtResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    OpenAPI.TOKEN = undefined;
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (accessToken && refreshToken) {
        try {
          const decodedToken: DecodedJwt = jwtDecode(accessToken);
          
          if (decodedToken.exp * 1000 < Date.now()) {
            console.warn('Access token expired, logging out.');
            clearAuthData();
            setLoading(false);
            return;
          }

          const userData: JwtResponse = {
            accessToken: accessToken,
            refreshToken: refreshToken,
            tokenType: 'Bearer',
            id: decodedToken.id,
            fullName: decodedToken.fullName,
            email: decodedToken.sub,
            roles: [], // Initialize roles array here

            permissions: decodedToken.permissions || [],
            organizationRoles: decodedToken.organizationRoles || []
          };

          const extractedRoles: string[] = [];
          if (Array.isArray(decodedToken.roles)) {
            for (const role of decodedToken.roles) {
              if (typeof role === 'object' && role !== null && typeof role.authority === 'string') {
                extractedRoles.push(role.authority);
              }
            }
          }
          userData.roles = extractedRoles; // Assign extracted roles

          console.log('AuthContext - Decoded Token Roles (checkAuth):', decodedToken.roles); // Re-added log
          console.log('AuthContext - Extracted Roles (checkAuth):', extractedRoles); // Re-added log


          if (Array.isArray(decodedToken.roles)) { // Log the problematic decoded roles
            console.log('AuthContext - Decoded Token Roles (checkAuth):', decodedToken.roles);
            console.log('AuthContext - Extracted Roles (checkAuth):', extractedRoles);
          }

          
          OpenAPI.TOKEN = accessToken;
          setIsAuthenticated(true);
          setUser(userData);
        } catch (err) {
          console.error("Failed to decode JWT or token invalid:", err);
          clearAuthData();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null); // Ensure user is null if not authenticated
      }
      setLoading(false);
    };
    checkAuth();
  }, [clearAuthData]);

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthService.postApiAuthLogin(credentials);
      
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      OpenAPI.TOKEN = response.accessToken;
      setIsAuthenticated(true);

      const decodedToken: DecodedJwt = jwtDecode(response.accessToken);

      const loginUserData: JwtResponse = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        tokenType: response.tokenType,
        id: decodedToken.id,
        fullName: decodedToken.fullName,
        email: decodedToken.sub,
        roles: [], // Initialize roles array
        permissions: decodedToken.permissions || [],
        organizationRoles: decodedToken.organizationRoles || []
      };

      const extractedRoles: string[] = [];
      if (Array.isArray(decodedToken.roles)) {
        for (const role of decodedToken.roles) {
          if (typeof role === 'object' && role !== null && typeof role.authority === 'string') {
            extractedRoles.push(role.authority);
          }
        }
      }
      loginUserData.roles = extractedRoles; // Assign extracted roles

      if (Array.isArray(decodedToken.roles)) { // Log the problematic decoded roles
        console.log('AuthContext - Decoded Token Roles (login):', decodedToken.roles);
        console.log('AuthContext - Extracted Roles (login):', extractedRoles);
      }
      
      setUser(loginUserData);
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      clearAuthData();
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearAuthData]);

  const register = useCallback(async (details: SignupRequest) => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.postApiAuthSignup(details);
      await login({ email: details.email, password: details.password });
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      clearAuthData();
      throw err;
    } finally {
      setLoading(false);
    }
  }, [login, clearAuthData]);

  const logout = useCallback(() => {
    clearAuthData();
  }, [clearAuthData]);

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};