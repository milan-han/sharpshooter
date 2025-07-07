/* eslint-env jest */
import { jest } from '@jest/globals';
import { GameRoom } from '../../core/GameRoom.js';
import { Player } from '../../entities/Player.js';
import { Projectile } from '../../entities/Projectile.js';

function createMockIO() {
  const emit = jest.fn();
  return {
    to: jest.fn(() => ({ emit })),
  };
}

describe('server kill logic', () => {
  test('projectile kills target and increments streak', () => {
    jest.useFakeTimers();
    const io = createMockIO();
    const room = new GameRoom({ io, roomId: 'r1' });

    globalThis.gameState = room.state;

    const shooter = new Player(0, 0);
    shooter.playerId = 'p1';
    const target = new Player(0, 0);
    target.playerId = 'p2';

    room.state.players.set('p1', shooter);
    room.state.players.set('p2', target);
    room.state.leaderboard.set('p1', { kills: 0, streak: 0 });
    room.state.leaderboard.set('p2', { kills: 0, streak: 0 });

    const proj = new Projectile(target.worldX, target.worldY, 0, 'p1');
    proj.update = () => false;
    room.state.projectiles.set('proj1', proj);

    jest.runAllTimers();

    room.loop();

    expect(room.state.leaderboard.get('p1').streak).toBe(1);
    const innerEmit = io.to.mock.results[0].value.emit;
    expect(innerEmit).toHaveBeenCalledWith('player:killed', expect.any(Object));
    jest.useRealTimers();
  });
});
