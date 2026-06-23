import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { eq } from 'drizzle-orm';
import { verifyAccessToken } from '../auth/jwt';
import { db } from '../db/client';
import { conversationParticipants } from '../db/schema';
import { env } from '../env';

let io: SocketIOServer | null = null;

function userRoom(userId: string): string {
  return `user:${userId}`;
}

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, { cors: { origin: env.CORS_ORIGIN } });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error('Missing access token'));
      return;
    }
    try {
      socket.data.userId = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('Invalid access token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(userRoom(socket.data.userId as string));
  });

  return io;
}

export async function emitToConversation(conversationId: string, event: string, payload: unknown): Promise<void> {
  if (!io) return;
  const rows = await db
    .select({ userId: conversationParticipants.userId })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.conversationId, conversationId));
  const rooms = rows.map((r) => userRoom(r.userId));
  if (rooms.length > 0) io.to(rooms).emit(event, payload);
}
