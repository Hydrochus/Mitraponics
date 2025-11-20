"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserAuth } from '@/context/UserAuthContext';
import { AxiosError } from 'axios';
import { ordersApi } from '@/services/api';

interface OrderItem {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  items: OrderItem[];
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'pending';
  payment_method: string;
}

// Define the structure of the response from the API
interface OrderResponse {
  orders: Order[];
}

export default function OrderHistory() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useUserAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  // Redirect to login only if authentication check is complete and user is not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/order-history');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch orders when authenticated or token is available
  useEffect(() => {
    // Only fetch orders if authentication is complete and successful
    if (!loading && isAuthenticated) {
      // Function to fetch orders from backend
      const fetchOrders = async () => {
        setPageLoading(true);
        try {
          const token = getAuthToken();
          console.log('Using auth token for order history:', token ? 'Token exists' : 'No token');
          
          if (!token) {
            console.error('No auth token available, cannot fetch orders');
            setOrders([]);
            setPageLoading(false);
            return;
          }
          
          const response = await ordersApi.getAll();
          
          if (response.status === 200) {
            // Cast the response to the correct type
            const orderData = response.data as unknown as OrderResponse;
            setOrders(orderData.orders || []);
            console.log(`Fetched ${orderData.orders?.length || 0} orders for user ID: ${user?.id}`);
          } else {
            console.error('Failed to fetch orders:', response.status);
            setOrders([]);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
          setOrders([]);
        }
        setPageLoading(false);
      };
      
      // Add event listener for storage changes
      const handleStorageChange = () => {
        if (localStorage.getItem('orderUpdated')) {
          fetchOrders();
          localStorage.removeItem('orderUpdated');
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      fetchOrders(); // Call fetchOrders directly in the outer useEffect
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    } else if (!loading && !isAuthenticated) {
      // If auth check is done and user is not authenticated, clear orders and stop local loading.
      setOrders([]);
      setPageLoading(false);
    }
  }, [isAuthenticated, loading, user]); // Added user to dependencies to refetch on user change

  // Helper function to get the auth token
  const getAuthToken = () => {
    const cookieToken = document.cookie.split('; ').find(row => row.startsWith('userToken='))?.split('=')[1];
    return cookieToken || localStorage.getItem('userToken');
  };

  // Show loading state if authentication is still being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Order History</h1>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Function to determine the status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to format payment method
  const formatPaymentMethod = (method: string) => {
    if (method === 'cod') return 'Cash on Delivery';
    if (method === 'card') return 'Credit Card';
    return method;
  };

  // Function to format date from ISO format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to count total items in an order
  const countItems = (items: OrderItem[]) => {
    return items ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  };

  // Function to open cancel modal for a specific order
  const openCancelModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCancelReason('');
    setOtherReason('');
    setShowCancelModal(true);
  };

  // Function to handle order cancellation
  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    
    // Validate reason
    if (!cancelReason) {
      alert('Please select a reason for cancellation');
      return;
    }
    
    if (cancelReason === 'other' && !otherReason.trim()) {
      alert('Please provide details for your cancellation reason');
      return;
    }
    
    try {
      setCancelingOrderId(selectedOrderId);
      const finalReason = cancelReason === 'other' ? otherReason : cancelReason;
      const response = await ordersApi.cancelOrder(parseInt(selectedOrderId), finalReason);
      
      if (response && response.data) {
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === selectedOrderId 
              ? { ...order, status: 'cancelled' } 
              : order
          )
        );
        
        // Close modal and show success message
        setShowCancelModal(false);
        alert('Order cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      let errorMsg = 'Failed to cancel order. Please try again.';
      
      try {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          // The server responded with an error status
          errorMsg += ` Server response: ${JSON.stringify(axiosError.response.data || {})}`;
          console.log('Error response data:', axiosError.response.data);
          console.log('Error response status:', axiosError.response.status);
        } else if (axiosError.request) {
          // The request was made but no response received
          errorMsg += ' No response received from server. Please check your internet connection.';
        } else {
          // Something happened in setting up the request
          errorMsg += ` ${axiosError.message}`;
        }
      } catch (jsonParseError) {
        console.error('Error parsing error details:', jsonParseError);
        errorMsg += ' Error parsing error details.';
      }
      
      alert(errorMsg);
    } finally {
      setCancelingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-4">
              Please tell us why you&apos;re cancelling this order:
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="reason-mistake" 
                  name="cancelReason"
                  value="Ordered by mistake"
                  checked={cancelReason === "Ordered by mistake"}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mr-3"
                />
                <label htmlFor="reason-mistake">Ordered by mistake</label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="reason-shipping" 
                  name="cancelReason"
                  value="Shipping takes too long"
                  checked={cancelReason === "Shipping takes too long"}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mr-3"
                />
                <label htmlFor="reason-shipping">Shipping takes too long</label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="reason-price" 
                  name="cancelReason"
                  value="Found a better price elsewhere"
                  checked={cancelReason === "Found a better price elsewhere"}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mr-3"
                />
                <label htmlFor="reason-price">Found a better price elsewhere</label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="reason-payment" 
                  name="cancelReason"
                  value="Payment issues"
                  checked={cancelReason === "Payment issues"}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mr-3"
                />
                <label htmlFor="reason-payment">Payment issues</label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="reason-other" 
                  name="cancelReason"
                  value="other"
                  checked={cancelReason === "other"}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mr-3"
                />
                <label htmlFor="reason-other">Other reason</label>
              </div>
              
              {cancelReason === 'other' && (
                <div className="ml-6 mt-2">
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Please specify your reason..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowCancelModal(false)}
              >
                Nevermind
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                onClick={handleCancelOrder}
                disabled={cancelingOrderId === selectedOrderId}
              >
                {cancelingOrderId === selectedOrderId ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Order History</h1>
        
        {pageLoading ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-6">You haven&apos;t placed any orders yet.</p>
            <Link href="/products">
              <button className="bg-black text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800">
                Start shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.order_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rp {order.total.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {countItems(order.items)} {countItems(order.items) === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPaymentMethod(order.payment_method)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/order-details/${order.id}`} className="text-teal-600 hover:text-teal-900 mr-4">
                          View
                        </Link>
                        {order.status === 'processing' && (
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => openCancelModal(order.id)}
                            disabled={cancelingOrderId === order.id}
                          >
                            {cancelingOrderId === order.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}