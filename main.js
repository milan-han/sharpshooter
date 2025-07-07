import { Game } from './core/Game.js';
import { Projectile } from './entities/Projectile.js';

let socket;
let game;
let playerId = null;

function patchGameState({ players = [], projectiles = [] }) {
  if (!game) return;

  players.forEach(([id, state]) => {
    if (state === null) {
      if (id === playerId) return;
      game.gameState.removeRemotePlayer(id);
      return;
    }
    if (id === playerId) {
      const p = game.gameState.player;
      p.gridX = state.gridX;
      p.gridY = state.gridY;
      p.heading = state.heading;
      p.heldOrb = state.heldOrb;
      p.updateWorldPos();
      return;
    }
    if (!game.gameState.otherPlayers.has(id)) {
      game.gameState.addRemotePlayer(id);
    }
    game.gameState.updateRemotePlayer(id, state);
  });

  projectiles.forEach(([id, data]) => {
    const existing = game.gameState.projectiles.find(p => p.__id === id);
    if (data === null) {
      if (existing) {
        game.gameState.projectiles = game.gameState.projectiles.filter(p => p.__id !== id);
      }
      return;
    }
    if (existing) {
      existing.x = data.x;
      existing.y = data.y;
      existing.heading = data.heading;
    } else {
      const pr = new Projectile(data.x, data.y, data.heading, data.shooterId);
      pr.__id = id;
      game.gameState.projectiles.push(pr);
    }
  });
}

function setupNetworking() {
  socket = io();

  socket.on('init', (data) => {
    playerId = data.id;
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas, onLocalAction);
    game.init();
  });

  socket.on('state:update', patchGameState);

  socket.on('player:killed', ({ killerId, victimId, streak }) => {
    if (!game) return;
    if (killerId === playerId) {
      game.gameState.player.killStreak = streak;
    }
    if (victimId === playerId) {
      game.gameState.player.killStreak = 0;
    }
  });
}

function onLocalAction(action) {
  if (!socket) return;
  socket.emit('input', action);
}

export function sendProjectile() {
  // no-op; projectiles are managed server-side
}

window.onload = () => {
    setupNetworking();
};

// expose for Player module
globalThis.sendProjectile = sendProjectile;
