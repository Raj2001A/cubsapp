import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'danger' | 'default';
  size?: 'sm' | 'md' | 'lg';
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => (
  <button
    className={`rounded-lg px-5 py-2 font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
      ${variant === 'primary' ? 'bg-[#DD1A51] hover:bg-[#b3123e] text-white' : ''}
      ${variant === 'danger' ? 'bg-red-700 hover:bg-red-800 text-white' : ''}
      ${variant === 'default' ? 'bg-white border border-[#DD1A51] text-[#DD1A51] hover:bg-[#ffe5ed]' : ''}
      ${size === 'sm' ? 'px-3 py-1 text-sm' : ''}
      ${size === 'md' ? 'px-4 py-2' : ''}
      ${size === 'lg' ? 'px-6 py-3 text-lg' : ''}
      ${className}`}
    {...props}
  />
);

export default Button;
