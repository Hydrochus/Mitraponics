"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Facebook, Instagram, Twitter } from "lucide-react";
import { RiMailFill } from "react-icons/ri";
import { HiLocationMarker } from "react-icons/hi";

export default function AdminLogin() {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing token and redirect if authenticated
  useEffect(() => {
    // If already authenticated and not still loading, redirect to dashboard
    if (isAuthenticated && !loading) {
      console.log("Admin authenticated, redirecting to dashboard");
      // Try Next.js navigation first
      router.push('/admin/dashboard');
      
      // As a fallback, use direct navigation after a short delay
      setTimeout(() => {
        console.log("Fallback redirect to dashboard");
        window.location.href = '/admin/dashboard';
      }, 1000);
    }
  }, [isAuthenticated, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      // Add manual redirect and debugging
      console.log("Login successful, redirecting to dashboard");
      // Use both methods to ensure redirect works
      router.push('/admin/dashboard');
      window.location.href = '/admin/dashboard';
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full flex overflow-hidden flex-col md:flex-row">
        {/* Left Side - Admin Information */}
        <div className="p-8 w-full md:w-1/2 bg-teal-100 flex flex-col">
          <div className="mt-auto">
            <h2 className="text-2xl font-semibold text-gray-800 text-left">Admin Portal</h2>
            <p className="text-gray-600 text-left">Welcome to the MitraPonics admin dashboard</p>
          </div>

          <div className="flex-grow flex flex-col justify-center space-y-6 text-gray-700">
            <div className="flex items-center gap-3">
              <RiMailFill /> <span>admin@mitraponics.com</span>
            </div>
            <div className="flex items-center gap-3">
              <HiLocationMarker />
              <span>Jl. A. P. Pettarani No.4, Kota Makassar, Sulawesi Selatan</span>
            </div>
          </div>

          <div className="flex gap-4 mt-auto">
            <a href="#" className="border border-gray-400 rounded-full p-2 text-gray-600 hover:text-black">
              <Facebook size={20} />
            </a>
            <a href="#" className="border border-gray-400 rounded-full p-2 text-gray-600 hover:text-black">
              <Instagram size={20} />
            </a>
            <a href="#" className="border border-gray-400 rounded-full p-2 text-gray-600 hover:text-black">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-8 w-full md:w-1/2 bg-white">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Admin Login</h2>
          <p className="text-gray-500 text-center mb-6">
            Please enter your credentials to access the admin dashboard
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full p-2 border-b border-gray-300 outline-none focus:border-black ${
                  errors.email ? 'border-red-300' : ''
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full p-2 border-b border-gray-300 outline-none focus:border-black ${
                  errors.password ? 'border-red-300' : ''
                }`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.submit}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-teal-200 text-gray-700 py-2 rounded-lg hover:bg-teal-300 transition ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-center mt-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-black">
                Return to store
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
} 