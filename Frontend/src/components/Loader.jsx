import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ size = 24, className = '', color = 'text-primary-600' }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 size={size} className={`animate-spin ${color}`} />
    </div>
  );
};

export default Loader;
