'use client';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export function PlayerList() {
  const { gameState } = useGameStore();
  
  if (!gameState) return null;
  const isHost = gameState.players[0]?.id === useGameStore.getState().socketId;

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-slate-700 shadow-xl overflow-hidden h-fit md:h-full flex flex-col">
      <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4 px-2 tracking-tight flex items-center justify-between">
        Players
        <span className="md:hidden text-xs bg-slate-700 px-2 py-0.5 rounded-full opacity-60">Swipe →</span>
      </h2>
      <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto space-x-2 md:space-x-0 md:space-y-2 pb-2 md:pb-0 pr-2 custom-scrollbar scrollbar-none md:scrollbar-thin">
        {gameState.players.map(p => {
          const isActive = p.id === gameState.currentPlayerId && gameState.status === 'playing';
          return (
            <motion.div 
              key={p.id}
              layout
              className={`p-2 h-14 md:h-auto md:p-3 rounded-xl flex items-center justify-between transition-colors flex-shrink-0 min-w-[140px] md:min-w-0 ${isActive ? 'bg-indigo-500/20 border border-indigo-500/50' : 'bg-slate-900/50 border border-slate-800'} ${p.isEliminated ? 'opacity-40 grayscale' : ''}`}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`w-2 h-2 rounded-full ${p.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-semibold text-white/90 text-sm md:text-base truncate max-w-[80px] md:max-w-none">
                  {p.name} {p.isMe && '(You)'}
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-xs md:text-sm font-medium opacity-80 text-white/70">
                  {p.isEliminated ? '💀' : `🃏 ${p.cardCount}`}
                </div>
                {isHost && !p.isMe && (
                  <button 
                    onClick={() => useGameStore.getState().kickPlayer(p.id)}
                    className="p-1 md:p-1.5 hover:bg-red-500/20 rounded-md text-red-400 opacity-60 hover:opacity-100 transition-all group"
                    title="Kick player"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
