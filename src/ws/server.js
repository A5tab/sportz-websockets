import WebSocket, { WebSocketServer } from 'ws';


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

    wss.on('connection', (socket) => {
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