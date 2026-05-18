import { io, Socket } from "socket.io-client";
import type { Feed } from "@/types/feed";
import { WS_URL } from "@/lib/config";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting";

export interface SocketHandlers {
  onFeed: (feed: Feed) => void;
  onStatusChange: (status: ConnectionStatus) => void;
}

let socket: Socket | null = null;
const seenIds = new Set<string>();

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ["polling", "websocket"],
      path: "/socket.io/",
    });
  }
  return socket;
}

export function connectSocket(handlers: SocketHandlers): () => void {
  const s = getSocket();

  const handleConnect = () => handlers.onStatusChange("connected");
  const handleDisconnect = () => handlers.onStatusChange("disconnected");
  const handleReconnectAttempt = () =>
    handlers.onStatusChange("reconnecting");
  const handleFeed = (feed: Feed) => {
    if (seenIds.has(feed.id)) return;
    seenIds.add(feed.id);
    handlers.onFeed(feed);
  };

  s.on("connect", handleConnect);
  s.on("disconnect", handleDisconnect);
  s.on("reconnect_attempt", handleReconnectAttempt);
  s.on("feed:new", handleFeed);

  handlers.onStatusChange("connecting");
  s.connect();

  return () => {
    s.off("connect", handleConnect);
    s.off("disconnect", handleDisconnect);
    s.off("reconnect_attempt", handleReconnectAttempt);
    s.off("feed:new", handleFeed);
  };
}

export function seedSeenIds(ids: string[]) {
  ids.forEach((id) => seenIds.add(id));
}

export function markSeen(id: string) {
  seenIds.add(id);
}
