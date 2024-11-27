import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string; 
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => {
  return (
    <div className="d-flex flex-column align-items-center mt-4 tc-w">
      {label && <p className="mb-2 primary-text" style={{ fontSize: '16px' }}>{label}</p>}
      <div className="progress w-100 h-100 rounded-5" style={{background:"none"}}>
        <div className="progress-bar" style={{backgroundColor:"rgba(0,90,0,0.5)", width: `${progress}%` }}>
          {Math.floor(progress)}%
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
