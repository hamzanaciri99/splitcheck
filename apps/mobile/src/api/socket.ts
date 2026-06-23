import { io, Socket } from 'socket.io-client';
import { api, API_URL } from './client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      autoConnect: false,
      auth: async (cb: (data: { token?: string }) => void) => {
        const tokens = await api.getTokens();
        cb({ token: tokens?.accessToken });
      },
    });
  }
  return socket;
}
