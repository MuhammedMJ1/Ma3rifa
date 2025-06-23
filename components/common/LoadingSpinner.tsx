
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, text, className }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-primary ${className}`}>
      <Loader2 size={size} className="animate-spin" />
      {text && <p className="mt-2 text-sm text-textSecondary">{text}</p>}
    </div>
  );
};