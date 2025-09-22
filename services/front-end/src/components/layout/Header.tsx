import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  height: 40px;
  background: #1E1E2F;
  color: white;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 0.4rem;
`;

const Header: React.FC = () => {
  return (
    <HeaderContainer> 
      <p>Welcome</p>
    </HeaderContainer>
  );
};

export default Header;
