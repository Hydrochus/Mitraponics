"use client";
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useCart } from './CartContext'; // Import our cart hook
import { useRouter } from 'next/navigation';

export default function Cart() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Use the cart context but don't render based on it until client-side
  const { cartItems, updateQuantity, removeItem, saveForLater } = useCart();

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate cart values (can do this even if not yet mounted)
  const subtotal = cartItems.reduce((total, item) => {
    return total + (Number(item.product.price) * item.quantity);
  }, 0);

  const shipping = cartItems.length > 0 ? 5.99 : 0;
  const taxRate = 0.07;
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  return (
    <div>
      <Head>
        <title>Your Cart | MITRAPONICS</title>
        <meta name="description" content="Review your cart items" />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>

        {!mounted ? (
          // Server-side and initial client render - show a loading state
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Loading cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          // Empty cart state - only shown after mounted
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
            <a href="/products">
              <button className="bg-black text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800">
                Discover items
              </button>
            </a>
          </div>
        ) : (
          // Populated cart - only shown after mounted
          <div className="flex flex-col md:flex-row gap-8">
            {/* Main cart section */}
            <div className="md:w-2/3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-6 flex justify-between">
                  <span>{cartItems.length} item{cartItems.length !== 1 && 's'} in your cart</span>
                  <span className="text-gray-600 text-base font-normal">Recently added</span>
                </h2>

                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-6 flex flex-col sm:flex-row">
                      {/* Product image */}
                      <div className="sm:w-24 h-24 flex-shrink-0 mb-4 sm:mb-0">
                        <div className="relative h-24 w-24 rounded-md overflow-hidden">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.title}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                          />
                        </div>
                      </div>

                      {/* Product details */}
                      <div className="sm:ml-6 flex-1">
                        <div className="flex flex-col sm:flex-row justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-800">{item.product.title}</h3>
                            <p className="text-sm text-gray-500">From {item.product.seller || 'MITRAPONICS'}</p>

                            {/* Options display */}
                            {item.product.options && Object.entries(item.product.options).map(([key, value]) => (
                              <p key={key} className="text-sm text-gray-600">
                                {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                              </p>
                            ))}

                            {/* Personalization if applicable */}
                            {item.product.personalizable && (
                              <p className="text-sm text-gray-600 mt-1">
                                Personalization: <span className="font-medium">{item.personalization}</span>
                              </p>
                            )}
                          </div>
                          <div className="text-right mt-2 sm:mt-0">
                            <p className="text-lg font-medium text-gray-800">Rp {Number(item.product.price).toLocaleString('id-ID')}</p>
                          </div>
                        </div>

                        {/* Quantity and actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-gray-300 rounded w-32">
                            <button
                              className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <input
                              type="text"
                              className="w-full text-center border-none focus:outline-none"
                              value={item.quantity}
                              readOnly
                            />
                            <button
                              className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <div className="text-sm text-gray-600 space-x-4">
                            <button
                              className="hover:text-black hover:underline"
                              onClick={() => saveForLater(item.id)}
                            >
                              Save for later
                            </button>
                            <button
                              className="hover:text-black hover:underline"
                              onClick={() => removeItem(item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="md:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({cartItems.length}):</span>
                    <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">Rp {shipping.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Estimated tax:</span>
                    <span className="font-medium">Rp {tax.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <button 
                  className="w-full bg-black text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800 mb-4"
                  onClick={() => router.push('/checkout')}
                >
                  Proceed to checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}