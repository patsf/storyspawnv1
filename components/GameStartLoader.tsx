import React, { useState, useEffect } from 'react';

const messages = [
  "Conjuring a new world...",
  "Waking the ancient spirits...",
  "Weaving the threads of fate...",
  "Consulting the digital oracle...",
  "Polishing the apocalypse...",
  "Igniting the story...",
];

const GameStartLoader: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-secondary text-white p-4 font-sans animate-fade-in gradient-bg-animated">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl font-bold font-heading mb-4 text-white animate-subtle-pulse">StorySpawn</h1>
        <div className="h-8 mt-4 flex items-center justify-center">
          <p key={messageIndex} className="text-text-secondary text-lg animate-fade-in">
            {messages[messageIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameStartLoader;