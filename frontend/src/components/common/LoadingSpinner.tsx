import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  inline?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  color = '#646cff',
  inline = false
}) => {
  return (
    <div className={`loading-spinner-container ${inline ? 'inline' : ''}`}>
      <div 
        className={`loading-spinner ${size}`}
        style={{ borderTopColor: color }}
      >
      </div>
    </div>
  );
};

export default LoadingSpinner;
