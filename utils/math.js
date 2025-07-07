export const lerp = (a, b, t) => a + (b - a) * t;

export const normalizeAngle = (angle) => {
    while (angle < -Math.PI) angle += Math.PI * 2;
    while (angle > Math.PI) angle -= Math.PI * 2;
    return angle;
};

export const distanceSquared = (x1, y1, x2, y2) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy;
};

export const angleDiff = (a, b) => normalizeAngle(a - b);
