import React, { ReactNode } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  border: 1px solid pink;
`;

const Content = styled.div`
  flex: 1;
  background: #f9f9f9; 
  overflow-y: auto;
`;

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <Sidebar />
      <Content>{children}</Content>
    </LayoutContainer>
  );
};

export default AdminLayout;
