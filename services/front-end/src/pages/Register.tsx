import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';
import { RootState } from '../store';
import { useAppDispatch } from '../store/hooks';
import { Role } from '../models/User';
import styled from 'styled-components';

const FormContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 20px;
  padding: 1.9rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 9px;
  font-size: 16px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 9px;
  font-size: 16px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #4361ee;
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background: #3a0ca3;
  }

  &:disabled {
    background: #ccc;
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

const RegisterHeader = styled.div`  
  margin-bottom: 0.5rem; 
  font-size: 2rem;
  font-weight: 700;
`; 

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'role' ? (value as Role) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const registerData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    dispatch(registerUser(registerData));
  };

  return (
    <FormContainer>
      <RegisterHeader>Register</RegisterHeader> 
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <Input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <Select name="role" value={formData.role} onChange={handleChange}>
          <option value="client">Client</option>
          <option value="staff">Staff</option>
          <option value="vet">Vet</option>
          <option value="admin">Admin</option>
        </Select>
        <Button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </FormContainer>
  );
};

export default Register;
