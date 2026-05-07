'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cardAssets, cardColors } from '../lib/cardStyles';
import { useState, useEffect } from 'react';

export function NewCardAnnouncement() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // We check if they've seen this specific update
    const hasSeen = localStorage.getItem('seen_fate_switch_update_v1');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('seen_fate_switch_update_v1', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="bg-slate-900 border-2 border-blue-500/30 w-full max-w-md rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.2)] p-8 text-center relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-48 h-64 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]"
            >
              <div className={`w-full h-full rounded-2xl overflow-hidden border-4 border-white/10 ${cardColors['fate_switch']}`}>
                <Image 
                  src={cardAssets['fate_switch']} 
                  alt="Fate Switch" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-blue-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg rotate-12 uppercase tracking-widest border-2 border-white">
                NEW!
              </div>
            </motion.div>

            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-4">
              Fate Switch Update
            </h2>
            
            <p className="text-slate-300 mb-8 leading-relaxed font-medium">
              A powerful new card has entered the deck! Use the <span className="text-blue-400 font-bold">Fate Switch</span> to swap your entire hand with any opponent and turn the tide of battle.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest text-sm"
            >
              Got it, let&apos;s play!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
