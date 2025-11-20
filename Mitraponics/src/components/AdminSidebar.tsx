"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiDashboardLine } from "react-icons/ri";
import { BiStore } from "react-icons/bi";
import { FiPackage, FiUsers, FiLogOut } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="fixed left-0 top-0 h-screen w-80 bg-white shadow-md flex flex-col p-8 border-r transition-all duration-300 ease-in-out">
      {/* Logo */}
      <div className="text-2xl font-bold mb-12">MITRAPONICS ADMIN</div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-6">
        <Link
          href="/admin/dashboard"
          className={`font-medium p-3 rounded-lg text-lg ${
            pathname === "/admin/dashboard" 
              ? "bg-teal-100 text-black" 
              : "text-gray-500 hover:bg-gray-100"
          } transition-all duration-200 ease-in-out flex items-center gap-2`}
        >
          <RiDashboardLine size={20} />
          <span>Dashboard</span>
        </Link>
        
        <Link
          href="/admin/products"
          className={`font-medium p-3 rounded-lg text-lg ${
            pathname.startsWith("/admin/products") 
              ? "bg-teal-100 text-black" 
              : "text-gray-500 hover:bg-gray-100"
          } transition-all duration-200 ease-in-out flex items-center gap-2`}
        >
          <BiStore size={20} />
          <span>Products</span>
        </Link>
        
        <Link
          href="/admin/orders"
          className={`font-medium p-3 rounded-lg text-lg ${
            pathname.startsWith("/admin/orders") 
              ? "bg-teal-100 text-black" 
              : "text-gray-500 hover:bg-gray-100"
          } transition-all duration-200 ease-in-out flex items-center gap-2`}
        >
          <FiPackage size={20} />
          <span>Orders</span>
        </Link>
        
        <Link
          href="/admin/users"
          className={`font-medium p-3 rounded-lg text-lg ${
            pathname.startsWith("/admin/users") 
              ? "bg-teal-100 text-black" 
              : "text-gray-500 hover:bg-gray-100"
          } transition-all duration-200 ease-in-out flex items-center gap-2`}
        >
          <FiUsers size={20} />
          <span>Users</span>
        </Link>
      </div>

      {/* Logout button at the bottom */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-full font-medium p-3 rounded-lg text-lg text-gray-500 hover:bg-gray-100 transition-all duration-200 ease-in-out flex items-center gap-2"
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default AdminSidebar; 