export class Grid {
    constructor(worldSize, tileSize) {
        this.worldSize = worldSize;
        this.tileSize = tileSize;
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

    hasTileAt(gx, gy) {
        return this.tiles.has(`${gx},${gy}`);
    }

    getTileAt(gx, gy) {
        return this.tiles.get(`${gx},${gy}`);
    }

    getInnerSize() {
        return this.tileSize * this.tileRatio;
    }

    getMaxGridCoord() {
        return this.worldSize / this.tileSize / 2;
    }

    getWorldHalf() {
        return this.worldSize / 2;
    }

    getRandomSpawn() {
        const keys = Array.from(this.tiles.keys());
        if (keys.length === 0) return { gx: 0, gy: 0 };
        const idx = Math.floor(Math.random() * keys.length);
        const [gx, gy] = keys[idx].split(',').map(Number);
        return { gx, gy };
    }
}
