import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page narrow"><p className="muted">Checking your session...</p></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (admin && user.role !== 'admin')
    return (
      <div className="page narrow">
        <h1>Admin only</h1>
        <p>Your account does not have access to this page.</p>
      </div>
    );
  return children;
}
