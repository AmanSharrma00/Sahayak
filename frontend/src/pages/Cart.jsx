

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Minus, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper to inject Razorpay JS script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [razorpayKey, setRazorpayKey] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/payment/config').then(res => setRazorpayKey(res.data.keyId)).catch(console.error);
    }
  }, [isAuthenticated]);

  const { data: cartData, isLoading, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get('/cart');
      return data.cart;
    },
    enabled: isAuthenticated,
  });

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      refetch();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = async () => {
    if (!cartData || cartData.items.length === 0) return;
    
    setCheckoutLoading(true);
    try {
      // 1. Create a Sahayak Order
      const orderItems = cartData.items.map(item => ({
        name: item.product.title,
        quantity: item.quantity,
        image: item.product.images?.length > 0 ? item.product.images[0].url : '',
        price: item.price,
        product: item.product._id,
        vendor: item.product.vendor || '6543210' // Normally we'd populate vendor in cart
      }));

      const shippingInfo = {
        address: "123 Main St", // Dummy Data - normally collected via a form
        city: "Mumbai",
        phoneNo: "9876543210",
        postalCode: "400001",
        country: "India"
      };

      const { data: orderData } = await api.post('/orders', {
        shippingInfo,
        orderItems,
        itemsPrice: cartData.totalPrice,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: cartData.totalPrice
      });

      // 2. Load Razorpay JS
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setCheckoutLoading(false);
        return;
      }

      // 3. Initiate Razorpay Order from backend
      const { data: paymentData } = await api.post('/payment/create-order', {
        orderId: orderData.order._id
      });

      // 4. Open Razorpay Checkout modal
      const options = {
        key: razorpayKey, 
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'Sahayak',
        description: 'Multi-Vendor Payment Request',
        order_id: paymentData.razorpayOrderId,
        handler: async function (response) {
          // 5. Verify payment signature on backend
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.order._id
            });
            alert('Payment Successful!');
            refetch(); // Cart will now be empty
          } catch (err) {
            console.error('Payment Verification Failed', err);
            alert('Verification Failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: '9999999999'
        },
        theme: {
          color: '#4f46e5' // Indigo-600
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Error processing checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isAuthenticated) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <ShoppingBag className="w-20 h-20 text-gray-300 mb-6" />
      <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Your cart is waiting</h2>
      <p className="text-gray-500 mb-8 max-w-md text-center">Login to your account to view your cart and proceed to checkout.</p>
      <Link to="/login" className="bg-indigo-600 text-white px-8 py-3.5 rounded-full font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all">
        Login Now
      </Link>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mt-20"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
          <ShoppingBag className="text-indigo-600" /> Shopping Cart
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Cart Items */}
          <div className="flex-1 space-y-6">
            {!cartData || cartData.items.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center flex flex-col items-center shadow-sm">
                <ShoppingBag size={64} className="text-gray-200 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
                <Link to="/explore" className="text-indigo-600 font-bold bg-indigo-50 px-6 py-3 rounded-full hover:bg-indigo-100 transition-colors">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              cartData.items.map((item) => (
                <div key={item.product._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 group hover:border-indigo-100 transition-colors">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-2xl flex items-center justify-center p-2 flex-shrink-0">
                    {item.product.images?.length > 0 ? (
                      <img src={item.product.images[0].url} alt={item.product.title} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <ShoppingBag className="text-gray-300 w-8 h-8" />
                    )}
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left w-full">
                    <Link to={`/product/${item.product._id}`}>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1 line-clamp-1">{item.product.title}</h3>
                    </Link>
                    <p className="text-2xl font-black text-gray-900 mb-4">₹{item.price}</p>
                    
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-1 py-1">
                        <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-800">
                           {item.quantity}x
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.product._id)}
                        className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors flex items-center gap-1 text-sm font-semibold pr-4"
                      >
                        <Trash2 size={16} className="ml-2" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Summary */}
          {cartData && cartData.items.length > 0 && (
            <div className="w-full lg:w-[400px]">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6 text-gray-600 font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-bold">₹{cartData.totalPrice}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-gray-100">
                    <span>Shipping</span>
                    <span className="text-emerald-500 font-bold">Free</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-gray-900 pt-2">
                    <span>Total</span>
                    <span>₹{cartData.totalPrice}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-gray-200 hover:shadow-indigo-200 hover:-translate-y-1 mb-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? 'Processing...' : (
                    <><CreditCard size={20} /> Secure Checkout</>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 py-3 rounded-xl border border-gray-100">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Payments processed securely via Razorpay
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
