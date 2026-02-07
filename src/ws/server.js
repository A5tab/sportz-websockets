import WebSocket, { WebSocketServer } from 'ws';
import { wsArcjet } from '../arcjet.js';

function sendJSON(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}

function broadcastJSON(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;
        sendJSON(client, payload);
    }
}

export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 1024 * 1024 });

    wss.on('connection', async (socket, req) => {
        if (wsArcjet) {
            try {
                const decision = await wsArcjet.protect(req);
                if (decision.isDenied()) {
                    if (decision.reason.isRateLimit()) {
                        const code = decision.reason.isRateLimit() ? "1013" : "1008";
                        const reason = decision.reason.isRateLimit() ? "Rate limit exceeded" : "Connection denied";
                        socket.close(code, reason);
                        return;
                    }
                }
            } catch (error) {
                console.error("WS Connection error:", error);
                socket.close(1011, "Server Security Error");
                return;
            }
        }
        socket.isAlive = true;

        socket.on('pong', () => {
            socket.isAlive = true;
        });
        sendJSON(socket, { type: 'welcome' });

        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    wss.on('error', (error) => console.error('WebSocket server error:', error));

    const interval = setInterval(() => {
        wss.clients.forEach((socket) => {
            if (socket.isAlive === false) return socket.terminate();
            socket.isAlive = false;
            socket.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(interval);
    });
    function broadcastMatchCreated(match) {
        broadcastJSON(wss, { type: 'match_created', data: match });
    }

    return { broadcastMatchCreated };
}