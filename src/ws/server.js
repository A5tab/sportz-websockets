import WebSocket, { WebSocketServer } from 'ws';


function sendJSON(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}

function broadcastJSON(wss, payload) {
    wss.clients.forEach((client) => {
        if (client.readyState !== WebSocket.OPEN) return;
        sendJSON(client, payload);
    });
}

export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 1024 * 1024 });

    wss.on('connection', (socket) => {
        sendJSON(socket, { type: 'welcome' });

        wss.on('error', (error) => console.error('WebSocket server error:', error));
    });
    function broadcastMatchCreated(match) {
        broadcastJSON(wss, { type: 'match_created', data: match });
    }

    return { broadcastMatchCreated };
}