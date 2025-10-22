import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isLoading: boolean;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, title, content, isLoading }) => {
  if (!isOpen) return null;

  const formatContent = (text: string) => {
    const formatted = text
      .replace(/^# (.*$)/gim, '<h3 class="text-xl font-bold mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h4 class="text-lg font-semibold mb-1">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n/g, '<br />');
      
    // Wrap list items in a ul
    return formatted.includes('<li') ? `<ul>${formatted.replace(/<li/g, '</li><li').replace('</li>', '')}</li></ul>` : formatted;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-background-secondary border border-surface-primary rounded-lg p-6 w-full max-w-2xl m-4 text-white animate-fade-in flex flex-col max-h-[80vh] shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold mb-4 text-accent flex-shrink-0">{title}</h3>
        <div className="text-text-primary mb-6 font-mono overflow-y-auto prose prose-invert prose-sm prose-p:my-1 prose-ul:my-2">
            {isLoading ? (
                <div className="flex items-center justify-center h-full min-h-[12rem]">
                    <div className="flex flex-col items-center gap-2 text-text-secondary">
                        <LoadingSpinner />
                        <span>Summarizing...</span>
                    </div>
                </div>
            ) : (
                <div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
            )}
        </div>
        <div className="flex justify-end mt-auto flex-shrink-0">
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

export default SummaryModal;