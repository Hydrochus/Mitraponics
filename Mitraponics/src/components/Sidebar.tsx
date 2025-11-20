"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiShoppingCart } from "react-icons/fi";
import { MdHistory } from "react-icons/md";
import { FiHome } from "react-icons/fi";
import { BiStore } from "react-icons/bi";
import { FiUser } from "react-icons/fi";
import { useCart } from "./CartContext";
import { useUserAuth } from "@/context/UserAuthContext";

const Sidebar = () => {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const { isAuthenticated, loading } = useUserAuth();

  return (
    <nav className="fixed left-0 top-0 h-screen w-80 bg-white shadow-md flex flex-col p-8 border-r transition-all duration-300 ease-in-out">
      {/* Logo */}
      <div className="text-2xl font-bold mb-12">MITRAPONICS</div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-6">
        <Link
          href="/"
          className={`font-medium p-3 rounded-lg text-lg ${
            pathname === "/" 
              ? "bg-teal-100 text-black" 
              : "text-gray-500 hover:bg-gray-100"
          } transition-all duration-200 ease-in-out flex items-center gap-2`}
        >
          <FiHome size={20} />
          <span>Home</span>
        </Link>
        <Link
          href="/products"
          className={`font-medium p-3 rounded-lg text-lg ${
            pathname === "/products" 
              ? "bg-teal-100 text-black" 
              : "text-gray-500 hover:bg-gray-100"
          } transition-all duration-200 ease-in-out flex items-center gap-2`}
        >
          <BiStore size={20} />
          <span>Products</span>
        </Link>
        <Link
          href="/order-history"
          className={`font-medium p-3 rounded-lg text-lg ${
            pathname === "/order-history" 
              ? "bg-teal-100 text-black" 
              : "text-gray-500 hover:bg-gray-100"
          } transition-all duration-200 ease-in-out flex items-center gap-2`}
        >
          <MdHistory size={20} />
          <span>Order History</span>
        </Link>
        <Link href="/cart">
          <div className={`relative p-3 rounded-lg ${
            pathname === "/cart" 
              ? "bg-teal-100 text-black" 
              : "text-gray-500 hover:bg-gray-100"
          } transition-all duration-200`}>
            <button className="flex items-center gap-3 text-lg">
              <FiShoppingCart size={24} />
              <span>Cart</span>
            </button>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Bottom Icons - Account button */}
      <div className="mt-auto">
        <Link
          href="/account"
          className={`font-medium p-3 rounded-lg text-lg ${
            pathname === "/account" 
              ? "bg-teal-100 text-black" 
              : "text-gray-500 hover:bg-gray-100"
          } transition-all duration-200 ease-in-out flex items-center gap-2`}
        >
          <FiUser size={20} />
          <span>{loading ? "Loading..." : isAuthenticated ? "My Account" : "Sign In"}</span>
        </Link>
      </div>
    </nav>
  );
};

export default Sidebar; 