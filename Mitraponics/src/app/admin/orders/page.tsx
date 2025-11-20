"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  order_number: string;
  user_id: number | null;
  customer_name: string;
  email: string;
  province: string;
  city: string;
  district: string;
  post_code: string;
  detailed_address: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  items: {
    id: number;
    order_id: number;
    product_id: number;
    product_name: string;
    price: number;
    quantity: number;
    personalization?: string;
    selected_options?: Record<string, string>;
    product: {
      title: string;
      images: string[];
    };
  }[];
}

export default function AdminOrders() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

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
    // Only fetch orders if authenticated
    if (isAuthenticated) {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/orders', {
          headers: {
              'Authorization': `Bearer ${getAdminToken()}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders);
          } else {
            console.error('Failed to fetch orders:', response.status);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
          setLoadingOrders(false);
      }
    };

    fetchOrders();
    }
  }, [isAuthenticated]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        const errorData = await response.json();
        console.error('Failed to update order status:', errorData);
        alert('Failed to update order status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('An error occurred while updating the order status.');
    }
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Helper function to format payment method
  const formatPaymentMethod = (method: string) => {
    if (method === 'cod') return 'Cash on Delivery (COD)';
    if (method === 'card') return 'Credit Card';
    return method;
  };

  // Helper function to get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      setDeletingOrderId(orderId);
      const response = await fetch(`http://localhost:8000/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        setOrders(orders.filter(order => order.id !== orderId));
        setShowDeleteModal(false);
        setSelectedOrderId(null);
      } else {
        const errorData = await response.json();
        console.error('Failed to delete order:', errorData);
        alert('Failed to delete order. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('An error occurred while deleting the order.');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const openDeleteModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowDeleteModal(true);
  };

  // Show loading or redirect if not authenticated
  if (loading || !isAuthenticated) {
    return <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <p className="text-lg text-gray-600">Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Delete Order</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this order? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedOrderId(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                onClick={() => selectedOrderId && handleDeleteOrder(selectedOrderId)}
                disabled={deletingOrderId === selectedOrderId}
              >
                {deletingOrderId === selectedOrderId ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Orders</h2>
            
            {loadingOrders ? (
            <div className="text-center py-10 text-lg">Loading orders...</div>
            ) : orders.length === 0 ? (
            <div className="text-center py-10 text-lg">No orders found</div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Order Header */}
                  <div 
                    className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer"
                    onClick={() => toggleOrderDetails(order.id)}
                  >
                      <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-semibold">{order.order_number}</h3>
                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div className="mt-3 md:mt-0 flex flex-col md:flex-row md:items-center gap-3">
                      <span className="text-xl font-semibold">Rp {order.total.toLocaleString('id-ID')}</span>
                      <select
                        value={order.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {order.status === 'cancelled' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(order.id);
                          }}
                          className="px-3 py-2 text-red-600 hover:text-red-800 font-medium"
                          disabled={deletingOrderId === order.id}
                        >
                          {deletingOrderId === order.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                    </div>
                    
                  {/* Order Details */}
                  {expandedOrder === order.id && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Customer Information */}
                        <div>
                          <h4 className="text-lg font-semibold mb-3">Customer Information</h4>
                          <dl className="grid grid-cols-1 gap-3 text-sm">
                            <div>
                              <dt className="font-medium text-gray-500">Name:</dt>
                              <dd>{order.customer_name}</dd>
                            </div>
                            <div>
                              <dt className="font-medium text-gray-500">Email:</dt>
                              <dd>{order.email}</dd>
                            </div>
                            <div>
                              <dt className="font-medium text-gray-500">Payment Method:</dt>
                              <dd>{formatPaymentMethod(order.payment_method)}</dd>
                            </div>
                          </dl>
                        </div>

                        {/* Shipping Address */}
                        <div>
                          <h4 className="text-lg font-semibold mb-3">Shipping Address</h4>
                          <dl className="grid grid-cols-1 gap-3 text-sm">
                            <div>
                              <dt className="font-medium text-gray-500">Address:</dt>
                              <dd>{order.detailed_address}</dd>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <dt className="font-medium text-gray-500">District:</dt>
                                <dd>{order.district}</dd>
                              </div>
                              <div>
                                <dt className="font-medium text-gray-500">City:</dt>
                                <dd>{order.city}</dd>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <dt className="font-medium text-gray-500">Province:</dt>
                                <dd>{order.province}</dd>
                              </div>
                              <div>
                                <dt className="font-medium text-gray-500">Post Code:</dt>
                                <dd>{order.post_code}</dd>
                              </div>
                            </div>
                          </dl>
                        </div>
                      </div>

                      {/* Order Items */}
                      <h4 className="text-lg font-semibold mb-3">Order Items</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="py-3 px-4">Product</th>
                              <th className="py-3 px-4">Quantity</th>
                              <th className="py-3 px-4">Price</th>
                              <th className="py-3 px-4">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {order.items.map((item) => (
                              <tr key={item.id}>
                                <td className="py-3 px-4 flex items-center">
                                  {item.product && item.product.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                                      alt={item.product_name}
                                      className="w-12 h-12 object-cover rounded-md mr-3"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded-md mr-3 flex items-center justify-center">
                                      <span className="text-xs text-gray-500">No image</span>
                                    </div>
                                  )}
                                  <span>{item.product_name}</span>
                                </td>
                                <td className="py-3 px-4 text-center">{item.quantity}</td>
                                <td className="py-3 px-4 text-right">Rp {item.price.toLocaleString('id-ID')}</td>
                                <td className="py-3 px-4 text-right">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Order Summary */}
                      <div className="mt-6 border-t border-gray-200 pt-6">
                        <div className="flex justify-end">
                          <dl className="text-sm space-y-2 text-right">
                            <div className="flex justify-between">
                              <dt className="font-medium text-gray-500 mr-10">Subtotal:</dt>
                              <dd className="font-medium">Rp {order.subtotal.toLocaleString('id-ID')}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium text-gray-500 mr-10">Shipping:</dt>
                              <dd className="font-medium">Rp {order.shipping.toLocaleString('id-ID')}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium text-gray-500 mr-10">Tax:</dt>
                              <dd className="font-medium">Rp {order.tax.toLocaleString('id-ID')}</dd>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                              <dt className="text-gray-900 mr-10">Total:</dt>
                              <dd className="text-gray-900">Rp {order.total.toLocaleString('id-ID')}</dd>
                          </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                ))}
              </div>
            )}
        </div>
      </main>
    </div>
  );
} 