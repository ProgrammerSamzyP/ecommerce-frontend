import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedAdminRoute({ children }) {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'ROLE_ADMIN';
  return isAdmin ? children : <Navigate to="/products" />;
}