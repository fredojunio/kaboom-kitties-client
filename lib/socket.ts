import { io } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export const socket = io(URL, {
  autoConnect: false, // Wait until we explicitly connect
});
