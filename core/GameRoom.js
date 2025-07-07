import { ServerGameState } from './ServerGameState.js';
import { Player } from '../entities/Player.js';
import { Projectile } from '../entities/Projectile.js';
import { collidesWithShield } from '../utils/collision.js';
import { distanceSquared } from '../utils/math.js';

export class GameRoom {
  constructor({ io, roomId }) {
    this.io = io;
    this.roomId = roomId;
    this.state = new ServerGameState();
    this.sockets = new Map();
    this.inputQueue = [];
    this.lastPlayers = new Map();
    this.lastProjectiles = new Map();
    this.loop = this.loop.bind(this);
  }

  start() {
    if (!this.interval) {
      this.interval = setInterval(this.loop, 1000 / 60);
    }
  }

  addSocket(socket) {
    this.sockets.set(socket.id, socket);
    socket.join(this.roomId);
    const spawn = this.state.grid.getRandomSpawn();
    const player = new Player(spawn.gx, spawn.gy);
    player.playerId = socket.id;
    this.state.players.set(socket.id, player);
    this.state.leaderboard.set(socket.id, { kills: 0, streak: 0 });
    socket.emit('init', { id: socket.id });
  }

  removeSocket(socket) {
    this.sockets.delete(socket.id);
    this.state.players.delete(socket.id);
    this.state.leaderboard.delete(socket.id);
  }

  handleInput(socketId, input) {
    this.inputQueue.push({ socketId, input });
  }

  broadcast(event, payload) {
    this.io.to(this.roomId).emit(event, payload);
  }

  applyInputs() {
    const queue = this.inputQueue;
    this.inputQueue = [];
    queue.forEach(({ socketId, input }) => {
      const player = this.state.players.get(socketId);
      if (!player) return;
      switch (input.type) {
        case 'move':
          player.move(input.dir);
          break;
        case 'rotate':
          player.rotate(input.dir);
          break;
        case 'interact': {
          if (player.heldOrb) {
            const proj = new Projectile(player.worldX, player.worldY, player.heading, player.playerId);
            const id = `${socketId}-${Date.now()}`;
            this.state.projectiles.set(id, proj);
            player.heldOrb = false;
          } else {
            const tile = this.state.grid.getTileAt(player.gridX, player.gridY);
            if (tile && tile.hasOrb) {
              tile.hasOrb = false;
              player.heldOrb = true;
            }
          }
          break;
        }
      }
    });
  }

  updateProjectiles() {
    for (const [id, proj] of Array.from(this.state.projectiles.entries())) {
      const expired = proj.update();
      if (expired) {
        this.state.projectiles.delete(id);
      }
    }
  }

  resolveCollisions() {
    for (const [projId, proj] of Array.from(this.state.projectiles.entries())) {
      for (const [pid, player] of this.state.players.entries()) {
        if (proj.shooterId === pid) continue;
        if (collidesWithShield(proj, player)) {
          continue;
        }
        const cubeRadius = this.state.grid.getInnerSize() / 2;
        const distSq = distanceSquared(proj.x, proj.y, player.worldX, player.worldY);
        if (distSq <= cubeRadius * cubeRadius) {
          const killer = this.state.leaderboard.get(proj.shooterId);
          if (killer) {
            killer.kills += 1;
            killer.streak += 1;
          }
          const victim = this.state.leaderboard.get(pid);
          if (victim) {
            victim.streak = 0;
          }
          player.respawn();
          this.broadcast('player:killed', {
            killerId: proj.shooterId,
            victimId: pid,
            streak: killer ? killer.streak : 0,
          });
          this.state.projectiles.delete(projId);
          break;
        }
      }
    }
  }

  emitDelta() {
    const playerDelta = [];
   for (const [id, pl] of this.state.players.entries()) {
     const last = this.lastPlayers.get(id);
     if (!last || last.gridX !== pl.gridX || last.gridY !== pl.gridY || last.heading !== pl.heading || last.heldOrb !== pl.heldOrb) {
       playerDelta.push([id, { gridX: pl.gridX, gridY: pl.gridY, heading: pl.heading, heldOrb: pl.heldOrb }]);
     }
   }
    for (const id of this.lastPlayers.keys()) {
      if (!this.state.players.has(id)) {
        playerDelta.push([id, null]);
      }
    }
    this.lastPlayers = new Map(
      Array.from(this.state.players.entries()).map(([id, pl]) => [id, {
        gridX: pl.gridX,
        gridY: pl.gridY,
        heading: pl.heading,
        heldOrb: pl.heldOrb,
      }])
    );

    const projectileDelta = [];
    for (const [id, pr] of this.state.projectiles.entries()) {
      const last = this.lastProjectiles.get(id);
      if (!last || last.x !== pr.x || last.y !== pr.y || last.heading !== pr.heading) {
        projectileDelta.push([id, { x: pr.x, y: pr.y, heading: pr.heading, shooterId: pr.shooterId }]);
      }
    }
    for (const id of this.lastProjectiles.keys()) {
      if (!this.state.projectiles.has(id)) {
        projectileDelta.push([id, null]);
      }
    }
    this.lastProjectiles = new Map(
      Array.from(this.state.projectiles.entries()).map(([id, pr]) => [id, {
        x: pr.x,
        y: pr.y,
        heading: pr.heading,
        shooterId: pr.shooterId,
      }])
    );

    if (playerDelta.length || projectileDelta.length) {
      this.broadcast('state:update', { players: playerDelta, projectiles: projectileDelta, frame: this.state.frame });
    }
  }

  loop() {
    globalThis.gameState = this.state;
    globalThis.sendProjectile = (proj) => {
      const id = `p-${Date.now()}-${Math.random()}`;
      this.state.projectiles.set(id, proj);
    };
    this.applyInputs();
    this.updateProjectiles();
    this.resolveCollisions();
    this.state.frame += 1;
    this.emitDelta();
  }
}
