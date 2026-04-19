'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { cardAssets } from '../lib/cardStyles';

export function DrawPile() {
  const { gameState, drawCard } = useGameStore();

  if (!gameState) return null;

  const isMyTurn = gameState.currentPlayerId === gameState.players.find(p => p.isMe)?.id;

  return (
    <div className="flex flex-col items-center justify-center space-y-2 md:space-y-4">
      <div className="text-[10px] md:text-sm font-semibold opacity-70 uppercase tracking-widest text-slate-300">Draw Pile</div>
      <motion.button
        whileHover={isMyTurn && !gameState.pendingAction ? { scale: 1.05, y: -5 } : {}}
        whileTap={isMyTurn && !gameState.pendingAction ? { scale: 0.95 } : {}}
        onClick={drawCard}
        disabled={!isMyTurn || !!gameState.pendingAction}
        className={`relative w-24 h-32 md:w-32 md:h-44 rounded-xl shadow-2xl flex items-center justify-center transition-all overflow-hidden ${isMyTurn && !gameState.pendingAction
          ? 'shadow-indigo-500/30 cursor-pointer ring-4 ring-white/10'
          : 'cursor-not-allowed opacity-80 border-2 md:border-4 border-slate-800'
          }`}
      >
        <div className="absolute inset-0 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
          <Image
            src={cardAssets.back}
            alt="Deck Back"
            fill
            className="object-contain"
          />
        </div>

        {/* Draw count badge */}
        <div className="absolute -bottom-1 -right-1 bg-red-600 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-sm md:text-lg shadow-2xl border-2 md:border-4 border-slate-900 z-10">
          {gameState.drawPileCount}
        </div>
      </motion.button>

      {isMyTurn && (
        <div className="text-green-400 font-bold animate-pulse text-sm uppercase tracking-tighter">Your Turn - Draw a card</div>
      )}
    </div>
  );
}
