import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Providers from './components/Providers';
import Navbar from './components/Navbar';

// We will import pages once they are moved mapping to 'src/pages'
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import VendorDashboard from './pages/VendorDashboard';

export default function App() {
  return (
    <Router>
      <Providers>
        <div className="bg-gray-50 min-h-screen flex flex-col font-sans antialiased">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/vendor" element={<VendorDashboard />} />
            </Routes>
          </main>
        </div>
      </Providers>
    </Router>
  );
}
