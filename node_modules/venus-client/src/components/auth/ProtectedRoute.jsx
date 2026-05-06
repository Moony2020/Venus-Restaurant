import { Navigate } from 'react-router-dom';
import PageLoader from '../PageLoader';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isCheckingAuth, isAuthenticated, isAdmin } = useAuth();

  if (isCheckingAuth) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
