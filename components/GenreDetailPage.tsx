import React from 'react';
import { FEATURED_WORLDS } from '../constants';
import { ChevronLeftIcon, StarIcon } from './icons';

type World = (typeof FEATURED_WORLDS)[0] & { staffPick?: boolean };

interface GenreDetailPageProps {
  category: string;
  worlds: World[];
  onWorldClick: (world: World) => void;
  onBack: () => void;
}

const GenreDetailPage: React.FC<GenreDetailPageProps> = ({ category, worlds, onWorldClick, onBack }) => {
  return (
    <div className="w-full animate-fade-in">
      <div className="mb-6 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-full text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-white">{category}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {worlds.map(world => (
          <button 
            key={world.title} 
            onClick={() => onWorldClick(world)}
            className={`relative aspect-video rounded-lg overflow-hidden group border-2 hover:border-accent transition-all duration-300 transform hover:scale-105 bg-cover bg-center ${world.staffPick ? 'border-amber-400' : 'border-stone-800'}`}
            style={{ backgroundImage: `url(${world.imageUrl})` }}
            aria-label={`Learn more about ${world.title}`}
          >
            {world.staffPick && (
                <div className="absolute top-2 right-2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full z-20 flex items-center gap-1">
                    <StarIcon className="w-4 h-4"/> Staff Pick
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col justify-end z-10 transition-colors group-hover:bg-black/70">
                <h4 className="font-bold text-white text-lg leading-tight">{world.title}</h4>
                <p className="text-sm text-stone-300/90">{world.tagline}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreDetailPage;