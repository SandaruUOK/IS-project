
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">🔐 Authenticating...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">❌ Authentication Error: {error}</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;