import React from 'react';

interface LocationDisplayProps {
  imageUrl: string;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ imageUrl }) => {
  return (
    <div className="relative h-40 sm:h-48 w-full flex-shrink-0 animate-fade-in group" key={imageUrl}>
      <img src={imageUrl} alt="Current location" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background-secondary via-background-secondary/70 to-transparent"></div>
       <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
    </div>
  );
};

export default LocationDisplay;
