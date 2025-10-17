import styled, { css } from 'styled-components';

interface ButtonProps {
  width?: string;
  height?: string;
  border?: string; 
  borderRadius?: string;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontWeight?: string;
  hoverBackground?: string;
  hoverColor?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

const Button = styled.button<ButtonProps>` 
  width: ${props => props.width || 'auto'};
  height: ${props => props.height || '40px'};
  border-radius: ${props => props.borderRadius || '9px'};
  
  border: ${props => {
    if (props.border) return props.border;
    if (props.variant === 'outline')
      return `2px solid ${props.backgroundColor || '#007bff'}`;
    return 'none';
  }};
   
  font-size: ${props => props.fontSize || '14px'};
  font-weight: ${props => props.fontWeight || '600'};
  font-family: inherit;
  text-align: center;
   
  color: ${props => {
    if (props.disabled) return '#999';
    if (props.variant === 'outline') return props.color || props.backgroundColor || '#007bff';
    return props.color || '#fff';
  }};
  
  background-color: ${props => {
    if (props.disabled) return '#f5f5f5';
    if (props.variant === 'outline') return 'transparent';
    
    switch (props.variant) {
      case 'primary': return props.backgroundColor || '#007bff';
      case 'secondary': return props.backgroundColor || '#6c757d';
      case 'danger': return props.backgroundColor || '#dc3545';
      case 'success': return props.backgroundColor || '#28a745';
      default: return props.backgroundColor || '#007bff';
    }
  }};
   
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
   
  padding: ${props => {
    switch (props.size) {
      case 'small': return '3px 12px';
      case 'large': return '5px 16px';
      default: return '5px 20px';
    }
  }};
   
  &:hover {
    background-color: ${props => {
      if (props.disabled) return '#f5f5f5';
      if (props.hoverBackground) return props.hoverBackground;
      if (props.variant === 'outline') return props.backgroundColor || '#007bff';
       
      const baseColor = props.backgroundColor || getBaseColor(props.variant);
      return getHoverColor(baseColor);
    }};
    
    color: ${props => {
      if (props.disabled) return '#999';
      if (props.hoverColor) return props.hoverColor;
      if (props.variant === 'outline') return '#fff';
      return props.color || '#fff';
    }};
     
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 8px rgba(0,0,0,0.1)'};
  }
   
  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }
   
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
  
  ${props => props.disabled && css`
    opacity: 0.6;
  `}
`;

const getBaseColor = (variant?: string): string => {
  switch (variant) {
    case 'primary': return '#007bff';
    case 'secondary': return '#6c757d';
    case 'danger': return '#dc3545';
    case 'success': return '#28a745';
    default: return '#007bff';
  }
};

const getHoverColor = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    '#007bff': '#0056b3',
    '#6c757d': '#545b62',
    '#dc3545': '#c82333',
    '#28a745': '#218838',
  };
  
  return colorMap[color] || color;
};

export default Button;
