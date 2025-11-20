import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react'; // Using lucide-react for icons

export default function Footer() {
  return (
    <footer className="bg-teal-100 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-4 gap-8 items-start">
        
        {/* Logo & Socials */}
        <div>
          <h2 className="text-lg font-bold mb-2">MITRAPONICS</h2>
          <p className="text-gray-600 mb-4">The Best Hydroponics in Town!</p>
          <div className="flex items-center gap-4">
            <a href="#" className="border border-gray-400 rounded-full p-2 text-gray-600 hover:text-black">
              <Facebook size={20} />
            </a>
            <a href="#" className="border border-gray-400 rounded-full p-2 text-gray-600 hover:text-black">
              <Instagram size={20} />
            </a>
            <a href="#" className="border border-gray-400 rounded-full p-2 text-gray-600 hover:text-black">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* Information Links */}
        <div>
          <h3 className="font-bold mb-3">Information</h3>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#">About</a></li>
            <li><a href="#">Product</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="font-bold mb-3">Company</h3>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#">Community</a></li>
            <li><a href="#">Career</a></li>
            <li><a href="#">Our story</a></li>
          </ul>
        </div>

        {/* Contact Links */}
        <div>
          <h3 className="font-bold mb-3">Contact</h3>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#">Getting Started</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Resources</a></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="text-center text-gray-600 mt-8">
        <p>2025 all Right Reserved Term of use MITRAPONICS</p>
      </div>
    </footer>
  );
}
