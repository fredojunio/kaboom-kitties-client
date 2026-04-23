'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useGameStore } from '../store/gameStore';
import { cardAssets } from '../lib/cardStyles';

export function CardAnimations() {
  const { kaboomDrawnId, peekedCards, awaitingDefuseCard, clearPeeked, insertDefuse, gameState, lastDrawnPlayerId } = useGameStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isMeExploding = kaboomDrawnId === gameState?.players.find(p => p.isMe)?.id;
  const isMeDrawing = lastDrawnPlayerId === gameState?.players.find(p => p.isMe)?.id;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const itemHeight = 56; // h-14
    const scrollTop = container.scrollTop;

    const index = Math.round(scrollTop / itemHeight);
    const maxIndex = (gameState?.drawPileCount || 0);
    const boundedIndex = Math.max(0, Math.min(maxIndex, index));

    if (boundedIndex !== selectedIndex) {
      setSelectedIndex(boundedIndex);
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: index * 56,
        behavior: 'smooth'
      });
    }
  };

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
              className="flex flex-col items-center w-full max-w-md"
            >
              <div className="w-40 h-56 relative mb-6 shadow-[0_0_50px_rgba(52,211,153,0.3)] rounded-2xl overflow-hidden border-2 border-emerald-500/50">
                <Image src={cardAssets.kaboom} alt="Kaboom" fill className="object-contain" />
              </div>

              <h2 className="text-3xl font-black text-emerald-400 mb-1 drop-shadow-sm uppercase tracking-tighter italic">DEFUSED!</h2>
              <p className="text-slate-400 mb-8 font-medium text-sm">Where do you want to insert the Kitten?</p>

              <div className="relative w-72 h-64 bg-slate-900/50 rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col pt-0">
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none opacity-80" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none opacity-80" />

                <div className="absolute inset-x-4 top-[100px] h-14 border-y-2 border-emerald-500/30 bg-emerald-500/5 z-0 pointer-events-none rounded-sm" />

                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto scroll-smooth snap-y snap-mandatory px-4 custom-scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="h-[100px]" />

                  {[...Array((gameState?.drawPileCount || 0) + 1)].map((_, i) => {
                    const label = i === 0 ? "TOP OF DECK" : i === (gameState?.drawPileCount || 0) ? "BOTTOM OF DECK" : ``;
                    const isActive = selectedIndex === i;
                    return (
                      <motion.button
                        key={i}
                        onClick={() => scrollToIndex(i)}
                        className="w-full h-14 flex items-center justify-center snap-center shrink-0 group"
                      >
                        <div className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-125' : 'scale-90 opacity-40 group-hover:opacity-80'}`}>
                          <span className={`text-[15px] font-black mb-0.5 tracking-widest ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>{i}</span>
                          <span className={`text-xs uppercase tracking-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>{label}</span>
                        </div>
                      </motion.button>
                    );
                  })}

                  <div className="h-[100px]" />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => insertDefuse(selectedIndex)}
                className="mt-8 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-12 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all uppercase tracking-widest"
              >
                Insert at Position {selectedIndex}
              </motion.button>

              <div className="mt-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                Scroll to explore • Click to focus
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lastDrawnPlayerId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.2, y: 0, x: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.2, 1, 0.5],
              y: isMeDrawing ? [0, 0, 400] : [0, 0, -400],
              rotate: isMeDrawing ? [0, 0, 10] : [0, 0, -10]
            }}
            transition={{ duration: 0.8, times: [0, 0.2, 0.8, 1] }}
            className="fixed inset-0 z-[80] pointer-events-none flex items-center justify-center p-4"
          >
            <motion.div
              className="flex flex-col items-center"
            >
              <div className="w-24 h-32 md:w-32 md:h-44 bg-slate-900 rounded-xl border-2 border-white/20 shadow-2xl flex items-center justify-center relative overflow-hidden mb-2">
                <Image
                  src={cardAssets.back}
                  alt="Drawn Card"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
