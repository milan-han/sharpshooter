import { Grid } from '../entities/Grid.js';
import { Player } from '../entities/Player.js';
import { collidesWithShield } from '../utils/collision.js';
import { distanceSquared } from '../utils/math.js';

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

        const player = globalThis.gameState.player;
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

        this.npcPlayers = [];
        this.otherPlayers = new Map();
    }

    init() {
        this.camera.x = this.player.worldX;
        this.camera.y = this.player.worldY;
        this.camera.rotation = -this.player.heading - Math.PI / 2;
    }

    addRemotePlayer(id) {
        const pl = new Player(0, 0);
        pl.playerId = id;
        pl.shieldCooldown = 0;
        pl.hitBlinkTimer = 0;
        this.otherPlayers.set(id, pl);
        return pl;
    }

    removeRemotePlayer(id) {
        this.otherPlayers.delete(id);
    }

    updateRemotePlayer(id, state) {
        const pl = this.otherPlayers.get(id);
        if (!pl) return;
        pl.gridX = state.gridX;
        pl.gridY = state.gridY;
        pl.heading = state.heading;
        pl.heldOrb = state.heldOrb;
        pl.updateWorldPos();
    }

    update() {
        const allPlayers = [
            this.player,
            ...this.npcPlayers,
            ...this.otherPlayers.values()
        ];

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

                const cubeRadius = this.grid.getInnerSize() / 2;
                const distSq = distanceSquared(proj.x, proj.y, pl.worldX, pl.worldY);

                if (collidesWithShield(proj, pl)) {
                    break; // projectile reflected by shield
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

    getState() {
        const players = [
            this.player,
            ...this.npcPlayers,
            ...this.otherPlayers.values()
        ].map(p => ({
            playerId: p.playerId,
            gridX: p.gridX,
            gridY: p.gridY,
            heading: p.heading,
            heldOrb: p.heldOrb
        }));

        const projectiles = this.projectiles.map(pr => ({
            x: pr.x,
            y: pr.y,
            heading: pr.heading,
            shooterId: pr.shooterId
        }));

        return { players, projectiles };
    }
}
