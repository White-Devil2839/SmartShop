import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show nothing while we validate the stored token
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f8fafc',
      }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div className="spinner" style={{
            width: 36, height: 36, border: '3px solid #e2e8f0',
            borderTopColor: '#3b82f6', borderRadius: '50%',
            animation: 'spin 0.7s linear infinite', margin: '0 auto 1rem',
          }} />
          <p>Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
