'use client';
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

export function AudioProvider() {
  const { gameState, kaboomDrawnId, lastDrawnPlayerId } = useGameStore();
  const [isMuted, setIsMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.25);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const boomRef = useRef<HTMLAudioElement | null>(null);
  const drawRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const statusRef = useRef(gameState?.status);
  const mutedRef = useRef(isMuted);

  useEffect(() => {
    statusRef.current = gameState?.status;
    mutedRef.current = isMuted;
  }, [gameState?.status, isMuted]);

  useEffect(() => {
    // Audio files are served from public/assets/mp3/
    bgmRef.current = new Audio('/assets/mp3/bgm.mp3');
    bgmRef.current.loop = true;

    boomRef.current = new Audio('/assets/mp3/boom.mp3');
    drawRef.current = new Audio('/assets/mp3/draw.mp3');

    // Load saved settings
    const savedMute = localStorage.getItem('game_muted');
    if (savedMute === 'true') setIsMuted(true);

    const savedMusicVal = localStorage.getItem('game_music_volume');
    const initMusic = savedMusicVal !== null ? parseFloat(savedMusicVal) : 0.25;
    setMusicVolume(initMusic);
    if (bgmRef.current) bgmRef.current.volume = savedMute === 'true' ? 0 : initMusic;

    const savedSfxVal = localStorage.getItem('game_sfx_volume');
    const initSfx = savedSfxVal !== null ? parseFloat(savedSfxVal) : 0.5;
    setSfxVolume(initSfx);
    if (boomRef.current) boomRef.current.volume = savedMute === 'true' ? 0 : Math.min(1, initSfx * 1.4);
    if (drawRef.current) drawRef.current.volume = savedMute === 'true' ? 0 : initSfx;

    const handleInteraction = () => {
      setHasInteracted(true);
      // Try to "unlock" audio by playing/pausing a silent moment
      if (bgmRef.current && statusRef.current === 'playing' && !mutedRef.current) {
        bgmRef.current.play().catch(() => {});
      }
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle BGM playback
  useEffect(() => {
    if (!bgmRef.current || !hasInteracted) return;

    if (gameState?.status === 'playing' && !isMuted && musicVolume > 0) {
      bgmRef.current.play().catch(e => console.warn('BGM play failed:', e));
    } else {
      bgmRef.current.pause();
    }
  }, [gameState?.status, isMuted, musicVolume, hasInteracted]);

  // Volume synchronization
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = isMuted ? 0 : musicVolume;
    }
    if (drawRef.current) {
      drawRef.current.volume = isMuted ? 0 : sfxVolume;
    }
    if (boomRef.current) {
      boomRef.current.volume = isMuted ? 0 : Math.min(1, sfxVolume * 1.4);
    }
  }, [isMuted, musicVolume, sfxVolume]);

  // Handle Kaboom sound
  useEffect(() => {
    if (kaboomDrawnId && boomRef.current && !isMuted && sfxVolume > 0 && hasInteracted) {
      boomRef.current.currentTime = 0;
      boomRef.current.play().catch(e => console.warn('Boom play failed:', e));
    }
  }, [kaboomDrawnId, isMuted, sfxVolume, hasInteracted]);

  // Handle Draw sound
  useEffect(() => {
    if (lastDrawnPlayerId && drawRef.current && !isMuted && sfxVolume > 0 && hasInteracted) {
      drawRef.current.currentTime = 0;
      drawRef.current.play().catch(e => console.warn('Draw play failed:', e));
    }
  }, [lastDrawnPlayerId, isMuted, sfxVolume, hasInteracted]);

  // Close mixer when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    localStorage.setItem('game_muted', String(newMute));
    if (newMute && bgmRef.current) {
      bgmRef.current.pause();
    } else if (!newMute && bgmRef.current && gameState?.status === 'playing' && musicVolume > 0 && hasInteracted) {
      bgmRef.current.play().catch(() => {});
    }
  };

  const handleMusicChange = (val: number) => {
    setMusicVolume(val);
    localStorage.setItem('game_music_volume', val.toString());
    if (val > 0 && isMuted) {
      setIsMuted(false);
      localStorage.setItem('game_muted', 'false');
    }
    if (bgmRef.current && val > 0 && gameState?.status === 'playing' && hasInteracted && bgmRef.current.paused) {
      bgmRef.current.play().catch(() => {});
    }
  };

  const handleSfxChange = (val: number) => {
    setSfxVolume(val);
    localStorage.setItem('game_sfx_volume', val.toString());
    if (val > 0 && isMuted) {
      setIsMuted(false);
      localStorage.setItem('game_muted', 'false');
    }
  };

  const playTestSfx = () => {
    if (drawRef.current && (!isMuted || sfxVolume > 0)) {
      if (isMuted) {
        setIsMuted(false);
        localStorage.setItem('game_muted', 'false');
      }
      drawRef.current.currentTime = 0;
      drawRef.current.play().catch(() => {});
    }
  };

  return (
    <div ref={containerRef} className="fixed bottom-6 left-6 z-[200]">
      {/* Volume Mixer Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-20 left-0 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 p-6 rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] w-80 text-white z-[210] flex flex-col gap-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/50 rounded-2xl text-xl">
                  🎧
                </div>
                <div>
                  <h3 className="font-black text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-wide">
                    Audio Mixer
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Volume Settings</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Close Mixer"
              >
                ✕
              </button>
            </div>

            {/* Master Mute Toggle Switch */}
            <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
                <div>
                  <span className="text-sm font-bold block">Master Audio</span>
                  <span className="text-xs text-slate-400">{isMuted ? 'Muted' : 'Unmuted'}</span>
                </div>
              </div>

              <button
                onClick={toggleMute}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  !isMuted ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <motion.div
                  className="w-6 h-6 bg-white rounded-full shadow-md"
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ x: !isMuted ? 24 : 0 }}
                />
              </button>
            </div>

            {/* Sliders Container */}
            <div className={`flex flex-col gap-5 transition-opacity duration-300 ${isMuted ? 'opacity-40 pointer-events-none' : ''}`}>
              {/* Music Volume */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎵</span>
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider">Music Volume</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                    {Math.round(musicVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={musicVolume}
                  onChange={e => handleMusicChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                />
              </div>

              {/* Sound Effects Volume */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💥</span>
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider">Sound Effects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={playTestSfx}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 font-bold px-2 py-0.5 rounded-md text-slate-300 hover:text-white transition-colors border border-slate-700"
                      title="Test Sound Effect"
                    >
                      Test
                    </button>
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                      {Math.round(sfxVolume * 100)}%
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sfxVolume}
                  onChange={e => handleSfxChange(parseFloat(e.target.value))}
                  onMouseUp={playTestSfx}
                  onTouchEnd={playTestSfx}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Audio Button */}
      <div className="flex items-center gap-2">
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-2xl backdrop-blur-xl border transition-all shadow-2xl flex items-center justify-center group overflow-hidden ${
            isOpen ? 'bg-indigo-600/80 border-indigo-400 text-white shadow-indigo-500/30 ring-4 ring-indigo-500/20' 
            : isMuted ? 'bg-slate-800/80 border-red-500/50 text-red-400 hover:bg-slate-800'
            : 'bg-slate-800/60 border-white/10 text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
          title="Audio Mixer"
        >
          <div className="relative z-10 flex items-center gap-2">
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </div>
          
          {!isMuted && !isOpen && (
            <motion.div 
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-blue-500 rounded-full pointer-events-none"
            />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.button>
      </div>
    </div>
  );
}
