'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useGameStore } from '../store/gameStore';
import { cardAssets, cardColors, cardEmojis } from '../lib/cardStyles';


export function SpectatorView() {
  const { gameState } = useGameStore();
  const [filter, setFilter] = useState<'all' | 'kaboom' | 'defuse' | 'action'>('all');
  const [activeTab, setActiveTab] = useState<'deck' | 'stats'>('deck');

  if (!gameState || !gameState.spectatorDeck) return null;

  const deck = gameState.spectatorDeck;
  const activePlayers = gameState.players.filter(p => !p.isEliminated);

  // Predict drawers for each card in the deck
  const predictedDrawers: string[] = [];
  if (activePlayers.length > 0) {
    let currIdx = activePlayers.findIndex(p => p.id === gameState.currentPlayerId);
    if (currIdx === -1) currIdx = 0;
    let turnsLeft = gameState.turnsRemaining || 1;

    for (let i = 0; i < deck.length; i++) {
      const p = activePlayers[currIdx];
      predictedDrawers.push(p ? p.name : 'Unknown');

      if (turnsLeft > 1) {
        turnsLeft--;
      } else {
        currIdx = (currIdx + 1) % activePlayers.length;
        turnsLeft = 1;
      }
    }
  } else {
    for (let i = 0; i < deck.length; i++) {
      predictedDrawers.push('Unknown');
    }
  }

  // Calculate stats
  const stats = deck.reduce((acc, card) => {
    acc[card.type] = (acc[card.type] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    if (card.type === 'kaboom') acc.kabooms = (acc.kabooms || 0) + 1;
    if (card.type === 'defuse') acc.defuses = (acc.defuses || 0) + 1;
    return acc;
  }, {} as Record<string, number> & { total: number; kabooms: number; defuses: number });

  // Filtered deck for view
  const filteredDeckWithIndices = deck.map((card, idx) => ({ card, idx, drawer: predictedDrawers[idx] }))
    .filter(({ card }) => {
      if (filter === 'kaboom') return card.type === 'kaboom';
      if (filter === 'defuse') return card.type === 'defuse';
      if (filter === 'action') return !['kaboom', 'defuse', 'taco_cat', 'beard_cat', 'cattermelon', 'hairy_potato_cat', 'rainbow_ralphing_cat'].includes(card.type);
      return true;
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex flex-col bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)] overflow-hidden p-4 md:p-6 text-white"
    >
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-2xl animate-pulse text-2xl md:text-3xl">
            👁️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white text-[10px] md:text-xs font-black uppercase px-2 py-0.5 rounded-full tracking-widest">
                Spectator Mode
              </span>
              <span className="text-xs text-slate-400 font-bold tracking-wider">
                Live Future View
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Secret Deck Viewer ({deck.length} Cards Remaining)
            </h2>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setActiveTab('deck')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'deck'
                ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🃏 Draw Order</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📊 Deck Stats</span>
          </button>
        </div>
      </div>

      {activeTab === 'deck' ? (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold text-slate-400 mr-2">Filter:</span>
            {(['all', 'kaboom', 'defuse', 'action'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                  filter === f
                    ? f === 'kaboom' ? 'bg-black border-red-500 text-red-500 shadow-lg shadow-red-500/30 animate-pulse'
                    : f === 'defuse' ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-500/30'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                {f === 'all' ? 'All Cards' : f === 'kaboom' ? `💥 Kabooms (${stats.kabooms || 0})` : f === 'defuse' ? `🛡️ Defuses (${stats.defuses || 0})` : '⚡ Action Cards'}
              </button>
            ))}
          </div>

          {/* Cards Carousel Container */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4 pt-2">
            <div className="flex items-center gap-4 min-h-[220px] md:min-h-[280px] h-full px-2">
              <AnimatePresence>
                {filteredDeckWithIndices.map(({ card, idx, drawer }) => (
                  <motion.div
                    key={`${card.id}-${idx}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ scale: 1.08, y: -10, zIndex: 50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`relative flex-shrink-0 w-36 h-52 md:w-44 md:h-64 rounded-2xl flex flex-col items-center p-2 border-2 transition-all ${
                      card.type === 'kaboom' ? 'border-red-500 bg-red-950/40 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse'
                      : card.type === 'defuse' ? 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                      : 'border-slate-700 bg-slate-800/80 hover:border-slate-500 shadow-xl'
                    }`}
                  >
                    {/* Index Badge */}
                    <div className="absolute -top-3 -left-3 bg-slate-900 border-2 border-slate-700 px-2.5 py-1 rounded-xl text-xs font-black text-slate-300 z-20 shadow-lg">
                      #{idx + 1} {idx === 0 && <span className="text-red-500">(Next)</span>}
                      {idx === deck.length - 1 && <span className="text-blue-400">(Bottom)</span>}
                    </div>

                    {/* Predicted Drawer Badge */}
                    <div className={`absolute -top-3 -right-3 border-2 px-2.5 py-1 rounded-xl text-[10px] md:text-xs font-black z-20 shadow-lg truncate max-w-[100px] ${
                      card.type === 'kaboom'
                        ? 'bg-red-600 border-white text-white animate-bounce'
                        : 'bg-slate-900 border-indigo-500/50 text-indigo-400'
                    }`}>
                      🎯 {drawer}
                    </div>

                    {/* Card Asset / Visual */}
                    <div className="relative w-full flex-1 rounded-xl overflow-hidden my-2 flex items-center justify-center">
                      {cardAssets[card.type] ? (
                        <Image
                          src={cardAssets[card.type]}
                          alt={card.type}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className={`w-full h-full rounded-xl flex flex-col items-center justify-center border border-white/10 ${cardColors[card.type] || 'bg-slate-700'}`}>
                          <div className="text-4xl mb-1">{cardEmojis[card.type]}</div>
                        </div>
                      )}
                    </div>

                    {/* Card Title */}
                    <div className="w-full text-center mt-auto pt-1 border-t border-white/10">
                      <span className={`text-xs md:text-sm font-black uppercase tracking-tight truncate block ${
                        card.type === 'kaboom' ? 'text-red-400 font-extrabold'
                        : card.type === 'defuse' ? 'text-emerald-400'
                        : 'text-slate-200'
                      }`}>
                        {card.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {filteredDeckWithIndices.length === 0 && (
                  <div className="w-full flex flex-col items-center justify-center py-12 text-slate-500 font-bold">
                    <span className="text-4xl mb-2">📭</span>
                    <span>No cards match your filter</span>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : (
        /* Stats Tab */
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar p-2">
          <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
            <span className="text-4xl mb-2">💥</span>
            <span className="text-2xl font-black text-red-500">{stats.kabooms || 0}</span>
            <span className="text-xs uppercase font-black tracking-widest text-slate-400 mt-1">Kabooms Left</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
            <span className="text-4xl mb-2">🛡️</span>
            <span className="text-2xl font-black text-emerald-400">{stats.defuses || 0}</span>
            <span className="text-xs uppercase font-black tracking-widest text-slate-400 mt-1">Defuses Left</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
            <span className="text-4xl mb-2">🤚</span>
            <span className="text-2xl font-black text-yellow-500">{stats.nope || 0}</span>
            <span className="text-xs uppercase font-black tracking-widest text-slate-400 mt-1">Nopes Left</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
            <span className="text-4xl mb-2">⚔️</span>
            <span className="text-2xl font-black text-red-400">{(stats.attack || 0) + (stats.skip || 0)}</span>
            <span className="text-xs uppercase font-black tracking-widest text-slate-400 mt-1">Skips / Attacks</span>
          </div>

          {/* Full Distribution Breakdown */}
          <div className="col-span-2 md:col-span-4 bg-slate-800/40 border border-slate-700/80 p-4 md:p-6 rounded-3xl mt-2">
            <h3 className="text-sm md:text-base font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>📊 Full Deck Breakdown</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(stats).filter(([key]) => key !== 'total' && key !== 'kabooms' && key !== 'defuses').map(([type, count]) => (
                <div key={type} className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{cardEmojis[type] || '🃏'}</span>
                    <span className="text-xs font-bold text-slate-300 capitalize truncate max-w-[80px]">
                      {type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg text-xs border border-indigo-500/20">
                    {count as number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
