"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { productsApi, Product } from '@/services/api';
import ProductCard from './ProductCard';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.getAll();
        
        // Get the top 3 products (you can modify this logic based on what makes a product "best")
        // Here we just take the first 3 products
        const top3Products = response.data.slice(0, 3);
        setFeaturedProducts(top3Products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl m-6 p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="z-10 max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800">
            Panen Sehat
            <br />
            <span className="text-teal-600">Langsung Kerumah.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">Discover our carefully curated selection of fresh fruits and vegetables, delivered right to your doorstep.</p>
          <div className="flex items-center gap-4">
            <Link href="/products" className="bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-300 rounded-full px-8 py-3 font-medium">
              Shop Now
            </Link>
            <Link href="/about" className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2">
              Learn More →
            </Link>
          </div>
        </div>
        <div className="relative mt-8 md:mt-0">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-200 rounded-full filter blur-3xl opacity-30"></div>
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-teal-300 rounded-full filter blur-2xl opacity-20"></div>
          <img 
            src="assets/PlantFruit.png" 
            alt="Fresh Fruits and Vegetables" 
            className="relative z-10 h-80 md:h-96 object-contain transform hover:scale-105 transition-transform duration-300" 
          />
        </div>
      </section>

      {/* Best Selling Plants */}
      <section className="m-6">
        <h2 className="text-3xl font-bold mb-2">Best Selling</h2>
        <p className="text-gray-500 mb-6">Our best products!</p>

        {loading ? (
          <div className="text-center py-8">Loading best products...</div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-8">No products found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <Link href="/products" className="inline-block bg-teal-100 px-4 py-2 rounded-full font-medium m-2">
          See more →
        </Link>
      </section>
    </div>
  );
}
