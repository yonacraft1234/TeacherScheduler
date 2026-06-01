import { io } from 'socket.io-client';

// Connect to same-origin path; Vite dev proxy forwards /socket.io to backend
export const socket = io('/', {
  path: '/socket.io',
  autoConnect: true,
  transports: ['websocket', 'polling'],
});
