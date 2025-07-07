import { GameState } from './GameState.js';
import { Renderer } from '../rendering/Renderer.js';
import { InputHandler } from '../input/InputHandler.js';
import { lerp, normalizeAngle } from '../utils/math.js';

export class Game {
    constructor(canvas, onAction = null) {
        this.gameState = new GameState();
        this.renderer = new Renderer(canvas);
        this.inputHandler = new InputHandler(this.gameState, onAction);
        
        // Make gameState globally accessible (works in browser and Node)
        globalThis.gameState = this.gameState;
        
        // Bind resize handler
        window.onresize = () => this.renderer.resize();
    }

    init() {
        this.gameState.init();
        this.animate();
    }

    updateCamera() {
        const camera = this.gameState.camera;
        camera.x = lerp(camera.x, this.gameState.player.worldX, camera.lerpFactor);
        camera.y = lerp(camera.y, this.gameState.player.worldY, camera.lerpFactor);
        
        const targetRotation = -this.gameState.player.heading - Math.PI / 2;
        const diff = normalizeAngle(targetRotation - camera.rotation);
        camera.rotation += diff * camera.lerpFactor;
    }

    animate = () => {
        this.updateCamera();
        this.renderer.render(this.gameState);
        requestAnimationFrame(this.animate);
    }
} 