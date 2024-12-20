import React from "react";
import { appPrimaryColor } from "../../constants";

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ 
  children, 
  className = "", 
  ...props 
}) => {
  return (
    <button 
      className={`px-4 py-2 bg-[${appPrimaryColor}] text-white rounded ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
