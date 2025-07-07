// --- Canvas and Context Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// --- MODIFIED: Canvas now fills the entire window ---
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- Global State ---
let player, grid;
const camera = { x: 0, y: 0, rotation: 0, lerpFactor: 0.1 };
let projectiles = [];

// --- Utility ---
const lerp = (a, b, t) => a + (b - a) * t;

// --- Game Object Classes ---
class Projectile {
    constructor(x, y, heading) {
        this.x = x; this.y = y; this.heading = heading;
        this.initialSpeed = 40; // Higher initial speed
        this.speed = this.initialSpeed;
        this.decayFactor = 0.97; // Speed will decay by 3% each frame
        this.life = 200; this.radius = 5;
    }
    update() {
        this.speed *= this.decayFactor; // Apply exponential decay
        this.x += Math.cos(this.heading) * this.speed;
        this.y += Math.sin(this.heading) * this.speed;
        this.life--;
    }
    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Player {
    constructor(gridX, gridY) {
        this.gridX = gridX; this.gridY = gridY;
        this.worldX = 0; this.worldY = 0;
        this.heading = -Math.PI / 2;
        this.heldOrb = false;
        this.updateWorldPos();
    }
    updateWorldPos() { this.worldX = this.gridX * grid.tileSize; this.worldY = this.gridY * grid.tileSize; }
    move(direction) {
        const dx = Math.round(Math.cos(this.heading));
        const dy = Math.round(Math.sin(this.heading));
        const nextGridX = this.gridX + dx * direction;
        const nextGridY = this.gridY + dy * direction;
        if (grid.hasTileAt(nextGridX, nextGridY)) {
            this.gridX = nextGridX; this.gridY = nextGridY;
            this.updateWorldPos();
        }
    }
    rotate(direction) { this.heading += (Math.PI / 2) * direction; }
    interact() {
        if (this.heldOrb) {
            projectiles.push(new Projectile(this.worldX, this.worldY, this.heading));
            this.heldOrb = false;
        } else {
            const key = `${this.gridX},${this.gridY}`;
            const tile = grid.tiles.get(key);
            if (tile && tile.hasOrb) {
                this.heldOrb = true;
                tile.hasOrb = false;
            }
        }
    }
}

class Grid {
    constructor(worldSize, tileSize) {
        this.worldSize = worldSize; this.tileSize = tileSize;
        this.tiles = new Map();
        this.tileRatio = 0.85;
        this._generate();
    }
    _generate() {
        const maxGridCoord = this.worldSize / this.tileSize / 2;
        for (let gx = -maxGridCoord; gx < maxGridCoord; gx++) {
            for (let gy = -maxGridCoord; gy < maxGridCoord; gy++) {
                if (Math.random() > 0.3) {
                    this.tiles.set(`${gx},${gy}`, { hasOrb: Math.random() > 0.8 });
                }
            }
        }
        if (!this.tiles.has('0,0')) this.tiles.set('0,0', {hasOrb: false});
    }
    hasTileAt(gx, gy) { return this.tiles.has(`${gx},${gy}`); }
    draw() {
        const innerSize = this.tileSize * this.tileRatio;
        const halfInnerSize = innerSize / 2;
        const maxGridCoord = this.worldSize / this.tileSize / 2;
        const worldHalf = this.worldSize / 2;

        // Draw grid lines and empty spaces
        ctx.strokeStyle = '#27272a'; ctx.lineWidth = 1;
        for (let i = -maxGridCoord; i <= maxGridCoord; i++) {
            const p = i * this.tileSize - this.tileSize / 2;
            ctx.beginPath(); ctx.moveTo(p, -worldHalf); ctx.lineTo(p, worldHalf); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-worldHalf, p); ctx.lineTo(worldHalf, p); ctx.stroke();
        }
        ctx.fillStyle = '#0c0a09';
        for (let gx = -maxGridCoord; gx < maxGridCoord; gx++) {
            for (let gy = -maxGridCoord; gy < maxGridCoord; gy++) {
                if (!this.hasTileAt(gx, gy)) {
                    const x = gx * this.tileSize - this.tileSize / 2;
                    const y = gy * this.tileSize - this.tileSize / 2;
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                }
            }
        }
        
        // Draw tiles and orbs
        ctx.strokeStyle = '#3f3f46'; ctx.lineWidth = 1;
        this.tiles.forEach((tile, key) => {
            const [gx, gy] = key.split(',').map(Number);
            const x = gx * this.tileSize; const y = gy * this.tileSize;
            ctx.strokeRect(x - halfInnerSize, y - halfInnerSize, innerSize, innerSize);
            if (tile.hasOrb) {
                ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
            }
        });
        
        // Draw Player
        const playerWorldX = player.gridX * this.tileSize;
        const playerWorldY = player.gridY * this.tileSize;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'; ctx.strokeStyle = 'rgba(255, 80, 80, 1)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.rect(playerWorldX - halfInnerSize, playerWorldY - halfInnerSize, innerSize, innerSize); ctx.fill(); ctx.stroke();

        // Draw Directional Indicator
        ctx.save();
        ctx.translate(playerWorldX, playerWorldY);
        ctx.rotate(player.heading);
        
        // Draw curved arc indicator with gradient
        const arcRadius = 140;
        const arcWidth = Math.PI * 0.7;
        
        // Create gradient along the arc
        const gradient = ctx.createLinearGradient(
            -arcRadius * Math.sin(arcWidth/2), -arcRadius * Math.cos(arcWidth/2),
            arcRadius * Math.sin(arcWidth/2), -arcRadius * Math.cos(arcWidth/2)
        );
        
        // Add gradient stops for fade effect - opaque at ends, transparent in middle
        gradient.addColorStop(0, 'rgba(59, 130, 246, 1)');
        gradient.addColorStop(0.2, 'rgba(59, 130, 246, 0)');
        gradient.addColorStop(0.8, 'rgba(59, 130, 246, 0)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 1)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, arcRadius, -arcWidth/2, arcWidth/2);
        ctx.stroke();
        
        ctx.restore();
    }
}

// --- Input Handling ---
window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
            player.move(1);
            break;
        case 'arrowdown':
        case 's':
            player.move(-1);
            break;
        case 'arrowleft':
        case 'a':
            player.rotate(-1);
            break;
        case 'arrowright':
        case 'd':
            player.rotate(1);
            break;
        case ' ':
            player.interact();
            break;
    }
});

// --- Main Animation Loop ---
function animate() {
    camera.x = lerp(camera.x, player.worldX, camera.lerpFactor);
    camera.y = lerp(camera.y, player.worldY, camera.lerpFactor);
    const targetRotation = -player.heading - Math.PI / 2;
    let diff = targetRotation - camera.rotation;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    camera.rotation += diff * camera.lerpFactor;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw world-space elements
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(camera.rotation);
    ctx.translate(-camera.x, -camera.y);
    grid.draw();
    projectiles.forEach((p, i) => {
        p.update();
        p.draw();
        if (p.life <= 0) projectiles.splice(i, 1);
    });
    ctx.restore();

    requestAnimationFrame(animate);
}

// --- Initialization ---
function init() {
    grid = new Grid(4000, 200);
    player = new Player(0, 0);
    
    camera.x = player.worldX; camera.y = player.worldY;
    camera.rotation = -player.heading - Math.PI / 2;
    animate();
}

window.onload = init;
window.onresize = () => {
    // --- MODIFIED: Resize to fill window ---
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}; 