'use client';

import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { ShoppingCart, Star, Filter, PackageOpen, Grid } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { useSearchParams } from 'next/navigation';

// Function to fetch products from backend
const fetchProducts = async (category) => {
  const url = category ? `/products?category=${category}` : '/products';
  const { data } = await api.get(url);
  return data.products;
};

// Function to fetch Categories for the Sidebar
const fetchCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

export default function ExplorePage() {
  const { isAuthenticated } = useAuthStore();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category'); // e.g. "64ad......."

  // Query Products
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => fetchProducts(selectedCategory),
  });

  // Query Categories
  const { data: categories, isLoading: isCatsLoading } = useQuery({
    queryKey: ['categoriesSidebar'],
    queryFn: fetchCategories,
  });

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)] pb-20">
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200 py-12 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">The Collection</span>
          </h1>
          <p className="text-gray-500 max-w-2xl text-lg font-medium">
            Browse through securely vetted items sold by top independent vendors across the platform.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center gap-2 font-bold text-gray-800 mb-6 border-b pb-4">
              <Filter size={20} className="text-indigo-600" />
              <span>Categories</span>
            </div>
            
            <div className="space-y-3">
              <Link href="/explore">
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${!selectedCategory ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <Grid size={16} /> All Products
                </div>
              </Link>

              {isCatsLoading ? (
                <div className="space-y-2 px-2">
                  {[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse"></div>)}
                </div>
              ) : categories && categories.map((cat) => (
                <Link key={cat._id} href={`/explore?category=${cat._id}`}>
                  <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat._id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'}`}>
                    <span>{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 border-t pt-6">
              <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">Price Range</h4>
              <div className="space-y-2">
                <label className="flex items-center text-sm text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors">
                  <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 mr-3 w-4 h-4" />
                  Under ₹1000
                </label>
                <label className="flex items-center text-sm text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors">
                  <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 mr-3 w-4 h-4" />
                  ₹1000 - ₹5000
                </label>
                <label className="flex items-center text-sm text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors">
                  <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 mr-3 w-4 h-4" />
                  Over ₹5000
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((skel) => (
                <div key={skel} className="bg-white rounded-2xl h-80 shadow-sm border border-gray-100 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center border border-red-100 font-medium">
              Failed to load products. Ensure your backend server is running on port 5000.
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
                  
                  {/* Image container inside the card */}
                  <div className="relative h-56 bg-gray-100 overflow-hidden flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0].url} 
                        alt={product.title} 
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <PackageOpen className="text-gray-300" size={48} />
                    )}
                    
                    {/* Add to Cart Overlay */}
                    {isAuthenticated && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <Link href={`/product/${product._id}`} className="bg-white text-indigo-900 font-bold px-6 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-700">
                          <ShoppingCart size={18} /> View Details
                        </Link>
                      </div>
                    )}
                    
                    {/* Badge */}
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-20">
                        Only {product.stock} left!
                      </span>
                    )}
                  </div>
                  
                  {/* Content Container */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                          {product.category?.name || 'Category'}
                        </p>
                        <div className="flex items-center text-amber-400">
                          <Star size={14} className="fill-current" />
                          <span className="text-gray-600 text-xs ml-1 font-medium">{product.ratings || 'New'}</span>
                        </div>
                      </div>
                      <Link href={`/product/${product._id}`}>
                        <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight hover:text-indigo-600 transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                      </Link>
                    </div>
                    
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        {product.discountPrice && (
                          <span className="line-through text-gray-400 text-sm mr-2">₹{product.price}</span>
                        )}
                        <span className="text-2xl font-black text-gray-900">
                          ₹{product.discountPrice || product.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center flex flex-col items-center shadow-sm w-full h-[300px] justify-center">
              <PackageOpen size={64} className="text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products in this Category</h3>
              <p className="text-gray-500 font-medium max-w-md">Try selecting another category or check back later.</p>
              <Link href="/explore" className="mt-6 font-bold text-indigo-600 hover:text-indigo-500">
                Clear Filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
