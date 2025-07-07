export class Projectile {
    constructor(x, y, heading, shooterId = null) {
        this.x = x;
        this.y = y;
        this.heading = heading;
        this.shooterId = shooterId; // track who fired this projectile
        this.initialSpeed = 40;
        this.speed = this.initialSpeed;
        this.decayFactor = 0.97;
        this.life = 200;
        this.radius = 5;
        
        // Color based on shooter type
        if (shooterId === 'player') {
            this.color = '#ff4444'; // red for human player
        } else if (shooterId && shooterId.startsWith('npc_')) {
            this.color = '#22c55e'; // green for NPCs
        } else {
            this.color = 'white'; // fallback
        }
    }

    update() {
        this.speed *= this.decayFactor;
        this.x += Math.cos(this.heading) * this.speed;
        this.y += Math.sin(this.heading) * this.speed;
        this.life--;
        return this.life <= 0; // Return true if projectile should be removed
    }
} 