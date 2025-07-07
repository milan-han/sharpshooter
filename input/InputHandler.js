export class InputHandler {
    constructor(gameState) {
        this.gameState = gameState;
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            this.handleKeyDown(e.key.toLowerCase());
        });
    }

    handleKeyDown(key) {
        switch (key) {
            case 'arrowup':
            case 'w':
                this.gameState.player.move(1);
                break;
            case 'arrowdown':
            case 's':
                this.gameState.player.move(-1);
                break;
            case 'arrowleft':
            case 'a':
                this.gameState.player.rotate(-1);
                break;
            case 'arrowright':
            case 'd':
                this.gameState.player.rotate(1);
                break;
            case ' ':
                this.gameState.player.interact();
                break;
        }
    }
} 