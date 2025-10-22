import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isLoading: boolean;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-background-secondary border border-surface-primary rounded-lg p-6 w-full max-w-lg m-4 text-white animate-fade-in shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold mb-4 text-accent">{title}</h3>
        <div className="text-text-primary mb-6 font-mono min-h-[6rem]">
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[6rem] text-text-secondary gap-4">
                    <LoadingSpinner />
                    <p className="text-sm">Elaborating...</p>
                </div>
            ) : (
                <p>{content}</p>
            )}
        </div>
        <div className="flex justify-end">
            <button
                onClick={onClose}
                className="bg-interactive-secondary text-white font-bold py-2 px-6 rounded-lg hover:bg-interactive-secondary transition-colors duration-200"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;