# Ball Shooter IO

A tactical grid-based IO game where players collect balls and shoot them at opponents while using directional shields for defense.

## Overview

Ball Shooter IO is a real-time multiplayer game built with vanilla JavaScript using ES6 modules. Players move on a grid-based battlefield, collect ammunition (white balls), and engage in combat while strategically using their directional shields to block incoming projectiles.

## Features

- **Grid-based Movement**: Players move on a structured grid system with smooth camera following
- **Tactical Combat**: Collect balls to load your weapon and fire at enemies
- **Directional Shield**: Front-facing shield arc blocks incoming projectiles
- **Health System**: Players have 100 HP and take damage from direct hits
- **Dynamic Ball Spawning**: Balls spawn randomly across the map over time
- **Smooth Camera**: Camera follows player with rotation and smooth interpolation
- **Modular Architecture**: Clean separation of concerns with ES6 modules

## Quick Start

1. **Clone or download** the project files
2. **Serve the files** using a local web server (required for ES6 modules):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   
   # Using Live Server (VS Code extension)
   # Right-click index.html and select "Open with Live Server"
   ```
3. **Open your browser** and navigate to `http://localhost:8000`
4. **Start playing** with the arrow keys and spacebar!

## Controls

- **Arrow Keys**: Move and rotate your player
  - ↑/↓: Move forward/backward in the direction you're facing
  - ←/→: Rotate left/right (90-degree increments)
- **Spacebar**: Interact
  - Collect balls when standing on them
  - Fire projectiles when holding a ball
- **Shield**: Automatically blocks projectiles in front of you (blue arc)

## Architecture

The game is built using a modular architecture with clear separation of concerns:

### Core Modules

#### `src/utils.js`
- **Purpose**: Shared utilities and configuration constants
- **Key Features**:
  - Game configuration (speeds, sizes, spawn rates)
  - Mathematical utilities (lerp, angle normalization)
  - Collision detection helpers
  - Coordinate system conversions

#### `src/projectile.js`
- **Purpose**: Manages fired projectiles (balls)
- **Key Features**:
  - Projectile physics and movement
  - Lifetime management
  - Visual effects (glow, trails)
  - Collision boundaries

#### `src/player.js`
- **Purpose**: Player entity management
- **Key Features**:
  - Grid-based movement system
  - Health and damage system
  - Shield collision detection
  - Visual rendering (player, health bar, held items)
  - State management for networking

#### `src/gameMap.js`
- **Purpose**: World management and ball spawning
- **Key Features**:
  - Grid system management
  - Ball spawning and removal
  - Valid position checking
  - Map rendering (grid lines, balls)
  - Dynamic content updates

#### `src/game.js`
- **Purpose**: Main game loop and system coordination
- **Key Features**:
  - Game loop management
  - Input handling
  - Camera system
  - Collision detection
  - Entity management
  - Rendering pipeline

### Data Flow

```
Input Events → Game.handleInput() → Player.move/rotate/interact()
                                 ↓
Game.update() → Updates all entities → Collision detection
                                    ↓
Game.render() → Camera transforms → Draw world → Draw UI
```

## Game Systems

### Movement System
- **Grid-based**: Players move in discrete grid cells
- **Directional**: Movement is always in the direction the player faces
- **Bounded**: Movement is restricted to valid grid positions

### Combat System
- **Ammunition**: Players must collect balls before firing
- **Projectiles**: Fired balls travel in straight lines with limited lifetime
- **Damage**: Direct hits deal 25 damage (4 hits to eliminate)
- **Shield**: Front-facing arc blocks projectiles within range

### Camera System
- **Following**: Camera smoothly follows the local player
- **Rotation**: Camera rotates to match player orientation
- **Interpolation**: Smooth movement using linear interpolation

### Rendering Pipeline
1. **Clear Canvas**: Reset the drawing surface
2. **World Space**: Apply camera transformations
3. **Draw Map**: Render grid and balls
4. **Draw Entities**: Render players and projectiles
5. **Screen Space**: Draw UI elements (held balls, stats)

## Development

### Adding New Features

1. **New Entity Types**: Create new classes following the existing pattern
2. **Game Mechanics**: Add new systems to the Game class
3. **Visual Effects**: Extend rendering methods in respective classes
4. **Networking**: Use the `getState()` methods for synchronization

### Configuration

Modify `src/utils.js` CONFIG object to adjust:
- Game world dimensions
- Movement speeds
- Projectile properties
- Spawn rates
- Visual parameters

### Performance Considerations

- **Object Pooling**: Consider pooling projectiles for high-frequency games
- **Culling**: Only render entities within camera view
- **Update Frequency**: Separate update rates for different systems
- **Memory Management**: Clean up inactive entities promptly

## Browser Compatibility

- **Modern Browsers**: Chrome 61+, Firefox 60+, Safari 10.1+, Edge 16+
- **Requirements**: ES6 module support, Canvas API, requestAnimationFrame
- **Local Server**: Required for ES6 module loading (CORS restrictions)

## Future Enhancements

### Multiplayer Features
- WebSocket server integration
- Player synchronization
- Lag compensation
- Server-side validation

### Gameplay Features
- Power-ups and special abilities
- Different weapon types
- Team-based gameplay
- Leaderboards and scoring

### Technical Improvements
- Sprite-based graphics
- Sound effects and music
- Mobile touch controls
- Progressive Web App features

## Contributing

1. Follow the existing code style and architecture
2. Add JSDoc comments for new functions and classes
3. Test changes in multiple browsers
4. Update documentation for new features

## License

This project is open source and available under the MIT License. 