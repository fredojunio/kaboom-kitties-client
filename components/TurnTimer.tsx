'use client';
import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';

export function TurnTimer() {
  const { gameState } = useGameStore();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    if (!gameState || gameState.status !== 'playing' || !gameState.turnExpiresAt) {
      setTimeLeft(null);
      setProgress(100);
      return;
    }

    const expiresAt = gameState.turnExpiresAt;
    const totalDuration = 15000;

    const updateTimer = () => {
      const remaining = Math.max(0, expiresAt - Date.now());
      setTimeLeft(Math.ceil(remaining / 1000));
      setProgress((remaining / totalDuration) * 100);

      if (remaining <= 0) {
        return true;
      }
      return false;
    };

    updateTimer();
    const interval = setInterval(() => {
      if (updateTimer()) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [gameState]);

  if (!gameState || gameState.status !== 'playing' || timeLeft === null) return null;

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const isMe = currentPlayer?.isMe;

  // Determine stroke color based on urgency
  let strokeColor = 'text-emerald-500';
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  if (timeLeft <= 5) {
    strokeColor = 'text-red-500';
    glowColor = 'rgba(239, 68, 68, 0.6)';
  } else if (timeLeft <= 10) {
    strokeColor = 'text-amber-500';
    glowColor = 'rgba(245, 158, 11, 0.4)';
  }

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="mb-4 flex flex-col items-center gap-2"
    >
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-full px-6 py-3 shadow-2xl flex items-center gap-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* SVG Circular Progress */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-slate-800"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-75 ${strokeColor}`}
              style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
            />
          </svg>
          {/* Time Left Number inside Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-mono font-black text-xl ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {timeLeft}
            </span>
          </div>
        </div>

        <div className="flex flex-col pr-2">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Active Turn</span>
          <span className={`font-bold text-base md:text-lg ${isMe ? 'text-indigo-400 font-black' : 'text-slate-200'}`}>
            {currentPlayer?.name || 'Player'} {isMe && '(You)'}
          </span>
        </div>
      </div>

      {isMe && timeLeft <= 5 && (
        <motion.span 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 font-black uppercase tracking-widest animate-bounce bg-red-950/80 border border-red-500/50 px-4 py-1 rounded-full shadow-lg"
        >
          ⚠️ Hurry! Auto-draw in {timeLeft}s
        </motion.span>
      )}
    </motion.div>
  );
}
