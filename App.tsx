import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Shuffle, Zap, X, Image as ImageIcon, Skull, AlertTriangle, Search } from 'lucide-react';
import { generateMemeImage } from './services/geminiService';
import { dbService } from './services/db';
import { Meme, LoadingState } from './types';
import { RANDOM_TOPICS } from './constants';
import { Button } from './components/Button';
import { MemeCard } from './components/MemeCard';
import { MemeGrid } from './components/History';

function App() {
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDarkHumor, setIsDarkHumor] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentMeme, setCurrentMeme] = useState<Meme | null>(null);
  
  // App State
  const [memes, setMemes] = useState<Meme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load memes on mount and when search changes
  const loadMemes = async () => {
    try {
      if (searchQuery.trim()) {
        const results = await dbService.searchMemes(searchQuery);
        setMemes(results);
      } else {
        const results = await dbService.getAllMemes();
        setMemes(results);
      }
    } catch (e) {
      console.error("Failed to load memes from DB", e);
    }
  };

  useEffect(() => {
    loadMemes();
  }, [searchQuery]);

  const handleGenerate = async (topic: string) => {
    if (!topic.trim() && !selectedImage) return;

    setLoadingState('generating');
    setError(null);

    const effectiveTopic = topic.trim() || "Make a funny meme from this visual";

    try {
      const { imageUrl, title } = await generateMemeImage(effectiveTopic, selectedImage, isDarkHumor);
      
      const newMeme: Meme = {
        id: crypto.randomUUID(),
        imageUrl: imageUrl,
        prompt: effectiveTopic,
        title: title,
        description: effectiveTopic,
        isDarkHumor: isDarkHumor,
        timestamp: Date.now()
      };

      await dbService.saveMeme(newMeme);
      
      setCurrentMeme(newMeme);
      setLoadingState('success');
      loadMemes();
    } catch (err: any) {
      setError(err.message || "Failed to generate meme. Please try again.");
      setLoadingState('error');
    }
  };

  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_TOPICS.length);
    const randomTopic = RANDOM_TOPICS[randomIndex];
    setPrompt(randomTopic);
    handleGenerate(randomTopic);
  };

  const handleDelete = async (id: string) => {
    await dbService.deleteMeme(id);
    if (currentMeme?.id === id) {
      setCurrentMeme(null);
    }
    loadMemes();
  };

  const handleRegenerate = (meme: Meme) => {
    setPrompt(meme.prompt);
    setIsDarkHumor(meme.isDarkHumor);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleGenerate(meme.prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(prompt);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError("Failed to process the file. Please try another one.");
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isDarkHumor ? 'bg-slate-950' : 'cosmic-bg'} text-slate-200 selection:bg-purple-500 selection:text-white pb-20`}>
      {isDarkHumor && (
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-slate-950/50 to-slate-950 -z-10"></div>
      )}

      {/* Header */}
      <header className="pt-8 pb-6 px-4 sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-white/10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
               CM
             </div>
             <h1 className="text-2xl font-cosmic font-bold tracking-tight text-white">
               COSMICS
             </h1>
          </div>

          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <input 
                type="text" 
                placeholder="Search your library..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
             />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8 flex flex-col items-center gap-12">
        
        {/* Generator Section */}
        <div className={`w-full max-w-3xl backdrop-blur-xl border rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group transition-all duration-500 ${isDarkHumor ? 'bg-slate-900/80 border-red-900/30 shadow-red-900/20' : 'bg-slate-900/60 border-slate-700/50'}`}>
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r transform origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${isDarkHumor ? 'from-red-600 to-orange-600' : 'from-cyan-500 via-purple-500 to-pink-500'}`}></div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* File Upload Area */}
            <div className={`relative border-2 border-dashed rounded-xl p-4 transition-colors ${selectedImage ? (isDarkHumor ? 'border-red-500/50 bg-red-950/20' : 'border-purple-500/50 bg-purple-900/20') : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'}`}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={loadingState === 'generating'}
              />
              
              {selectedImage ? (
                <div className="relative h-48 w-full flex items-center justify-center">
                  <img src={selectedImage} alt="Upload preview" className="h-full object-contain rounded-lg" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1 bg-slate-900/80 text-white rounded-full hover:bg-red-500 transition-colors z-20"
                    title="Remove file"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <div className={`p-3 rounded-full ${isDarkHumor ? 'bg-red-500/10 text-red-400' : 'bg-purple-500/10 text-purple-400'} flex gap-2`}>
                    {isDarkHumor ? <Skull size={24} /> : <ImageIcon size={24} />}
                  </div>
                  <p className="text-sm font-medium">Drop an Image (Optional)</p>
                  <p className="text-xs text-amber-500 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    GIFs and Videos are not supported
                  </p>
                </div>
              )}
            </div>

            {/* Text Input */}
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a topic (e.g., 'Cats', 'Coding')..."
                className={`w-full bg-slate-800/80 border rounded-xl px-6 py-4 text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${isDarkHumor ? 'border-red-900/50 focus:ring-red-500' : 'border-slate-600 focus:ring-purple-500'}`}
                disabled={loadingState === 'generating'}
              />
              <Sparkles className={`absolute right-4 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none ${isDarkHumor ? 'text-red-400' : 'text-purple-400'}`} />
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Dark Humor Toggle */}
              <button
                  type="button"
                  onClick={() => setIsDarkHumor(!isDarkHumor)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all border ${isDarkHumor ? 'bg-red-500/10 border-red-500/50 text-red-200' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                  title="Enable for edgy, dark humor (18+ style)"
                >
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${isDarkHumor ? 'bg-red-600' : 'bg-slate-600'}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${isDarkHumor ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="text-sm font-bold flex items-center gap-2">
                    {isDarkHumor ? <><Skull size={16}/> DARK MODE</> : "Safe Mode"}
                  </span>
              </button>

              <div className="flex gap-4 w-full sm:w-auto">
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={handleRandom}
                    disabled={loadingState === 'generating'}
                    className="sm:w-auto"
                  >
                    <Shuffle size={20} />
                  </Button>

                  <Button 
                    type="submit" 
                    variant="cosmic" 
                    isLoading={loadingState === 'generating'}
                    className={`flex-1 text-lg py-3 sm:w-48 ${isDarkHumor ? '!bg-gradient-to-r !from-red-700 !to-orange-700 !shadow-red-900/40 !border-red-500/30' : ''}`}
                  >
                    <Zap size={20} className={loadingState === 'generating' ? 'hidden' : ''} />
                    Generate
                  </Button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg text-center animate-pulse">
              {error}
            </div>
          )}
        </div>

        {/* Loading / Current Meme Display */}
        {loadingState === 'generating' && (
          <div className="w-full max-w-md aspect-square bg-slate-800/30 rounded-2xl flex flex-col items-center justify-center border border-slate-700/50 animate-pulse">
            <div className="relative">
                <div className={`w-24 h-24 border-4 rounded-full animate-spin ${isDarkHumor ? 'border-red-500/30 border-t-red-500' : 'border-purple-500/30 border-t-purple-500'}`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">{isDarkHumor ? '💀' : '🤖'}</span>
                </div>
            </div>
            <p className={`mt-6 font-cosmic animate-bounce ${isDarkHumor ? 'text-red-400' : 'text-purple-300'}`}>
              {isDarkHumor ? "Summoning dark forces..." : "Consulting the Meme Gods..."}
            </p>
          </div>
        )}

        {currentMeme && loadingState !== 'generating' && (
          <div className="w-full max-w-md animate-float">
            <div className={`mb-4 flex items-center gap-2 justify-center ${isDarkHumor ? 'text-red-400' : 'text-cyan-400'}`}>
                <Sparkles size={16} />
                <span className="uppercase tracking-widest text-xs font-bold">Latest Creation</span>
                <Sparkles size={16} />
            </div>
            <MemeCard 
              meme={currentMeme} 
              onDelete={handleDelete}
              onRegenerate={handleRegenerate}
            />
          </div>
        )}

        {/* LIBRARY GRID */}
        <MemeGrid 
          memes={memes} 
          title="My Library"
          icon="💾"
          onDelete={handleDelete}
          onRegenerate={handleRegenerate}
          emptyMessage={
            searchQuery 
              ? `No memes found for "${searchQuery}"` 
              : "No memes created yet. Start generating!" 
          }
        />
      </main>
    </div>
  );
}

export default App;