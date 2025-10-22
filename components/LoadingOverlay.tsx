// FIX: Populated file with LoadingOverlay component.
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, text = "Loading..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in">
      <LoadingSpinner />
      <p className="text-white mt-4">{text}</p>
    </div>
  );
};

export default LoadingOverlay;
