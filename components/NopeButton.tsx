'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export function NopeButton() {
  const { gameState, playNope, socketId } = useGameStore();

  if (!gameState || !gameState.pendingAction) return null;

  const action = gameState.pendingAction;
  const isMyAction = action.originalPlayerId === socketId;
  const hasNope = gameState.myHand.some(c => c.type === 'nope') && !isMyAction;

  const handleNope = () => {
    const nopeCard = gameState.myHand.find(c => c.type === 'nope');
    if (nopeCard) {
      playNope(action.id, nopeCard.id);
    }
  };

  const actionName = action.actionType.replace('_', ' ');
  const originalPlayer = gameState.players.find(p => p.id === action.originalPlayerId)?.name || 'Someone';
  const nopeMessage = action.nopeCount > 0 ? `Action Noped ${action.nopeCount} times!` : `${originalPlayer} is about to ${actionName}`;

  if (!hasNope && !action.nopeCount) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black/80 text-white px-6 py-3 rounded-xl border border-slate-700 backdrop-blur-md"
        >
          <div className="animate-pulse">{nopeMessage} (2s window)</div>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ scale: 0, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center group"
      >
        <div className="bg-black/60 px-4 py-2 rounded-t-xl text-white font-mono text-sm">
          {nopeMessage}
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: [-2, 2, -2, 0] }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNope}
          disabled={!hasNope}
          className={`w-24 h-24 md:w-32 md:h-32 rounded-full font-black text-2xl md:text-4xl border-4 md:border-8 shadow-2xl flex items-center justify-center transition-colors ${
            hasNope 
              ? 'bg-red-600 border-red-800 text-white shadow-red-500/50 cursor-pointer hover:bg-red-500 hover:border-red-600'
              : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
          }`}
        >
          NOPE!
        </motion.button>

        {/* Timer ring indicator mock */}
        <div className="absolute top-10 left-10 right-0 py-2 pointer-events-none">
           <motion.div 
             initial={{ width: '100%' }}
             animate={{ width: '0%' }}
             transition={{ duration: 2, ease: "linear" }}
             className="h-2 bg-yellow-400 mt-20 z-0 origin-left"
           />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
