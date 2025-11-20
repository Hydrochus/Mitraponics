"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, loading, router]);

  // Helper function to get admin token
  const getAdminToken = () => {
    // Try to get from cookies first (the secure way)
    const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1];
    // Fall back to localStorage if not in cookies
    return token || localStorage.getItem('adminToken') || '';
  };

  useEffect(() => {
    // Only fetch users if authenticated
    if (isAuthenticated) {
    const fetchUsers = async () => {
      try {
          console.log('Admin token:', getAdminToken()); // Debug token
          
        const response = await fetch('http://localhost:8000/api/admin/users', {
          headers: {
              'Authorization': `Bearer ${getAdminToken()}`,
            'Accept': 'application/json',
          },
        });

          console.log('Response status:', response.status); // Debug response status

        if (response.ok) {
          const data = await response.json();
            console.log('User data:', data); // Debug received data
            
            // Store all users for the add form
            if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
            }
          } else {
            // Handle non-OK responses
            const errorText = await response.text();
            console.error('Failed to fetch users. Status:', response.status, 'Response:', errorText);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
          setLoadingUsers(false);
      }
    };

    fetchUsers();
    }
  }, [isAuthenticated]);

  // Handle admin status toggle
  const handleAdminToggle = async (userId: number, currentStatus: boolean) => {
    try {
      setUpdatingUserId(userId);
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ is_admin: !currentStatus }),
      });

      if (response.ok) {
        // Update the user's admin status in the local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, is_admin: !currentStatus } : user
        ));
      } else {
        const errorText = await response.text();
        console.error('Failed to update user. Status:', response.status, 'Response:', errorText);
        alert('Failed to update user admin status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('An error occurred while updating the user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Show loading or redirect if not authenticated
  if (loading || !isAuthenticated) {
    return <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <p className="text-lg text-gray-600">Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">User Management</h2>
            
            {loadingUsers ? (
              <div className="text-center py-8">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className={user.is_admin ? "bg-teal-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleAdminToggle(user.id, user.is_admin)}
                            disabled={updatingUserId === user.id}
                            className={`px-3 py-1 rounded-md text-xs font-medium ${
                              user.is_admin 
                                ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {updatingUserId === user.id 
                              ? 'Updating...' 
                              : user.is_admin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 