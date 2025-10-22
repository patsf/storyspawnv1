import React, { useState, useEffect } from 'react';

interface SaveIndicatorProps {
  isSaving: boolean;
}

const SaveIndicator: React.FC<SaveIndicatorProps> = ({ isSaving }) => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    let timer: number;
    if (!isSaving && showSaved) {
        timer = window.setTimeout(() => setShowSaved(false), 2000);
    } else if (isSaving) {
        setShowSaved(true);
    }

    return () => clearTimeout(timer);
  }, [isSaving]);


  return (
    <div className="h-5 w-24 flex items-center justify-start">
      <div className={`text-sm transition-opacity duration-300 ${showSaved ? 'opacity-100' : 'opacity-0'}`}>
        {isSaving ? (
            <span className="text-text-secondary">Saving...</span>
        ) : (
            <span className="text-green-400">Saved ✓</span>
        )}
      </div>
    </div>
  );
};

export default SaveIndicator;