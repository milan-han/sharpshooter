import { Grid } from '../entities/Grid.js';
import { Player } from '../entities/Player.js';
import { Projectile } from '../entities/Projectile.js';

export class ServerGameState {
  constructor(seed = Date.now()) {
    this.grid = new Grid(4000, 200);
    this.players = new Map();
    this.projectiles = new Map();
    this.frame = 0;
    this.rngSeed = seed;
    this.leaderboard = new Map();
  }

  serialize() {
    return {
      frame: this.frame,
      rngSeed: this.rngSeed,
      players: Array.from(this.players.entries()).map(([id, p]) => [id, {
        gridX: p.gridX,
        gridY: p.gridY,
        heading: p.heading,
        heldOrb: p.heldOrb,
      }]),
      projectiles: Array.from(this.projectiles.entries()).map(([id, pr]) => [id, {
        x: pr.x,
        y: pr.y,
        heading: pr.heading,
        shooterId: pr.shooterId,
      }]),
      leaderboard: Array.from(this.leaderboard.entries()),
    };
  }

  static deserialize(obj) {
    const state = new ServerGameState(obj.rngSeed);
    state.frame = obj.frame;
    obj.players.forEach(([id, data]) => {
      const p = new Player(data.gridX, data.gridY);
      p.playerId = id;
      p.heading = data.heading;
      p.heldOrb = data.heldOrb;
      state.players.set(id, p);
    });
    obj.projectiles.forEach(([id, pr]) => {
      const proj = new Projectile(pr.x, pr.y, pr.heading, pr.shooterId);
      state.projectiles.set(id, proj);
    });
    state.leaderboard = new Map(obj.leaderboard);
    return state;
  }
}
