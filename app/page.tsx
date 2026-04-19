'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const { connect, currentRoomCode } = useGameStore();

  useEffect(() => {
    if (currentRoomCode) {
      router.push(`/game/${currentRoomCode}`);
      // Don't resetRoomCode immediately or we might lose the state if the next page takes a bit to load
    }
  }, [currentRoomCode, router]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    connect(name.trim());
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomCodeInput.trim()) return;
    connect(name.trim(), roomCodeInput.trim().toUpperCase());
    router.push(`/game/${roomCodeInput.trim().toUpperCase()}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <motion.div 
        className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-red-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-6xl mb-4"
          >
            💥🐱
          </motion.div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-500 tracking-tight">
            Kaboom Kitties
          </h1>
          <p className="text-slate-400 mt-2 font-medium">The Russian Roulette Card Game</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
              placeholder="Enter your name..."
              maxLength={12}
            />
          </div>

          <div className="pt-4 border-t border-slate-700/50 space-y-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create New Game
            </motion.button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-600/50"></div>
              <span className="flex-shrink-0 mx-4 text-slate-500 text-sm font-medium">OR</span>
              <div className="flex-grow border-t border-slate-600/50"></div>
            </div>

            <form onSubmit={handleJoin} className="flex gap-2">
              <input 
                type="text" 
                value={roomCodeInput}
                onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                className="flex-grow bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium uppercase tracking-widest text-center"
                placeholder="ROOM CODE"
                maxLength={6}
              />
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!name.trim() || roomCodeInput.length < 6}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
              >
                Join
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
