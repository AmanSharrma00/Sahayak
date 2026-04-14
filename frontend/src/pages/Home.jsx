import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full relative bg-gradient-to-br from-indigo-50 via-white to-violet-50 overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 mb-6 tracking-tight">
              The Multi-Vendor Marketplace of the Future
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed font-medium">
              Discover millions of products from independent sellers across India. Start your business journey or shop securely with Sahayak today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/explore" className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-indigo-600 rounded-full overflow-hidden transition-all duration-300 shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:bg-indigo-500 hover:scale-105 hover:-translate-y-1 w-full sm:w-auto">
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/seller/register" className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-indigo-600 bg-white border-2 border-indigo-100 rounded-full overflow-hidden transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50 w-full sm:w-auto">
                Become a Seller
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center group">
              <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-indigo-100">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Infinite Choices</h3>
              <p className="text-gray-500 font-medium">Explore categories built by independent sellers offering unique items you won't find anywhere else.</p>
            </div>
            
            <div className="flex flex-col items-center group">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-emerald-100">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Secure Payments</h3>
              <p className="text-gray-500 font-medium">Powered by industry-standard Razorpay integration. Your money is secured at every transaction step.</p>
            </div>

            <div className="flex flex-col items-center group">
              <div className="h-16 w-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-violet-100">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Multi-Fulfillment</h3>
              <p className="text-gray-500 font-medium">Our multi-vendor backend engine instantly notifies independent sellers the moment you checkout.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
