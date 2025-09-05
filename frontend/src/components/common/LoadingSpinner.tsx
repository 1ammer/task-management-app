import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  color = '#646cff'
}) => {
  return (
    <div className="loading-spinner-container">
      <div 
        className={`loading-spinner ${size}`}
        style={{ borderTopColor: color }}
      >
      </div>
    </div>
  );
};

export default LoadingSpinner;
