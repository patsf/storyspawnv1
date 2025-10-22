import React from 'react';
import { FEATURED_WORLDS, getCategoryFromTheme } from '../constants';
import { XIcon, StarIcon } from './icons';

type FeaturedWorld = (typeof FEATURED_WORLDS)[0] & { staffPick?: boolean };

interface FeaturedWorldDetailModalProps {
  world: FeaturedWorld | null;
  onClose: () => void;
  onPlay: (world: FeaturedWorld) => void;
  onGenreClick: (category: string) => void;
}

const FeaturedWorldDetailModal: React.FC<FeaturedWorldDetailModalProps> = ({ world, onClose, onPlay, onGenreClick }) => {
  if (!world) return null;

  const category = getCategoryFromTheme(world.theme);

  return (
    <div
      className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-4xl m-4 text-white flex flex-col max-h-[90vh] animate-slide-in-up shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 sm:h-80 w-full">
            <img src={world.imageUrl} alt={world.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/70 to-transparent"></div>
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-white bg-black/50 hover:bg-black/80 transition-colors">
                <XIcon className="w-6 h-6" />
            </button>
            <div className="absolute bottom-0 left-0 p-6">
                <h2 className="text-4xl font-extrabold font-heading text-white">{world.title}</h2>
                <p className="text-stone-300">{world.tagline}</p>
            </div>
        </div>

        <div className="p-6 overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    {category && (
                        <>
                            <button
                                onClick={() => onGenreClick(category)}
                                className="text-accent-text hover:text-accent hover:underline transition-colors focus:outline-none focus:text-accent"
                            >
                                {category}
                            </button>
                            <span>•</span>
                        </>
                    )}
                    <span>By {world.creator}</span>
                </div>
                {world.staffPick && (
                    <div className="bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                        <StarIcon className="w-4 h-4"/> Staff Pick
                    </div>
                )}
            </div>
            <p className="text-stone-300 font-mono leading-relaxed">{world.detailedDescription}</p>
        </div>

        <div className="p-4 mt-auto bg-stone-950/50 border-t border-stone-800">
             <button
                onClick={() => onPlay(world)}
                className="w-full bg-accent text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-hover transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-white animate-glow"
            >
                Start This Adventure
            </button>
        </div>

      </div>
    </div>
  );
};

export default FeaturedWorldDetailModal;