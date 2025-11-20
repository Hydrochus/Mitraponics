"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Facebook, Instagram, Twitter } from "lucide-react";
import { RiMailFill } from "react-icons/ri";
import { HiLocationMarker } from "react-icons/hi";

export default function AdminRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      router.push('/admin/login');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Registration failed' });
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
            <p className="text-gray-600 text-left">Create a new admin account</p>
          </div>

          <div className="flex-grow flex flex-col justify-center space-y-6 text-gray-700">
            <div className="flex items-center gap-3">
              <RiMailFill /> <span>admin@mitraponics.com</span>
            </div>
            <div className="flex items-center gap-3">
              <HiLocationMarker />
              <span>132 Dartmouth Street, Boston, MA 02156, USA</span>
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
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Admin Registration</h2>
          <p className="text-gray-500 text-center mb-6">
            Create a new admin account to access the dashboard
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
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full p-2 border-b border-gray-300 outline-none focus:border-black ${
                  errors.confirmPassword ? 'border-red-300' : ''
                }`}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
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
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="text-center mt-4">
              <Link href="/admin/login" className="text-sm text-gray-600 hover:text-black">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
} 