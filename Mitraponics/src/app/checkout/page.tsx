"use client";

import React, { useState } from 'react';
import { useCart } from '@/components/CartContext';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/services/api';

export default function Checkout() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const [formData, setFormData] = useState({
    fullName: '',
    province: '',
    city: '',
    district: '',
    postCode: '',
    detailedAddress: '',
    email: '',
    country: 'Indonesia',
    paymentMethod: 'cod', // Default to COD
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
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
    
    // Basic validation
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.postCode) newErrors.postCode = 'Post code is required';
    if (!formData.detailedAddress) newErrors.detailedAddress = 'Address is required';
    if (!formData.email) newErrors.email = 'Email is required';
    
    // Only validate card details if card payment is selected
    if (formData.paymentMethod === 'card') {
    if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
    if (!formData.cardName) newErrors.cardName = 'Card name is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.cvv) newErrors.cvv = 'CVV is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Check if cart is empty
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items to your cart before checking out.');
      router.push('/products');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order in the backend
      const orderData = {
        customer_name: formData.fullName,
        email: formData.email,
        province: formData.province,
        city: formData.city,
        district: formData.district,
        post_code: formData.postCode,
        detailed_address: formData.detailedAddress,
        payment_method: formData.paymentMethod
      };
      
      const response = await ordersApi.create(orderData);
      
      // Store order info for confirmation page if response data exists
      if (response && response.data) {
        const order = response.data;
        
        // Store values with null checks
        if (order.id !== undefined) {
          localStorage.setItem('lastOrderId', String(order.id));
        }
        
        if (order.order_number) {
          localStorage.setItem('orderNumber', order.order_number);
        }
        
        if (order.total !== undefined) {
          localStorage.setItem('orderTotal', String(order.total));
        }
        
        localStorage.setItem('paymentMethod', formData.paymentMethod);
      } else {
        // If response data is missing, store minimal information
        const timestamp = Date.now();
        localStorage.setItem('orderNumber', `ORD-${timestamp}`);
        localStorage.setItem('orderTotal', String(subtotal + shipping + tax));
      localStorage.setItem('paymentMethod', formData.paymentMethod);
      }
      
      // Clear the cart
      await clearCart();
      
      // Trigger event to update order history
      localStorage.setItem('orderUpdated', 'true');
      window.dispatchEvent(new Event('storage'));
      
      // Navigate to order confirmation
      router.push('/order-confirmation');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('There was an error processing your order. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Calculate order total
  const subtotal = cartItems.reduce((total, item) => 
    total + (Number(item.product.price) * item.quantity), 0);
  const shipping = 15000; // Rp 15,000 shipping cost
  const tax = subtotal * 0.11; // 11% tax for Indonesia
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Shipping and Payment Form */}
          <div className="lg:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.province ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.district ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Post Code</label>
                    <input
                      type="text"
                      name="postCode"
                      value={formData.postCode}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.postCode ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.postCode && <p className="text-red-500 text-sm mt-1">{errors.postCode}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Address (Street, Building, House No.)</label>
                    <textarea
                      name="detailedAddress"
                      value={formData.detailedAddress}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md ${errors.detailedAddress ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.detailedAddress && <p className="text-red-500 text-sm mt-1">{errors.detailedAddress}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      disabled
                    >
                      <option value="Indonesia">Indonesia</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
                
                {/* Payment Method Selection */}
                <div className="mb-6">
                <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="payment-cod"
                        name="paymentMethod"
                        type="radio"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleChange}
                        className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300"
                      />
                      <label htmlFor="payment-cod" className="ml-3 block text-base font-medium text-gray-700">
                        Cash on Delivery (COD)
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="payment-card"
                        name="paymentMethod"
                        type="radio"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                        className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300"
                      />
                      <label htmlFor="payment-card" className="ml-3 block text-base font-medium text-gray-700">
                        Credit Card
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Credit Card Form - Only show if card payment is selected */}
                {formData.paymentMethod === 'card' && (
                  <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                        placeholder="**** **** **** ****"
                      className={`w-full px-3 py-2 border rounded-md ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                  </div>
                    
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.cardName ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                  </div>
                    
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className={`w-full px-3 py-2 border rounded-md ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                          placeholder="***"
                        className={`w-full px-3 py-2 border rounded-md ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
              <button
                type="submit"
                  disabled={isSubmitting}
                  className={`bg-black text-white py-3 px-8 rounded-full font-medium hover:bg-gray-800 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Cart items */}
              <div className="space-y-4 mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-gray-200 rounded-md w-12 h-12 flex items-center justify-center overflow-hidden mr-3">
                        {item.product.images && item.product.images[0] && (
                          <img src={item.product.images[0]} alt={item.product.title} className="object-cover h-full w-full" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.product.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm">Rp {(Number(item.product.price) * item.quantity).toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Rp {shipping.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (11%)</span>
                  <span>Rp {tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t mt-2 font-semibold">
                    <span>Total</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}