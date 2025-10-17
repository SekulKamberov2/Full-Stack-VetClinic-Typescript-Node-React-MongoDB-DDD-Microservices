import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 170px;
  height: 100vh;
  background: #1e1e2f;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1rem; 
`;

const MenuItem = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 5px;
  transition: background 0.2s;

  &:hover {
    background: #33334d;
  }
`;

const Sidebar: React.FC = () => {
  return (
    <SidebarContainer>
      <h2>Admin</h2>
      <MenuItem to="admin/dashboard">Dashboard</MenuItem>
      <MenuItem to="/admin/clients">Clients</MenuItem>
      <MenuItem to="/admin/patients">Patients</MenuItem>
      <MenuItem to="/profile">Profile</MenuItem>
    </SidebarContainer>
  );
};

export default Sidebar;
