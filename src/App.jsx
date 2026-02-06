import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

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

// POS Pages
import POSBilling from './pages/POS/POSBilling';
import POSHistory from './pages/POS/POSHistory';

// Shop Pages
import Home from './pages/Shop/Home';
import ShopPage from './pages/Shop/ShopPage';
import Cart from './pages/Shop/Cart';

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
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth-redirect" element={<AuthRedirect />} />

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
              <Route path="orders" element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminDashboard />} />
              <Route path="users" element={<AdminDashboard />} />
              <Route path="reports" element={<AdminDashboard />} />
              <Route path="settings" element={<AdminDashboard />} />
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
              <Route path="wishlist" element={<Cart />} />
              <Route path="offers" element={<ShopPage />} />
              <Route path="profile" element={<Home />} />
              <Route path="orders" element={<Home />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
