import React from 'react';
import { SendIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface UserInputProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
}

const UserInput: React.FC<UserInputProps> = ({ onSubmit, isLoading, input, setInput }) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
    }
  };

  return (
    <div className="p-4 bg-transparent border-t border-surface-primary" data-tour-id="user-input">
      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? "Awaiting story..." : "What do you do next?"}
              disabled={isLoading}
              className="w-full bg-surface-secondary border border-border-primary rounded-full py-3 px-5 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/80 transition duration-200 font-mono"
              autoFocus
            />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-accent text-white rounded-full p-3 w-11 h-11 flex items-center justify-center hover:bg-accent-hover disabled:bg-surface-primary disabled:text-text-secondary disabled:cursor-not-allowed transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-secondary focus:ring-white"
          aria-label="Send message"
        >
          {isLoading ? <LoadingSpinner /> : <SendIcon className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};

export default UserInput;