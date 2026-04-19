'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

import Image from 'next/image';
import { cardColors, cardEmojis, cardAssets } from '../lib/cardStyles';

export function Hand() {
  const { gameState, playCard, playCombo, localHandOrder, reorderHand } = useGameStore();
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Responsive sizes
  const isMobile = windowWidth < 768;
  const cardWidth = isMobile ? 120 : 176; // w-30 vs w-44 approx
  const cardHeight = isMobile ? 180 : 256; // h-45 vs h-64 approx

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!gameState) return null;

  const isMyTurn = gameState.currentPlayerId === gameState.players.find(p => p.isMe)?.id;

  const toggleCard = (id: string) => {
    setSelectedCards(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handlePlayCard = (cardId: string) => {
    if (gameState.myHand.find(c => c.id === cardId)?.type === 'demand' && !targetId) {
      alert("Please select a target first!");
      return;
    }
    playCard(cardId, targetId || undefined);
    setSelectedCards([]);
  };

  const handlePlayCombo = () => {
    if (!targetId) {
      alert("Combos require a target player.");
      return;
    }
    playCombo(selectedCards, targetId);
    setSelectedCards([]);
  };

  // Other players to target
  const otherPlayers = gameState.players.filter(p => !p.isMe && !p.isEliminated);

  return (
    <div className="relative h-full w-full mt-auto flex flex-col items-center">
      {/* Target Selector */}
      {isMyTurn && (
        <div className="absolute -top-32 md:-top-44 flex items-center space-x-2 bg-slate-800/80 p-2 rounded-xl border border-slate-600 z-[200] backdrop-blur-md shadow-2xl">
          <span className="text-xs md:text-sm font-semibold opacity-80 text-slate-300">Target:</span>
          <select 
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm outline-none"
            value={targetId || ''}
            onChange={(e) => setTargetId(e.target.value)}
          >
            <option value="">None</option>
            {otherPlayers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {selectedCards.length >= 2 && (
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded"
               onClick={handlePlayCombo}
             >
               Play Combo
             </motion.button>
          )}
        </div>
      )}

      {/* Cards Display */}
      <div className="relative w-full h-full flex items-end justify-center perspective-[1000px]">
        <AnimatePresence mode="popLayout">
          {(() => {
            // Sort hand based on localHandOrder
            const hand = [...gameState.myHand];
            if (localHandOrder.length > 0) {
              hand.sort((a, b) => {
                const aIdx = localHandOrder.indexOf(a.id);
                const bIdx = localHandOrder.indexOf(b.id);
                if (aIdx === -1) return 1;
                if (bIdx === -1) return -1;
                return aIdx - bIdx;
              });
            }

            return hand.map((card, index) => {
              const isSelected = selectedCards.includes(card.id);
              const totalCards = hand.length;
              
              const maxHandWidth = Math.min(1200, windowWidth * 0.95);
              const cardSpacing = totalCards > 1 ? Math.min(isMobile ? 60 : 100, (maxHandWidth - cardWidth) / (totalCards - 1)) : 0;
              const spreadWidth = cardSpacing * (totalCards - 1);
              
              const xOffset = totalCards > 1 
                ? (index / (totalCards - 1) - 0.5) * spreadWidth
                : 0;
              
              const rotation = totalCards > 1 
                ? (index / (totalCards - 1) - 0.5) * Math.min(20, totalCards * (isMobile ? 1.5 : 2))
                : 0;

              return (
                <motion.div
                  key={card.id}
                  layout
                  drag="x"
                  dragConstraints={{ left: -100, right: 100 }}
                  dragElastic={0.05}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onDragStart={() => (window as any).isDraggingHand = true}
                  onDragEnd={(e, info) => {
                    const dragDistance = info.offset.x;
                    const threshold = cardSpacing / 2;
                    if (Math.abs(dragDistance) > threshold) {
                        const shift = Math.round(dragDistance / cardSpacing);
                        let newIndex = index + shift;
                        newIndex = Math.max(0, Math.min(totalCards - 1, newIndex));
                        
                        if (newIndex !== index) {
                            const newOrder = hand.map(c => c.id);
                            const [movedCardId] = newOrder.splice(index, 1);
                            newOrder.splice(newIndex, 0, movedCardId);
                            reorderHand(newOrder);
                        }
                    }
                    // Small delay to prevent click event after drag
                    setTimeout(() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (window as any).isDraggingHand = false;
                    }, 50);
                  }}
                  initial={{ y: 200, opacity: 0, scale: 0.5 }}
                  animate={{ 
                    x: xOffset,
                    y: isSelected ? (isMobile ? -80 : -120) : (Math.abs(rotation) * (isMobile ? 0.4 : 0.8)) + (isMobile ? 5 : 10),
                    rotateZ: rotation,
                    scale: isSelected ? (isMobile ? 1.1 : 1.15) : 1,
                    opacity: 1,
                    zIndex: isSelected ? 100 : index
                  }}
                  exit={{ y: 300, opacity: 0, scale: 0.5 }}
                  whileHover={!isSelected ? { 
                    y: -80, 
                    scale: 1.1, 
                    zIndex: 200,
                    transition: { duration: 0.2 } 
                  } : {}}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (!(window as any).isDraggingHand) {
                      toggleCard(card.id);
                    }
                  }}
                  className="absolute bottom-0 cursor-pointer will-change-transform drop-shadow-2xl"
                  style={{ 
                    transformOrigin: 'bottom center',
                    width: cardWidth,
                    height: cardHeight
                  }}
                >
                  {/* The Asset Image itself is the full card design */}
                  <div className="relative w-full h-full rounded-2xl overflow-hidden pointer-events-none">
                     {cardAssets[card.type] ? (
                       <Image 
                         src={cardAssets[card.type]} 
                         alt={card.type}
                         fill
                         className="object-contain"
                         priority={index < 5}
                       />
                     ) : (
                       <div className={`w-full h-full rounded-2xl flex flex-col items-center justify-center border-4 border-white/20 ${cardColors[card.type] || 'bg-slate-700'}`}>
                          <div className="text-5xl mb-2">{cardEmojis[card.type]}</div>
                          <div className="font-black uppercase text-sm">{card.type.replace(/_/g, ' ')}</div>
                       </div>
                     )}
                  </div>

                  {isSelected && isMyTurn && !['defuse', 'kaboom', 'taco_cat', 'beard_cat', 'cattermelon', 'hairy_potato_cat', 'rainbow_ralphing_cat'].includes(card.type) && (
                    <motion.button 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 bg-white text-black font-black px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs shadow-[0_0_20px_rgba(255,255,255,0.5)] uppercase tracking-tighter z-10 whitespace-nowrap"
                      onClick={(e) => { e.stopPropagation(); handlePlayCard(card.id); }}
                    >
                      Play Card
                    </motion.button>
                  )}
                </motion.div>
              );
            });
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
}
