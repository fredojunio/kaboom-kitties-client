'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

import Image from 'next/image';
import { cardColors, cardEmojis, cardAssets } from '../lib/cardStyles';

export function Hand() {
  const { gameState, playCard, playCombo, playNope, giveFavor, localHandOrder, reorderHand } = useGameStore();
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isSelectingTarget, setIsSelectingTarget] = useState(false);
  const [isSelectingCardType, setIsSelectingCardType] = useState(false);
  const [pendingPlay, setPendingPlay] = useState<{ type: 'single' | 'combo', cardIds: string[], namedCard?: any } | null>(null);
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
    const card = gameState.myHand.find(c => c.id === cardId);
    if (!card) return;

    if (card.type === 'demand') {
      setPendingPlay({ type: 'single', cardIds: [cardId] });
      setIsSelectingTarget(true);
      return;
    }

    if (['nope', 'defuse', 'kaboom'].includes(card.type)) return;

    playCard(cardId);
    setSelectedCards([]);
  };

  const handlePlayCombo = () => {
    setPendingPlay({ type: 'combo', cardIds: [...selectedCards] });
    setIsSelectingTarget(true);
  };

  const handleConfirmTarget = (targetPlayerId: string) => {
    if (!pendingPlay) return;

    if (pendingPlay.type === 'single') {
      playCard(pendingPlay.cardIds[0], targetPlayerId);
    } else {
      // If it's a 3-of-a-kind combo, it might have a namedCard attached
      playCombo(pendingPlay.cardIds, targetPlayerId, pendingPlay.namedCard as any);
    }

    setIsSelectingTarget(false);
    setPendingPlay(null);
    setSelectedCards([]);
  };

  // Other players to target
  const otherPlayers = gameState.players.filter(p => !p.isMe && !p.isEliminated);

  return (
    <div className="relative h-full w-full mt-auto flex flex-col items-center">
      {/* Target Selector Modal */}
      <AnimatePresence>
        {isSelectingTarget && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-2xl w-full max-w-sm text-center"
            >
              <h3 className="text-xl font-black mb-6 uppercase tracking-tight text-white/90">Select a Target</h3>
              <div className="grid grid-cols-1 gap-3">
                {otherPlayers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleConfirmTarget(p.id)}
                    className="w-full bg-slate-900 border border-slate-700 hover:border-purple-500 hover:bg-slate-800 p-4 rounded-2xl flex items-center justify-between group transition-all"
                  >
                    <span className="font-bold text-lg">{p.name}</span>
                    <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-1 rounded-full group-hover:border-purple-500/50">🃏 {p.cardCount}</span>
                  </button>
                ))}
                {otherPlayers.length === 0 && (
                  <p className="text-slate-400 italic py-4">No targets available</p>
                )}
                <button 
                  onClick={() => setIsSelectingTarget(false)}
                  className="mt-4 text-sm font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combo Play Button (Without Target Dropdown) */}
      {(() => {
        const selectedHandCards = gameState.myHand.filter(c => selectedCards.includes(c.id));
        const allSameType = selectedHandCards.every(c => c.type === selectedHandCards[0].type);
        
        // You cannot combo Kaboom
        const unplayableAsCombo = ['kaboom'];
        const isPlayableCombo = selectedHandCards.length > 0 && !unplayableAsCombo.includes(selectedHandCards[0].type);
        
        const isValidCombo = isPlayableCombo && allSameType && (selectedHandCards.length === 2 || selectedHandCards.length === 3);
        
        if (isMyTurn && isValidCombo) {
          return (
            <div className="absolute -top-16 flex items-center space-x-2 z-[200]">
              <motion.button 
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-black px-6 py-2 rounded-full shadow-lg shadow-purple-500/30 uppercase tracking-tighter"
                onClick={() => {
                  if (selectedHandCards.length === 3) {
                    setPendingPlay({ type: 'combo', cardIds: [...selectedCards] });
                    setIsSelectingCardType(true);
                  } else {
                    handlePlayCombo();
                  }
                }}
              >
                Play Combo
              </motion.button>
            </div>
          );
        }
        return null;
      })()}

      {/* Card Type Picker Modal (for 3-of-a-kind) */}
      <AnimatePresence>
        {isSelectingCardType && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-4xl text-center"
            >
              <h3 className="text-3xl font-black mb-2 uppercase tracking-tight text-white italic">What do you want?</h3>
              <p className="text-slate-400 text-sm mb-8 font-medium italic">"Name your price, little kitty..."</p>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                {Object.keys(cardAssets)
                  .filter(type => type !== 'kaboom' && type !== 'back')
                  .map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setPendingPlay(prev => prev ? { ...prev, namedCard: type } : null);
                        setIsSelectingCardType(false);
                        setIsSelectingTarget(true);
                      }}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden group-hover:scale-110 transition-all duration-300">
                        <Image 
                          src={cardAssets[type]} 
                          alt={type} 
                          fill 
                          className="object-contain"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-white truncate w-full">
                        {type.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
              </div>

              <button 
                onClick={() => {
                  setIsSelectingCardType(false);
                  setPendingPlay(null);
                }}
                className="mt-8 px-8 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-all"
              >
                Cancel Action
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Pending Favor Overlay */}
      {gameState.pendingFavor && (
        <div className="absolute inset-x-0 -top-32 flex flex-col items-center z-[300]">
          {gameState.pendingFavor.targetId === gameState.players.find(p => p.isMe)?.id ? (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-yellow-500 text-black px-8 py-3 rounded-2xl shadow-2xl font-black uppercase tracking-tight text-center border-4 border-black"
            >
              <p className="text-sm">FAVOR REQUESTED!</p>
              <p className="text-lg">Pick a card to give to {gameState.pendingFavor.attackerName}</p>
            </motion.div>
          ) : gameState.pendingFavor.attackerId === gameState.players.find(p => p.isMe)?.id ? (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-purple-600 text-white px-8 py-3 rounded-2xl shadow-2xl font-black uppercase tracking-tight text-center border-4 border-white"
            >
              <p className="text-sm">FAVOR PLAYED</p>
              <p className="text-lg">Waiting for your card...</p>
            </motion.div>
          ) : null}
        </div>
      )}

      {/* Cards Display */}
      <div className="relative w-full h-full flex items-end justify-center perspective-[1000px]">
        <AnimatePresence mode="popLayout">
          {(() => {
            // Sort hand based on localHandOrder
            const hand = [...gameState.myHand];
            const isFavorTarget = gameState.pendingFavor?.targetId === gameState.players.find(p => p.isMe)?.id;

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
                      if (isFavorTarget) {
                        giveFavor(card.id);
                      } else {
                        toggleCard(card.id);
                      }
                    }
                  }}
                  className={`absolute bottom-0 cursor-pointer will-change-transform drop-shadow-2xl ${isFavorTarget ? 'ring-4 ring-yellow-500 rounded-2xl animate-pulse' : ''}`}
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

                  {isSelected && isMyTurn && !isFavorTarget && !['defuse', 'kaboom', 'taco_cat', 'beard_cat', 'cattermelon', 'hairy_potato_cat', 'rainbow_ralphing_cat', 'nope'].includes(card.type) && (
                    <motion.button 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 bg-white text-black font-black px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs shadow-[0_0_20px_rgba(255,255,255,0.5)] uppercase tracking-tighter z-10 whitespace-nowrap"
                      onClick={(e) => { e.stopPropagation(); handlePlayCard(card.id); }}
                    >
                      Play Card
                    </motion.button>
                  )}

                  {isSelected && gameState.pendingAction && card.type === 'nope' && (
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.5, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black px-6 md:px-8 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs shadow-[0_0_20px_rgba(220,38,38,0.6)] uppercase tracking-tighter z-[200] whitespace-nowrap border-2 border-white animate-pulse"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        playNope(gameState.pendingAction!.id, card.id); 
                        setSelectedCards([]);
                      }}
                    >
                      {gameState.pendingAction.nopeCount % 2 === 0 ? 'NOPE!' : 'YEP!'}
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
