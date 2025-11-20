import React from 'react';
import { Package, Phone, Flower } from 'lucide-react'; // Using lucide-react for icons

export default function AboutUs() {
  return (
    <section className="text-center py-16">
      <h2 className="text-3xl font-bold mb-2">About us</h2>
      <p className="text-gray-500 mb-10">Order now and appreciate the beauty of nature</p>

      <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
        {/* Large Assortment */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-teal-100 rounded-full w-20 h-20 flex items-center justify-center">
            <Flower size={32} />
          </div>
          <h3 className="font-bold">Large Assortment</h3>
          <p className="text-gray-500 text-sm">
            we offer many different types of products with fewer variations in each category.
          </p>
        </div>

        {/* Fast Shipping */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-teal-100 rounded-full w-20 h-20 flex items-center justify-center">
            <Package size={32} />
          </div>
          <h3 className="font-bold">Fast Shipping</h3>
          <p className="text-gray-500 text-sm">
            4-day or less delivery time and an expedited delivery option.
          </p>
        </div>

        {/* 24/7 Support */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-teal-100 rounded-full w-20 h-20 flex items-center justify-center">
            <Phone size={32} />
          </div>
          <h3 className="font-bold">24/7 Support</h3>
          <p className="text-gray-500 text-sm">
            answers to any business related inquiry 24/7 and in real-time.
          </p>
        </div>
      </div>
    </section>
  );
}
