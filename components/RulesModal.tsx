'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cardAssets, cardColors } from '../lib/cardStyles';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ruleItems = [
  {
    type: 'kaboom',
    title: 'The Kaboom!',
    description: 'If you draw this card, you explode and lose the game immediately!',
  },
  {
    type: 'defuse',
    title: 'Defuse Card',
    description: 'The most powerful card. If you draw a Kaboom, this card saves you. You then put the Kaboom back anywhere in the deck!',
  },
  {
    type: 'attack',
    title: 'Attack',
    description: 'End your turn without drawing and force the next player to take 2 turns in a row.',
  },
  {
    type: 'skip',
    title: 'Skip',
    description: 'Immediately end your turn without drawing a card.',
  },
  {
    type: 'peek',
    title: 'See the Future',
    description: 'Peek at the top card of the Draw Pile so you know what is coming.',
  },
  {
    type: 'nope',
    title: 'Nope!',
    description: 'Stop any action played by another player. You can even Nope a Nope!',
  },
  {
    type: 'demand',
    title: 'Favor',
    description: 'Force another player to give you one card from their hand (of their choice).',
  },
  {
    type: 'shuffle',
    title: 'Shuffle',
    description: 'Shuffle the Draw Pile until you feel lucky.',
  },
  {
    type: 'taco_cat', // Just to have an icon, Taco Cat is a good rep
    title: 'Special Combos',
    description: 'You can play matching sets of ANY cards (not just Cat Cards): \n\n• Pair (2): Steal a RANDOM card from another player. \n• Trio (3): Name a card type and steal it if they have it!',
  }
];

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
              <div>
                <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white uppercase">How to Play</h2>
                <p className="text-slate-400 font-medium text-sm md:text-base mt-1">Master the art of not exploding.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors shadow-lg"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12">
              {/* Basic Goal */}
              <section className="text-center max-w-2xl mx-auto">
                <div className="inline-block px-4 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-xs uppercase tracking-widest mb-4">
                  The Objective
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Don&apos;t Get Blown Up!</h3>
                <p className="text-slate-400 leading-relaxed">
                  The deck contains a few **Kaboom Kitties**. Players take turns playing cards and then **drawing** from the deck. 
                  If you draw a Kaboom, you&apos;re out. The last player left alive wins!
                </p>
              </section>

              {/* Card Dictionary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {ruleItems.map((item) => (
                  <div key={item.type} className="flex gap-6 items-start group">
                    <div className="relative w-24 h-32 md:w-32 md:h-44 flex-shrink-0 group-hover:scale-105 transition-transform duration-300 drop-shadow-xl">
                      <div className={`absolute inset-0 rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 ${cardColors[item.type]}`}>
                        <Image 
                          src={cardAssets[item.type]} 
                          alt={item.title} 
                          fill 
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <h4 className="text-xl font-bold text-white mb-2 tracking-tight">{item.title}</h4>
                      <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Note */}
              <section className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 text-center">
                <p className="text-slate-300 font-medium italic">
                  &quot;It&apos;s like Russian Roulette, but with explosive kittens and tactical laser pointers.&quot;
                </p>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
