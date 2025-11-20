"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersApi } from '@/services/api';

export default function OrderConfirmation() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState({
    orderId: '',
    orderNumber: '',
    date: new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    total: 0,
    items: 0,
    paymentMethod: 'cod'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order details from localStorage
    const orderId = localStorage.getItem('lastOrderId');
    const orderNumber = localStorage.getItem('orderNumber');
    const orderTotal = parseFloat(localStorage.getItem('orderTotal') || '0');
    const paymentMethod = localStorage.getItem('paymentMethod') || 'cod';
    
    if (orderId && orderNumber) {
      // Try to fetch the order details from the API
      const fetchOrderDetails = async () => {
        try {
          const response = await ordersApi.getOne(parseInt(orderId));
          if (response && response.data) {
            const order = response.data;
            const itemCount = order.items && Array.isArray(order.items) 
              ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) 
              : 0;
            
            setOrderDetails({
              orderId: orderId,
              orderNumber: order.order_number || orderNumber,
              date: order.created_at 
                ? new Date(order.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : new Date().toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }),
              total: typeof order.total === 'number' ? order.total : orderTotal,
              items: itemCount,
              paymentMethod: order.payment_method || paymentMethod
            });
    } else {
            throw new Error('Invalid response data');
          }
        } catch (error) {
          console.error('Error fetching order details:', error);
          // If API fails, use the data from localStorage
          setOrderDetails({
            orderId: orderId || '',
            orderNumber: orderNumber || `ORD-${Date.now()}`,
            date: new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
            }),
            total: orderTotal || 0,
            items: 0,
            paymentMethod: paymentMethod || 'cod'
          });
        } finally {
          setLoading(false);
        }
      };
      
      fetchOrderDetails();
    } else {
      // If no order ID is found, use a fallback
      setOrderDetails({
        orderId: '',
        orderNumber: orderNumber || `ORD-${Math.floor(100000000 + Math.random() * 900000000).toString()}`,
        date: new Date().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        total: orderTotal || 0,
        items: 0,
        paymentMethod: paymentMethod || 'cod'
      });
      setLoading(false);
    }
    
    // Clear localStorage items after retrieving them
    localStorage.removeItem('lastOrderId');
    localStorage.removeItem('orderNumber');
    localStorage.removeItem('orderTotal');
      localStorage.removeItem('paymentMethod');
  }, []);

  // Helper function to format payment method text
  const formatPaymentMethod = (method: string) => {
    if (method === 'cod') return 'Cash on Delivery (COD)';
    if (method === 'card') return 'Credit Card';
    return method;
  };

  // Safe number formatting function
  const formatCurrency = (amount: number) => {
    try {
      return amount.toLocaleString('id-ID');
    } catch (error) {
      return '0';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="rounded-full bg-green-100 p-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 text-green-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
          
          {/* Thank you message */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Thank You For Your Order!
            </h1>
            <p className="text-lg text-gray-600">
              We've received your order and will begin processing it right away.
            </p>
          </div>
          
          {/* Order Details */}
          <div className="border border-gray-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-medium">#{orderDetails.orderNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{orderDetails.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium">Rp {formatCurrency(orderDetails.total)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Items</p>
                <p className="font-medium">{orderDetails.items || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{formatPaymentMethod(orderDetails.paymentMethod)}</p>
              </div>
            </div>
          </div>
          
          {/* Next Steps */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">What Happens Next?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>You'll receive an email confirmation shortly</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>We'll process your order within 1-2 business days</span>
              </li>
              {orderDetails.paymentMethod === 'cod' && (
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Payment will be collected upon delivery</span>
                </li>
              )}
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>You'll receive tracking information once your order ships</span>
              </li>
            </ul>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/order-history">
              <button className="w-full sm:w-auto bg-gray-200 text-gray-800 hover:bg-gray-300 py-3 px-8 rounded-full font-medium transition">
                View Your Orders
              </button>
            </Link>
            <Link href="/products">
              <button className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 py-3 px-8 rounded-full font-medium transition">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 