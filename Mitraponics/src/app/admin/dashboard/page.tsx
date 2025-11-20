"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RiMailFill } from "react-icons/ri";
import { HiLocationMarker } from "react-icons/hi";
import { Facebook, Instagram, Twitter } from "lucide-react";

interface Order {
  id: number;
  status: string;
  total: number;
}

interface DashboardStats {
  productCount: number;
  orderCount: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    productCount: 0,
    orderCount: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  // Helper function to get admin token
  const getAdminToken = () => {
    // Try to get from cookies first (the secure way)
    const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1];
    // Fall back to localStorage if not in cookies
    return token || localStorage.getItem('adminToken') || '';
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch products count
        const productsResponse = await fetch('http://localhost:8000/api/products');
        const productsData = await productsResponse.json();
        
        // Fetch orders
        const ordersResponse = await fetch('http://localhost:8000/api/admin/orders', {
          headers: {
            'Authorization': `Bearer ${getAdminToken()}`,
            'Accept': 'application/json',
          },
        });
        const ordersData = await ordersResponse.json();
        
        // Calculate total revenue from orders
        let totalRevenue = 0;
        if (ordersData.orders && Array.isArray(ordersData.orders)) {
          totalRevenue = ordersData.orders.reduce((sum: number, order: Order) => {
            // Only count completed orders (delivered status) for revenue
            if (order.status === 'delivered') {
              return sum + Number(order.total || 0);
            }
            return sum;
          }, 0);
        }
        
        setStats({
          productCount: productsData.length || 0,
          orderCount: ordersData.orders?.length || 0,
          totalRevenue: totalRevenue
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Dashboard Overview */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-teal-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800">Total Products</h3>
                {loading ? (
                  <p className="text-3xl font-bold mt-2 text-gray-400">Loading...</p>
                ) : (
                  <p className="text-3xl font-bold mt-2 text-gray-700">{stats.productCount}</p>
                )}
              </div>
              <div className="bg-teal-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800">Total Orders</h3>
                {loading ? (
                  <p className="text-3xl font-bold mt-2 text-gray-400">Loading...</p>
                ) : (
                  <p className="text-3xl font-bold mt-2 text-gray-700">{stats.orderCount}</p>
                )}
              </div>
              <div className="bg-teal-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800">Total Revenue</h3>
                {loading ? (
                  <p className="text-3xl font-bold mt-2 text-gray-400">Loading...</p>
                ) : (
                  <p className="text-3xl font-bold mt-2 text-gray-700">Rp {Number(stats.totalRevenue).toLocaleString('id-ID')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/products" className="block">
                <button className="w-full bg-teal-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-teal-300 transition text-center">
                  Manage Products
                </button>
              </Link>
              <Link href="/admin/orders" className="block">
                <button className="w-full bg-teal-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-teal-300 transition text-center">
                  View Orders
                </button>
              </Link>
              <Link href="/admin/users" className="block">
                <button className="w-full bg-teal-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-teal-300 transition text-center">
                  Users Management
                </button>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 bg-teal-100 rounded-lg shadow-lg p-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
                <div className="mt-2 space-y-2 text-gray-700">
                  <div className="flex items-center gap-2">
                    <RiMailFill />
                    <span>admin@mitraponics.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiLocationMarker />
                    <span>Jl. A. P. Pettarani No. 12, Kota Makassar, Sulawesi Selatan, Indonesia</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
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
          </div>
        </div>
      </main>
    </div>
  );
} 