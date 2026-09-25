import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Search, RefreshCw, Bell } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

import Navbar from './components/Navbar';
import FoodCard from './components/FoodCard';
import CartDrawer from './components/CartDrawer';
import OrderTracker from './components/OrderTracker';
import VendorDashboard from './components/VendorDashboard';
import ReviewModal from './components/ReviewModal';
import AuthScreen from './components/AuthScreen';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const API_BASE = 'http://localhost:5000/api';

// -------------------------------------------------------------
// Protected Route Component
// -------------------------------------------------------------
function ProtectedRoute({ children, allowedRoles = [], disallowedRoles = [] }) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontWeight: '600' }}>Verifying your campus session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const isStaff = currentUser.role === 'vendor' || currentUser.role === 'staff' || currentUser.role === 'admin';

  if (disallowedRoles.includes(currentUser.role)) {
    return <Navigate to={isStaff ? "/kitchen" : "/"} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={isStaff ? "/kitchen" : "/"} replace />;
  }

  return children;
}

// -------------------------------------------------------------
// Menu Page Component (Home /)
// -------------------------------------------------------------
function MenuPage({ onAddToCart, favorites, onToggleFavorite }) {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMenuData() {
      setLoading(true);
      try {
        const [catsRes, menuRes] = await Promise.all([
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/menu`)
        ]);

        if (catsRes.ok) setCategories(await catsRes.json());
        if (menuRes.ok) setMenuItems(await menuRes.json());
      } catch (err) {
        console.error('Menu load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMenuData();
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category_slug === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px 100px', width: '100%' }}>
      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '18px' }}>
        <Search 
          size={18} 
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
        />
        <input
          type="text"
          placeholder="Search campus meals, chips, stew, drinks, extras..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px 12px 42px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
      </div>

      {/* Category Pills */}
      <div className="category-scroll" style={{ marginBottom: '22px' }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: selectedCategory === 'all' ? '800' : '600',
            backgroundColor: selectedCategory === 'all' ? 'var(--primary)' : '#FFFFFF',
            color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--text-main)',
            border: '1px solid',
            borderColor: selectedCategory === 'all' ? 'var(--primary)' : 'var(--border)',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          🌟 All Items
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: selectedCategory === cat.slug ? '800' : '600',
              backgroundColor: selectedCategory === cat.slug ? 'var(--primary)' : '#FFFFFF',
              color: selectedCategory === cat.slug ? '#FFFFFF' : 'var(--text-main)',
              border: '1px solid',
              borderColor: selectedCategory === cat.slug ? 'var(--primary)' : 'var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Food Items Responsive Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p>Loading campus cafeteria meals...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px dashed var(--border)' }}>
          <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-muted)' }}>No meals found matching your search.</p>
        </div>
      ) : (
        <div className="food-grid">
          {filteredItems.map(item => (
            <FoodCard
              key={item.id}
              item={item}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Orders Page Wrapper Component
// -------------------------------------------------------------
function OrdersPage({ onOpenReview }) {
  const navigate = useNavigate();
  const { token, currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(fetchOrders, 6000);
    return () => clearInterval(timer);
  }, [token]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px 100px', width: '100%' }}>
      <OrderTracker
        orders={orders}
        onRefresh={fetchOrders}
        onBrowseMenu={() => navigate('/')}
        onOpenReview={onOpenReview}
      />
    </div>
  );
}

// -------------------------------------------------------------
// Kitchen Portal Page Wrapper Component
// -------------------------------------------------------------
function KitchenPage({ onNotify }) {
  const { token } = useAuth();
  const [vendorOrders, setVendorOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  const fetchVendorData = async () => {
    if (!token) return;
    try {
      const [ordRes, menuRes] = await Promise.all([
        fetch(`${API_BASE}/orders/vendor`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/menu`)
      ]);
      if (ordRes.ok) setVendorOrders(await ordRes.json());
      if (menuRes.ok) setMenuItems(await menuRes.json());
    } catch (err) {
      console.error('Kitchen data fetch error:', err);
    }
  };

  useEffect(() => {
    fetchVendorData();
    const timer = setInterval(fetchVendorData, 5000);
    return () => clearInterval(timer);
  }, [token]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchVendorData();
        onNotify(`Order #${orderId} marked as ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleVerifyPickup = async (orderId, pin) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/verify-pickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pickup_pin: pin })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`❌ REJECTED: ${data.error}`);
        return;
      }
      alert(`✅ VERIFIED: Hand over meal to ${data.customerName}! Ticket #${data.orderNumber} is complete.`);
      fetchVendorData();
    } catch (err) {
      alert('PIN verification failed: ' + err.message);
    }
  };

  const handleToggleStock = async (itemId) => {
    try {
      const res = await fetch(`${API_BASE}/menu/${itemId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMenuItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, is_available: !item.is_available } : item
        ));
      }
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  const handleAddDish = async (newDish) => {
    try {
      const res = await fetch(`${API_BASE}/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDish)
      });
      if (res.ok) {
        onNotify('Added new dish to live menu!');
        fetchVendorData();
      }
    } catch (err) {
      alert('Failed to add dish');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px 100px', width: '100%' }}>
      <VendorDashboard
        orders={vendorOrders}
        menuItems={menuItems}
        onUpdateStatus={handleUpdateStatus}
        onVerifyPickup={handleVerifyPickup}
        onToggleStock={handleToggleStock}
        onAddDish={handleAddDish}
        onRefresh={fetchVendorData}
      />
    </div>
  );
}

