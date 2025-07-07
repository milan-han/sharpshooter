import { Grid } from '../entities/Grid.js';
import { Player } from '../entities/Player.js';

// Lightweight AI-controlled cube that inherits all movement and shooting behaviour from Player
class NPC extends Player {
    constructor(gridX, gridY) {
        super(gridX, gridY);
        // Give each NPC a unique ID for projectile tracking
        this.playerId = `npc_${Math.random().toString(36).substr(2, 9)}`;
        // Frame countdown until next decision
        this._decisionCooldown = 0;
        this._decisionInterval = 20; // decide roughly every 20 frames

        // Combat-related state
        this.shieldCooldown = 0; // frames until shield can block again
        this.hitBlinkTimer = 0;  // frames remaining to blink after being hit
    }

    update() {
        // Throttle decision-making to every _decisionInterval frames
        if (this._decisionCooldown > 0) {
            this._decisionCooldown--;
            return;
        }
        this._decisionCooldown = this._decisionInterval;

        const player = window.gameState.player;
        if (!player) return;

        // Determine which cardinal direction more closely points toward the human player
        const dx = player.gridX - this.gridX;
        const dy = player.gridY - this.gridY;

        // Pick the dominant axis to face the player (avoids diagonals)
        let desiredHeading;
        if (Math.abs(dx) > Math.abs(dy)) {
            desiredHeading = dx > 0 ? 0 : Math.PI; // East or West
        } else {
            desiredHeading = dy > 0 ? Math.PI / 2 : -Math.PI / 2; // South or North
        }

        // Normalise current heading into [-PI, PI] for comparison
        const normalisedCurrent = ((this.heading % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const diff = desiredHeading - normalisedCurrent;
        // Rotate toward desired heading if not already aligned (allow a small tolerance)
        if (Math.abs(diff) > 0.01) {
            const direction = (diff + Math.PI * 2) % (Math.PI * 2) > Math.PI ? -1 : 1;
            this.rotate(direction);
            return; // rotate this tick, act next tick
        }

        // When aligned choose to move forward or shoot
        if (Math.random() < 0.5) {
            // Attempt to move one tile forward
            this.move(1);
        } else {
            // Ensure we have an orb to fire, otherwise pretend to pick one up
            if (!this.heldOrb) this.heldOrb = true;
            this.interact();
        }
    }
}

export class GameState {
    constructor() {
        // Create grid first
        this.grid = new Grid(4000, 200);
        this.projectiles = [];
        this.camera = {
            x: 0,
            y: 0,
            rotation: 0,
            lerpFactor: 0.1
        };
        // Create player after grid is initialized
        this.player = new Player(0, 0);
        this.player.playerId = 'player'; // human player gets fixed ID

        // Attach combat state to human player
        this.player.shieldCooldown = 0;
        this.player.hitBlinkTimer = 0;

        // Spawn a handful of NPC opponents at random valid tiles away from the centre
        this.npcPlayers = [];
        const tileKeys = Array.from(this.grid.tiles.keys());
        const desiredNPCCount = 3;
        while (this.npcPlayers.length < desiredNPCCount && tileKeys.length) {
            const index = Math.floor(Math.random() * tileKeys.length);
            const [gx, gy] = tileKeys.splice(index, 1)[0].split(',').map(Number);
            if (gx === 0 && gy === 0) continue; // avoid spawning on human player
            const npc = new NPC(gx, gy);
            this.npcPlayers.push(npc);
        }
    }

    init() {
        this.camera.x = this.player.worldX;
        this.camera.y = this.player.worldY;
        this.camera.rotation = -this.player.heading - Math.PI / 2;
    }

    update() {
        const allPlayers = [this.player, ...this.npcPlayers];

        // Update timers (shield cooldowns / blink) for everyone
        allPlayers.forEach(p => {
            if (p.shieldCooldown > 0) p.shieldCooldown--;
            if (p.hitBlinkTimer > 0) p.hitBlinkTimer--;
        });

        // Update NPC AI so they can spawn projectiles this frame
        this.npcPlayers.forEach(npc => npc.update());

        // Move projectiles and decide if they should persist
        const stillAlive = [];
        for (const proj of this.projectiles) {
            const expired = proj.update();
            if (expired) continue;

            let remove = false;

            // Check collision with each player cube
            for (const pl of allPlayers) {
                // Skip collision if this projectile was fired by this player
                if (proj.shooterId === pl.playerId) continue;

                const dx = proj.x - pl.worldX;
                const dy = proj.y - pl.worldY;
                const distSq = dx * dx + dy * dy;

                const shieldRadius = 140;
                const shieldArc = Math.PI * (100 / 180); // 100° arc
                const cubeRadius = this.grid.getInnerSize() / 2;

                // Shield block and bounce
                if (pl.shieldCooldown === 0 && distSq <= shieldRadius * shieldRadius) {
                    const angleToProj = Math.atan2(dy, dx);
                    let diff = ((angleToProj - pl.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI; // [-PI, PI]
                    if (Math.abs(diff) <= shieldArc / 2) {
                        // Bounce: reverse direction and slow slightly
                        proj.heading = angleToProj + Math.PI;
                        proj.speed *= 0.9;
                        // Reposition just outside shield to avoid immediate re-trigger
                        proj.x = pl.worldX + Math.cos(angleToProj) * (shieldRadius + proj.radius + 1);
                        proj.y = pl.worldY + Math.sin(angleToProj) * (shieldRadius + proj.radius + 1);

                        pl.shieldCooldown = 24; // approx 0.4s at 60fps
                        // Do not remove projectile; continue physics
                        break; // No need to check cube hit this tick
                    }
                }

                // Direct cube hit (square approximated as circle)
                if (distSq <= cubeRadius * cubeRadius) {
                    pl.hitBlinkTimer = 30; // blink for half a second
                    remove = true;
                    break;
                }
            }

            if (!remove) stillAlive.push(proj);
        }

        this.projectiles = stillAlive;
    }
} 