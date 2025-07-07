/* eslint-env jest */
import { distanceSquared, angleDiff } from '../../utils/math.js';

describe('math helpers', () => {
  test('distanceSquared computes squared distance', () => {
    expect(distanceSquared(0, 0, 3, 4)).toBe(25);
  });

  test('angleDiff normalizes difference', () => {
    expect(angleDiff(Math.PI, 0)).toBeCloseTo(Math.PI);
    expect(angleDiff(0, Math.PI)).toBeCloseTo(-Math.PI);
  });
});
