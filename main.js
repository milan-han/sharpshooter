import { Game } from './core/Game.js';

let socket;
let game;
let playerId = null;

function setupNetworking() {
    socket = io();

    socket.on('init', (data) => {
        playerId = data.id;
        const canvas = document.getElementById('gameCanvas');
        game = new Game(canvas, onLocalAction);
        game.init();
        onLocalAction();
        // create existing players
        data.players.forEach(([id, state]) => {
            if (id === playerId) return;
            const pl = game.gameState.addRemotePlayer(id);
            game.gameState.updateRemotePlayer(id, state);
        });
    });

    socket.on('playerJoined', ({ id, state }) => {
        if (!game) return;
        const pl = game.gameState.addRemotePlayer(id);
        game.gameState.updateRemotePlayer(id, state);
    });

    socket.on('playerDisconnected', (id) => {
        if (!game) return;
        game.gameState.removeRemotePlayer(id);
    });

    socket.on('playerUpdate', ({ id, state }) => {
        if (!game) return;
        if (id === playerId) return;
        game.gameState.updateRemotePlayer(id, state);
    });

    socket.on('projectileFired', (proj) => {
        if (!game) return;
        game.gameState.projectiles.push(proj);
    });
}

function onLocalAction() {
    if (!socket || !game) return;
    const p = game.gameState.player;
    socket.emit('playerUpdate', {
        gridX: p.gridX,
        gridY: p.gridY,
        heading: p.heading,
        heldOrb: p.heldOrb
    });
}

export function sendProjectile(proj) {
    if (!socket) return;
    socket.emit('projectileFired', proj);
}

window.onload = () => {
    setupNetworking();
};

// expose for Player module
globalThis.sendProjectile = sendProjectile;
