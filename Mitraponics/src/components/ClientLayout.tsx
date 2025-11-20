"use client";

import React from 'react';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';
import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';

function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if current page is a login/register page where sidebar should be hidden
  const hideNavigation = [
    '/admin/login',
    '/login',
    '/register'
  ].includes(pathname);

  // Check if we're on admin pages
  const isAdminPage = pathname === '/admin/dashboard' || 
                       pathname === '/admin/products' || 
                       pathname === '/admin/orders' ||
                       pathname === '/admin/users' ||
                       pathname.startsWith('/admin/products/') ||
                       pathname.startsWith('/admin/orders/') ||
                       pathname.startsWith('/admin/users/');

  return (
    <div className="flex">
      {!hideNavigation && (
        isAdminPage ? <AdminSidebar /> : <Sidebar />
      )}
      <div className={`flex-1 ${!hideNavigation ? 'ml-80' : ''} min-h-screen flex flex-col`}>
        <main className={`flex-1 ${!hideNavigation ? 'px-12 py-8' : 'p-0'}`}>{children}</main>
        {!hideNavigation && <Footer />}
      </div>
    </div>
  );
}

export default ClientLayout; 