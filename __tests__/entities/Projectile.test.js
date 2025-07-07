/* eslint-env jest */
import { Projectile } from '../../entities/Projectile.js';

describe('Projectile physics', () => {
  test('reflect turns projectile toward normal and slows it', () => {
    const p = new Projectile(0, 0, Math.PI);
    const initialSpeed = p.speed;
    p.reflect(0);
    expect(p.heading).toBeCloseTo(0);
    expect(p.speed).toBeCloseTo(initialSpeed * 0.9);
  });
});
