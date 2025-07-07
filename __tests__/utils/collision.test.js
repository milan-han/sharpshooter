/* eslint-env jest */
import { collidesWithShield, SHIELD_RADIUS } from '../../utils/collision.js';
import { Projectile } from '../../entities/Projectile.js';

describe('shield collision', () => {
  test('projectile within arc is reflected', () => {
    const player = { worldX: 0, worldY: 0, heading: 0, shieldCooldown: 0 };
    const proj = new Projectile(SHIELD_RADIUS - 1, 0, Math.PI);
    const result = collidesWithShield(proj, player);
    expect(result).toBe(true);
    expect(proj.heading).toBeCloseTo(0);
    expect(player.shieldCooldown).toBe(24);
  });
});
