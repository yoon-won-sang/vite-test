import React from 'react';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  onClick
}) => {
  return (
    <button
      style={{
        padding: '8px 16px',
        backgroundColor: variant === 'primary' ? '#1890ff' : '#f0f0f0',
        color: variant === 'primary' ? '#fff' : '#000',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
