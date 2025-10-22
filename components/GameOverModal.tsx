import React from 'react';

interface GameOverBannerProps {
  onNewGame: () => void;
  onReturnToMenu: () => void;
}

const GameOverBanner: React.FC<GameOverBannerProps> = ({ onNewGame, onReturnToMenu }) => {
  return (
    <div className="p-4 bg-transparent border-t border-red-500/30 text-center animate-fade-in">
        <h3 className="text-xl font-bold font-heading text-red-400">Your Story Has Ended</h3>
        <p className="text-text-secondary mb-4 text-sm">Death is not a barrier, but a new beginning.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onNewGame}
            className="bg-accent text-white font-bold py-2 px-5 rounded-lg hover:bg-accent-hover transition-colors duration-200"
          >
            Start a New Adventure
          </button>
          <button
            onClick={onReturnToMenu}
            className="bg-interactive-secondary text-white font-bold py-2 px-5 rounded-lg hover:bg-interactive-secondary transition-colors duration-200"
          >
            Return to Menu
          </button>
        </div>
      </div>
  );
};

export default GameOverBanner;