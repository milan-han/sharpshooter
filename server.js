import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { GameRoom } from './core/GameRoom.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

const rooms = [];
const ROOM_CAP = parseInt(process.env.ROOM_CAP || '20', 10);

function getAvailableRoom() {
  let room = rooms.find(r => r.state.players.size < ROOM_CAP);
  if (!room) {
    const id = `room${rooms.length}`;
    room = new GameRoom({ io, roomId: id });
    room.start();
    rooms.push(room);
  }
  return room;
}

io.on('connection', (socket) => {
  const room = getAvailableRoom();
  room.addSocket(socket);

  socket.on('input', (payload) => {
    room.handleInput(socket.id, payload);
  });

  socket.on('disconnect', () => {
    room.removeSocket(socket);
  });
});

httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
