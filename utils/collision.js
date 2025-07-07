import { distanceSquared, angleDiff } from './math.js';

export const SHIELD_RADIUS = 140;
export const SHIELD_ARC = Math.PI * (100 / 180); // 100° arc

export const collidesWithShield = (projectile, player) => {
    if (player.shieldCooldown > 0) return false;

    const distSq = distanceSquared(projectile.x, projectile.y, player.worldX, player.worldY);
    if (distSq > SHIELD_RADIUS * SHIELD_RADIUS) return false;

    const angleToProj = Math.atan2(projectile.y - player.worldY, projectile.x - player.worldX);
    if (Math.abs(angleDiff(angleToProj, player.heading)) > SHIELD_ARC / 2) return false;

    projectile.reflect(angleToProj);
    projectile.x = player.worldX + Math.cos(angleToProj) * (SHIELD_RADIUS + projectile.radius + 1);
    projectile.y = player.worldY + Math.sin(angleToProj) * (SHIELD_RADIUS + projectile.radius + 1);
    player.shieldCooldown = 24;
    return true;
};
