import React from 'react';
import { Meme } from '../types';
import { MemeCard } from './MemeCard';

interface MemeGridProps {
  memes: Meme[];
  title: string;
  icon?: string;
  onDelete?: (id: string) => void;
  onRegenerate?: (meme: Meme) => void;
  emptyMessage?: string;
}

export const MemeGrid: React.FC<MemeGridProps> = ({ 
  memes, 
  title, 
  icon = "🌌", 
  onDelete, 
  onRegenerate,
  emptyMessage = "No memes found in this sector of the galaxy."
}) => {
  if (memes.length === 0) {
    return (
      <div className="mt-12 text-center text-slate-500 py-12 border-2 border-dashed border-slate-800 rounded-xl">
        <p className="text-xl">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full max-w-6xl mx-auto px-4 pb-20">
      <h2 className="text-2xl font-cosmic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-8 flex items-center gap-2">
        <span className="text-2xl">{icon}</span> {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {memes.map((meme) => (
          <MemeCard 
            key={meme.id} 
            meme={meme} 
            onDelete={onDelete} 
            onRegenerate={onRegenerate}
          />
        ))}
      </div>
    </div>
  );
};