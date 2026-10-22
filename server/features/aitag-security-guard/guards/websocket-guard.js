/**
 * Grandchild Security Layer 9: WebSocket Authentication & Channel Isolation Guard
 * Location: server/features/aitag-security-guard/guards/websocket-guard.js
 */

const WebSocket = require('ws');

// In-memory subscription registry: Room ID -> Set of authenticated ws clients
const ROOM_SUBSCRIBERS = new Map();

/**
 * Validates connection token during WebSocket upgrade or handshake
 */
function authenticateWsConnection(req) {
  try {
    const authService = require('../../aitag-auth/service');

    // 1. Check Authorization header
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authService.verifyToken(authHeader.split(' ')[1]);
    }

    // 2. Check query string token (?token=...)
    if (req.url && req.url.includes('token=')) {
      const url = new URL(req.url, 'http://localhost');
      const token = url.searchParams.get('token');
      if (token) {
        return authService.verifyToken(token);
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Subscribes a client socket to an isolated channel room (e.g. orderId or taskId)
 */
function joinRoom(roomKey, ws) {
  if (!roomKey || !ws) return;
  if (!ROOM_SUBSCRIBERS.has(roomKey)) {
    ROOM_SUBSCRIBERS.set(roomKey, new Set());
  }
  ROOM_SUBSCRIBERS.get(roomKey).add(ws);
}

/**
 * Removes a client socket from a room or all rooms
 */
function leaveRoom(ws, roomKey) {
  if (!ws) return;
  if (roomKey && ROOM_SUBSCRIBERS.has(roomKey)) {
    ROOM_SUBSCRIBERS.get(roomKey).delete(ws);
    return;
  }
  for (const clientSet of ROOM_SUBSCRIBERS.values()) {
    clientSet.delete(ws);
  }
}

/**
 * Broadcasts payload exclusively to clients subscribed to the target room
 */
function broadcastToRoom(roomKey, data, senderWs = null) {
  if (!roomKey || !ROOM_SUBSCRIBERS.has(roomKey)) return 0;

  const clients = ROOM_SUBSCRIBERS.get(roomKey);
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  let delivered = 0;

  for (const client of clients) {
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      client.send(payload);
      delivered++;
    }
  }

  return delivered;
}

module.exports = {
  authenticateWsConnection,
  joinRoom,
  leaveRoom,
  broadcastToRoom,
  ROOM_SUBSCRIBERS
};
