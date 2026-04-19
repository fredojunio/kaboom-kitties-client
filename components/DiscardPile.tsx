'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useGameStore } from '../store/gameStore';
import { cardColors, cardEmojis, cardAssets } from '../lib/cardStyles';
import { CardType, Card } from '../types';

export function DiscardPile() {
  const { gameState } = useGameStore();
  const [showHistory, setShowHistory] = useState(false);

  if (!gameState) return null;

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  const { recentDiscards, pendingAction } = gameState;

  return (
    <div className="flex items-center justify-center relative min-h-[220px] md:min-h-[300px]">
      <div className="relative flex items-center justify-center gap-4 md:gap-16">
        {/* The Active Play (Current) */}
        <div className="relative w-28 h-40 md:w-40 md:h-56 flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {pendingAction && (
              <motion.div
                key={pendingAction.id}
                initial={{ scale: 0.5, y: 100, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, y: -100, opacity: 0, filter: 'blur(10px)' }}
                className="absolute z-50 flex flex-col items-center"
              >
                <div className="absolute -top-12 bg-white text-black px-4 py-1 rounded-full font-black text-sm shadow-xl z-10 whitespace-nowrap uppercase tracking-tighter">
                  {pendingAction.actionType.replace('_', ' ')}
                </div>

                <div className="flex -space-x-8 md:-space-x-12">
                  {pendingAction.cards?.map((card: Card, i: number) => (
                    <motion.div
                      key={card.id}
                      initial={{ rotate: -10 * i }}
                      animate={{ rotate: (i - (pendingAction.cards!.length - 1) / 2) * 5 }}
                      className="w-28 h-40 md:w-40 md:h-56 shadow-[0_0_40px_rgba(255,255,255,0.3)] relative rounded-2xl overflow-hidden"
                    >
                      {cardAssets[card.type] ? (
                        <Image src={cardAssets[card.type]} alt={card.type} fill className="object-contain" />
                      ) : (
                        <div className={`w-full h-full flex flex-col items-center justify-center border-4 border-white/20 ${cardColors[card.type] || 'bg-slate-700'}`}>
                          <div className="text-4xl mb-2">{cardEmojis[card.type]}</div>
                          <div className="font-black uppercase text-[10px] text-white tracking-widest">{card.type.replace(/_/g, ' ')}</div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {pendingAction.nopeCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2 }}
                    className="absolute inset-0 border-[16px] border-red-600 rounded-2xl flex items-center justify-center pointer-events-none z-20"
                  >
                    <div className="bg-red-600 text-white font-black text-4xl px-4 rotate-[-20deg] shadow-2xl">
                      NOPED!
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* KABOOM on the table visibility */}
          {useGameStore.getState().kaboomDrawnId && (
            <motion.div
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: isMobile ? 1 : 1.2, rotate: 0 }}
              className="absolute z-[60] w-36 h-52 md:w-48 md:h-72 shadow-[0_0_60px_rgba(239,68,68,0.6)] rounded-3xl border-4 md:border-8 border-red-600 overflow-hidden"
            >
              <Image src={cardAssets.kaboom} alt="KABOOM" fill className="object-contain" />
              <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none" />
            </motion.div>
          )}

          {/* {!pendingAction && !useGameStore.getState().kaboomDrawnId && (
               <div className="text-slate-600 font-bold uppercase tracking-tighter opacity-20 text-2xl rotate-[-10deg] whitespace-nowrap">
                  THE TABLE
               </div>
            )} */}
        </div>

        {/* The Discard Stack (Past) - Now on the right */}
        <motion.div 
          onClick={() => setShowHistory(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-24 h-32 md:w-32 md:h-44 scale-90 opacity-60 cursor-pointer group"
        >
          <div className="absolute -top-6 inset-x-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold bg-white text-black px-2 py-0.5 rounded-full uppercase">View History</span>
          </div>

          {!recentDiscards || recentDiscards.length === 0 && (
            <div className="absolute inset-0 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500 italic text-xs">
              History
            </div>
          )}
          {recentDiscards?.map((type: CardType, i: number) => {
            const rotation = (i - recentDiscards.length / 2) * 2;
            const x = (i - recentDiscards.length / 2) * 5;
            return (
              <motion.div
                key={`discard-${i}-${type}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: rotation, x }}
                className="absolute inset-0 rounded-xl shadow-lg overflow-hidden"
                style={{ zIndex: i }}
              >
                <div className="absolute inset-0">
                  {cardAssets[type] ? (
                    <Image src={cardAssets[type]} alt={type} fill className="object-contain" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${cardColors[type]}`}>
                      <div className="text-xl">{cardEmojis[type]}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          <div className="absolute -bottom-8 inset-x-0 text-center text-[10px] font-bold uppercase opacity-40 tracking-widest">Discard Pile</div>
        </motion.div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Played Cards History</h3>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-12">
                  {[...(gameState.discardHistory || [])].reverse().map((type, i) => (
                    <motion.div
                      key={`history-${i}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="group flex flex-col items-center"
                    >
                      <div className={`w-full aspect-[3/4] rounded-xl relative overflow-hidden shadow-lg border-2 border-white/5 transition-transform group-hover:scale-105 duration-200`}>
                        {cardAssets[type] ? (
                          <Image src={cardAssets[type]} alt={type} fill className="object-contain" />
                        ) : (
                          <div className={`w-full h-full flex flex-col items-center justify-center ${cardColors[type] || 'bg-slate-800'}`}>
                            <div className="text-3xl mb-1">{cardEmojis[type]}</div>
                          </div>
                        )}
                      </div>
                      <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                        {type.replace('_', ' ')}
                      </span>
                    </motion.div>
                  ))}

                  {(!gameState.discardHistory || gameState.discardHistory.length === 0) && (
                    <div className="col-span-full py-20 text-center opacity-30 italic font-bold">
                      No cards played yet
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-950/50 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                Showing {gameState.discardHistory?.length || 0} cards (Newest First)
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
