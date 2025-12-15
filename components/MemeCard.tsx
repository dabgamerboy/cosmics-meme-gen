import React from 'react';
import { Download, Trash2, RefreshCw } from 'lucide-react';
import { Meme } from '../types';

interface MemeCardProps {
  meme: Meme;
  onDelete?: (id: string) => void;
  onRegenerate?: (meme: Meme) => void;
}

export const MemeCard: React.FC<MemeCardProps> = ({ meme, onDelete, onRegenerate }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = meme.imageUrl;
    link.download = `cosmic-meme-${meme.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-xl transition-all hover:shadow-purple-500/20 hover:-translate-y-1 flex flex-col">
      <div className="aspect-square w-full overflow-hidden bg-slate-900 flex items-center justify-center relative">
         <img 
           src={meme.imageUrl} 
           alt={meme.title} 
           className="w-full h-full object-contain"
           loading="lazy"
         />
         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button 
              onClick={handleDownload}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
              title="Download"
            >
              <Download size={20} />
            </button>
            
            {onRegenerate && (
              <button 
                onClick={() => onRegenerate(meme)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-blue-300 backdrop-blur-md transition-colors"
                title="Regenerate"
              >
                <RefreshCw size={20} />
              </button>
            )}
         </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-cosmic text-lg text-white mb-1 truncate" title={meme.title}>{meme.title}</h3>
        <p className="text-sm text-slate-400 font-medium truncate mb-2">"{meme.prompt}"</p>
        
        {meme.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-2 italic">{meme.description}</p>
        )}
        
        <div className="mt-auto flex justify-between items-center pt-2 border-t border-slate-700/50">
           <span className="text-xs text-slate-500">{new Date(meme.timestamp).toLocaleDateString()}</span>
           <div className="flex gap-2">
             {onDelete && (
               <button 
                 onClick={() => onDelete(meme.id)}
                 className="text-red-400 hover:text-red-300 transition-colors"
                 title="Delete from Library"
               >
                 <Trash2 size={16} />
               </button>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};