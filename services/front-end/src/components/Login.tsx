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

    outline: none; /* removes default blue outline */

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
 
`;  

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <FormContainer>
      <Header>Login</Header>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Credentials>sekul@google.com | clientpassword</Credentials>
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </FormContainer>
  );
};

export default Login;
