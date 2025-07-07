/* eslint-env jest */
import { ServerGameState } from '../../core/ServerGameState.js';
import { Player } from '../../entities/Player.js';
import { Projectile } from '../../entities/Projectile.js';
import { jest } from '@jest/globals';

describe('ServerGameState serialization', () => {
  test('round trip maintains data', () => {
    jest.useFakeTimers();
    const state = new ServerGameState(123);
    globalThis.gameState = state;
    const p = new Player(1, 2);
    p.playerId = 'p1';
    state.players.set('p1', p);
    const pr = new Projectile(5, 5, 0, 'p1');
    state.projectiles.set('proj1', pr);
    state.frame = 42;
    state.leaderboard.set('p1', { kills: 3, streak: 2 });

    const obj = state.serialize();
    const copy = ServerGameState.deserialize(JSON.parse(JSON.stringify(obj)));
    jest.runAllTimers();
    jest.useRealTimers();

    expect(copy.frame).toBe(42);
    expect(copy.players.get('p1').gridX).toBe(1);
    expect(copy.projectiles.get('proj1').x).toBe(5);
    expect(copy.leaderboard.get('p1').kills).toBe(3);
  });
});
