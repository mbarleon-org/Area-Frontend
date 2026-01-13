import React from 'react';
import type { EditMenuFieldProps } from './EditMenu.types';
import {
  inputContainerStyle,
  inputStyle,
  labelStyle,
  requiredStyle,
} from './EditMenu.styles';

export const EditMenuField: React.FC<EditMenuFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  inputRef,
}) => {
  return (
    <div style={inputContainerStyle}>
      <label style={labelStyle}>
        {label}
        {required && <span style={requiredStyle}>*</span>}
      </label>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
};
