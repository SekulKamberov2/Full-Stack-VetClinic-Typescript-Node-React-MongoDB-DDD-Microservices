import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../store/authSlice';
import { RootState } from '../store';
import { useAppDispatch } from '../store/hooks';
import styled from 'styled-components';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 310px;
  margin: 4rem auto;
  padding: 1.9rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 9px;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: orange;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #1E1E2F;
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background: #434367ff;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #f72585;
  background: #ffeef0;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #fda4af;
`; 

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; 
  justify-content: flex-start;
  color: #1E1E2F;  
  font-size: 1.6rem;
  font-weight: 700;
  margin-top: -0.7rem;
  margin-bottom: 0.6rem;
`;  

const Credentials = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; 
  justify-content: flex-start;
  color: #434367ff;  
  font-size: 0.9rem;
  font-weight: 400;
  margin-bottom: 1rem;
`;  

const SuccessMessage = styled.div`
  color: #22c55e;
  background: #f0fdf4;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #bbf7d0;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const RoleInfo = styled.div`
  color: #666;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 0.5rem;
  font-style: italic;
`;

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, client } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(false);
    setUserRole(null);
    
    dispatch(clearError());
    
    const result = await dispatch(loginUser({ email, password }));
    
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.role;
      setUserRole(role);
      setShowSuccess(true); 
      navigate('/profile'); 
    }
  };

  const fillDemoCredentials = () => {
    setEmail('sekul19@google.com');
    setPassword('clientpassword');
  };

  const fillVetCredentials = () => {
    setEmail('sekul30@google.com');
    setPassword('clientpassword');
  };

  useEffect(() => {
    if (isAuthenticated && client) {
      console.log('Already authenticated, checking role:', client.role);
      if (client.role === 'vet') {
        navigate('/clients-list');
      } else {
        navigate('/profile');
      }
    }
  }, [isAuthenticated, client, navigate]);

  if (isAuthenticated) {
    return (
      <FormContainer>
        <LoadingSpinner />
        <div>Redirecting...</div>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <Header>Login</Header>
      
      {showSuccess && (
        <SuccessMessage>
          Login successful! 
          {userRole && (
            <RoleInfo>
              Role: {userRole} - Redirecting to {userRole === 'vet' ? 'Clients List' : 'Profile'}...
            </RoleInfo>
          )}
        </SuccessMessage>
      )}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Credentials>
        <div>Demo Credentials:</div>
        <div>sekul19@google.com | clientpassword</div> 
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <Button 
            type="button" 
            onClick={fillDemoCredentials}
            style={{ 
              background: 'transparent', 
              color: '#434367ff', 
              border: '1px solid #434367ff',
              fontSize: '0.8rem',
              padding: '6px 12px',
              width: 'auto'
            }}
          >
            Fill Client Credentials
          </Button>
          <Button 
            type="button" 
            onClick={fillVetCredentials}
            style={{ 
              background: 'transparent', 
              color: '#dc3545', 
              border: '1px solid #dc3545',
              fontSize: '0.8rem',
              padding: '6px 12px',
              width: 'auto'
            }}
          >
            Fill Vet Credentials
          </Button>
        </div>
      </Credentials>
      
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoadingSpinner /> Logging in...
            </>
          ) : (
            'Login'
          )}
        </Button>
      </form>
    </FormContainer>
  );
};

export default Login;
