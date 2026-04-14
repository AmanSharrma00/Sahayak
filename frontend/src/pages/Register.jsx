

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, Store } from 'lucide-react';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer' // default format
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/signup', formData);
      navigate('/login?registered=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-gray-50">
      {/* Left Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-violet-800 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-6">Join the Sahayak Ecosystem</h2>
          <p className="text-xl text-indigo-100 font-medium max-w-md leading-relaxed">
            Whether you want to discover unique items or build your own multi-vendor empire, it starts here.
          </p>
        </div>
        
        {/* Dynamic decorative elements */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-violet-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-lg text-sm font-medium animate-pulse">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10 w-full text-gray-900 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 w-full text-gray-900 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 w-full text-gray-900 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white"
                />
              </div>

              <div className="pt-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">How would you like to use Sahayak?</p>
                <div className="grid grid-cols-2 gap-4">
                  <label 
                    className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-200 ${formData.role === 'customer' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' : 'border-gray-200 hover:border-indigo-200 text-gray-500'}`}
                  >
                    <input 
                      type="radio" 
                      name="role" 
                      value="customer" 
                      className="sr-only"
                      checked={formData.role === 'customer'}
                      onChange={() => setFormData({ ...formData, role: 'customer' })}
                    />
                    <UserIcon size={24} />
                    <span className="font-semibold text-sm">Customer</span>
                  </label>
                  
                  <label 
                    className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-200 ${formData.role === 'vendor' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' : 'border-gray-200 hover:border-indigo-200 text-gray-500'}`}
                  >
                    <input 
                      type="radio" 
                      name="role" 
                      value="vendor" 
                      className="sr-only"
                      checked={formData.role === 'vendor'}
                      onChange={() => setFormData({ ...formData, role: 'vendor' })}
                    />
                    <Store size={24} />
                    <span className="font-semibold text-sm">Seller (Vendor)</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center p-3.5 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
