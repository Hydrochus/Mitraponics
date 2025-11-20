"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

interface UserAuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to check if this is a login/register page
  const isLoginPage = () => {
    const path = window.location.pathname;
    return path === '/login' || path === '/register';
  };

  // Function to get the token from cookies or localStorage
  const getToken = () => {
    const cookieToken = document.cookie.split('; ').find(row => row.startsWith('userToken='))?.split('=')[1];
    const localToken = localStorage.getItem('userToken');
    return cookieToken || localToken;
  };

  // Function to store the token in both cookies and localStorage
  const storeToken = (token: string) => {
    document.cookie = `userToken=${token}; path=/; max-age=86400`; // 24 hours
    localStorage.setItem('userToken', token);
  };

  // Function to clear the token from both cookies and localStorage
  const clearToken = () => {
    document.cookie = 'userToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('userToken');
  };

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      setLoading(true); // Ensure loading is true at the start
      try {
        // If we're on a login/register page, clear the token
        if (isLoginPage()) {
          setIsAuthenticated(false);
          setUser(null);
          clearToken();
          return;
        }
        
        // Get token
        const token = getToken();
        
        // If no token, user is not authenticated
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        // Make API call to validate token
        try {
          const response = await fetch('http://localhost:8000/api/user/check-auth', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setIsAuthenticated(true);
            setUser(data.user);
            // Ensure token is stored in both places
            storeToken(token);
          } else if (response.status === 401) {
            // If token is specifically unauthorized, clear it
            setIsAuthenticated(false);
            setUser(null);
            clearToken();
          } else {
            // For other error responses, don't clear token as it might be a server issue
            console.error('Auth check server error:', response.status);
            // Keep current auth state to prevent unnecessary logouts on server issues
            // If there's no user and an error, consider them not authenticated.
            if (!user) {
              setIsAuthenticated(false);
            }
          }
        } catch (error) {
          // Network error - don't clear token as it might be a connection issue
          console.error('Auth check network error:', error);
          // If we already have a user, keep them authenticated to prevent
          // logout on temporary network issues. If no user, consider not authenticated.
          if (!user) {
            setIsAuthenticated(false);
          }
        }
      } finally {
        setLoading(false); // This is the only place setLoading(false) should be called
      }
    };

    checkAuth();
    
    // Optional: Add dependency on router path if isLoginPage needs to react to SPA navigation
    // This might require getting pathname from next/router if window.location.pathname is not reactive
  }, []); // Consider adding dependencies if isLoginPage logic could change without a full remount.

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
        
        // Store the token
        storeToken(data.token);
        
        // The redirection is now handled in the login page component
        // to support dynamic redirects
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
        
        // Store the token
        storeToken(data.token);
        
        // The redirection is now handled in the register page component
        // to support dynamic redirects
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = getToken();
               
      if (token) {
        await fetch('http://localhost:8000/api/user/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      }
      setIsAuthenticated(false);
      setUser(null);
      clearToken();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear credentials even if logout API fails
      setIsAuthenticated(false);
      setUser(null);
      clearToken();
      router.push('/login');
    }
  };

  return (
    <UserAuthContext.Provider value={{ isAuthenticated, user, login, register, logout, loading }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}; 