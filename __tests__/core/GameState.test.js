/* eslint-env jest */
import { GameState } from '../../core/GameState.js';
import { Projectile } from '../../entities/Projectile.js';
import { jest } from '@jest/globals';

describe('player kill and respawn', () => {
  test('hit increments shooter streak and respawns target', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const gs = new GameState();
    globalThis.gameState = gs;
    gs.grid.getRandomSpawn = jest.fn(() => ({ gx: 5, gy: 5 }));

    const shooter = gs.player;
    shooter.playerId = 'shooter';
    const target = gs.addRemotePlayer('target');
    target.shieldCooldown = 1; // can't block

    target.gridX = 0;
    target.gridY = 0;
    target.updateWorldPos();

    const proj = new Projectile(target.worldX, target.worldY, 0, shooter.playerId);
    proj.update = () => false; // stay in place

    gs.projectiles.push(proj);
    gs.update();

    expect(shooter.killStreak).toBe(1);
    expect(target.killStreak).toBe(0);
    expect(target.gridX).toBe(5);
    expect(target.gridY).toBe(5);
    Math.random.mockRestore();
  });
});
