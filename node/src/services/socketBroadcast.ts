import type { Server } from "socket.io";

let ioInstance: Server | null = null;

export function attachSocketServer(io: Server): void {
  ioInstance = io;
}

/** Emit to Socket.IO room `user:<userId>` (same as socket connection handler). */
export function notifyUser(userId: number, event: string, payload: unknown): void {
  if (!ioInstance || !Number.isFinite(userId)) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
}
