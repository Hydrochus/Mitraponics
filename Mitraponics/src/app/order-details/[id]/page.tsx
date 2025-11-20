"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { ordersApi } from '@/services/api';

interface OrderItem {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  product: {
    id: number;
    images: string[];
  };
}

interface Order {
  id: number;
  order_number: string;
  created_at: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: OrderItem[];
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'pending';
  payment_method: string;
  customer_name: string;
  province: string;
  city: string;
  district: string;
  detailed_address: string;
  post_code: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export default function OrderDetails() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      
      try {
        const response = await axios.get(`http://localhost:8000/api/orders/${params.id}`);
        
        if (response.status === 200) {
          const orderData = response.data;
          
          // Add tracking info for shipped orders - in a real app, this would come from the backend
          if (orderData.status === 'shipped') {
            orderData.trackingNumber = 'JNE' + Math.floor(1000000000 + Math.random() * 9000000000);
            orderData.estimatedDelivery = new Date(new Date().getTime() + (3 * 24 * 60 * 60 * 1000))
              .toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
          }
          
          setOrder(orderData);
        } else {
          console.error('Failed to fetch order:', response.status);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
      
      setLoading(false);
    };

    fetchOrderDetails();
  }, [params.id]);

  // Function to determine status badge color
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

  // Function to handle order cancellation
  const handleCancelOrder = async () => {
    if (!order) return;
    
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
      setCanceling(true);
      const finalReason = cancelReason === 'other' ? otherReason : cancelReason;
      console.log('Attempting to cancel order with ID:', order.id, 'and reason:', finalReason);
      
      const response = await ordersApi.cancelOrder(order.id, finalReason);
      
      if (response && response.data) {
        console.log('Successfully cancelled order, API response:', response.data);
        
        // Update the order status in local state
        setOrder({
          ...order,
          status: 'cancelled'
        });
        
        // Trigger refresh of order history
        localStorage.setItem('orderUpdated', 'true');
        window.dispatchEvent(new Event('storage'));
        
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
      } catch (jsonError) {
        errorMsg += ' Error parsing error details.';
      }
      
      alert(errorMsg);
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
            <Link href="/order-history">
              <button className="bg-black text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800">
                Back to Order History
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-4">
              Please tell us why you're cancelling this order:
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
                disabled={canceling}
              >
                {canceling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
          <Link href="/order-history">
            <button className="text-teal-600 hover:text-teal-800 font-medium">
              &larr; Back to Order History
            </button>
          </Link>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Order #{order.order_number}</h2>
              <p className="text-gray-600 mt-1">Placed on {formatDate(order.created_at)}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          {order.trackingNumber && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Tracking Information</h3>
              <p className="text-gray-600">Tracking Number: <span className="font-semibold">{order.trackingNumber}</span></p>
              {order.estimatedDelivery && (
                <p className="text-gray-600 mt-1">Estimated Delivery: <span className="font-semibold">{order.estimatedDelivery}</span></p>
              )}
              {order.status === 'shipped' && (
                <a 
                  href="#" 
                  className="inline-block mt-2 text-teal-600 hover:text-teal-800 font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('This would open the shipping carrier tracking page');
                  }}
                >
                  Track Package
                </a>
              )}
            </div>
          )}

          {/* Order items */}
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Items in Your Order</h3>
          <div className="border rounded-lg overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0 mr-4">
                          {item.product && item.product.images && item.product.images.length > 0 ? (
                            <img src={item.product.images[0]} alt={item.product_name} className="h-16 w-16 rounded-md object-cover" />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No image</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      Rp {(+item.price).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      Rp {(+item.price * item.quantity).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order totals */}
          <div className="border-t pt-4">
            <div className="flex justify-between my-2">
              <span className="text-gray-600">Subtotal</span>
              <span>Rp {(+order.subtotal).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between my-2">
              <span className="text-gray-600">Shipping</span>
              <span>Rp {(+order.shipping).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between my-2">
              <span className="text-gray-600">Tax</span>
              <span>Rp {(+order.tax).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between pt-4 border-t mt-4">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-semibold text-lg">Rp {(+order.total).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Shipping information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Shipping Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 font-medium">Customer:</p>
              <p className="text-gray-800">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Address:</p>
              <p className="text-gray-800">
                {order.detailed_address}<br />
                {order.district}, {order.city}<br />
                {order.province}, {order.post_code}
              </p>
            </div>
          </div>
        </div>

        {/* Payment information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Payment Information</h3>
          <div>
            <p className="text-gray-600 font-medium">Payment Method:</p>
            <p className="text-gray-800">{formatPaymentMethod(order.payment_method)}</p>
            {order.payment_method === 'card' && (
              <p className="text-gray-500 mt-1">Card ending in **** 1234</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <Link href="/order-history">
            <button className="w-full md:w-auto bg-black text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800">
              Back to Order History
            </button>
          </Link>
          {order.status === 'processing' && (
            <button 
              className="w-full md:w-auto bg-white border border-red-600 text-red-600 py-3 px-6 rounded-full font-medium hover:bg-red-50"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Order
            </button>
          )}
          <button 
            className="w-full md:w-auto bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-full font-medium hover:bg-gray-50"
            onClick={() => {
              window.print();
            }}
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
} 