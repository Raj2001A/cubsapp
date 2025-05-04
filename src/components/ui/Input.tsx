import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, className = '', ...props }, ref) => (
  <div className="flex flex-col mb-2">
    {label && <label className="mb-1 font-medium text-[#DD1A51]">{label}</label>}
    <input
      ref={ref}
      className={`block w-full rounded-md border border-[#DD1A51] bg-white text-[#DD1A51] placeholder-[#b3123e] focus:border-[#DD1A51] focus:ring-2 focus:ring-red-300 focus:outline-none px-4 py-2 transition-colors duration-150 ${className}`}
      {...props}
    />
  </div>
));

export default Input;
