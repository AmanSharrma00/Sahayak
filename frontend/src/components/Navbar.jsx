

import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, Compass, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b shadow-sm border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <div className="h-8 w-8 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-lg flex items-center justify-center transform transition-transform group-hover:rotate-12">
              <span className="text-white font-bold text-xl leading-none">S</span>
            </div>
            <Link to="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tighter">
              Sahayak
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8 relative group">
            <input 
              type="text" 
              placeholder="Search for amazing products..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
            />
            <div className="absolute right-3 top-2.5 text-gray-400 group-hover:text-indigo-500 transition-colors">
              <Search size={18} />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/explore" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors flex items-center gap-1">
              <Compass size={18} /> Explore
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="text-gray-600 hover:text-indigo-600 transition-colors relative group">
                  <ShoppingCart size={22} className="transform group-hover:scale-110 transition-transform"/>
                  <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                    0
                  </span>
                </Link>
                
                <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                     <span className="text-sm font-semibold text-gray-800 tracking-wide">Hi, {user?.name?.split(' ')[0]}</span>
                  </div>
                  <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                     <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                <Link to="/login" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors">Login</Link>
                <Link to="/register" className="bg-gray-900 hover:bg-indigo-600 text-white px-5 py-2 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-indigo-500/30">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-indigo-600 focus:outline-none"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
