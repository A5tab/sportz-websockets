import express from 'express';
import { matchRouter } from './routes/match.route.js';
import http from 'http';
import { attachWebSocketServer } from './ws/server.js';
import { securityMiddleware } from './arcjet.js';

const app = express();
const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer(app);

// JSON middleware
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use(securityMiddleware())
app.use('/matches', matchRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

// Start server
server.listen(PORT, HOST, () => {
  const baseURL = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running at ${baseURL}`);
  console.log(`Websocket server is running at ${baseURL.replace(
    'http', 'ws')}/ws`)
});
