import styled from 'styled-components';
import React, { InputHTMLAttributes, CSSProperties } from 'react';

interface GenericInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  customStyle?: CSSProperties;
}

const StyledInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: #4361ee;
    box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
  }
`;

const GenericInput: React.FC<GenericInputProps> = ({ label, customStyle, ...rest }) => {
  return (
    <div style={{ marginBottom: '1rem', width: '100%' }}>
      {label && <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>{label}</label>}
      <StyledInput {...rest} style={customStyle} />
    </div>
  );
};

export default GenericInput;
 