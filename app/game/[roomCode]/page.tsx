'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGameStore } from '../../../store/gameStore';
import { PlayerList } from '../../../components/PlayerList';
import { DrawPile } from '../../../components/DrawPile';
import { DiscardPile } from '../../../components/DiscardPile';
import { Hand } from '../../../components/Hand';
import { NopeButton } from '../../../components/NopeButton';
import { CardAnimations } from '../../../components/CardAnimations';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import tableBg from '../../../app/assets/background/table.png';

export default function GameRoom() {
  const params = useParams();
  const roomCode = params.roomCode as string;
  const router = useRouter();

  const { gameState, playerName, startGame } = useGameStore();
  const [showTurnPopup, setShowTurnPopup] = useState(false);

  useEffect(() => {
    if (!gameState) return;
    const myId = useGameStore.getState().socketId;
    
    // Only trigger if the turn has actually shifted to the player
    if (gameState.currentPlayerId === myId && gameState.status === 'playing') {
      // We don't want it to re-popup if we are just updating the same turn
      // Simple way: only set to true if it's currently false
      setShowTurnPopup(prev => {
        if (!prev) {
          // It was false, now it's my turn, show it!
          const timer = setTimeout(() => setShowTurnPopup(false), 2000);
          return true;
        }
        return prev;
      });
    }
  }, [gameState?.currentPlayerId, gameState?.status]);

  useEffect(() => {
    // If we have no playerName and no gameState, it means we probably refreshed the page
    if (!playerName && !gameState) {
      try {
        const sessionStr = sessionStorage.getItem('kaboom_session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session.roomCode === roomCode && session.playerId) {
            // Found a valid session! Try to reconnect.
            useGameStore.getState().tryReconnect(session.roomCode, session.playerId);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to parse session', e);
      }
      
      // If no valid session was found, send back to home
      router.push('/');
    }
  }, [gameState, playerName, router, roomCode]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin text-4xl">🐱</div>
      </div>
    );
  }

  const isHost = gameState.players[0]?.id === useGameStore.getState().socketId;
  const canStart = isHost && gameState.players.length >= 2 && gameState.status === 'lobby';

  if (gameState.status === 'lobby') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl z-10 w-full max-w-lg text-center"
        >
          <h1 className="text-3xl font-black mb-2">Room Code: <span className="text-red-500 tracking-widest">{roomCode}</span></h1>
          <p className="text-slate-400 mb-8">Waiting for players to join...</p>

          <div className="space-y-2 mb-8 text-left max-h-60 overflow-y-auto custom-scrollbar pr-2">
            {gameState.players.map(p => (
              <div key={p.id} className="bg-slate-900/50 p-4 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${p.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-bold text-lg">{p.name} {p.isMe && '(You)'}</span>
                </div>
                {isHost && !p.isMe && (
                  <button 
                    onClick={() => useGameStore.getState().kickPlayer(p.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 opacity-60 hover:opacity-100 transition-all flex items-center gap-1 text-sm font-bold"
                  >
                    KICK
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {isHost ? (
            <motion.button
              whileHover={canStart ? { scale: 1.05 } : {}}
              whileTap={canStart ? { scale: 0.95 } : {}}
              onClick={startGame}
              disabled={!canStart}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gameState.players.length < 2 ? 'Need at least 2 players' : 'Start Game'}
            </motion.button>
          ) : (
            <div className="text-slate-400 animate-pulse font-medium">Waiting for host to start...</div>
          )}
        </motion.div>
      </div>
    );
  }

  if (gameState.status === 'finished') {
    const winner = gameState.players.find(p => p.id === gameState.winnerId);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center bg-slate-800/80 p-12 rounded-3xl backdrop-blur-xl border-2 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]"
        >
          <div className="text-8xl mb-6">👑</div>
          <h1 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-600">
            {winner?.name} Wins!
          </h1>
          <button onClick={() => router.push('/')} className="mt-8 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Play Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-white">
      {/* Background Asset */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src={tableBg}
          alt="Table Background"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/80" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col p-2 md:p-8 max-w-7xl mx-auto h-screen overflow-hidden gap-2 md:gap-4">
        {/* Top Section */}
        <div className="flex flex-col md:grid md:grid-cols-4 gap-2 md:gap-4 flex-1 min-h-0">

          {/* Player List (Horizontal on mobile, Sidebar on desktop) */}
          <div className="md:col-span-1 h-fit md:h-full min-h-0">
            <PlayerList />
          </div>

          {/* Center Table (Flex 1 to take remaining space on mobile) */}
          <div className="md:col-span-2 flex flex-col items-center justify-center relative flex-1 p-2 md:p-4 min-h-0">
            <div className="flex flex-row items-center justify-center gap-4 md:gap-12 w-full">
              <DrawPile />
              <DiscardPile />
            </div>
            <NopeButton />
          </div>

          {/* Right Col: Placeholder or Log */}
          <div className="hidden md:block md:col-span-1"></div>
        </div>

        {/* Bottom Section: Hand */}
        <div className="h-[25vh] md:h-1/3 min-h-[180px] md:min-h-[300px]">
          <Hand />
        </div>

        <CardAnimations />

        {/* Your Turn Popup */}
        <AnimatePresence>
          {showTurnPopup && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="bg-gradient-to-r from-red-600 to-orange-600 px-12 py-6 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.5)] border-4 border-white/20"
              >
                <h2 className="text-6xl font-black text-white italic tracking-tighter drop-shadow-lg">
                  YOUR TURN!
                </h2>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