// -------------------------------------------------------------
// App Navigation Shell
// -------------------------------------------------------------
function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated, token } = useAuth();
  const { addToCart } = useCart();

  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [notification, setNotification] = useState('');

  // Reviews
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    triggerNotification(`Added ${item.name} to cart!`);
  };

  const handleToggleFavorite = (itemId) => {
    setFavorites(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSubmitReview = async () => {
    if (!selectedOrderForReview || !token) return;
    try {
      await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: selectedOrderForReview.id,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      setShowReviewModal(false);
      setReviewComment('');
      triggerNotification('⭐ Thank you for rating your meal!');
    } catch (err) {
      alert('Failed to submit review');
    }
  };

  // Dedicated full-screen authentication & password recovery pages
  if (location.pathname === '/login') {
    return (
      <AuthScreen
        onLoginSuccess={(user) => {
          const isStaff = user.role === 'vendor' || user.role === 'staff' || user.role === 'admin';
          triggerNotification(`Welcome back, ${user.first_name || user.name}!`);
          const params = new URLSearchParams(location.search);
          const redirect = params.get('redirect') || (isStaff ? '/kitchen' : '/');
          navigate(redirect);
        }}
      />
    );
  }

  if (location.pathname === '/forgot-password') {
    return <ForgotPasswordPage />;
  }

  if (location.pathname.startsWith('/reset-password')) {
    return <ResetPasswordPage />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#111827',
          color: '#FFFFFF',
          padding: '10px 20px',
          borderRadius: '999px',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: '700',
          maxWidth: '90%'
        }} className="animate-fade-in">
          <Bell size={16} color="#FBBF24" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenCart={() => setShowCartDrawer(true)}
        hasActiveOrders={false}
      />

      {/* Main Content Area Routes */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route 
            path="/" 
            element={
              (currentUser?.role === 'vendor' || currentUser?.role === 'staff' || currentUser?.role === 'admin') ? (
                <Navigate to="/kitchen" replace />
              ) : (
                <MenuPage 
                  onAddToCart={handleAddToCart}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              )
            } 
          />

          {/* DEDICATED CHECKOUT / ORDER REVIEW PAGE (Students Only) */}
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute disallowedRoles={['vendor', 'staff', 'admin']}>
                <CheckoutPage />
              </ProtectedRoute>
            } 
          />

          {/* DEDICATED PAYMENT PAGE (Students Only) */}
          <Route 
            path="/payment" 
            element={
              <ProtectedRoute disallowedRoles={['vendor', 'staff', 'admin']}>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />

          {/* PASSWORD RECOVERY ROUTES */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* MY ORDERS & TICKET TRACKER (Students Only) */}
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute disallowedRoles={['vendor', 'staff', 'admin']}>
                <OrdersPage onOpenReview={(order) => {
                  setSelectedOrderForReview(order);
                  setShowReviewModal(true);
                }} />
              </ProtectedRoute>
            } 
          />

          {/* KITCHEN PORTAL (VENDOR / STAFF / ADMIN ONLY) */}
          <Route 
            path="/kitchen" 
            element={
              <ProtectedRoute allowedRoles={['vendor', 'staff', 'admin']}>
                <KitchenPage onNotify={triggerNotification} />
              </ProtectedRoute>
            } 
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Slide-in Preview Cart Drawer */}
      <CartDrawer 
        isOpen={showCartDrawer} 
        onClose={() => setShowCartDrawer(false)} 
      />

      {/* 5-Star Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        order={selectedOrderForReview}
        rating={reviewRating}
        setRating={setReviewRating}
        comment={reviewComment}
        setComment={setReviewComment}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
}

// -------------------------------------------------------------
// Root App with Providers
// -------------------------------------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
