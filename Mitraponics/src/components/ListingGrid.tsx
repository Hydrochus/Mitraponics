"use client";

import { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useCart } from "./CartContext";
import { productsApi, Product } from "@/services/api";

const ListingGrid = () => {
  const { cartItems, addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentListing, setCurrentListing] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.getAll();
        setListings(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (listing: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    await addToCart({
      product_id: listing.id,
      quantity: 1,
      selected_options: listing.options
    });
  };

  const openModal = (listing: Product) => {
    setCurrentListing(listing);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentListing(null);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentListing) {
      setCurrentImageIndex((prev) =>
        prev === currentListing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentListing) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? currentListing.images.length - 1 : prev - 1
      );
    }
  };

  const selectThumbnail = (index: number) => {
    setCurrentImageIndex(index);
  };

  const isInCart = (id: number) => {
    return cartItems.some(item => item.product.id === id);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (loading) {
    return (
      <div className="w-[65%] flex flex-wrap justify-start gap-8 gap-y-20 p-6 mx-auto">
        <div className="text-center w-full">Loading products...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="w-[65%] flex flex-wrap justify-start gap-8 gap-y-20 p-6 mx-auto">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="w-60 border border-gray-300 rounded-lg overflow-hidden shadow-md bg-white cursor-pointer"
            onClick={() => openModal(listing)}
          >
            {/* Product Image */}
            <div className="h-36 w-full relative">
              <img 
                src={listing.images[0]} 
                className="h-full w-full object-cover" 
                alt={listing.title}
              />
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold">{listing.title}</h3>
              <p className="text-gray-600">Rp {Number(listing.price).toLocaleString('id-ID')}</p>
              <p className="text-gray-500">{listing.description}</p>
            </div>

            {/* Bottom Button */}
            <div className="flex justify-center items-center p-4 border-t">
              <button 
                onClick={(e) => handleAddToCart(listing, e)}
                className={`px-3 py-1 rounded-md flex items-center ${
                  isInCart(listing.id) 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                <FaShoppingCart className="mr-1" />
                {isInCart(listing.id) ? "Added" : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && currentListing && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleBackgroundClick}
        >
          <div className="bg-white rounded-lg w-[90%] max-w-5xl flex flex-col md:flex-row h-[90vh] max-h-[700px] overflow-hidden">
            {/* Left Side - Images */}
            <div className="relative w-full md:w-2/3 bg-gray-200 flex flex-col">
              {/* Main Image */}
              <div className="relative flex-grow flex items-center justify-center">
                <img
                  src={currentListing.images[currentImageIndex]}
                  alt={currentListing.title}
                  className="max-h-full max-w-full object-contain"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md"
                >
                  <IoIosArrowBack className="text-gray-700 text-xl" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md"
                >
                  <IoIosArrowForward className="text-gray-700 text-xl" />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="h-20 p-2 flex items-center">
                {currentListing.images.map((image, index) => (
                  <div
                    key={index}
                    className={`h-16 w-16 mr-2 cursor-pointer border-2 ${
                      index === currentImageIndex ? 'border-gray-700' : 'border-gray-300'
                    }`}
                    onClick={() => selectThumbnail(index)}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Info */}
            <div className="w-full md:w-1/3 p-6 flex flex-col">
              {/* Price */}
              <div className="text-2xl font-semibold mb-6">
                Rp {Number(currentListing.price).toLocaleString('id-ID')}
              </div>

              {/* Add to Cart Button in Modal */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(currentListing, e);
                }}
                className={`mb-6 py-2 px-4 rounded-md flex items-center justify-center ${
                  isInCart(currentListing.id) 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                <FaShoppingCart className="mr-2" />
                {isInCart(currentListing.id) ? "Added to Cart" : "Add to Cart"}
              </button>

              {/* Product Details */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Product Details</h3>
                <p className="text-gray-600">{currentListing.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingGrid;