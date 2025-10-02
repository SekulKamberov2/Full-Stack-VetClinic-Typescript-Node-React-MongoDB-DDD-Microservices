import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../store';
import { verifyAuth } from '../store/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  
  const { 
    isAuthenticated, 
    client, 
    loading 
  } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      dispatch(verifyAuth() as any);
    }
  }, [dispatch, isAuthenticated, loading]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #1E1E2F',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', margin: 0 }}>Checking authentication...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  if (requiredRole && client?.role !== requiredRole) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem' }}>x</div>
        <h2 style={{ color: '#dc3545', margin: 0 }}>Access Denied</h2>
        <p style={{ color: '#666', margin: 0 }}>
          You don't have permission to access this page.
        </p>
        <p style={{ color: '#999', fontSize: '0.9rem', margin: 0 }}>
          Required role: <strong>{requiredRole}</strong> | Your role: <strong>{client?.role}</strong>
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '10px 20px',
            background: '#1E1E2F',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }
  return <>{children}</>;
};

export default ProtectedRoute;
