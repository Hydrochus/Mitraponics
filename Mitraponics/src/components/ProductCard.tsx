"use client";

import React from 'react';
import Link from 'next/link';
import { Product } from '@/services/api';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  return (
    <Link href="/products" className={`block border rounded-xl p-4 text-center transition hover:shadow-lg ${className}`}>
      <div className="h-40 mb-4 overflow-hidden flex items-center justify-center">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.title} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No image</span>
          </div>
        )}
      </div>
      <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
      <p className="text-gray-500">Rp {Number(product.price).toLocaleString('id-ID')}</p>
    </Link>
  );
}