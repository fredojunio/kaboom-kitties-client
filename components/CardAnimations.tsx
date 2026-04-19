'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useGameStore } from '../store/gameStore';
import { cardAssets } from '../lib/cardStyles';

export function CardAnimations() {
  const { kaboomDrawnId, peekedCards, awaitingDefuseCard, clearPeeked, insertDefuse, gameState } = useGameStore();

  const isMeExploding = kaboomDrawnId === gameState?.players.find(p => p.isMe)?.id;

  return (
    <>
      <AnimatePresence>
        {kaboomDrawnId && isMeExploding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-red-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [1, 2.5, 2], rotate: 0 }}
              transition={{ duration: 0.5 }}
              className="text-9xl drop-shadow-[0_0_100px_rgba(255,0,0,1)]"
            >
              💥
            </motion.div>
            <div className="absolute top-1/4 text-5xl font-black text-white px-8 py-4 bg-black/80 rounded-3xl animate-bounce border-4 border-red-500">
               KABOOM!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {peekedCards.length > 0 && (
          // ... (keep peek as is, it's already updated to use assets in previous turns)
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-bold text-white mb-8">Top 3 Cards</h2>
              <div className="flex gap-4 mb-8">
                {peekedCards.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="w-36 h-52 rounded-xl border-4 border-white/20 shadow-2xl relative overflow-hidden"
                  >
                     <Image src={cardAssets[c.type]} alt={c.type} fill className="object-contain bg-slate-800" />
                  </motion.div>
                ))}
              </div>
              <button 
                onClick={clearPeeked}
                className="bg-indigo-500 hover:bg-indigo-600 px-8 py-3 rounded-xl font-bold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {awaitingDefuseCard && (
          <motion.div 
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              initial={{ scale: 0.8, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-48 h-72 relative mb-8 shadow-[0_0_50px_rgba(52,211,153,0.4)] rounded-2xl overflow-hidden border-4 border-emerald-500">
                <Image src={cardAssets.kaboom} alt="Kaboom" fill className="object-contain" />
              </div>

              <h2 className="text-4xl font-black text-emerald-400 mb-2 drop-shadow-sm uppercase tracking-tighter">DEFUSED!</h2>
              <p className="text-slate-300 mb-8 font-medium">Where do you want to secretly insert the Kaboom Kitty?</p>
              
              <div className="relative w-full max-w-2xl bg-slate-900/80 p-6 rounded-3xl border border-white/10 shadow-2xl">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 px-2">
                   <span>Top of Deck</span>
                   <span>Bottom</span>
                </div>
                
                <div className="flex gap-1.5 w-full justify-evenly">
                  {[...Array(Math.max((gameState?.drawPileCount || 0) + 1, 1))].map((_, i) => (
                     <motion.button
                       key={i}
                       whileHover={{ scale: 1.15, y: -4 }}
                       whileTap={{ scale: 0.9 }}
                       onClick={() => insertDefuse(i)}
                       className="flex-1 h-20 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-400 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold text-emerald-500 hover:text-white transition-all overflow-hidden"
                     >
                        <span className="opacity-40 mb-1">POS</span>
                        <span className="text-lg">{i}</span>
                     </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
