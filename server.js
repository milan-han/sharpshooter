import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

const players = new Map();

io.on('connection', (socket) => {
    const state = { gridX: 0, gridY: 0, heading: -Math.PI/2, heldOrb: false };
    players.set(socket.id, state);
    socket.emit('init', { id: socket.id, players: Array.from(players.entries()) });
    socket.broadcast.emit('playerJoined', { id: socket.id, state });

    socket.on('playerUpdate', (data) => {
        players.set(socket.id, data);
        socket.broadcast.emit('playerUpdate', { id: socket.id, state: data });
    });

    socket.on('projectileFired', (proj) => {
        socket.broadcast.emit('projectileFired', proj);
    });

    socket.on('disconnect', () => {
        players.delete(socket.id);
        socket.broadcast.emit('playerDisconnected', socket.id);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
