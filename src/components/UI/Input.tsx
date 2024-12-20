import React from "react";

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ 
  className = "", 
  ...props 
}) => {
  return (
    <input 
      className={`border rounded px-3 py-2 w-full ${className}`} 
      {...props} 
    />
  );
};

export default Input;
