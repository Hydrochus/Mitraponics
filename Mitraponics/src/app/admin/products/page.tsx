"use client";

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  images: string[];
  personalizable: boolean;
  options: Record<string, string[]>;
}

type ProductFormData = {
  title: string;
  description: string;
  price: string;
  images: Array<File | string>;
  imagePreviews: string[];
  options: Record<string, string[]>;
  usePlaceholderImages: boolean;
};

export default function AdminProducts() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch products
  useEffect(() => {
    if (isAuthenticated) {
    fetchProducts();
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products', {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`,
        },
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Helper function to get admin token from cookies
  const getAdminToken = () => {
    // Try to get from cookies first (the secure way)
    const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1];
    // Fall back to localStorage if not in cookies
    return token || localStorage.getItem('adminToken') || '';
  };

  const handleAddSubmit = async (formData: ProductFormData) => {
    try {
      let imageUrls: string[] = [];
      
      // Use placeholder images if selected or try to upload real images
      if (formData.usePlaceholderImages) {
        imageUrls = [
          "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGxhbnR8ZW58MHx8MHx8fDA%3D",
          "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fHBsYW50fGVufDB8fDB8fHww"
        ];
        console.log("Using placeholder images instead of uploading");
      } else {
        // Only map over actual File objects, not strings
        const files = formData.images.filter((file): file is File => file instanceof File);

    try {
      // First, upload the images
          imageUrls = await Promise.all(
            files.map(async (file) => {
              const formDataObj = new FormData();
              formDataObj.append('image', file);

              // Make sure we properly handle upload errors
              try {
          const response = await fetch('http://localhost:8000/api/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${getAdminToken()}`,
            },
                  body: formDataObj,
          });

          if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}));
                  console.error('Upload error response:', errorData);
                  throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          return data.url;
              } catch (err) {
                console.error('Error during file upload:', err);
                throw new Error(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
              }
            })
          );
        } catch (uploadError) {
          console.error("Image upload failed, using placeholders instead:", uploadError);
          // If upload fails, fall back to placeholders
          imageUrls = [
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGxhbnR8ZW58MHx8MHx8fDA%3D",
            "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fHBsYW50fGVufDB8fDB8fHww"
          ];
        }
      }

      // Construct product data to send to API
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price), // Convert string to number
        images: imageUrls,
        personalizable: false,
        options: formData.options || {} // Ensure options is at least an empty object
      };
      
      // Log the payload for debugging
      console.log('Sending product data to API:', productData);

      // Then, create the product
      const response = await fetch('http://localhost:8000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify(productData),
      });

      // Log complete response for debugging
      console.log('API response status:', response.status, response.statusText);
      
      let responseData = {};
      try {
        responseData = await response.json();
        console.log('API response data:', responseData);
      } catch (error) {
        console.log('Could not parse response as JSON:', error);
      }

      if (!response.ok) {
        let errorMessage = `Failed to add product: ${response.status} ${response.statusText}`;
        
        // Try to extract more specific error messages if available
        if (responseData && typeof responseData === 'object') {
          if ('message' in responseData) {
            errorMessage += ` - ${responseData.message}`;
          }
          else if ('error' in responseData) {
            errorMessage += ` - ${responseData.error}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Close modal and refresh products
      setShowAddModal(false);
      fetchProducts();
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert(`Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditSubmit = async (formData: ProductFormData) => {
    if (!selectedProduct) return;

    try {
      // Upload new images if any
      const newFiles = (formData.images as File[]).filter(file => file instanceof File);
      let finalImages = [...selectedProduct.images]; // Start with existing images
      
      // If new files were uploaded, replace the old images with the new ones
      if (newFiles.length > 0) {
        const imageUrls = await Promise.all(
          newFiles.map(async (file) => {
            const formDataObj = new FormData();
            formDataObj.append('image', file);

            const response = await fetch('http://localhost:8000/api/upload', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${getAdminToken()}`,
              },
              body: formDataObj,
            });

            if (!response.ok) {
              throw new Error('Failed to upload image');
            }

            const data = await response.json();
            return data.url;
          })
        );
        
        // Replace old images with new ones
        finalImages = imageUrls;
      }

      // Update the product
      const response = await fetch(`http://localhost:8000/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          images: finalImages,
          personalizable: false,
          options: formData.options
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      // Close modal and refresh products
      setShowEditModal(false);
      setSelectedProduct(null);
      fetchProducts();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      fetchProducts();
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const ProductForm = ({ onSubmit, title, initialValues }: { onSubmit: (formData: ProductFormData) => Promise<void>, title: string, initialValues: ProductFormData }) => {
    const [formData, setFormData] = useState<ProductFormData>(initialValues);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        // For edit form, if we're uploading new images, replace the old ones
        const isEditForm = title === "Edit Product";
        
        // For edit form with new uploads, replace existing images
        const newImages = isEditForm && files.length > 0 
          ? [...files] as Array<File | string>
          : [...formData.images, ...files] as Array<File | string>;
          
        const newPreviews = newImages.map((file) =>
          typeof file === 'string' ? file : URL.createObjectURL(file)
        );
        
        setFormData({
          ...formData,
          images: newImages,
          imagePreviews: newPreviews,
        });
      }
    };

    const removeImage = (index: number) => {
      const newImages = formData.images.filter((_: File | string, i: number) => i !== index);
      const newPreviews = formData.imagePreviews.filter((_: string, i: number) => i !== index);
      setFormData({
        ...formData,
        images: newImages,
        imagePreviews: newPreviews,
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setUploading(true);
      try {
        await onSubmit(formData);
      } finally {
        setUploading(false);
      }
    };

    return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-10">{title}</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
          <div>
              <label className="block text-lg font-medium text-gray-700">Product Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-lg py-3 px-4"
              required
            />
          </div>
          <div>
              <label className="block text-lg font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-lg py-3 px-4"
              rows={4}
              required
            />
          </div>
          <div>
              <label className="block text-lg font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-lg py-3 px-4"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
              <label className="block text-lg font-medium text-gray-700">Images</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
                className="mt-2 block w-full text-lg"
            />
              <p className="mt-2 text-lg text-gray-500">Upload one or more images</p>
          </div>
          {formData.imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {formData.imagePreviews.map((preview: string, index: number) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.usePlaceholderImages}
                onChange={(e) => setFormData({ ...formData, usePlaceholderImages: e.target.checked })}
                className="h-6 w-6 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label className="ml-4 block text-lg text-gray-700">Use placeholder images (workaround for upload error)</label>
          </div>
            <div className="flex justify-end space-x-6">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedProduct(null);
                }}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg text-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
                className="bg-teal-200 text-gray-700 px-8 py-3 rounded-lg text-lg hover:bg-teal-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {uploading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  };

  // Show loading or redirect if not authenticated
  if (loading || !isAuthenticated) {
    return <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <p className="text-lg text-gray-600">Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
        </div>

        <div className="px-6 py-8 sm:px-0">
          <div className="bg-white rounded-2xl shadow-2xl p-12">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-4xl font-semibold text-gray-800">Products</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-teal-200 text-gray-700 px-8 py-4 rounded-xl text-lg hover:bg-teal-300 transition font-semibold"
              >
                Add New Product
              </button>
            </div>

            {loadingProducts ? (
              <div className="text-center py-16 text-xl">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-xl">No products found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-8 py-5 text-left text-base font-bold text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-8 py-5 text-left text-base font-bold text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-8 py-5 text-left text-base font-bold text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-8 py-5 text-left text-base font-bold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-8 py-6 whitespace-nowrap">
                          {product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="h-24 w-24 object-cover rounded-xl border"
                            />
                          )}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-xl font-semibold text-gray-900">{product.title}</div>
                          <div className="text-lg text-gray-500 line-clamp-2 mt-2">{product.description}</div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-xl text-gray-700">
                          Rp {Number(product.price).toLocaleString('id-ID')}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-lg font-medium">
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-teal-700 hover:text-teal-900 mr-6 text-lg font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-700 hover:text-red-900 text-lg font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && <ProductForm onSubmit={handleAddSubmit} title="Add New Product" initialValues={{
        title: '',
        description: '',
        price: '',
        images: [],
        imagePreviews: [],
        options: {},
        usePlaceholderImages: true,
      }} />}

      {/* Edit Product Modal */}
      {showEditModal && <ProductForm onSubmit={handleEditSubmit} title="Edit Product" initialValues={{
        title: selectedProduct?.title || '',
        description: selectedProduct?.description || '',
        price: selectedProduct?.price?.toString() || '',
        images: selectedProduct?.images || [],
        imagePreviews: selectedProduct?.images || [],
        options: selectedProduct?.options || {},
        usePlaceholderImages: false,
      }} />}
    </div>
  );
} 