'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export function NopeButton() {
  const { gameState, playNope } = useGameStore();

  if (!gameState || !gameState.pendingAction) return null;

  const action = gameState.pendingAction;
  const hasNope = gameState.myHand.some(c => c.type === 'nope');
  const canNope = hasNope; // Everyone can nope if they have the card

  const handleNope = () => {
    const nopeCard = gameState.myHand.find(c => c.type === 'nope');
    if (nopeCard) {
      playNope(action.id, nopeCard.id);
    }
  };

  const actionName = action.actionType.replace('play_', '').replace('_', ' ');
  const originalPlayer = gameState.players.find(p => p.id === action.originalPlayerId)?.name || 'Someone';

  const isCurrentlyCancelled = action.nopeCount % 2 !== 0;
  const targetPlayer = gameState.players.find(p => p.id === action.targetPlayerId)?.name;
  
  const nopeMessage = action.nopeCount > 0
    ? (isCurrentlyCancelled ? "ACTION NOPED!" : "ACTION YEPPED!")
    : `${originalPlayer} is playing ${actionName}${targetPlayer ? ` on ${targetPlayer}` : ''}`;

  if (!hasNope && !action.nopeCount) {
    return (
      <div className="absolute top-4 md:top-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50 w-full px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black/90 text-white px-4 md:px-8 py-2 md:py-4 rounded-2xl md:rounded-3xl border-2 border-slate-700 backdrop-blur-xl shadow-2xl text-center flex flex-col items-center"
        >
          <div className="text-xs md:text-sm font-black uppercase tracking-tighter text-slate-400 mb-0.5 md:mb-1">{actionName}</div>
          <div className="font-black text-sm md:text-xl uppercase italic underline decoration-yellow-500 leading-tight">{nopeMessage}</div>
          <div className="mt-2 md:mt-4 h-1 md:h-1.5 w-24 md:w-32 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              key={action.nopeCount}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 2, ease: "linear" }}
              className="h-full bg-yellow-500"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0, y: -50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        className="absolute top-4 md:top-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center group w-full"
      >
        <div className="bg-black/60 px-3 md:px-4 py-1.5 md:py-2 rounded-t-lg md:rounded-t-xl text-white font-mono text-xs md:text-sm mb-[-2px] md:mb-0 z-10 relative">
          {nopeMessage}
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNope}
          disabled={!canNope}
          className={`w-24 h-24 sm:w-28 sm:h-28 md:w-44 md:h-44 rounded-full font-black text-2xl sm:text-3xl md:text-5xl border-4 sm:border-6 md:border-[12px] shadow-[0_0_30px_rgba(0,0,0,0.5)] md:shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-300 relative overflow-hidden z-20 ${canNope
            ? 'bg-red-600 border-red-950 text-white shadow-red-500/50 cursor-pointer hover:bg-red-500 hover:scale-105 active:scale-95'
            : 'bg-slate-800 border-slate-900 text-slate-600 cursor-not-allowed opacity-40'
            }`}
        >
          <span className="z-10 tracking-tighter uppercase italic">{isCurrentlyCancelled ? 'YEP!' : 'NOPE!'}</span>

          {/* Pulsing glow */}
          {canNope && (
            <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
          )}

          {/* Animated background rings */}
          <div className="absolute inset-0 z-0">
            <motion.div
              key={action.nopeCount}
              initial={{ width: '100%', height: '100%' }}
              animate={{ width: '0%', height: '0%' }}
              transition={{ duration: 2, ease: "linear" }}
              className="absolute inset-0 m-auto bg-black/20 rounded-full"
            />
          </div>
        </motion.button>

        {/* Tips */}
        {canNope && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-white font-black text-[10px] md:text-xs uppercase tracking-widest bg-red-600/20 px-3 md:px-4 py-1 rounded-full border border-red-500/30 backdrop-blur-sm"
          >
            QUICK! COUNTER-PLAY ACTIVE
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
