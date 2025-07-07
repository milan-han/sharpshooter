export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawProjectile(projectile) {
        this.ctx.fillStyle = projectile.color || 'white';
        this.ctx.beginPath();
        this.ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawGrid(grid) {
        const innerSize = grid.getInnerSize();
        const halfInnerSize = innerSize / 2;
        const maxGridCoord = grid.getMaxGridCoord();
        const worldHalf = grid.getWorldHalf();

        // Draw grid lines and empty spaces
        this.ctx.strokeStyle = '#27272a';
        this.ctx.lineWidth = 1;
        for (let i = -maxGridCoord; i <= maxGridCoord; i++) {
            const p = i * grid.tileSize - grid.tileSize / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(p, -worldHalf);
            this.ctx.lineTo(p, worldHalf);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(-worldHalf, p);
            this.ctx.lineTo(worldHalf, p);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = '#0c0a09';
        for (let gx = -maxGridCoord; gx < maxGridCoord; gx++) {
            for (let gy = -maxGridCoord; gy < maxGridCoord; gy++) {
                if (!grid.hasTileAt(gx, gy)) {
                    const x = gx * grid.tileSize - grid.tileSize / 2;
                    const y = gy * grid.tileSize - grid.tileSize / 2;
                    this.ctx.fillRect(x, y, grid.tileSize, grid.tileSize);
                }
            }
        }

        // Draw tiles and orbs
        this.ctx.strokeStyle = '#3f3f46';
        this.ctx.lineWidth = 1;
        grid.tiles.forEach((tile, key) => {
            const [gx, gy] = key.split(',').map(Number);
            const x = gx * grid.tileSize;
            const y = gy * grid.tileSize;
            this.ctx.strokeRect(x - halfInnerSize, y - halfInnerSize, innerSize, innerSize);
            if (tile.hasOrb) {
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 8, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    drawPlayer(player, grid, isNPC = false) {
        const playerWorldX = player.gridX * grid.tileSize;
        const playerWorldY = player.gridY * grid.tileSize;
        const halfInnerSize = grid.getInnerSize() / 2;

        // Draw player or NPC square with different colour schemes
        if (isNPC) {
            this.ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';   // greenish NPC fill
            this.ctx.strokeStyle = 'rgba(34, 197, 94, 1)';   // greenish outline
        } else {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';     // red player fill
            this.ctx.strokeStyle = 'rgba(255, 80, 80, 1)';   // red outline
        }
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.rect(playerWorldX - halfInnerSize, playerWorldY - halfInnerSize, grid.getInnerSize(), grid.getInnerSize());
        this.ctx.fill();
        this.ctx.stroke();

        // Draw direction indicator
        this.ctx.save();
        this.ctx.translate(playerWorldX, playerWorldY);
        this.ctx.rotate(player.heading);
        
        const arcRadius = 140;
        const arcWidth = Math.PI * 0.7;
        
        const gradient = this.ctx.createLinearGradient(
            -arcRadius * Math.sin(arcWidth/2), -arcRadius * Math.cos(arcWidth/2),
            arcRadius * Math.sin(arcWidth/2), -arcRadius * Math.cos(arcWidth/2)
        );
        
        gradient.addColorStop(0, 'rgba(59, 130, 246, 1)');
        gradient.addColorStop(0.2, 'rgba(59, 130, 246, 0)');
        gradient.addColorStop(0.8, 'rgba(59, 130, 246, 0)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 1)');
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, arcRadius, -arcWidth/2, arcWidth/2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawUI(gameState) {
        const killStreak = gameState.player.killStreak || 0;
        
        // Save context for UI drawing (no transforms)
        this.ctx.save();
        
        // Top right position
        const padding = 24;
        const boxWidth = 160;
        const boxHeight = 60;
        const x = this.canvas.width - boxWidth - padding;
        const y = padding;
        
        // Background box with grid-like aesthetic
        this.ctx.fillStyle = 'rgba(12, 10, 9, 0.9)'; // Dark background matching grid
        this.ctx.strokeStyle = '#27272a'; // Grid line color
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(x, y, boxWidth, boxHeight);
        this.ctx.strokeRect(x, y, boxWidth, boxHeight);
        
        // Inner border detail
        this.ctx.strokeStyle = '#3f3f46';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 4, y + 4, boxWidth - 8, boxHeight - 8);
        
        // Kill streak text
        this.ctx.fillStyle = '#a1a1aa'; // Muted gray
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('KILL STREAK', x + 12, y + 20);
        
        // Kill streak number
        this.ctx.fillStyle = killStreak > 0 ? '#ef4444' : '#71717a'; // Red if active, gray if zero
        this.ctx.font = 'bold 24px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(killStreak.toString(), x + boxWidth / 2, y + 45);
        
        this.ctx.restore();
    }

    render(gameState) {
        this.clear();
        
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate(gameState.camera.rotation);
        this.ctx.translate(-gameState.camera.x, -gameState.camera.y);

        this.drawGrid(gameState.grid);
        gameState.projectiles.forEach(p => this.drawProjectile(p));

        // Draw NPC cubes
        if (gameState.npcPlayers) {
            gameState.npcPlayers.forEach(npc => this.drawPlayer(npc, gameState.grid, true));
        }

        // Draw other connected players
        if (gameState.otherPlayers) {
            for (const pl of gameState.otherPlayers.values()) {
                this.drawPlayer(pl, gameState.grid);
            }
        }

        // Draw human player last so it appears on top
        this.drawPlayer(gameState.player, gameState.grid);

        this.ctx.restore();
        
        // Draw UI elements (after restoring world transforms)
        this.drawUI(gameState);
    }
} 