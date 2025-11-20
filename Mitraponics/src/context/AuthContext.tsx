"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to check if this is an admin login page
  const isAdminLoginPage = () => {
    return window.location.pathname === '/admin/login';
  };

  // Function to get the admin token from cookies or localStorage
  const getAdminToken = () => {
    const cookieToken = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1];
    const localToken = localStorage.getItem('adminToken');
    return cookieToken || localToken;
  };

  // Function to store the admin token in both cookies and localStorage
  const storeAdminToken = (token: string) => {
    document.cookie = `adminToken=${token}; path=/; max-age=86400`; // 24 hours
    localStorage.setItem('adminToken', token);
  };

  // Function to clear the admin token from both cookies and localStorage
  const clearAdminToken = () => {
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('adminToken');
  };

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        // If we're on the admin login page, clear the token and don't redirect
        if (isAdminLoginPage()) {
          setIsAuthenticated(false);
          setUser(null);
          clearAdminToken();
          setLoading(false);
          return;
        }
        
        // Get token
        const token = getAdminToken();
        
        // If no token, user is not authenticated
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        // Make API call to validate token
        try {
          const response = await fetch('http://localhost:8000/api/admin/check-auth', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            // Check if the user is actually an admin
            if (data.user && data.user.is_admin) {
              setIsAuthenticated(true);
              setUser(data.user);
              // Ensure token is stored in both places
              storeAdminToken(token);
            } else {
              // User is not an admin
              setIsAuthenticated(false);
              setUser(null);
              clearAdminToken();
            }
          } else if (response.status === 401) {
            // If token is specifically unauthorized, clear it
            setIsAuthenticated(false);
            setUser(null);
            clearAdminToken();
          } else {
            // For other error responses, don't clear token as it might be a server issue
            console.error('Admin auth check server error:', response.status);
            // Keep current auth state to prevent unnecessary logouts on server issues
          }
        } catch (error) {
          // Network error - don't clear token as it might be a connection issue
          console.error('Admin auth check network error:', error);
          // If we already have a user, keep them authenticated to prevent
          // logout on temporary network issues
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Admin login successful, setting authenticated state");
        
        // Store the token first
        storeAdminToken(data.token);
        
        // Then update state
        setIsAuthenticated(true);
        setUser(data.user);
        
        // Give a moment for state to update
        setTimeout(() => {
          console.log("Redirecting to admin dashboard");
          // Try both methods to ensure redirect happens
          router.push('/admin/dashboard');
          
          // As a fallback, after a short delay, force redirect
          setTimeout(() => {
            console.log("Fallback redirect to admin dashboard");
            window.location.href = '/admin/dashboard';
          }, 500);
        }, 100);
        
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = getAdminToken();
               
      if (token) {
        await fetch('http://localhost:8000/api/admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      }
      setIsAuthenticated(false);
      setUser(null);
      clearAdminToken();
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear credentials even if logout API fails
      setIsAuthenticated(false);
      setUser(null);
      clearAdminToken();
      window.location.href = '/admin/login';
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 