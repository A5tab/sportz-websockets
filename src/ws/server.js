import WebSocket, { WebSocketServer } from 'ws';
import { wsArcjet } from '../arcjet.js';

const matchSubscriptions = new Map();
function subscribeToMatch(socket, matchId) {
    if (!matchSubscriptions.has(matchId)) {
        matchSubscriptions.set(matchId, new Set());
    }
    matchSubscriptions.get(matchId).add(socket);
    socket.subscriptions.add(matchId);
    sendJSON(socket, { type: 'subscribed', matchId });
}

function unsubscribeFromMatch(socket, matchId) {
    const subscribers = matchSubscriptions.get(matchId);
    if (!subscribers) return;

    subscribers.delete(socket);
    if (subscribers.size === 0) {
        matchSubscriptions.delete(matchId);
    }
    socket.subscriptions.delete(matchId);
    sendJSON(socket, { type: 'unsubscribed', matchId });
}

function cleanupSubscriptions(socket) {
    for (const matchId of socket.subscriptions) {
        unsubscribeFromMatch(socket, matchId);
    }
}


function sendJSON(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}

function broadcastToAll(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;
        sendJSON(client, payload);
    }
}

function broadcastToMatch(matchId, payload) {
    const subscribers = matchSubscriptions.get(matchId);
    if (!subscribers || subscribers.size === 0) return;

    for (const client of subscribers) {
        if (client.readyState === WebSocket.OPEN) {
            sendJSON(client, payload);
        }
    }
}

function handleMessage(socket, data) {
    let message;
    try {
        message = JSON.parse(data.toString());
    } catch (error) {
        sendJSON(socket, { type: 'error', data: 'Invalid JSON' });
    }

    if (message?.type === 'subscribe' && Number.isInteger(message.matchId)) {
        subscribeToMatch(socket, message.matchId);
    }
    else if (message?.type === 'unsubscribe' && Number.isInteger(message.matchId)) {
        unsubscribeFromMatch(socket, message.matchId);
    }
    else if (message?.type === 'close') {
        cleanupSubscriptions(socket);
        socket.close();
    }
}
export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({ noServer: true, path: '/ws', maxPayload: 1024 * 1024 });


    server.on('upgrade', async (req, socket, head) => {
        const { pathname } = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

        if (pathname !== '/ws') {
            socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
            socket.destroy();
            return;
        }

        if (wsArcjet) {
            try {
                const decision = await wsArcjet.protect(req);

                if (decision.isDenied()) {
                    if (decision.reason.isRateLimit()) {
                        socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n');
                    } else {
                        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
                    }
                    socket.destroy();
                    return;
                }
            } catch (e) {
                console.error('WS upgrade protection error', e);
                socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
                socket.destroy();
                return;
            }
        }

        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
        });
    });

    wss.on('connection', async (socket, req) => {
        socket.isAlive = true;
        socket.on('pong', () => { socket.isAlive = true; });

        socket.subscriptions = new Set();

        sendJSON(socket, { type: 'welcome' });

        socket.subscriptions = new Set();

        socket.on('message', (data) => {
            handleMessage(socket, data);
        });

        socket.on('error', () => {
            socket.terminate();
        });

        socket.on('error', console.error);

        socket.on('close', () => {
            cleanupSubscriptions(socket);
        });
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) ws.terminate();

            ws.isAlive = false;
            ws.ping();
        })
    }, 30000);

    wss.on('close', () => clearInterval(interval));

    const broadcastMatchCreated = (match) => {
        broadcastToAll(wss, { type: 'match.created', data: match });
    };
    const broadcastCommentary = (matchId, comments) => {
        broadcastToMatch(matchId, { type: 'match.commentary', data: comments });
    };


    return { broadcastMatchCreated, broadcastCommentary };
}