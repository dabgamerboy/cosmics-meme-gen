import React, { useState } from 'react';
import { X, Globe, AlertTriangle } from 'lucide-react';
import { Meme } from '../types';
import { Button } from './Button';

interface PostModalProps {
  meme: Meme;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPost: (memeId: string, title: string, description: string) => void;
}

export const PostModal: React.FC<PostModalProps> = ({ meme, isOpen, onClose, onConfirmPost }) => {
  const [title, setTitle] = useState(meme.title);
  const [description, setDescription] = useState(meme.description || meme.prompt);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen) return null;

  const handlePostClick = () => {
    setShowConfirmation(true);
  };

  const handleFinalConfirm = () => {
    onConfirmPost(meme.id, title, description);
    setShowConfirmation(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Main Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
        >
          <X size={24} />
        </button>

        {/* Image Preview */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-4 md:h-auto h-64">
           <img 
             src={meme.imageUrl} 
             alt="Meme Preview" 
             className="max-h-full max-w-full object-contain rounded-lg shadow-lg" 
           />
        </div>

        {/* Form */}
        <div className="w-full md:w-1/2 p-6 flex flex-col gap-4 overflow-y-auto">
           <h2 className="text-2xl font-cosmic text-white mb-2">Post to Community</h2>
           <p className="text-sm text-slate-400 mb-4">Share your creation with the universe. Add a catchy title and description.</p>
           
           <div className="flex flex-col gap-2">
             <label className="text-xs font-bold uppercase text-slate-500">Title</label>
             <input 
               type="text" 
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
             />
           </div>

           <div className="flex flex-col gap-2">
             <label className="text-xs font-bold uppercase text-slate-500">Description</label>
             <textarea 
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               rows={4}
               className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
             />
           </div>

           <div className="mt-auto pt-4 flex gap-3 justify-end">
              <Button variant="secondary" onClick={onClose} className="px-4 py-2 text-sm">Cancel</Button>
              <Button variant="cosmic" onClick={handlePostClick} className="px-6 py-2 text-sm shadow-purple-500/20">
                Post Meme
              </Button>
           </div>
        </div>

        {/* Are you sure Popup Overlay */}
        {showConfirmation && (
          <div className="absolute inset-0 z-20 bg-slate-900/95 flex items-center justify-center p-6 animate-in fade-in duration-200">
             <div className="max-w-xs text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500 animate-bounce">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
                <p className="text-slate-400 text-sm mb-6">
                  This will make your meme public for everyone to see in the Community Feed.
                </p>
                <div className="flex gap-3 justify-center">
                   <button 
                     onClick={() => setShowConfirmation(false)}
                     className="px-6 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors font-medium"
                   >
                     No, wait
                   </button>
                   <button 
                     onClick={handleFinalConfirm}
                     className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity font-bold shadow-lg shadow-purple-500/30"
                   >
                     Yes, Post it!
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};