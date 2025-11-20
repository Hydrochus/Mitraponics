"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserAuth } from '@/context/UserAuthContext';
import { Facebook, Instagram, Twitter } from "lucide-react";
import { RiMailFill } from "react-icons/ri";
import { HiLocationMarker } from "react-icons/hi";

export default function Register() {
  const router = useRouter();
  const { register, isAuthenticated, loading } = useUserAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing token and redirect if authenticated
  useEffect(() => {
    // First, explicitly clear any existing tokens when the register page is visited
    document.cookie = 'userToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('userToken');
    
    // If already authenticated and not still loading, redirect to account page
    if (isAuthenticated && !loading) {
      router.push('/account');
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
    
    if (!formData.name) newErrors.name = 'Name is required';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.password_confirmation) newErrors.password_confirmation = 'Please confirm your password';
    else if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await register(formData.name, formData.email, formData.password);
      // The redirect is handled in the register function
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      if (errorMessage.includes('email')) {
        setErrors({ email: 'This email is already in use' });
      } else {
        setErrors({ submit: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full flex overflow-hidden flex-col md:flex-row">
        {/* Left Side - Store Information */}
        <div className="p-8 w-full md:w-1/2 bg-teal-100 flex flex-col">
          <div className="mt-auto">
            <h2 className="text-2xl font-semibold text-gray-800 text-left">Join MitraPonics</h2>
            <p className="text-gray-600 text-left">Create your account and start shopping</p>
          </div>

          <div className="flex-grow flex flex-col justify-center space-y-6 text-gray-700">
            <div className="flex items-center gap-3">
              <RiMailFill /> <span>support@mitraponics.com</span>
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

        {/* Right Side - Registration Form */}
        <div className="p-8 w-full md:w-1/2 bg-white">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Create Account</h2>
          <p className="text-gray-500 text-center mb-6">
            Register to track orders and save your favorites
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full p-2 border-b border-gray-300 outline-none focus:border-black ${
                  errors.name ? 'border-red-300' : ''
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                className={`w-full p-2 border-b border-gray-300 outline-none focus:border-black ${
                  errors.password_confirmation ? 'border-red-300' : ''
                }`}
              />
              {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
            </div>

            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.submit}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-teal-200 text-black py-2 rounded-lg hover:bg-teal-300 transition ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-green-600 hover:underline">
                  Sign in
                </Link>
              </p>
              <Link href="/" className="text-sm text-gray-600 hover:text-black block">
                Return to store
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
} 