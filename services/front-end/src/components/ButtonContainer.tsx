import styled from 'styled-components';

interface ButtonContainerProps {
  margin?: string;
  width?: string;
  height?: string;
  justifyContent?: string;
  alignItems?: string;
  padding?: string;
  flexDirection?: string;
}

export const ButtonContainer = styled.div<ButtonContainerProps>`
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection || 'column'};
  justify-content: ${({ justifyContent }) => justifyContent || 'center'};
  align-items: ${({ alignItems }) => alignItems || 'center'};
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '80px'};
  margin: ${({ margin }) => margin || '0'};
  padding: ${({ padding }) => padding || '0'};
`;
