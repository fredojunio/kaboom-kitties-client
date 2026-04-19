import { create } from 'zustand';
import { socket } from '../lib/socket';
import { ClientGameState, Card, CardType } from '../types';

interface GameStateStore {
  gameState: ClientGameState | null;
  currentRoomCode: string | null;
  playerName: string;
  error: string | null;
  peekedCards: Card[];
  socketId: string | null;
  kaboomDrawnId: string | null;
  awaitingDefuseCard: Card | null;
  localHandOrder: string[];
  
  // Actions
  setPlayerName: (name: string) => void;
  connect: (name: string, roomCode?: string) => void; 
  resetRoomCode: () => void;
  startGame: () => void;
  playCard: (cardId: string, targetPlayerId?: string) => void;
  playCombo: (cardIds: string[], targetPlayerId: string, namedCard?: CardType) => void;
  playNope: (pendingActionId: string, cardId: string) => void;
  drawCard: () => void;
  giveFavor: (cardId: string) => void;
  insertDefuse: (index: number) => void;
  reorderHand: (newOrder: string[]) => void;
  clearError: () => void;
  clearPeeked: () => void;
  tryReconnect: (roomCode: string, playerId: string) => void;
  kickPlayer: (targetPlayerId: string) => void;
  leaveRoom: () => void;
}

export const useGameStore = create<GameStateStore>((set, get) => {
  // Listeners
  socket.on('connect', () => {
    set({ socketId: socket.id });
  });

  socket.on('game_state', (state: ClientGameState) => {
    const myPlayer = state.players.find(p => p.isMe);
    if (myPlayer) {
      try {
        sessionStorage.setItem('kaboom_session', JSON.stringify({
          roomCode: state.roomCode,
          playerId: myPlayer.id,
          playerName: myPlayer.name
        }));
      } catch (e) {}

      if (!get().playerName) {
        set({ playerName: myPlayer.name });
      }
    }
    set({ gameState: state, currentRoomCode: state.roomCode });
  });

  socket.on('room_created', ({ roomCode }) => {
    set({ currentRoomCode: roomCode });
  });

  socket.on('error', ({ message }) => {
    set({ error: message });
  });

  socket.on('peek_result', (cards: Card[]) => {
    set({ peekedCards: cards });
  });

  socket.on('kaboom_drawn', ({ playerId }) => {
    set({ kaboomDrawnId: playerId });
  });

  socket.on('await_defuse_insert', ({ card }) => {
    set({ awaitingDefuseCard: card });
  });

  socket.on('defuse_inserted', () => {
    set({ awaitingDefuseCard: null, kaboomDrawnId: null });
  });

  socket.on('player_eliminated', () => {
    set({ kaboomDrawnId: null });
  });

  socket.on('action_pending', (action) => {
    const s = get().gameState;
    if (s) {
      set({ gameState: { ...s, pendingAction: action } });
    }
  });

  socket.on('action_resolved', ({ actionId, cancelled }) => {
    const s = get().gameState;
    if (s && s.pendingAction?.id === actionId) {
      set({ gameState: { ...s, pendingAction: null } });
    }
  });

  socket.on('turn_changed', ({ currentPlayerId, turnsRemaining }) => {
    const s = get().gameState;
    if (s) {
      set({ gameState: { ...s, currentPlayerId, turnsRemaining } });
    }
  });

  socket.on('kicked', () => {
    sessionStorage.removeItem('kaboom_session');
    set({ gameState: null, currentRoomCode: null, error: 'You have been kicked from the room' });
    window.location.href = '/';
  });

  return {
    gameState: null,
    currentRoomCode: null,
    playerName: '',
    error: null,
    peekedCards: [],
    socketId: null,
    kaboomDrawnId: null,
    awaitingDefuseCard: null,
    localHandOrder: [],

    setPlayerName: (name) => set({ playerName: name }),

    connect: (name, roomCode) => {
      set({ playerName: name, error: null });
      
      const performEmit = () => {
        if (roomCode) {
          socket.emit('join_room', { roomCode, playerName: name });
        } else {
          socket.emit('create_room', { playerName: name });
        }
      };

      if (!socket.connected) {
        socket.once('connect', performEmit);
        socket.connect();
      } else {
        performEmit();
      }
    },

    resetRoomCode: () => set({ currentRoomCode: null }),

    startGame: () => {
      const state = get().gameState;
      if (state) {
        socket.emit('start_game', { roomCode: state.roomCode });
      }
    },

    playCard: (cardId, targetPlayerId) => {
      const state = get().gameState;
      if (state) {
        socket.emit('play_card', { roomCode: state.roomCode, cardId, targetPlayerId });
      }
    },

    playCombo: (cardIds, targetPlayerId, namedCard) => {
      const state = get().gameState;
      if (state) {
        socket.emit('play_combo', { roomCode: state.roomCode, cardIds, targetPlayerId, namedCard });
      }
    },

    playNope: (pendingActionId, cardId) => {
      const state = get().gameState;
      if (state) {
        socket.emit('play_nope', { roomCode: state.roomCode, pendingActionId, cardId });
      }
    },

    drawCard: () => {
      const state = get().gameState;
      if (state) {
        socket.emit('draw_card', { roomCode: state.roomCode });
      }
    },

    giveFavor: (cardId) => {
      const state = get().gameState;
      if (state) {
        socket.emit('give_favor', { roomCode: state.roomCode, cardId });
      }
    },

    insertDefuse: (index) => {
      const state = get().gameState;
      const card = get().awaitingDefuseCard;
      if (state && card) {
        socket.emit('insert_defuse', { roomCode: state.roomCode, index, card });
      }
    },

    reorderHand: (newOrder) => set({ localHandOrder: newOrder }),

    clearError: () => set({ error: null }),
    clearPeeked: () => set({ peekedCards: [] }),

    tryReconnect: (roomCode, playerId) => {
      set({ error: null });
      const performEmit = () => {
        socket.emit('reconnect_room', { roomCode, playerId });
      };

      if (!socket.connected) {
        socket.once('connect', performEmit);
        socket.connect();
      } else {
        performEmit();
      }
    },

    kickPlayer: (targetPlayerId) => {
      const state = get().gameState;
      if (state) {
        socket.emit('kick_player', { roomCode: state.roomCode, targetPlayerId });
      }
    },
    
    leaveRoom: () => {
      sessionStorage.removeItem('kaboom_session');
      set({ gameState: null, currentRoomCode: null, awaitingDefuseCard: null, kaboomDrawnId: null });
    }
  };
});
