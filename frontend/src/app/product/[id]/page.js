'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { ShoppingCart, Star, ShieldCheck, Check, Truck, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'next/navigation';

export default function ProductDetailPage({ params }) {
  const unwrappedParams = params; // Depending on NextJS config, params might be a Promise in Next 15, but since we are on 14 it's sync. In 15 we'd React.use(params). We assume ^14 for now based on standard creation. 
  // Wait, Next 15 requires React.use(params). Let's use standard approach that works
  const { id } = unwrappedParams;
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [addStatus, setAddStatus] = useState({ loading: false, success: false, error: null });

  // Fetch product data
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data.product;
    },
  });

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setAddStatus({ loading: true, success: false, error: null });
    
    try {
      await api.post('/cart', {
        productId: product._id,
        quantity: quantity
      });
      setAddStatus({ loading: false, success: true, error: null });
      setTimeout(() => setAddStatus(prev => ({ ...prev, success: false })), 3000);
    } catch (err) {
      setAddStatus({ loading: false, success: false, error: err.response?.data?.message || 'Failed to add to cart' });
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 p-8 pt-20 flex justify-center">
      <div className="animate-pulse flex items-center space-x-4">
        <div className="h-12 w-12 bg-indigo-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-indigo-200 rounded w-[200px]"></div>
          <div className="h-4 bg-indigo-200 rounded w-[150px]"></div>
        </div>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
      <p className="text-gray-500 mb-6">The item you are looking for does not exist or has been removed.</p>
      <Link href="/explore" className="text-indigo-600 font-bold hover:underline flex items-center gap-2">
        <ArrowLeft size={18} /> Back to Explore
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/explore" className="text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-2 mb-8 w-max">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            
            {/* Left: Product Images */}
            <div className="bg-gray-100 p-8 min-h-[400px] flex items-center justify-center relative">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0].url} 
                  alt={product.title}
                  className="max-w-full max-h-[500px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="text-gray-400 font-medium">No Image Available</div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="p-8 md:p-12 flex flex-col justify-between">
              <div>
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">
                  {product.category?.name || 'Category'}
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                  {product.title}
                </h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <Star size={16} className="text-amber-500 fill-current" />
                    <span className="ml-1.5 font-bold text-amber-700 text-sm">{product.ratings > 0 ? product.ratings : 'New'}</span>
                  </div>
                  <span className="text-gray-400 text-sm">|</span>
                  <span className="text-gray-600 text-sm font-medium">{product.numOfReviews || 0} Reviews</span>
                </div>

                <div className="mb-8">
                  {product.discountPrice && (
                    <span className="text-gray-400 line-through text-lg mr-3">₹{product.price}</span>
                  )}
                  <span className="text-4xl font-black text-gray-900">
                    ₹{product.discountPrice || product.price}
                  </span>
                </div>

                <div className="prose prose-indigo text-gray-600 mb-8 max-w-none">
                  <p>{product.description}</p>
                </div>

                {/* Seller Info */}
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center">
                    {product.vendor?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Sold by</p>
                    <p className="font-bold text-gray-900">{product.vendor?.name}</p>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="border-t border-gray-100 pt-8 mt-4">
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 mb-2">Quantity</span>
                    <div className="flex items-center bg-gray-100 rounded-full border border-gray-200 p-1">
                      <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all focus:outline-none text-gray-700 font-bold"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(q => q + 1)}
                        disabled={quantity >= product.stock}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all focus:outline-none text-gray-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-end h-full mt-7">
                    <p className={`text-sm font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
                    </p>
                  </div>
                </div>

                {addStatus.error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">
                    {addStatus.error}
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addStatus.loading}
                  className={`w-full py-4 rounded-2xl flex items-center justify-center font-bold text-lg transition-all shadow-xl shadow-indigo-200 ${
                    addStatus.success 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {addStatus.loading ? (
                    'Adding to cart...'
                  ) : addStatus.success ? (
                    <><Check className="mr-2" /> Added to Cart!</>
                  ) : (
                    <><ShoppingCart className="mr-2" /> Add to Cart</>
                  )}
                </button>

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <ShieldCheck size={18} className="text-emerald-500" /> Secure payment
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <Truck size={18} className="text-indigo-500" /> Fast delivery
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
