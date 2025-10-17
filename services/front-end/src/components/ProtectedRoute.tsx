import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../store';
import { verifyAuth } from '../store/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string | string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  
  const { 
    isAuthenticated, 
    client, 
    loading 
  } = useSelector((state: RootState) => state.auth);
  
  console.log('ProtectedRoute - Mounted for path:', location.pathname);
  console.log('ProtectedRoute - Auth state:', { 
    isAuthenticated, 
    loading,
    client: client ? { id: client.id, role: client.role } : 'No client'
  });
  console.log('Allowed roles:', allowedRoles);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      console.log('Verifying authentication...');
      dispatch(verifyAuth() as any);
    }
  }, [dispatch, isAuthenticated, loading]);

  const userRole = client?.role;

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
    console.log('Not authenticated, redirecting to login');
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  if (allowedRoles) {
    console.log('Role check required for path:', location.pathname);
    
    if (!userRole) {
      console.log('No user role found, showing loading');
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
          <p style={{ color: '#666', margin: 0 }}>Loading user information...</p>
        </div>
      );
    }

    console.log('Role check:', { userRole, allowedRoles });
    
    const hasAllowedRole = Array.isArray(allowedRoles) 
      ? allowedRoles.includes(userRole)
      : userRole === allowedRoles;

    console.log('Has allowed role?', hasAllowedRole);

    if (!hasAllowedRole) {
      console.log('Access denied for role:', userRole);
      
      const roleText = Array.isArray(allowedRoles) 
        ? allowedRoles.join(', ') 
        : allowedRoles;
        
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
          <h1 style={{ fontSize: '4rem', fontWeight: '800', color: '#c01e56ff', margin: 0 }}>Access Denied</h1>
          <p style={{ color: '#666', margin: 0 }}>
            You don't have permission to access this page.
          </p>
          <p style={{ color: '#999', fontSize: '0.9rem', margin: 0 }}>
            Allowed roles: <strong>{roleText}</strong> | Your role: <strong>{userRole}</strong>
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
  }

  console.log('Access granted to:', location.pathname);
  return <>{children}</>;
};

export default ProtectedRoute;
