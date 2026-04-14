

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Store, Package, Image as ImageIcon, UploadCloud, Truck, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VendorDashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'upload'
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', slug: '', price: '', discountPrice: '', stock: '', description: '', category: ''
  });
  const [images, setImages] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({ loading: false, success: false, error: null });

  // If user is not authenticated or not a vendor
  if (!isAuthenticated || user?.role !== 'vendor') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Access Denied</h2>
        <p className="text-gray-500 mb-8 max-w-md">You must be logged in as a <b>Vendor</b> to access the seller dashboard.</p>
        <Link to="/login" className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-600 transition-colors">
          Switch Account
        </Link>
      </div>
    );
  }

  // Fetch Vendor specific orders
  const { data: vendorOrders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['vendorOrders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/vendor');
      return data.orders;
    },
    enabled: activeTab === 'orders'
  });

  // Fetch Categories for the dropdown
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
    enabled: activeTab === 'upload'
  });

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      refetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order status');
    }
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadStatus({ loading: true, success: false, error: null });

    const formPayload = new FormData();
    Object.keys(formData).forEach(key => formPayload.append(key, formData[key]));
    images.forEach(img => formPayload.append('images', img));

    try {
      await api.post('/products', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus({ loading: false, success: true, error: null });
      setFormData({ title: '', slug: '', price: '', discountPrice: '', stock: '', description: '', category: '' });
      setImages([]);
      setTimeout(() => setUploadStatus(prev => ({ ...prev, success: false })), 3000);
    } catch (err) {
      setUploadStatus({ loading: false, success: false, error: err.response?.data?.message || 'Error uploading product' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Store className="text-indigo-600" size={32} /> Vendor Dashboard
            </h1>
            <p className="text-gray-500 font-medium mt-1">Manage your storefront and monitor your active orders.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-150">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 p-6 flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 w-full text-left px-5 py-4 rounded-2xl font-bold transition-all ${
                activeTab === 'orders' ? 'bg-white shadow-sm border border-gray-200 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Truck size={20} /> My Orders
            </button>
            <button 
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-3 w-full text-left px-5 py-4 rounded-2xl font-bold transition-all ${
                activeTab === 'upload' ? 'bg-white shadow-sm border border-gray-200 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UploadCloud size={20} /> Add Product
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 md:p-10 bg-white">
            
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Fulfilment Pipeline</h2>
                
                {ordersLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl"></div>)}
                  </div>
                ) : !vendorOrders || vendorOrders.length === 0 ? (
                  <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-3xl">
                    <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No pending orders</h3>
                    <p className="text-gray-500 text-sm">When customers buy your products, they will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {vendorOrders.map(order => (
                      <div key={order._id} className="border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-indigo-300 transition-colors">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-gray-100 pb-4">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Order ID</p>
                            <p className="text-gray-900 font-mono text-sm">{order._id}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
                            <span className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-bold ${
                              order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 
                              order.orderStatus === 'Shipped' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Actions</p>
                            <select 
                              className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              value={order.orderStatus}
                              onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                              disabled={order.orderStatus === 'Delivered'}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-sm font-bold text-gray-900 mb-2">Items you need to ship:</p>
                          {order.vendorItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <img src={item.image} alt="product" className="w-12 h-12 rounded-lg object-cover" />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                <p className="text-xs font-semibold text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* UPLOAD TAB */}
            {activeTab === 'upload' && (
              <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload New Product</h2>
                
                {uploadStatus.error && (
                  <div className="bg-red-50 text-red-600 p-4 border border-red-200 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
                    <AlertCircle size={18} /> {uploadStatus.error}
                  </div>
                )}
                {uploadStatus.success && (
                  <div className="bg-emerald-50 text-emerald-600 p-4 border border-emerald-200 rounded-xl mb-6 text-sm font-bold">
                    Product uploaded successfully and instantly LIVE!
                  </div>
                )}

                <form onSubmit={handleUploadSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Product Title</label>
                      <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700">URL Slug (e.g. nike-shoes)</label>
                      <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Base Price (₹)</label>
                      <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Stock Quantity</label>
                      <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Select Category</label>
                      <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                        <option value="" disabled>Choose Category...</option>
                        {categories && categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Description</label>
                      <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Product Images (Up to 5)</label>
                      <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center cursor-pointer relative group">
                        <ImageIcon size={40} className="text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-bold text-indigo-700">Drop files or click to upload</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                      {images.length > 0 && (
                        <p className="text-sm font-bold text-emerald-600 mt-2">{images.length} file(s) selected.</p>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={uploadStatus.loading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 transition-all flex justify-center items-center gap-2 group disabled:opacity-50"
                  >
                    {uploadStatus.loading ? 'Encrypting & Uploading...' : (
                       <><UploadCloud size={20} /> Publish Product to Catalog</>
                    )}
                  </button>
                </form>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
