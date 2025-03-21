import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

export function Label({ className = "", ...props }: LabelProps) {
  return (
    <label className={`text-gray-700 font-medium ${className}`} {...props} />
  );
}
