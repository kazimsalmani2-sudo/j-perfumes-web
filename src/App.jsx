import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Components
import AuthGate from './components/AuthGate';
import ChatBot from './components/ChatBot';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Home from './pages/Home';
import Collections from './pages/Collections';
import Shop from './pages/Shop';
import Attars from './pages/Attars';
import GiftSets from './pages/GiftSets';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';

import './App.css';

function AppContent() {
  const location = useLocation();
  const publicAuthRoutes = ["/login", "/register", "/forgot-password"];
  const isAuthPage = publicAuthRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      <ScrollToTop />
      {!isAuthPage && <Navbar />}
      <div className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes */}
          <Route path="/home" element={<AuthGate><Home /></AuthGate>} />
          <Route path="/collections" element={<AuthGate><Collections /></AuthGate>} />
          <Route path="/shop" element={<AuthGate><Shop /></AuthGate>} />
          <Route path="/shop/:id" element={<AuthGate><ProductDetail /></AuthGate>} />
          <Route path="/attars" element={<AuthGate><RouteWrapper><Attars /></RouteWrapper></AuthGate>} />
          <Route path="/gift-sets" element={<AuthGate><GiftSets /></AuthGate>} />
          <Route path="/about" element={<AuthGate><About /></AuthGate>} />
          <Route path="/contact" element={<AuthGate><Contact /></AuthGate>} />
          <Route path="/cart" element={<AuthGate><Cart /></AuthGate>} />
          <Route path="/checkout" element={<AuthGate><Checkout /></AuthGate>} />
          <Route path="/order-confirmation" element={<AuthGate><OrderConfirmation /></AuthGate>} />
          <Route path="/wishlist" element={<AuthGate><Wishlist /></AuthGate>} />
          <Route path="/account" element={<AuthGate><Account /></AuthGate>} />
        </Routes>
      </div>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <WhatsAppButton />}
      {!isAuthPage && <ChatBot />}
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </CartProvider>
  );
}

// Simple wrapper to scroll to top on mount
function RouteWrapper({ children }) {
  return <>{children}</>;
}

export default App;
