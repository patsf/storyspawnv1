import React, { useState, useEffect } from 'react';
import type { EnvironmentType } from '../constants';

interface DynamicBackgroundProps {
  environment: EnvironmentType;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ environment }) => {
  const [currentBg, setCurrentBg] = useState(`bg-env-${environment}`);
  const [prevBg, setPrevBg] = useState('');
  
  useEffect(() => {
    const newBg = `bg-env-${environment}`;
    if (newBg !== currentBg) {
      setPrevBg(currentBg);
      setCurrentBg(newBg);
    }
  }, [environment, currentBg]);

  return (
    <>
      {prevBg && (
        <div
          key={prevBg}
          className={`dynamic-bg ${prevBg} opacity-0`}
        />
      )}
      <div
        key={currentBg}
        className={`dynamic-bg ${currentBg} opacity-100`}
      />
    </>
  );
};

export default DynamicBackground;
