import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Components
import AuthGate from './components/AuthGate';
import ChatBot from './components/ChatBot';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Pages
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

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminSettings from './pages/admin/AdminSettings';

import './App.css';

function AppContent() {
  const location = useLocation();
  const publicAuthRoutes = ["/login", "/register", "/forgot-password"];
  const isAuthPage = publicAuthRoutes.includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      <ScrollToTop />
      {!isAuthPage && !isAdminPage && <Navbar />}
      <div className={isAdminPage ? '' : 'main-content'}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ProductDetail />} />
          <Route path="/attars" element={<RouteWrapper><Attars /></RouteWrapper>} />
          <Route path="/gift-sets" element={<GiftSets />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />

          {/* Protected routes */}
          <Route path="/checkout" element={<AuthGate><Checkout /></AuthGate>} />
          <Route path="/order-confirmation" element={<AuthGate><OrderConfirmation /></AuthGate>} />
          <Route path="/wishlist" element={<AuthGate><Wishlist /></AuthGate>} />
          <Route path="/account" element={<AuthGate><Account /></AuthGate>} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/orders" element={<AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>} />
          <Route path="/admin/products" element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>} />
          <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
          <Route path="/admin/analytics" element={<AdminProtectedRoute><AdminAnalytics /></AdminProtectedRoute>} />
          <Route path="/admin/coupons" element={<AdminProtectedRoute><AdminCoupons /></AdminProtectedRoute>} />
          <Route path="/admin/settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />
        </Routes>
      </div>
      {!isAuthPage && !isAdminPage && <Footer />}
      {!isAuthPage && !isAdminPage && <WhatsAppButton />}
      {!isAuthPage && !isAdminPage && <ChatBot />}
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AdminAuthProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </AdminAuthProvider>
      </Router>
    </CartProvider>
  );
}

// Simple wrapper to scroll to top on mount
function RouteWrapper({ children }) {
  return <>{children}</>;
}

export default App;
