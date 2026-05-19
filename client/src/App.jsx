import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import PageLoader from './components/PageLoader';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AdminSystem from './pages/AdminSystem';

const Home = lazy(() => import('./pages/Home'));
const Menu = lazy(() => import('./pages/Menu'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Payment = lazy(() => import('./pages/Payment'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Account = lazy(() => import('./pages/Account'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const BookingSuccess = lazy(() => import('./pages/BookingSuccess'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminControlPanel = lazy(() => import('./pages/AdminControlPanel'));
const AdminInquiries = lazy(() => import('./pages/AdminInquiries'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminBookings = lazy(() => import('./pages/AdminBookings'));
const Kitchen = lazy(() => import('./pages/Kitchen'));
const About = lazy(() => import('./pages/About'));
const Bespoke = lazy(() => import('./pages/Bespoke'));
const Reservations = lazy(() => import('./pages/Reservations'));
import ScrollToTop from './components/ScrollToTop';
import SiteFooter from './layout/SiteFooter';
import { Toaster } from 'react-hot-toast';

const AppContent = () => {
  const { pathname } = useLocation();
  const hideFooter = pathname.startsWith('/admin') || pathname.startsWith('/kitchen');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/bespoke" element={<Bespoke />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/track/:trackingCode" element={<TrackOrder />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminControlPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/overview"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inquiries"
            element={
              <ProtectedRoute adminOnly>
                <AdminInquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leads"
            element={
              <ProtectedRoute adminOnly>
                <AdminInquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute adminOnly>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute adminOnly>
                <AdminBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/system"
            element={
              <ProtectedRoute adminOnly>
                <AdminSystem />
              </ProtectedRoute>
            }
          />

          <Route
            path="/kitchen"
            element={
              <ProtectedRoute adminOnly>
                <Kitchen />
              </ProtectedRoute>
            }
          />
        </Routes>
        {!hideFooter ? <SiteFooter /> : null}
      </Suspense>
      <Toaster position="bottom-right" reverseOrder={false} />
      <ScrollToTop />
    </>
  );
};

const App = () => (
  <AuthProvider>
    <CartProvider>
      <AppContent />
    </CartProvider>
  </AuthProvider>
);

export default App;
