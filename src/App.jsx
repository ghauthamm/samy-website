import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

// Components
import PageLoader from './components/PageLoader';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import POSLayout from './layouts/POSLayout';
import ShopLayout from './layouts/ShopLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/Products';
import AdminOrders from './pages/Admin/Orders';
import AdminAnalytics from './pages/Admin/Analytics';
import AdminUsers from './pages/Admin/Users';
import AdminReports from './pages/Admin/Reports';
import AdminSettings from './pages/Admin/Settings';
import AdminStock from './pages/Admin/Stock';

// POS Pages
import POSBilling from './pages/POS/POSBilling';
import POSHistory from './pages/POS/POSHistory';

// Shop Pages
import Home from './pages/Shop/Home';
import ShopPage from './pages/Shop/ShopPage';
import Cart from './pages/Shop/Cart';
import MyOrders from './pages/Shop/MyOrders';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccess/OrderSuccessPage';

// Diagnostic Page
import Diagnostic from './pages/Diagnostic';

import './index.css';

// Auth Redirect Component
const AuthRedirect = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  if (userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (userRole === 'cashier') {
    return <Navigate to="/pos" replace />;
  } else {
    return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth-redirect" element={<AuthRedirect />} />

              {/* Diagnostic Route */}
              <Route path="/diagnostic" element={<Diagnostic />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="stock" element={<AdminStock />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* POS Routes */}
              <Route
                path="/pos"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                    <POSLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<POSBilling />} />
                <Route path="history" element={<POSHistory />} />
              </Route>

              {/* Public Shop Routes */}
              <Route path="/" element={<ShopLayout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-success" element={<OrderSuccessPage />} />
                <Route path="wishlist" element={<Cart />} />
                <Route path="offers" element={<ShopPage />} />
                <Route path="profile" element={<Home />} />
                <Route path="orders" element={<MyOrders />} />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
