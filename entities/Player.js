import { Projectile } from './Projectile.js';

export class Player {
    constructor(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.worldX = 0;
        this.worldY = 0;
        this.heading = -Math.PI / 2;
        this.heldOrb = false;
        // Wait for next tick to update position to ensure gameState is available
        setTimeout(() => this.updateWorldPos(), 0);
    }

    updateWorldPos() {
        const grid = globalThis.gameState.grid;
        if (grid) {
            this.worldX = this.gridX * grid.tileSize;
            this.worldY = this.gridY * grid.tileSize;
        }
    }

    move(direction) {
        const dx = Math.round(Math.cos(this.heading));
        const dy = Math.round(Math.sin(this.heading));
        const nextGridX = this.gridX + dx * direction;
        const nextGridY = this.gridY + dy * direction;
        if (globalThis.gameState.grid.hasTileAt(nextGridX, nextGridY)) {
            this.gridX = nextGridX;
            this.gridY = nextGridY;
            this.updateWorldPos();
        }
    }

    rotate(direction) {
        this.heading += (Math.PI / 2) * direction;
    }

    interact() {
        if (this.heldOrb) {
            const proj = new Projectile(this.worldX, this.worldY, this.heading, this.playerId);
            globalThis.gameState.projectiles.push(proj);
            if (typeof globalThis.sendProjectile === 'function') {
                globalThis.sendProjectile(proj);
            }
            this.heldOrb = false;
        } else {
            const key = `${this.gridX},${this.gridY}`;
            const tile = globalThis.gameState.grid.tiles.get(key);
            if (tile && tile.hasOrb) {
                this.heldOrb = true;
                tile.hasOrb = false;
            }
        }
    }
} 