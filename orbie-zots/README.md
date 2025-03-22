# Orbie Zots

A mobile-optimized interactive particle swarm simulation with Orbie - a central character that influences nearby particles.

## Overview

Orbie Zots is a touch-based interactive simulation that creates mesmerizing particle swarm behavior. The application features:

- Orbie: A central character with a golden pulsating glow that influences nearby particles
- Interactive touch controls with attract/repel modes (double-tap to toggle)
- Multiple color themes including a unique "sparkle" grayscale effect
- Comprehensive parameter controls organized by category
- Optimized performance for mobile devices
- Wall system with interactive physics and SVG import support

## Features

### Orbie Character
- Central character with pulsating golden glow
- Direct touch interaction (push/pull)
- Configurable influence radius affecting nearby particles
- Adjustable size, glow, and pulsation parameters

### Particle Swarms
- "Zots": Regular particles with plasma drift behavior
- "Swarm": Particles under Orbie's influence with distinct behavior
- Physics-based flocking simulation with separation, alignment, and cohesion
- Configurable sparkle rate for dynamic color changes

### Wall System
- Create interactive walls that particles and Orbie interact with
- Draw walls directly or import from SVG files
- Multiple wall types with different interaction properties:
  - Standard Walls: Block all entities
  - Golden Path: Allows Orbie and OrbieSwarm to pass through
  - Ghost Walls: Block Zots but allow Orbie to pass
  - Orbie-Only Barrier: Only blocks Orbie entities
  - Energy Field: Blocks all entities with reduced force
- Support for curved walls with Bezier and arc segments

### Color Theme System
- 8 distinct color themes: rainbow, blue, green, fire, neon, gold, sparkle, and colorblind
- Customizable sparkle theme with grayscale/color balance controls
- Theme selection via the menu interface

### Interactive Controls
- Double-tap anywhere to toggle between attract/repel modes
- Menu interface with tabbed parameter groups (Orbie, Swarm, Zots, Walls)
- Fine-tuned control over all simulation aspects
- Reset controls to quickly reposition Orbie or reset all particles

## Project Structure

```
orbie-zots/
├── public/                 # Publicly accessible files
│   ├── index.html          # Main HTML file
│   ├── css/                # Stylesheets
│   │   └── styles.css      # Core CSS styles
│   ├── dist/               # Compiled/minified JS
│   │   └── bundle.js       # Combined, minified JavaScript
│   ├── curves-sample.svg   # Sample SVG for wall importing
│   └── sample-walls.svg    # Sample SVG for wall importing
│
├── src/                    # Source code (not directly accessible)
│   └── js/                 # Original JS source files
│       ├── particles.js    # Particle system logic
│       ├── touch.js        # Touch interaction handler
│       ├── colors.js       # Color themes and generators
│       ├── menu.js         # Menu UI handlers
│       ├── walls.js        # Wall system and physics
│       ├── presets.js      # Preset configurations
│       └── main.js         # Application initialization
│
├── build/                  # Build scripts and configuration
│   ├── build.js            # Simple build script
│   └── .terserrc           # Terser configuration for minification
│
├── docs/                   # Documentation
├── wall-layouts.md         # Documentation for wall system
├── wall-logic.txt          # Technical details of wall implementation
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation
```

## Technical Design

### Modular Architecture
The project is organized into discrete functional modules:

- **particles.js**: Core simulation engine with proprietary flocking algorithms
- **touch.js**: Touch interaction handler with visual feedback effects
- **colors.js**: Color theme system with various theme generators
- **menu.js**: Menu interface with organized parameter controls
- **walls.js**: Wall system with physics interactions and SVG import capabilities
- **presets.js**: Preset configuration options for quick setup
- **main.js**: Application initialization and module coordination

### Security Features
- Proprietary algorithms encapsulated using module pattern
- Limited public API exposure to protect intellectual property
- Minification and obfuscation via Terser

### Mobile Optimization
- Touch-centric interaction model with visual feedback
- Performance optimizations for mobile rendering
- Throttled event handling for smoother experience
- Hardware acceleration via appropriate CSS properties

## Development

### Prerequisites
- Node.js and npm

### Getting Started
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the project:
   ```
   npm run build
   ```
   or for Windows environments:
   ```
   npm run build:simple
   ```
4. Start the development server:
   ```
   npm run start
   ```
   
The application will be available at http://localhost:8080

### Development Workflow
For convenience, you can use:
```
npm run dev
```
This will build the project and start the development server in one command.

## Usage

- **Touch/click and drag** to interact with Orbie and particles
- **Double-tap/double-click** to toggle between attract and repel modes
- **Click the menu button** (≡) in the top-right to access controls
- Use the **parameter groups** dropdown to switch between Orbie, Swarm, Zots, and Walls settings
- Adjust the **color theme** via the dropdown menu
- Fine-tune the **sparkle effect** with the dedicated controls
- Use **Reset Orbie** to center Orbie or **Reset All** to reset everything

### Wall Interaction
- Draw walls directly using the wall tools in the menu
- Import walls from SVG files using the "Load Walls from SVG" button
- Different wall types interact with particles and Orbie differently
- See wall-layouts.md for detailed information about creating custom wall layouts

## Creating Wall Layouts
The simulation can load walls from SVG files containing path elements. These walls support:

- Different types that interact with entities in unique ways
- Curved paths using Bezier and arc SVG commands
- Custom force strengths and visual appearances

See the wall-layouts.md file for comprehensive documentation on creating wall layouts.

## Deployment
To deploy the application, transfer the contents of the `public` directory to your web server.