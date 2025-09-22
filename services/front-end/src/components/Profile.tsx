import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { RootState } from '../store';
import { useAppDispatch } from '../store/hooks';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  max-width: 550px;
  margin: 3rem auto;
  padding: 2rem;
  background: white;
  border-radius: 14px;
  box-shadow: 0 73px 90px 434367ff;
`;

const ProfileInfo = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  p {
    margin: 4px 0;
    font-size: 1.3rem;
  }
  strong {
    color: #1E1E2F;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: #1E1E2F;
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 16px;
  cursor: pointer;
  margin-right: 0.5rem;

  &:hover {
    background: #434367ff;
  }
`; 

const ButtonWrapper = styled.div`
  display: flex; 
  align-items: center;
  justify-content: flex-start; 
`; 

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth); 
  console.log('Profile', user)
  useEffect(() => { 
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  return (
    <ProfileContainer>
      <h2>User Profile</h2>
      <ProfileInfo>
        <p><strong>ID:</strong> {user._id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>First Name:</strong> {user.firstName}</p>
        <p><strong>Last Name:</strong> {user.lastName}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </ProfileInfo>
      <ButtonWrapper> 
        <Button onClick={handleLogout}>Update</Button>
        <Button onClick={handleLogout}>New Client</Button>
        <Button onClick={handleLogout}>Logout</Button>
      </ButtonWrapper>
    </ProfileContainer>
  );
};

export default Profile;
