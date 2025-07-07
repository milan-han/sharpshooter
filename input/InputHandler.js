export class InputHandler {
    constructor(gameState, onAction = null) {
        this.gameState = gameState;
        this.onAction = onAction;
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            this.handleKeyDown(e.key.toLowerCase());
        });
    }

    handleKeyDown(key) {
        let action = null;
        switch (key) {
            case 'arrowup':
            case 'w':
                this.gameState.player.move(1);
                action = { type: 'move', dir: 1 };
                break;
            case 'arrowdown':
            case 's':
                this.gameState.player.move(-1);
                action = { type: 'move', dir: -1 };
                break;
            case 'arrowleft':
            case 'a':
                this.gameState.player.rotate(-1);
                action = { type: 'rotate', dir: -1 };
                break;
            case 'arrowright':
            case 'd':
                this.gameState.player.rotate(1);
                action = { type: 'rotate', dir: 1 };
                break;
            case ' ':
                this.gameState.player.interact();
                action = { type: 'interact' };
                break;
        }
        if (action && this.onAction) this.onAction(action);
    }
} 