import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import PageLoader from './components/PageLoader';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

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
const BookingSuccess = lazy(() => import('./pages/BookingSuccess'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLeads = lazy(() => import('./pages/AdminLeads'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const Kitchen = lazy(() => import('./pages/Kitchen'));
const About = lazy(() => import('./pages/About'));
const Bespoke = lazy(() => import('./pages/Bespoke'));
const Reservations = lazy(() => import('./pages/Reservations'));
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from 'react-hot-toast';

const App = () => (
  <AuthProvider>
    <CartProvider>
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
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leads"
            element={
              <ProtectedRoute adminOnly>
                <AdminLeads />
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
            path="/kitchen"
            element={
              <ProtectedRoute adminOnly>
                <Kitchen />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <Toaster position="bottom-right" reverseOrder={false} />
      <ScrollToTop />
    </CartProvider>
  </AuthProvider>
);

export default App;
