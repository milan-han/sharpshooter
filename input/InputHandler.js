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
                action = { type: 'move', dir: 1 };
                break;
            case 'arrowdown':
            case 's':
                action = { type: 'move', dir: -1 };
                break;
            case 'arrowleft':
            case 'a':
                action = { type: 'rotate', dir: -1 };
                break;
            case 'arrowright':
            case 'd':
                action = { type: 'rotate', dir: 1 };
                break;
            case ' ':
                action = { type: 'interact' };
                break;
        }
        if (action && this.onAction) this.onAction(action);
    }
} 