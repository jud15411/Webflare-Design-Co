import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { User } from './api/v1/auth/user.model.js';
import { ClientUser } from './api/v1/client/clientUser.model.js';
import { Message } from './api/v1/messages/message.model.js';
// FIX: Use createRequire to bypass the ES Module import issue for ioredis
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Redis = require('ioredis');

// Define a type for our WebSocket connections to include authentication info
interface AuthenticatedWebSocket extends WebSocket {
  userId?: string; // For staff
  clientUserId?: string; // For clients
  isAlive?: boolean;
}

// Maps to keep track of connections and their subscriptions
const connectionMap = new Map<string, AuthenticatedWebSocket>();
const projectSubscriptions = new Map<string, Set<string>>();

export const initWebSocketServer = (server: Server) => {
  if (!process.env.REDIS_URL) {
    console.error('🔴 REDIS_URL not defined in environment variables.');
    return;
  }

  const wss = new WebSocketServer({ server });
  // This will now work correctly
  const redisSub = new Redis(process.env.REDIS_URL);
  const redisPub = new Redis(process.env.REDIS_URL);

  redisSub.psubscribe('chat:*');

  redisSub.on(
    'pmessage',
    (_pattern: string, channel: string, message: string) => {
      const projectId = channel.split(':')[1];
      if (!projectId) return;

      const subscribers = projectSubscriptions.get(projectId);
      if (subscribers) {
        subscribers.forEach((userId) => {
          const ws = connectionMap.get(userId);
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        });
      }
    }
  );

  wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
    const token = req.url?.split('token=')[1];
    if (!token) {
      return ws.close(1011, 'Authentication token missing.');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      const userId = decoded.id;

      const user = await User.findById(userId);
      const clientUser = await ClientUser.findById(userId);

      if (user) {
        ws.userId = userId;
        connectionMap.set(userId, ws);
      } else if (clientUser) {
        ws.clientUserId = userId;
        connectionMap.set(userId, ws);
      } else {
        return ws.close(1011, 'User not found.');
      }

      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', async (message) => {
        const data = JSON.parse(message.toString());

        if (data.type === 'subscribe' && data.projectId) {
          const projectId = data.projectId;
          if (!projectSubscriptions.has(projectId)) {
            projectSubscriptions.set(projectId, new Set());
          }
          projectSubscriptions
            .get(projectId)!
            .add(ws.userId || ws.clientUserId!);
          return;
        }

        const { projectId, text } = data;
        if (!projectId || !text) return;

        const savedMessage = await Message.create({
          project: projectId,
          text,
          sender: {
            user: ws.userId ? ws.userId : undefined,
            clientUser: ws.clientUserId ? ws.clientUserId : undefined,
          },
        });

        const populatedMessage = await savedMessage.populate([
          { path: 'sender.user', select: 'name' },
          {
            path: 'sender.clientUser',
            populate: { path: 'client', select: 'clientName' },
          },
        ]);

        redisPub.publish(`chat:${projectId}`, JSON.stringify(populatedMessage));
      });

      ws.on('close', () => {
        const idToClean = ws.userId || ws.clientUserId!;
        connectionMap.delete(idToClean);
        projectSubscriptions.forEach((subscribers) => {
          subscribers.delete(idToClean);
        });
      });
    } catch (error) {
      ws.close(1011, 'Invalid authentication token.');
    }
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
    redisSub.quit();
    redisPub.quit();
  });
};
