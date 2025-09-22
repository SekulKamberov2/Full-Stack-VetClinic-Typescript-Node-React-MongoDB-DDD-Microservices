import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 1rem;
  background: #f5f6fa;
  overflow-y: auto;
`;

const Dashboard: React.FC = () => {
  return (
    <LayoutContainer>
      <Sidebar />
      <ContentWrapper>
        <Header />
        <MainContent>
          <Outlet />
        </MainContent>
      </ContentWrapper>
    </LayoutContainer>
  );
};

export default Dashboard;
