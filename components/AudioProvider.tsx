'use client';
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';

export function AudioProvider() {
  const { gameState, kaboomDrawnId, lastDrawnPlayerId } = useGameStore();
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const boomRef = useRef<HTMLAudioElement | null>(null);
  const drawRef = useRef<HTMLAudioElement | null>(null);

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
    bgmRef.current.volume = 0.25;

    boomRef.current = new Audio('/assets/mp3/boom.mp3');
    boomRef.current.volume = 0.7;

    drawRef.current = new Audio('/assets/mp3/draw.mp3');
    drawRef.current.volume = 0.5;

    const savedMute = localStorage.getItem('game_muted');
    if (savedMute === 'true') {
      setIsMuted(true);
    }

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

    if (gameState?.status === 'playing' && !isMuted) {
      bgmRef.current.play().catch(e => console.warn('BGM play failed:', e));
    } else {
      bgmRef.current.pause();
    }
  }, [gameState?.status, isMuted, hasInteracted]);

  // Handle Kaboom sound
  useEffect(() => {
    if (kaboomDrawnId && boomRef.current && !isMuted && hasInteracted) {
      boomRef.current.currentTime = 0;
      boomRef.current.play().catch(e => console.warn('Boom play failed:', e));
    }
  }, [kaboomDrawnId, isMuted, hasInteracted]);

  // Handle Draw sound
  useEffect(() => {
    if (lastDrawnPlayerId && drawRef.current && !isMuted && hasInteracted) {
      drawRef.current.currentTime = 0;
      drawRef.current.play().catch(e => console.warn('Draw play failed:', e));
    }
  }, [lastDrawnPlayerId, isMuted, hasInteracted]);

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    localStorage.setItem('game_muted', String(newMute));
  };

  return (
    <motion.button 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={toggleMute}
      className="fixed bottom-6 left-6 z-[200] p-4 rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all shadow-2xl flex items-center justify-center group overflow-hidden"
      title={isMuted ? 'Unmute' : 'Mute'}
    >
      <div className="relative z-10">
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
      
      {!isMuted && (
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-blue-500 rounded-full"
        />
      )}
      
      {/* Background glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}
