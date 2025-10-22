import React from 'react';

interface EnvironmentIndicatorProps {
  location: string;
}

const EnvironmentIndicator: React.FC<EnvironmentIndicatorProps> = ({ location }) => {
  if (!location) return null;

  return (
    <div
      key={location}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black/50 backdrop-blur-md text-white text-lg font-heading px-6 py-3 rounded-lg border border-white/20 shadow-lg animate-fade-in-out"
    >
      {location}
    </div>
  );
};

export default EnvironmentIndicator;
