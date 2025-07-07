export const lerp = (a, b, t) => a + (b - a) * t;

export const normalizeAngle = (angle) => {
    while (angle < -Math.PI) angle += Math.PI * 2;
    while (angle > Math.PI) angle -= Math.PI * 2;
    return angle;
}; 