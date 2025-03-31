import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function Button({ className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
