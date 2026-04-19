import attack from '../app/assets/cards/attack.png';
import beard_cat from '../app/assets/cards/beard_cat.png';
import cattermelon from '../app/assets/cards/cattermelon.png';
import defuse from '../app/assets/cards/defuse.png';
import demand from '../app/assets/cards/demand.png';
import hairy_potato_cat from '../app/assets/cards/hairy_potato_cat.png';
import kaboom from '../app/assets/cards/kaboom.png';
import nope from '../app/assets/cards/nope.png';
import peek from '../app/assets/cards/peek.png';
import rainbow_ralphing_cat from '../app/assets/cards/rainbow_ralphing_cat.png';
import shuffle from '../app/assets/cards/shuffle.png';
import skip from '../app/assets/cards/skip.png';
import taco_cat from '../app/assets/cards/taco_cat.png';
import back from '../app/assets/cards/back.png';
import { StaticImageData } from 'next/image';

export const cardColors: Record<string, string> = {
  skip: 'bg-blue-500',
  attack: 'bg-red-600',
  peek: 'bg-green-500',
  shuffle: 'bg-indigo-500',
  demand: 'bg-pink-600',
  nope: 'bg-yellow-600',
  taco_cat: 'bg-orange-400',
  beard_cat: 'bg-orange-500',
  cattermelon: 'bg-orange-600',
  hairy_potato_cat: 'bg-orange-700',
  rainbow_ralphing_cat: 'bg-pink-400',
  defuse: 'bg-emerald-500',
  kaboom: 'bg-black',
};

export const cardEmojis: Record<string, string> = {
  skip: '⏭️',
  attack: '⚔️',
  peek: '👁️',
  shuffle: '🔀',
  demand: '🫴',
  nope: '🤚',
  taco_cat: '🌮',
  beard_cat: '🧔',
  cattermelon: '🍉',
  hairy_potato_cat: '🥔',
  rainbow_ralphing_cat: '🌈',
  defuse: '🛡️',
  kaboom: '💥',
};

export const cardAssets: Record<string, StaticImageData> = {
  attack,
  beard_cat,
  cattermelon,
  defuse,
  demand,
  hairy_potato_cat,
  kaboom,
  nope,
  peek,
  rainbow_ralphing_cat,
  shuffle,
  skip,
  taco_cat,
  back,
};
