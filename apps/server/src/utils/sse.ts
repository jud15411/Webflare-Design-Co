import { Request, Response } from 'express';

type Client = { id: string; res: Response };
const channels: Record<string, Client[]> = {};

function getChannel(name: string) {
  if (!channels[name]) channels[name] = [];
  return channels[name];
}

export function sseMiddleware(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
}

export function subscribe(channel: string, req: Request, res: Response) {
  sseMiddleware(req, res);
  const id = Math.random().toString(36).slice(2);
  const client = { id, res };
  getChannel(channel).push(client);

  req.on('close', () => {
    const list = getChannel(channel);
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) list.splice(idx, 1);
  });

  // heartbeat
  const interval = setInterval(() => {
    try { res.write(`: heartbeat\n\n`); } catch {}
  }, 30000);
  req.on('close', () => clearInterval(interval));
}

export function publish(channel: string, event: string, data: any) {
  const payload = `event: ${event}\n` +
                  `data: ${JSON.stringify(data)}\n\n`;
  for (const client of getChannel(channel)) {
    try { client.res.write(payload); } catch {}
  }
}
