/**
 * Orbie Zots - Particle Swarm Simulation
 * Copyright (c) 2025
 * Built: 2025-03-22T16:20:08.978Z
 */

// colors.js - Color themes and generators for particles
const ColorThemes = (function() {
    // Current active theme
    let currentTheme = 'sparkle';
    
    // Sparkle settings
    let sparkleSettings = {
        grayscaleChance: 0.8,       // Chance of grayscale vs. color (0-1)
        colorSaturation: 15,        // Saturation for colored particles (0-100)
        brightnessFactor: 1.0       // Multiplier for particle brightness
    };
    
    // Color theme generators
    const generators = {
        // Rainbow theme with full spectrum
        rainbow: function() {
            return `hsl(${Math.random() * 360}, 70%, 60%)`;
        },
        
        // Blue theme with variations
        blue: function() {
            const hue = 200 + Math.random() * 60; // Range from 200-260 (blues to purples)
            const saturation = 50 + Math.random() * 50; // 50-100% saturation
            const lightness = 30 + Math.random() * 50; // 30-80% lightness
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        },
        
        // Green theme with variations
        green: function() {
            const hue = 80 + Math.random() * 80; // Range from 80-160 (yellowy greens to blue-greens)
            const saturation = 50 + Math.random() * 50; // 50-100% saturation
            const lightness = 30 + Math.random() * 50; // 30-80% lightness
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        },
        
        // Fire theme (reds, oranges)
        fire: function() {
            const hue = Math.random() * 40; // Reds to oranges
            const saturation = 70 + Math.random() * 30; // High saturation
            const lightness = 40 + Math.random() * 30; // Medium to high brightness 
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        },
        
        // Neon theme with bright, vibrant colors
        neon: function() {
            const hues = [320, 280, 180, 140]; // magenta, purple, cyan, green
            return `hsl(${hues[Math.floor(Math.random() * hues.length)]}, 100%, 60%)`;
        },
        
        // Gold theme with yellow/gold hues
        gold: function() {
            const hue = 40 + Math.random() * 20; // Range from 40-60 (gold to yellow)
            const saturation = 70 + Math.random() * 30; // 70-100% saturation
            const lightness = 40 + Math.random() * 30; // 40-70% lightness
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        },
        
        // Sparkle theme - primarily grayscale with occasional color hints
        sparkle: function() {
            // Decide if this particle will be grayscale or have a subtle color
            const isGrayscale = Math.random() < sparkleSettings.grayscaleChance;
            
            if (isGrayscale) {
                // Pure grayscale sparkle with varying brightness
                const sparkleType = Math.floor(Math.random() * 4);
                const brightnessFactor = sparkleSettings.brightnessFactor;
                
                switch (sparkleType) {
                    case 0: // Bright white
                        return `hsl(0, 0%, ${Math.min(100, 85 * brightnessFactor + Math.random() * 15 * brightnessFactor)}%)`;
                        
                    case 1: // Light gray
                        return `hsl(0, 0%, ${Math.min(100, 65 * brightnessFactor + Math.random() * 15 * brightnessFactor)}%)`;
                        
                    case 2: // Medium gray
                        return `hsl(0, 0%, ${Math.min(100, 40 * brightnessFactor + Math.random() * 20 * brightnessFactor)}%)`;
                        
                    case 3: // Dark sparkle (more rare)
                        return `hsl(0, 0%, ${Math.min(100, 15 * brightnessFactor + Math.random() * 20 * brightnessFactor)}%)`;
                }
            } else {
                // Subtle color hint (based on color settings)
                const colorType = Math.floor(Math.random() * 3);
                const saturation = sparkleSettings.colorSaturation;
                
                switch (colorType) {
                    case 0: // Very subtle gold hint
                        const goldHue = 45 + Math.random() * 10; // Gold hue range
                        const goldLight = 60 + Math.random() * 25; // Medium to high brightness
                        return `hsl(${goldHue}, ${saturation}%, ${goldLight}%)`;
                        
                    case 1: // Very subtle blue hint
                        const blueHue = 210 + Math.random() * 30; // Blue hue range
                        const blueLight = 60 + Math.random() * 30; // Medium to high brightness
                        return `hsl(${blueHue}, ${saturation}%, ${blueLight}%)`;
                        
                    case 2: // Very subtle cool gray (slight blue undertone)
                        const coolGrayHue = 210;
                        const coolGraySat = Math.max(1, saturation * 0.3); // Lower saturation than others
                        const coolGrayLight = 40 + Math.random() * 50; // Wide brightness range
                        return `hsl(${coolGrayHue}, ${coolGraySat}%, ${coolGrayLight}%)`;
                }
            }
            
            // Fallback - pure white
            return 'hsl(0, 0%, 100%)';
        },
        
        // Colorblind-friendly theme
        colorblind: function() {
            // Colors chosen for deuteranopia and protanopia visibility
            const colorblindSafe = [
                '211, 100%, 50%',  // Blue
                '60, 100%, 50%',   // Yellow
                '180, 100%, 30%',  // Teal
                '27, 100%, 50%',   // Orange
                '270, 100%, 60%'   // Purple
            ];
            return `hsl(${colorblindSafe[Math.floor(Math.random() * colorblindSafe.length)]})`;
        }
    };
    
    // Public API
    return {
        // Get a color using the current theme
        getColor: function() {
            if (generators[currentTheme]) {
                return generators[currentTheme]();
            }
            // Fallback to rainbow if theme not found
            return generators.rainbow();
        },
        
        // Get a color for a specific theme
        getColorForTheme: function(theme) {
            if (generators[theme]) {
                return generators[theme]();
            }
            return generators.rainbow();
        },
        
        // Change the current theme
        setTheme: function(themeName) {
            if (generators[themeName]) {
                currentTheme = themeName;
                return true;
            }
            return false;
        },
        
        // Get current theme name
        getCurrentTheme: function() {
            return currentTheme;
        },
        
        // Get list of available themes
        getThemeList: function() {
            return Object.keys(generators);
        },
        
        // Update sparkle theme settings
        updateSparkleSettings: function(settings) {
            if (settings) {
                if (typeof settings.grayscaleChance !== 'undefined') {
                    sparkleSettings.grayscaleChance = settings.grayscaleChance;
                }
                if (typeof settings.colorSaturation !== 'undefined') {
                    sparkleSettings.colorSaturation = settings.colorSaturation;
                }
                if (typeof settings.brightnessFactor !== 'undefined') {
                    sparkleSettings.brightnessFactor = settings.brightnessFactor;
                }
            }
        },
        
        // Get current sparkle settings
        getSparkleSettings: function() {
            return {...sparkleSettings};
        }
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ColorThemes;
}

// presets.js - Predefined behavior patterns for particle swarms
const Presets = {
    // Swarm behavior presets
    swarmPresets: {
        murmuration: {
            name: "Murmuration",
            zotCount: 25,
            speed: 3,
            separation: 0.1,
            alignment: 2,
            cohesion: 5,
            perception: 200,
            trailLength: 0
        },
        lavaLamp: {
            name: "Lava Lamp",
            zotCount: 25,
            speed: 2,
            separation: 0.1,
            alignment: 0.5,
            cohesion: 5,
            perception: 20,
            trailLength: 0
        },
        cookingOil: {
            name: "Cooking Oil",
            zotCount: 25,
            speed: 2.5,
            separation: 0.2,
            alignment: 0.1,
            cohesion: 3,
            perception: 50,
            trailLength: 0
        },
        jellyOrbs: {
            name: "Jelly Orbs",
            zotCount: 25,
            speed: 3,
            separation: 0.1,
            alignment: 0.1,
            cohesion: 5,
            perception: 100,
            trailLength: 0
        },
        atomic: {
            name: "Atomic",
            zotCount: 25,
            speed: 3,
            separation: 0.1,
            alignment: 0.1,
            cohesion: 5,
            perception: 200,
            trailLength: 0
        },
        fizzyOrb: {
            name: "Fizzy Orb",
            zotCount: 25,
            speed: 2,
            separation: 0.1,
            alignment: 0,
            cohesion: 3.5,
            perception: 50,
            trailLength: 0
        }
    },
    
    // Color themes for zot swarms
    colorThemes: {
        rainbow: {
            name: "Rainbow",
            getColor: function() {
                return `hsl(${Math.random() * 360}, 70%, 60%)`;
            }
        },
        blue: {
            name: "Blue",
            getColor: function() {
                const hue = 200 + Math.random() * 60; // Range from 200-260 (blues to purples)
                const saturation = 50 + Math.random() * 50; // 50-100% saturation
                const lightness = 30 + Math.random() * 50; // 30-80% lightness
                return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            }
        },
        green: {
            name: "Green",
            getColor: function() {
                const hue = 80 + Math.random() * 80; // Range from 80-160 (yellowy greens to blue-greens)
                const saturation = 50 + Math.random() * 50; // 50-100% saturation
                const lightness = 30 + Math.random() * 50; // 30-80% lightness
                return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            }
        },
        fire: {
            name: "Fire",
            getColor: function() {
                return `hsl(${Math.random() * 40}, ${70 + Math.random() * 20}%, ${50 + Math.random() * 20}%)`;
            }
        },
        neon: {
            name: "Neon",
            getColor: function() {
                const hues = [320, 280, 180, 140]; // magenta, purple, cyan, green
                return `hsl(${hues[Math.floor(Math.random() * hues.length)]}, 100%, 60%)`;
            }
        },
        gold: {
            name: "Gold",
            getColor: function() {
                const hue = 40 + Math.random() * 20; // Range from 40-60 (gold to yellow)
                const saturation = 70 + Math.random() * 30; // 70-100% saturation
                const lightness = 40 + Math.random() * 30; // 40-70% lightness
                return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            }
        },
        sparkle: {
            name: "Sparkle",
            getColor: function() {
                // Create a mostly grayscale sparkling effect
                // Each zot has a different random grayscale value with occasional subtle color hints
                
                // Randomly pick a sparkle type (80% chance of grayscale, 20% chance of subtle color)
                const isGrayscale = Math.random() < 0.8;
                
                if (isGrayscale) {
                    // Pure grayscale sparkle with varying brightness
                    const sparkleType = Math.floor(Math.random() * 4);
                    
                    switch (sparkleType) {
                        case 0: // Bright white
                            return `hsl(0, 0%, ${85 + Math.random() * 15}%)`; // 85-100% brightness
                            
                        case 1: // Light gray
                            return `hsl(0, 0%, ${65 + Math.random() * 15}%)`; // 65-80% brightness
                            
                        case 2: // Medium gray
                            return `hsl(0, 0%, ${40 + Math.random() * 20}%)`; // 40-60% brightness
                            
                        case 3: // Dark sparkle (more rare)
                            return `hsl(0, 0%, ${15 + Math.random() * 20}%)`; // 15-35% brightness
                    }
                } else {
                    // Subtle color hint (only 20% of particles)
                    const colorType = Math.floor(Math.random() * 3);
                    
                    switch (colorType) {
                        case 0: // Very subtle gold hint
                            const goldHue = 45 + Math.random() * 10; // Gold hue range
                            const goldSat = 15 + Math.random() * 20; // Low saturation
                            const goldLight = 60 + Math.random() * 25; // Medium to high brightness
                            return `hsl(${goldHue}, ${goldSat}%, ${goldLight}%)`;
                            
                        case 1: // Very subtle blue hint
                            const blueHue = 210 + Math.random() * 30; // Blue hue range
                            const blueSat = 10 + Math.random() * 20; // Low saturation
                            const blueLight = 60 + Math.random() * 30; // Medium to high brightness
                            return `hsl(${blueHue}, ${blueSat}%, ${blueLight}%)`;
                            
                        case 2: // Very subtle cool gray (slight blue undertone)
                            const coolGrayHue = 210;
                            const coolGraySat = 5 + Math.random() * 10; // Very low saturation
                            const coolGrayLight = 40 + Math.random() * 50; // Wide brightness range
                            return `hsl(${coolGrayHue}, ${coolGraySat}%, ${coolGrayLight}%)`;
                    }
                }
                
                // Fallback - pure white
                return 'hsl(0, 0%, 100%)';
            }
        },
        mono: {
            name: "Monochrome",
            getColor: function() {
                const lightness = 20 + Math.random() * 60;
                return `hsl(0, 0%, ${lightness}%)`;
            }
        }
    },
    
    // Default settings for different components
    defaults: {
        // Orbie defaults
        orbie: {
            baseSize: 12, // Base radius in pixels
            size: 12,     // Current size (adjustable)
            speed: 2,
            color: 'rgba(255, 250, 230, 0.9)',
            glowColor: 'rgba(255, 215, 0, 0.6)',
            glowSize: 3,  // Multiplier of orbie size
            pulseSpeed: 0.05,
            pulseIntensity: 0.4,
            influenceRadius: 100,
            influenceIntensity: 0.05, // How strongly Orbie influences particles
            touchMultiplier: 0.15
        },
        
        // OrbieSwarm defaults (particles in Orbie's influence)
        orbieSwarm: {
            speed: 3,
            separation: 0.1,
            alignment: 0.1,
            cohesion: 5,
            perception: 100,
            trailLength: 0,
            sparkleRate: 0.02,
            dampening: 0.95
        },
        
        // ZotSwarm defaults (independent swarms)
        zotSwarm: {
            zotCount: 25,
            minSize: 0.5,
            maxSize: 4,
            speed: 2,
            separation: 0.1,
            alignment: 0.1,
            cohesion: 3.5,
            perception: 50,
            trailLength: 0,
            colorTheme: 'blue'
        },
        
        // Touch and wall forces
        forces: {
            touchForce: 3,
            wallForce: 1.0,
            zotTouchEnabled: true,
            zotSwarmInteractionEnabled: true
        }
    }
};

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Presets;
}

// touch.js - Touch interaction handler with visual feedback
const TouchHandler = (function() {
    // Private variables
    let canvas;
    let touchActive = false;
    let touchX = 0;
    let touchY = 0;
    let lastTouchTime = 0;
    let touchPulseElement = null;
    
    // Callbacks for integration with particle system
    let callbacks = {
        onTouchStart: null,
        onTouchMove: null,
        onTouchEnd: null,
        onDoubleTap: null,
        onSwarmPlacement: null,  // New callback for placing swarms
        isAttractMode: null
    };
    
    // State for handling swarm placement
    let placingSwarm = false;
    let swarmPlacementLetter = null;
    
    // Throttle function for performance optimization
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Touch event handlers
    function handleTouchStart(e) {
        e.preventDefault(); // Prevent scrolling
        
        if (e.touches && e.touches[0]) {
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;
            
            touchX = x;
            touchY = y;
            touchActive = true;
            
            // Check if a swarm placement letter is active
            if (placingSwarm && swarmPlacementLetter && callbacks.onSwarmPlacement) {
                // Call the swarm placement callback
                callbacks.onSwarmPlacement(x, y);
                
                // Clear swarm placement state
                placingSwarm = false;
                swarmPlacementLetter = null;
                
                // Skip other touch processing
                return;
            }
            
            // Detect double tap
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - lastTouchTime;
            
            if (timeDiff < 300) { // Double tap detected
                if (callbacks.onDoubleTap) {
                    callbacks.onDoubleTap(x, y);
                    // After the mode changes, update the visual effect
                    createModeChangedEffect(x, y);
                    
                    // Also update the existing pulse if present
                    if (touchPulseElement) {
                        touchPulseElement.classList.remove('touch-pulse-attract', 'touch-pulse-repel');
                        if (callbacks.isAttractMode && callbacks.isAttractMode()) {
                            touchPulseElement.classList.add('touch-pulse-attract');
                        } else {
                            touchPulseElement.classList.add('touch-pulse-repel');
                        }
                    }
                }
            }
            
            lastTouchTime = currentTime;
            
            // Create visual effects
            createTouchRipple(x, y);
            createTouchPulse(x, y);
            
            // Call the callback
            if (callbacks.onTouchStart) {
                callbacks.onTouchStart(x, y);
            }
        }
    }
    
    // Throttled touch move handler for better performance
    const handleTouchMove = throttle(function(e) {
        e.preventDefault();
        
        if (touchActive && e.touches && e.touches[0]) {
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;
            
            touchX = x;
            touchY = y;
            
            // Update pulse position
            updateTouchPulse(x, y);
            
            // Call the callback
            if (callbacks.onTouchMove) {
                callbacks.onTouchMove(x, y);
            }
        }
    }, 16); // ~60fps
    
    function handleTouchEnd(e) {
        e.preventDefault();
        
        // Remove pulse effect
        removeTouchPulse();
        
        touchActive = false;
        
        // Call the callback
        if (callbacks.onTouchEnd) {
            callbacks.onTouchEnd();
        }
    }
    
    // Visual effect functions
    function createTouchRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple';
        
        // Add appropriate class based on mode - checking more safely
        const isAttract = callbacks.isAttractMode ? callbacks.isAttractMode() : false;
        if (isAttract) {
            ripple.classList.add('touch-ripple-attract');
        } else {
            ripple.classList.add('touch-ripple-repel');
        }
        
        const rippleSize = 20;
        
        // Center the ripple on the touch point
        ripple.style.left = `${x - rippleSize/2}px`;
        ripple.style.top = `${y - rippleSize/2}px`;
        ripple.style.width = `${rippleSize}px`;
        ripple.style.height = `${rippleSize}px`;
        
        document.body.appendChild(ripple);
        
        // Remove after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 400);
    }
    
    // Create continuous pulse effect at touch point
    function createTouchPulse(x, y) {
        removeTouchPulse(); // Remove any existing pulse
        
        const pulse = document.createElement('div');
        pulse.className = 'touch-pulse';
        
        // Add appropriate class based on mode - checking with callbacks.isAttractMode
        const isAttract = callbacks.isAttractMode ? callbacks.isAttractMode() : false;
        if (isAttract) {
            pulse.classList.add('touch-pulse-attract');
        } else {
            pulse.classList.add('touch-pulse-repel');
        }
        
        // Position the pulse (CSS handles centering with margin)
        pulse.style.left = `${x}px`;
        pulse.style.top = `${y}px`;
        
        document.body.appendChild(pulse);
        touchPulseElement = pulse;
    }
    
    // Update pulse position when touch moves
    function updateTouchPulse(x, y) {
        if (touchPulseElement) {
            touchPulseElement.style.left = `${x}px`;
            touchPulseElement.style.top = `${y}px`;
        }
    }
    
    // Remove pulse element
    function removeTouchPulse() {
        if (touchPulseElement) {
            touchPulseElement.remove();
            touchPulseElement = null;
        }
    }
    
    // Create special effect for mode change (attract/repel toggle)
    function createModeChangedEffect(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple mode-change-ripple';
        
        // Add appropriate class based on new mode
        // We'll always show the effect but the color will depend on the new mode
        // The callback will reflect the UPDATED state after the toggle
        const isAttract = callbacks.isAttractMode ? callbacks.isAttractMode() : false;
        if (isAttract) {
            ripple.classList.add('touch-ripple-attract');
        } else {
            ripple.classList.add('touch-ripple-repel');
        }
        
        const rippleSize = 40;
        
        // Center the ripple on the touch point
        ripple.style.left = `${x - rippleSize/2}px`;
        ripple.style.top = `${y - rippleSize/2}px`;
        ripple.style.width = `${rippleSize}px`;
        ripple.style.height = `${rippleSize}px`;
        
        document.body.appendChild(ripple);
        
        // Remove after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Public API
    return {
        init: function(canvasElement, callbacksObj) {
            canvas = canvasElement;
            
            // Merge provided callbacks with defaults
            if (callbacksObj) {
                callbacks = {...callbacks, ...callbacksObj};
            }
            
            // Add touch event listeners
            canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
            canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
        },
        
        // Get current touch position info
        getTouchPosition: function() {
            return {
                x: touchX,
                y: touchY,
                active: touchActive
            };
        },
        
        // Set swarm placement mode
        setSwarmPlacementMode: function(isActive, letter) {
            placingSwarm = isActive;
            swarmPlacementLetter = letter;
        },
        
        // Check if in swarm placement mode
        isInSwarmPlacementMode: function() {
            return placingSwarm;
        },
        
        // Create a visual cue for swarm placement
        createSwarmPlacementCue: function(x, y, letter) {
            // Create a pulsing effect at the position
            const cue = document.createElement('div');
            cue.className = 'swarm-letter';
            cue.textContent = letter;
            cue.style.left = `${x}px`;
            cue.style.top = `${y}px`;
            document.body.appendChild(cue);
            
            // Add pulsing animation
            cue.style.animation = 'pulse-animation 1s infinite ease-in-out';
            
            return cue;
        }
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = TouchHandler;
}

// menu.js - Menu UI handlers and settings management
const MenuSystem = (function() {
    // Private variables
    let controlsPanel;
    let menuToggle;
    let isMenuInitialized = false;
    
    // Callbacks for different settings
    let callbacks = {
        updateOrbieSettings: null,
        updateSwarmSettings: null,
        updateSettings: null,
        resetOrbie: null,
        resetAll: null,
        changeColorTheme: null,
        updateWallSettings: null
    };
    
    // Initialize menu with necessary DOM elements and callbacks
    function init(elements, callbackFunctions) {
        // Skip if already initialized
        if (isMenuInitialized) return;
        
        // Store elements
        controlsPanel = elements.controlsPanel || document.getElementById('controls');
        menuToggle = elements.menuToggle || document.getElementById('menuToggle');
        
        // Store callbacks
        if (callbackFunctions) {
            callbacks = {...callbacks, ...callbackFunctions};
        }
        
        // Setup menu toggle
        setupMenuToggle();
        
        // Setup parameter groups
        setupParameterGroups();
        
        // Setup all input controls
        setupInputControls();
        
        // Setup color theme selector if available
        setupColorThemes();
        
        isMenuInitialized = true;
    }
    
    // Setup menu toggle button
    function setupMenuToggle() {
        if (menuToggle && controlsPanel) {
            // Handle click for desktop
            menuToggle.addEventListener('click', function(e) {
                e.preventDefault();
                controlsPanel.classList.toggle('collapsed');
            });
            
            // Handle touch for mobile - fixed to use touchstart instead of touchend
            menuToggle.addEventListener('touchstart', function(e) {
                e.preventDefault();
                controlsPanel.classList.toggle('collapsed');
                e.stopPropagation();
            }, { passive: false });
            
            // Close menu when clicking/touching outside
            document.addEventListener('touchend', function(e) {
                if (!controlsPanel.classList.contains('collapsed') && 
                    !controlsPanel.contains(e.target) && 
                    e.target !== menuToggle) {
                    controlsPanel.classList.add('collapsed');
                }
            });
            
            document.addEventListener('click', function(e) {
                if (!controlsPanel.classList.contains('collapsed') && 
                    !controlsPanel.contains(e.target) && 
                    e.target !== menuToggle) {
                    controlsPanel.classList.add('collapsed');
                }
            });
        }
    }
    
    // Setup parameter groups
    function setupParameterGroups() {
        const paramGroup = document.getElementById('paramGroup');
        if (!paramGroup) return;
        
        const paramGroups = {
            orbie: document.getElementById('orbieParams'),
            orbieSwarm: document.getElementById('orbieSwarmParams'),
            zotSwarms: document.getElementById('zotSwarmsParams'),
            forces: document.getElementById('forcesParams'),
            walls: document.getElementById('wallsParams')
        };
        
        paramGroup.addEventListener('change', function() {
            // Hide all parameter groups
            document.querySelectorAll('.param-group').forEach(group => {
                group.classList.remove('active');
            });
            
            // Show the selected group
            const selectedGroup = paramGroups[this.value];
            if (selectedGroup) {
                selectedGroup.classList.add('active');
            }
        });
    }
    
    // Setup all input controls and their event handlers
    function setupInputControls() {
        // Orbie controls
        setupRangeInput('orbieSize', value => updateSetting('orbie', 'size', value));
        setupRangeInput('orbieGlowSize', value => updateSetting('orbie', 'glowSize', value));
        setupRangeInput('orbiePulseSpeed', value => updateSetting('orbie', 'pulseSpeed', value));
        setupRangeInput('orbiePulseIntensity', value => updateSetting('orbie', 'pulseIntensity', value));
        setupRangeInput('orbieInfluenceRadius', value => updateSetting('orbie', 'influenceRadius', value));
        setupRangeInput('orbieTouchMultiplier', value => updateSetting('orbie', 'touchMultiplier', value));
        
        // Swarm controls
        setupRangeInput('swarmSpeed', value => updateSetting('orbieSwarm', 'speed', value));
        setupRangeInput('swarmSeparation', value => updateSetting('orbieSwarm', 'separation', value));
        setupRangeInput('swarmAlignment', value => updateSetting('orbieSwarm', 'alignment', value));
        setupRangeInput('swarmCohesion', value => updateSetting('orbieSwarm', 'cohesion', value));
        setupRangeInput('swarmPerception', value => updateSetting('orbieSwarm', 'perception', value));
        setupRangeInput('swarmSparkleRate', value => updateSetting('orbieSwarm', 'sparkleRate', value));
        
        // Zots controls
        setupRangeInput('zotsCount', value => updateSetting('zotSwarms', 'particleCount', value));
        setupRangeInput('zotsSpeed', value => updateSetting('zotSwarms', 'speed', value));
        setupRangeInput('zotsSeparation', value => updateSetting('zotSwarms', 'separation', value));
        setupRangeInput('zotsAlignment', value => updateSetting('zotSwarms', 'alignment', value));
        setupRangeInput('zotsCohesion', value => updateSetting('zotSwarms', 'cohesion', value));
        setupRangeInput('zotsPerception', value => updateSetting('zotSwarms', 'perception', value));
        setupRangeInput('zotsTouchForce', value => updateSetting('zotSwarms', 'touchForce', value));
        
        // Force controls
        setupRangeInput('touchForce', value => updateSetting('forces', 'touchForce', value));
        setupRangeInput('wallForce', value => updateSetting('forces', 'wallForce', value));
        
        // Setup Zot Touch Interaction toggle
        const zotTouchEnabled = document.getElementById('zotTouchEnabled');
        if (zotTouchEnabled) {
            zotTouchEnabled.addEventListener('change', function() {
                if (callbacks.updateSettings) {
                    callbacks.updateSettings('forces', 'zotTouchEnabled', this.checked);
                }
            });
        }
        
        // Reset buttons
        const resetOrbieButton = document.getElementById('resetButton');
        if (resetOrbieButton && callbacks.resetOrbie) {
            resetOrbieButton.addEventListener('click', callbacks.resetOrbie);
        }
        
        const resetAllButton = document.getElementById('resetAllButton');
        if (resetAllButton && callbacks.resetAll) {
            resetAllButton.addEventListener('click', callbacks.resetAll);
        }
    }
    
    // Setup color theme selector
    function setupColorThemes() {
        const colorThemeSelect = document.getElementById('colorTheme');
        if (colorThemeSelect && callbacks.changeColorTheme) {
            // Populate theme options if we have the theme list
            if (ColorThemes && typeof ColorThemes.getThemeList === 'function') {
                const themes = ColorThemes.getThemeList();
                const currentTheme = ColorThemes.getCurrentTheme();
                
                themes.forEach(theme => {
                    const option = document.createElement('option');
                    option.value = theme;
                    option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1); // Capitalize first letter
                    option.selected = (theme === currentTheme);
                    colorThemeSelect.appendChild(option);
                });
            }
            
            // Add event listener for theme change
            colorThemeSelect.addEventListener('change', function() {
                callbacks.changeColorTheme(this.value);
            });
        }
        
        // Sparkle theme settings if they exist
        setupRangeInput('sparkleGrayscale', value => updateSparkleSettings('grayscaleChance', value));
        setupRangeInput('sparkleColor', value => updateSparkleSettings('colorSaturation', value));
        setupRangeInput('sparkleBrightness', value => updateSparkleSettings('brightnessFactor', value));
    }
    
    // Helper function to update sparkle settings
    function updateSparkleSettings(setting, value) {
        if (ColorThemes && typeof ColorThemes.updateSparkleSettings === 'function') {
            const settings = {};
            settings[setting] = value;
            ColorThemes.updateSparkleSettings(settings);
        }
    }
    
    // Update a setting in any group
    function updateSetting(group, property, value) {
        // Handle Orbie settings
        if (group === 'orbie') {
            if (callbacks.updateOrbieSettings) {
                callbacks.updateOrbieSettings(property, value);
            }
        }
        // Handle Orbie swarm settings
        else if (group === 'orbieSwarm') {
            if (callbacks.updateSwarmSettings) {
                callbacks.updateSwarmSettings('orbieSwarm', property, value);
            }
        }
        // Handle Zot swarm settings (handled differently, through UI)
        else if (group === 'zotSwarms') {
            // These are handled through the UI directly
        }
        // Handle Forces settings
        else if (group === 'forces') {
            if (callbacks.updateSettings) {
                callbacks.updateSettings('forces', property, value);
            }
        }
        // Handle Wall settings
        else if (group === 'walls') {
            if (callbacks.updateWallSettings) {
                callbacks.updateWallSettings(property, value);
            }
        }
    }
    
    // Helper function to set up a range input
    function setupRangeInput(id, changeCallback) {
        const input = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Value');
        
        if (input && valueDisplay) {
            // Set initial value display
            valueDisplay.textContent = parseFloat(input.value).toFixed(input.step.includes('.') ? 2 : 0);
            
            // Add event listeners for input changes
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                valueDisplay.textContent = value.toFixed(this.step.includes('.') ? 2 : 0);
                
                // Call the callback with the new value
                if (changeCallback) {
                    changeCallback(value);
                }
            });
        }
    }
    
    // Public API
    return {
        init: init,
        toggleMenu: function() {
            if (controlsPanel) {
                controlsPanel.classList.toggle('collapsed');
            }
        }
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = MenuSystem;
}

// particles.js - Core particle simulation with encapsulated proprietary logic
const ParticleSystem = (function() {
    // Private variables and methods - protect intellectual property
    let canvas, ctx;
    let dpr, width, height;
    let animationFrameId;
    let lastTime = 0;
    let frameCount = 0;
    let fpsDisplay;
    
    // Touch interaction state
    let touch = {
        x: 0,
        y: 0,
        active: false,
        attract: false
    };
    
    // Walls for collision - Now managed by WallSystem
    // let walls = [];
    
    // Orbie - the main character
    let orbie = null;
    let orbiePulsePhase = 0; // For pulsating effect
    
    // Orbie settings
    let orbieSettings = {
        baseSize: 12, // Base radius in pixels
        size: 12,     // Current size (adjustable)
        speed: 2,
        color: 'rgba(255, 250, 230, 0.9)',
        glowColor: 'rgba(255, 215, 0, 0.6)',
        glowSize: 3,  // Multiplier of orbie size
        glowOpacity: 0.7, // Base opacity for the glow
        pulseSpeed: 0.05,
        pulseIntensity: 0.4,
        influenceRadius: 100,
        influenceIntensity: 0.05, // How strongly Orbie influences particles within its radius
        touchMultiplier: 0.15
    };
    
    // Settings for particles in Orbie's swarm
    let orbieSwarmSettings = {
        speed: 3,
        separation: 0.1,
        alignment: 0.1,
        cohesion: 5,
        perception: 100,
        trailLength: 0,
        sparkleRate: 0.02,
        dampening: 0.95
    };
    
    // Forces settings
    let forceSettings = {
        touchForce: 3,
        wallForce: 1.0,
        zotTouchEnabled: true,  // New setting for zot touch interaction
        zotSwarmInteractionEnabled: true  // New setting for zot swarm interaction
    };
    
    // Collection of all particles (regular background particles)
    let backgroundParticles = [];
    
    // Collection of ZotSwarms (multiple independent swarms)
    let zotSwarms = [];
    
    // Currently active swarm for placement (with letter indicator)
    let activeSwarmPlacement = null;
    
    // Handle device pixel ratio and canvas sizing
    function setupCanvas() {
        dpr = window.devicePixelRatio || 1;
        resize();
        
        window.addEventListener('resize', function() {
            resize();
        });
    }
    
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        ctx.scale(dpr, dpr);
    }
    
    // Generate sparkle color for Orbie's swarm
    function getSparkleColor() {
        // Create a mostly grayscale sparkling effect
        // Each zot should have a different random grayscale value with occasional subtle color hints
        
        // Randomly pick a sparkle type (80% chance of grayscale, 20% chance of subtle color)
        const isGrayscale = Math.random() < 0.8;
        
        if (isGrayscale) {
            // Pure grayscale sparkle with varying brightness
            const sparkleType = Math.floor(Math.random() * 4);
            
            switch (sparkleType) {
                case 0: // Bright white
                    return `hsl(0, 0%, ${85 + Math.random() * 15}%)`; // 85-100% brightness
                    
                case 1: // Light gray
                    return `hsl(0, 0%, ${65 + Math.random() * 15}%)`; // 65-80% brightness
                    
                case 2: // Medium gray
                    return `hsl(0, 0%, ${40 + Math.random() * 20}%)`; // 40-60% brightness
                    
                case 3: // Dark sparkle (more rare)
                    return `hsl(0, 0%, ${15 + Math.random() * 20}%)`; // 15-35% brightness
            }
        } else {
            // Subtle color hint (only 20% of particles)
            const colorType = Math.floor(Math.random() * 3);
            
            switch (colorType) {
                case 0: // Very subtle gold hint
                    const goldHue = 45 + Math.random() * 10; // Gold hue range
                    const goldSat = 15 + Math.random() * 20; // Low saturation
                    const goldLight = 60 + Math.random() * 25; // Medium to high brightness
                    return `hsl(${goldHue}, ${goldSat}%, ${goldLight}%)`;
                    
                case 1: // Very subtle blue hint
                    const blueHue = 210 + Math.random() * 30; // Blue hue range
                    const blueSat = 10 + Math.random() * 20; // Low saturation
                    const blueLight = 60 + Math.random() * 30; // Medium to high brightness
                    return `hsl(${blueHue}, ${blueSat}%, ${blueLight}%)`;
                    
                case 2: // Very subtle cool gray (slight blue undertone)
                    const coolGrayHue = 210;
                    const coolGraySat = 5 + Math.random() * 10; // Very low saturation
                    const coolGrayLight = 40 + Math.random() * 50; // Wide brightness range
                    return `hsl(${coolGrayHue}, ${coolGraySat}%, ${coolGrayLight}%)`;
            }
        }
        
        // Fallback - pure white
        return 'hsl(0, 0%, 100%)';
    }
    
    // Initialize background particles
    function initBackgroundParticles() {
        // Reset the array, but don't add any particles
        backgroundParticles = [];
        
        // No particles are created during initialization
        // This ensures only Orbie is present after initializing
    }
    
    // Initialize Orbie
    function initOrbie() {
        orbie = {
            x: width / 2, // Center of screen
            y: height / 2, // Center of screen
            vx: 0,
            vy: 0,
            color: orbieSettings.color,
            size: orbieSettings.size,
            glowSize: orbieSettings.size * orbieSettings.glowSize,
            glowColor: orbieSettings.glowColor,
            glowOpacity: orbieSettings.glowOpacity,
            pulseSpeed: orbieSettings.pulseSpeed,
            pulseIntensity: orbieSettings.pulseIntensity,
            history: []
        };
    }
    
    // Create a new ZotSwarm
    function createZotSwarm(config) {
        const swarm = {
            id: generateSwarmId(),
            zots: [],
            settings: {...config},
            originalSettings: {...config}, // Store original settings to revert to when leaving Orbie's influence
            inOrbieInfluence: false // Track if this swarm is in Orbie's influence
        };
        
        // Get the color generator function
        const getColor = Presets.colorThemes[config.colorTheme]?.getColor || 
                        Presets.colorThemes.blue.getColor;
        
        // Generate particles for this swarm
        for (let i = 0; i < config.zotCount; i++) {
            swarm.zots.push({
                x: config.centerX + (Math.random() * 100 - 50), // Cluster around center
                y: config.centerY + (Math.random() * 100 - 50), // Cluster around center
                vx: (Math.random() * 2 - 1) * config.speed,
                vy: (Math.random() * 2 - 1) * config.speed,
                color: getColor(),
                size: config.minSize + Math.random() * (config.maxSize - config.minSize),
                history: [],
                inOrbieSwarm: false, // Track if particle is in Orbie's swarm
                swarmId: swarm.id // Assign swarm ID to each particle for identification
            });
        }
        
        zotSwarms.push(swarm);
        return swarm.id;
    }
    
    // Create a letter indicator for new swarm placement
    function createSwarmPlacementIndicator(preset) {
        // Generate a random position that's not too close to the edges
        const margin = 100;
        const x = margin + Math.random() * (width - 2 * margin);
        const y = margin + Math.random() * (height - 2 * margin);
        
        // Generate a random letter (A-Z)
        const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        
        // Create the placement indicator
        activeSwarmPlacement = {
            id: letter,
            x: x,
            y: y,
            preset: preset,
            element: null
        };
        
        // Create and add the visual indicator element
        const indicator = document.createElement('div');
        indicator.className = 'swarm-letter';
        indicator.textContent = letter;
        indicator.style.left = `${x}px`;
        indicator.style.top = `${y}px`;
        document.body.appendChild(indicator);
        
        activeSwarmPlacement.element = indicator;
        
        return activeSwarmPlacement;
    }
    
    // Create a swarm at the letter indicator position
    function confirmSwarmPlacement(config) {
        if (!activeSwarmPlacement) return null;
        
        // Remove the visual indicator
        if (activeSwarmPlacement.element) {
            activeSwarmPlacement.element.style.opacity = '0';
            setTimeout(() => {
                if (activeSwarmPlacement.element && activeSwarmPlacement.element.parentNode) {
                    activeSwarmPlacement.element.parentNode.removeChild(activeSwarmPlacement.element);
                }
            }, 500);
        }
        
        // Merge the placement position with the config
        const swarmConfig = {
            ...config,
            centerX: activeSwarmPlacement.x,
            centerY: activeSwarmPlacement.y
        };
        
        // Create the swarm
        const swarmId = createZotSwarm(swarmConfig);
        
        // Clear the active placement
        activeSwarmPlacement = null;
        
        return swarmId;
    }
    
    // Remove a swarm by ID
    function removeZotSwarm(swarmId) {
        const index = zotSwarms.findIndex(swarm => swarm.id === swarmId);
        if (index !== -1) {
            zotSwarms.splice(index, 1);
            return true;
        }
        return false;
    }
    
    // Generate a unique ID for swarms
    function generateSwarmId() {
        return 'swarm-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    }
    
    // Apply preset to new swarm settings
    function applyPresetToNewSwarm(presetName) {
        const preset = Presets.swarmPresets[presetName];
        if (!preset) return null;
        
        return {
            ...Presets.defaults.zotSwarm,
            ...preset,
            colorTheme: 'blue' // Default color theme
        };
    }
    
    // Update all particles in the system
    function updateParticles() {
        // Update Orbie's pulse effect only if pulseSpeed is not zero
        if (orbie.pulseSpeed > 0) {
            // Update Orbie's pulse effect - modified for outward radiation with reset
            orbiePulsePhase += orbie.pulseSpeed;
            
            // When reaching 1, start a new pulse
            if (orbiePulsePhase > 1) {
                // Reset the pulse phase to start a new pulse
                orbiePulsePhase = 0;
            }
        }
        
        // Update Orbie's position based on touch or autonomous movement
        if (orbie) {
            const prevX = orbie.x;
            const prevY = orbie.y;
            
            // Update Orbie's position based on touch with distance decay
            if (touch.active) {
                const dx = orbie.x - touch.x;
                const dy = orbie.y - touch.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    // Apply force with distance decay - stronger effect closer to touch point
                    const forceDecay = Math.max(0, 1 - (distance / (width/2))); // Decay with distance
                    const force = forceSettings.touchForce * orbieSettings.touchMultiplier * forceDecay;
                    
                    if (touch.attract) {
                        // Attract Orbie towards touch point
                        orbie.vx -= (dx / distance) * force;
                        orbie.vy -= (dy / distance) * force;
                    } else {
                        // Repel Orbie from touch point
                        orbie.vx += (dx / distance) * force;
                        orbie.vy += (dy / distance) * force;
                    }
                }
            }
            
            // Add some drag to Orbie's movement for smoother control
            orbie.vx *= 0.95;
            orbie.vy *= 0.95;
            
            // Limit Orbie's velocity
            const orbieSpeed = Math.sqrt(orbie.vx * orbie.vx + orbie.vy * orbie.vy);
            const maxOrbieSpeed = orbieSettings.speed * 2;
            if (orbieSpeed > maxOrbieSpeed) {
                orbie.vx = (orbie.vx / orbieSpeed) * maxOrbieSpeed;
                orbie.vy = (orbie.vy / orbieSpeed) * maxOrbieSpeed;
            }
            
            // Update Orbie's position
            orbie.x += orbie.vx;
            orbie.y += orbie.vy;
            
            // Keep Orbie within the screen bounds
            if (orbie.x < orbie.size) orbie.x = orbie.size;
            if (orbie.x > width - orbie.size) orbie.x = width - orbie.size;
            if (orbie.y < orbie.size) orbie.y = orbie.size;
            if (orbie.y > height - orbie.size) orbie.y = height - orbie.size;
            
            // Apply wall forces to Orbie
            WallSystem.applyForces(orbie, prevX, prevY, true);
        }
        
        // Update background particles
        updateParticleGroup(backgroundParticles, Presets.defaults.zotSwarm);
        
        // Update all ZotSwarms
        zotSwarms.forEach(swarm => {
            updateParticleGroup(swarm.zots, swarm.settings);
            
            // Check if swarm is in Orbie's influence
            const wasInInfluence = swarm.inOrbieInfluence;
            
            // Calculate average distance of swarm particles to Orbie
            let particlesInInfluence = 0;
            for (let i = 0; i < swarm.zots.length; i++) {
                if (swarm.zots[i].inOrbieSwarm) {
                    particlesInInfluence++;
                }
            }
            
            // If more than 30% of particles are influenced, consider the swarm influenced
            swarm.inOrbieInfluence = (particlesInInfluence / swarm.zots.length) > 0.3;
            
            // If just left Orbie's influence, restore original settings
            if (wasInInfluence && !swarm.inOrbieInfluence) {
                // Restore original settings
                swarm.settings = {...swarm.originalSettings};
            }
        });
    }
    
    // Update a group of particles based on their settings
    function updateParticleGroup(particles, settings) {
        // For each particle in the group
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            const prevX = particle.x;
            const prevY = particle.y;
            
            // Check if particle is in Orbie's influence zone
            const dxOrbie = particle.x - orbie.x;
            const dyOrbie = particle.y - orbie.y;
            const distanceToOrbie = Math.sqrt(dxOrbie * dxOrbie + dyOrbie * dyOrbie);
            
            // Check if the particle is newly entering or leaving Orbie's swarm
            const wasInSwarm = particle.inOrbieSwarm;
            particle.inOrbieSwarm = distanceToOrbie < orbieSettings.influenceRadius;
            
            // Change particle color when it enters or leaves the swarm
            if (particle.inOrbieSwarm && !wasInSwarm) {
                // Store the original color before entering swarm
                particle.originalColor = particle.color;
                // Change color to sparkle when entering swarm
                particle.color = getSparkleColor();
                
                // Give it a slightly larger size when in the swarm
                particle.originalSize = particle.size;
                particle.size *= 1.2;
            } else if (!particle.inOrbieSwarm && wasInSwarm) {
                // Revert to original color when leaving swarm
                if (particle.originalColor) {
                    particle.color = particle.originalColor;
                    delete particle.originalColor;
                }
                
                // Revert to original size
                if (particle.originalSize) {
                    particle.size = particle.originalSize;
                    delete particle.originalSize;
                }
            } else if (particle.inOrbieSwarm && Math.random() < orbieSwarmSettings.sparkleRate) {
                // Occasionally change the color of particles in the swarm based on sparkle rate
                particle.color = getSparkleColor();
            }
            
            // Use appropriate settings based on whether particle is in Orbie's swarm
            const activeSettings = particle.inOrbieSwarm ? orbieSwarmSettings : settings;
            
            // Save position history for trail
            if (activeSettings.trailLength > 0) {
                particle.history.push({ x: particle.x, y: particle.y });
                if (particle.history.length > activeSettings.trailLength) {
                    particle.history.shift();
                }
            } else {
                particle.history = [];
            }
            
            // Calculate flocking forces
            let separationX = 0, separationY = 0;
            let alignmentX = 0, alignmentY = 0;
            let cohesionX = 0, cohesionY = 0;
            let neighborCount = 0;
            
            // Define which particle group to check for neighbors
            let neighborsGroup;
            if (particle.inOrbieSwarm) {
                // If particle is in Orbie's swarm, only consider other particles in Orbie's swarm
                neighborsGroup = particles.filter(p => p.inOrbieSwarm);
            } else if (forceSettings.zotSwarmInteractionEnabled && particle.swarmId !== undefined && particle.swarmId !== null) {
                // If zot swarm interaction is enabled and this is a zot particle with a valid swarmId, 
                // consider particles from all zot swarms
                const allZotParticles = [];
                // Add particles from current group first
                allZotParticles.push(...particles);
                
                // Add particles from other zot swarms
                for (let s = 0; s < zotSwarms.length; s++) {
                    // Skip the current swarm to avoid duplicates
                    if (zotSwarms[s].id !== particle.swarmId) {
                        allZotParticles.push(...zotSwarms[s].zots);
                    }
                }
                
                neighborsGroup = allZotParticles;
            } else {
                // Otherwise, just consider particles from the same group
                neighborsGroup = particles;
            }
            
            // For each potential neighbor, calculate influences
            for (let j = 0; j < neighborsGroup.length; j += 2) { // Mobile optimization: check every other particle
                if (i !== j || neighborsGroup !== particles) { // Skip self unless comparing across groups
                    const other = neighborsGroup[j];
                    const dx = particle.x - other.x;
                    const dy = particle.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < activeSettings.perception && distance > 0) {
                        // Separation - avoid crowding neighbors
                        const force = (activeSettings.perception - distance) / activeSettings.perception;
                        separationX += dx * force / distance;
                        separationY += dy * force / distance;
                        
                        // Alignment - steer towards average heading of neighbors
                        alignmentX += other.vx;
                        alignmentY += other.vy;
                        
                        // Cohesion - steer towards center of mass of neighbors
                        cohesionX += other.x;
                        cohesionY += other.y;
                        
                        neighborCount++;
                    }
                }
            }
            
            // Apply flocking forces if we have neighbors
            if (neighborCount > 0) {
                // Apply separation
                separationX *= activeSettings.separation;
                separationY *= activeSettings.separation;
                
                // Apply alignment
                alignmentX = (alignmentX / neighborCount - particle.vx) * activeSettings.alignment;
                alignmentY = (alignmentY / neighborCount - particle.vy) * activeSettings.alignment;
                
                // Apply cohesion
                cohesionX = (cohesionX / neighborCount - particle.x) * activeSettings.cohesion * 0.01;
                cohesionY = (cohesionY / neighborCount - particle.y) * activeSettings.cohesion * 0.01;
                
                // Sum forces
                particle.vx += separationX + alignmentX + cohesionX;
                particle.vy += separationY + alignmentY + cohesionY;
            }
            
            // If in Orbie's swarm, add attraction to Orbie
            if (particle.inOrbieSwarm && orbieSettings.influenceIntensity > 0) {
                // Apply force towards Orbie based on influenceIntensity
                particle.vx += (orbie.x - particle.x) * orbieSettings.influenceIntensity;
                particle.vy += (orbie.y - particle.y) * orbieSettings.influenceIntensity;
            }
            
            // Apply touch force if active AND (particle is in Orbie's swarm OR zot touch is enabled)
            if (touch.active && (particle.inOrbieSwarm || forceSettings.zotTouchEnabled)) {
                const dx = particle.x - touch.x;
                const dy = particle.y - touch.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150;
                
                if (distance < maxDistance) {
                    const force = ((maxDistance - distance) / maxDistance) * forceSettings.touchForce;
                    
                    if (touch.attract) {
                        // Attract towards touch point
                        particle.vx -= (dx / distance) * force;
                        particle.vy -= (dy / distance) * force;
                    } else {
                        // Repel from touch point
                        particle.vx += (dx / distance) * force;
                        particle.vy += (dy / distance) * force;
                    }
                }
            }
            
            // Apply wall forces
            WallSystem.applyForces(particle, prevX, prevY, true);
            
            // Apply dampening to reduce wobble if particle is in orbieSwarm
            if (particle.inOrbieSwarm && orbieSwarmSettings.dampening > 0) {
                particle.vx *= orbieSwarmSettings.dampening;
                particle.vy *= orbieSwarmSettings.dampening;
            }
            
            // Limit velocity for stability
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            const maxSpeed = 2 * activeSettings.speed;
            if (speed > maxSpeed) {
                particle.vx = (particle.vx / speed) * maxSpeed;
                particle.vy = (particle.vy / speed) * maxSpeed;
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around screen edges
            if (particle.x < 0) particle.x = width;
            if (particle.x > width) particle.x = 0;
            if (particle.y < 0) particle.y = height;
            if (particle.y > height) particle.y = 0;
        }
    }
    
    // Draw particles, swarms, and Orbie
    function drawParticles() {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw walls if they exist
        WallSystem.render(ctx);
        
        // Draw Orbie (our main character)
        if (orbie) {
            // Draw background particles
            drawParticleGroup(backgroundParticles);
            
            // Draw all ZotSwarms
            zotSwarms.forEach(swarm => {
                drawParticleGroup(swarm.zots);
            });
            
            // Draw Orbie's influence area (for debugging, comment out in production)
            // ctx.beginPath();
            // ctx.arc(orbie.x, orbie.y, orbieSettings.influenceRadius, 0, Math.PI * 2);
            // ctx.strokeStyle = 'rgba(100, 150, 255, 0.1)';
            // ctx.stroke();
            
            // Calculate current glow size with outward radiation only if pulseSpeed > 0
            const pulseFactor = orbie.pulseSpeed > 0 ? 1 + (orbiePulsePhase * orbie.pulseIntensity) : 1;
            const currentGlowSize = orbie.glowSize * pulseFactor;
            
            // Draw Orbie's pulsating glow - using gradient for smoother effect
            const glowGradient = ctx.createRadialGradient(
                orbie.x, orbie.y, orbie.size * 0.5,
                orbie.x, orbie.y, currentGlowSize
            );
            glowGradient.addColorStop(0, `rgba(255, 223, 0, ${orbie.glowOpacity})`); // Bright gold inner glow
            glowGradient.addColorStop(0.5, `rgba(255, 215, 0, ${orbie.glowOpacity * 0.57})`); // Mid gold (scaled from 0.4/0.7)
            glowGradient.addColorStop(1, 'rgba(255, 200, 0, 0)'); // Fade to transparent
            
            ctx.beginPath();
            ctx.arc(orbie.x, orbie.y, currentGlowSize, 0, Math.PI * 2);
            ctx.fillStyle = glowGradient;
            ctx.fill();
            
            // Add a subtle outer ring to Orbie for better visibility
            ctx.beginPath();
            ctx.arc(orbie.x, orbie.y, orbie.size * 1.2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 215, 0, ${Math.min(0.6, orbie.glowOpacity * 0.8)})`; // Golden stroke proportional to glow opacity
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw Orbie's core with gradient for dimension
            const coreGradient = ctx.createRadialGradient(
                orbie.x - orbie.size * 0.3, orbie.y - orbie.size * 0.3, 0,
                orbie.x, orbie.y, orbie.size
            );
            coreGradient.addColorStop(0, 'rgba(255, 255, 240, 0.6)'); // Warm white center with 40% reduced opacity
            coreGradient.addColorStop(0.7, 'rgba(255, 233, 150, 0.54)'); // Pale gold middle with 40% reduced opacity
            coreGradient.addColorStop(1, 'rgba(255, 215, 0, 0.42)'); // Gold edge with 40% reduced opacity
            
            ctx.beginPath();
            ctx.arc(orbie.x, orbie.y, orbie.size, 0, Math.PI * 2);
            ctx.fillStyle = coreGradient;
            ctx.fill();
        }
    }
    
    // Draw a group of particles
    function drawParticleGroup(particles) {
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            
            // Set color based on whether particle is in Orbie's swarm
            const particleColor = particle.inOrbieSwarm 
                ? particle.color.replace('hsl', 'hsla').replace(')', ', 0.9)') // Slight transparency for swarm
                : particle.color;
            
            // Draw trail if enabled
            if (particle.history.length > 1) {
                // Draw fewer trail points on mobile for better performance
                const step = 2; // Skip every other point 
                
                for (let j = 0; j < particle.history.length; j += step) {
                    const point = particle.history[j];
                    const alpha = j / particle.history.length * 0.3;
                    const size = particle.size * (j / particle.history.length * 0.8);
                    
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                    // Convert HSL to HSLA for transparency
                    ctx.fillStyle = particle.color.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
                    ctx.fill();
                }
            }
            
            // Draw the particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particleColor;
            ctx.fill();
        }
    }
    
    // Animation loop
    function animate(timestamp) {
        // Request next frame first for smoother animation
        animationFrameId = requestAnimationFrame(animate);
        
        // Calculate FPS and update display every second
        frameCount++;
        if (timestamp - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (timestamp - lastTime));
            fpsDisplay.textContent = `FPS: ${fps}`;
            frameCount = 0;
            lastTime = timestamp;
        }
        
        // Update and draw particles
        updateParticles();
        drawParticles();
    }
    
    // Initialize everything
    function init() {
        // Load default settings from Presets
        orbieSettings = {...Presets.defaults.orbie};
        
        // Ensure glowOpacity has a default if it's missing from presets
        if (orbieSettings.glowOpacity === undefined) {
            orbieSettings.glowOpacity = 0.7;
        }
        
        orbieSwarmSettings = {...Presets.defaults.orbieSwarm};
        forceSettings = {...Presets.defaults.forces};
        
        // Initialize particles
        initBackgroundParticles();
        initOrbie();
        
        // Start animation
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Public API - only expose necessary methods
    return {
        init: function(canvasElement, fpsElement) {
            canvas = canvasElement;
            ctx = canvas.getContext('2d', { alpha: false });
            fpsDisplay = fpsElement;
            
            setupCanvas();
            init();
        },
        
        setTouchPosition: function(x, y, isActive) {
            touch.x = x;
            touch.y = y;
            touch.active = isActive;
        },
        
        toggleAttraction: function() {
            touch.attract = !touch.attract;
            return touch.attract;
        },
        
        isAttractMode: function() {
            return touch.attract;
        },
        
        // Update Orbie settings
        updateOrbieSettings: function(property, value) {
            if (property in orbieSettings) {
                orbieSettings[property] = value;
                
                // Update Orbie's properties
                if (orbie) {
                    if (property === 'size') {
                        orbie.size = value;
                        orbie.glowSize = value * orbieSettings.glowSize;
                    } else if (property === 'glowSize') {
                        orbie.glowSize = orbie.size * value;
                    } else if (property === 'glowOpacity') {
                        orbie.glowOpacity = value;
                    } else if (property === 'pulseSpeed' || property === 'pulseIntensity') {
                        orbie[property] = value;
                    } else if (property === 'speed') {
                        // Just update the setting, velocity is calculated from this
                    }
                }
            }
        },
        
        // Get Orbie settings
        getOrbieSettings: function() {
            return {...orbieSettings};
        },
        
        // Update OrbieSwarm settings
        updateOrbieSwarmSettings: function(property, value) {
            if (property in orbieSwarmSettings) {
                orbieSwarmSettings[property] = value;
            }
        },
        
        // Update force settings
        updateForceSettings: function(property, value) {
            if (property in forceSettings) {
                forceSettings[property] = value;
            }
        },
        
        // Update settings (generic method)
        updateSettings: function(group, property, value) {
            if (group === 'forces' && property in forceSettings) {
                forceSettings[property] = value;
            }
        },
        
        // Get a force setting value
        getForceSettingValue: function(property) {
            return property in forceSettings ? forceSettings[property] : undefined;
        },
        
        // Methods for ZotSwarm management
        createSwarmPlacementIndicator: function(preset) {
            return createSwarmPlacementIndicator(preset);
        },
        
        confirmSwarmPlacement: function(config) {
            return confirmSwarmPlacement(config);
        },
        
        getActiveSwarmPlacement: function() {
            return activeSwarmPlacement;
        },
        
        cancelSwarmPlacement: function() {
            if (activeSwarmPlacement && activeSwarmPlacement.element) {
                if (activeSwarmPlacement.element.parentNode) {
                    activeSwarmPlacement.element.parentNode.removeChild(activeSwarmPlacement.element);
                }
                activeSwarmPlacement = null;
            }
        },
        
        getZotSwarms: function() {
            return zotSwarms.map(swarm => ({
                id: swarm.id,
                zotCount: swarm.zots.length,
                settings: {...swarm.settings}
            }));
        },
        
        removeZotSwarm: function(swarmId) {
            return removeZotSwarm(swarmId);
        },
        
        applyPresetToNewSwarm: function(presetName) {
            return applyPresetToNewSwarm(presetName);
        },
        
        // Reset Orbie to center
        resetOrbie: function() {
            if (orbie) {
                orbie.x = width / 2;
                orbie.y = height / 2;
                orbie.vx = 0;
                orbie.vy = 0;
                orbie.glowOpacity = orbieSettings.glowOpacity;
            }
        },
        
        // Reset everything
        resetAll: function() {
            // Clear all swarms
            zotSwarms = [];
            
            // Cancel any active placement
            this.cancelSwarmPlacement();
            
            // Reset settings to defaults
            orbieSettings = {...Presets.defaults.orbie};
            orbieSwarmSettings = {...Presets.defaults.orbieSwarm};
            forceSettings = {...Presets.defaults.forces};
            
            // Update UI toggle to match settings
            const zotTouchEnabled = document.getElementById('zotTouchEnabled');
            if (zotTouchEnabled) {
                zotTouchEnabled.checked = forceSettings.zotTouchEnabled;
            }
            
            const zotSwarmInteractionEnabled = document.getElementById('zotSwarmInteractionEnabled');
            if (zotSwarmInteractionEnabled) {
                zotSwarmInteractionEnabled.checked = forceSettings.zotSwarmInteractionEnabled;
            }
            
            // Reinitialize
            initBackgroundParticles();
            initOrbie();
        },
        
        // Add a wall segment - wrapper for WallSystem
        addWall: function(x1, y1, x2, y2) {
            return WallSystem.addWall(x1, y1, x2, y2);
        },
        
        // Clear all walls - wrapper for WallSystem
        clearWalls: function() {
            WallSystem.clearWalls();
        }
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ParticleSystem;
}

// walls.js - Wall system for Orbie & Zot interactions
const WallSystem = (function() {
    // Wall collection
    let walls = [];
    
    // Wall properties
    const wallSettings = {
        wallForce: 1.0,        // Strength of wall repulsion
        wallPerception: 30,    // Distance at which particles detect walls
        visualThickness: 2,    // Visual thickness of walls
        color: '#ffffff',      // Default wall color
        glowColor: 'rgba(255, 255, 255, 0.3)', // Glow effect color
        glowRadius: 5,         // Glow effect radius
        segmentCount: 10       // Segments to approximate curves
    };
    
    // Wall interaction types - bitmask for entities that are blocked by this wall
    const INTERACTION_TYPES = {
        ALL: 0b1111,            // Blocks everything
        NONE: 0b0000,           // Blocks nothing
        ORBIE: 0b0001,          // Blocks Orbie
        ORBIE_SWARM: 0b0010,    // Blocks Orbie's swarm
        ZOT: 0b0100,            // Blocks individual Zots
        ZOT_SWARM: 0b1000,      // Blocks Zot swarms
        NOT_ORBIE: 0b1110,      // Blocks everything except Orbie
        NOT_ORBIE_FAMILY: 0b1100, // Blocks only Zots and Zot swarms
        ONLY_ZOTS: 0b0100       // Blocks only individual Zots
    };
    
    // Color presets for wall types
    const WALL_PRESETS = {
        STANDARD: {
            color: '#ffffff',
            glowColor: 'rgba(255, 255, 255, 0.3)',
            interactionType: INTERACTION_TYPES.ALL,
            force: 1.0
        },
        ORBIE_ONLY: {
            color: '#ff3366',
            glowColor: 'rgba(255, 51, 102, 0.3)',
            interactionType: INTERACTION_TYPES.ORBIE,
            force: 1.0
        },
        GOLDEN_PATH: {
            color: '#ffd700',
            glowColor: 'rgba(255, 215, 0, 0.5)',
            interactionType: INTERACTION_TYPES.NOT_ORBIE_FAMILY,
            force: 1.5
        },
        GHOST_WALL: {
            color: 'rgba(80, 200, 255, 0.7)',
            glowColor: 'rgba(80, 200, 255, 0.3)',
            interactionType: INTERACTION_TYPES.ZOT,
            force: 0.5
        },
        ENERGY_FIELD: {
            color: '#00ff88',
            glowColor: 'rgba(0, 255, 136, 0.4)',
            interactionType: INTERACTION_TYPES.ALL,
            force: 0.3
        }
    };
    
    // Physics utility functions
    // Calculate distance from point to line segment
    function distToSegment(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        
        if (len_sq !== 0) {
            param = dot / len_sq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Calculate normal vector to a line segment
    function normalToSegment(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        
        if (len_sq !== 0) {
            param = dot / len_sq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        // Vector from closest point to particle
        const dx = px - xx;
        const dy = py - yy;
        
        // Normalize
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return { x: 0, y: 0 };
        
        return { x: dx / dist, y: dy / dist };
    }
    
    // Check if line segments intersect (for collision detection)
    function lineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        if (denom === 0) {
            return false; // Parallel lines
        }
        
        const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
        const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
        
        return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
    }
    
    // Add curve utilities for bezier and arc approximation
    function approximateCubicBezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2, segmentCount = 10) {
        const points = [];
        for (let i = 0; i <= segmentCount; i++) {
            const t = i / segmentCount;
            
            // Cubic Bezier formula
            const u = 1 - t;
            const tt = t * t;
            const uu = u * u;
            const uuu = uu * u;
            const ttt = tt * t;
            
            const x = uuu * x1 + 3 * uu * t * cx1 + 3 * u * tt * cx2 + ttt * x2;
            const y = uuu * y1 + 3 * uu * t * cy1 + 3 * u * tt * cy2 + ttt * y2;
            
            points.push({ x, y });
        }
        return points;
    }
    
    function approximateQuadraticBezier(x1, y1, cx, cy, x2, y2, segmentCount = 10) {
        const points = [];
        for (let i = 0; i <= segmentCount; i++) {
            const t = i / segmentCount;
            
            // Quadratic Bezier formula
            const u = 1 - t;
            const tt = t * t;
            const uu = u * u;
            
            const x = uu * x1 + 2 * u * t * cx + tt * x2;
            const y = uu * y1 + 2 * u * t * cy + tt * y2;
            
            points.push({ x, y });
        }
        return points;
    }
    
    function approximateArc(x1, y1, rx, ry, angle, largeArc, sweep, x2, y2, segmentCount = 10) {
        // Convert angle from degrees to radians
        const angleRad = (angle * Math.PI) / 180;
        
        // Center parameterization of the elliptical arc
        // This is a simplified implementation and might not handle all edge cases
        
        // First, transform to the ellipse coordinate system
        const dx = (x1 - x2) / 2;
        const dy = (y1 - y2) / 2;
        
        // Apply the rotation to align with the ellipse
        const x1p = Math.cos(angleRad) * dx + Math.sin(angleRad) * dy;
        const y1p = -Math.sin(angleRad) * dx + Math.cos(angleRad) * dy;
        
        // Ensure radii are large enough
        rx = Math.abs(rx);
        ry = Math.abs(ry);
        
        // Scale up the radii if needed
        const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
        if (lambda > 1) {
            rx *= Math.sqrt(lambda);
            ry *= Math.sqrt(lambda);
        }
        
        // Calculate the center
        const sign = largeArc !== sweep ? 1 : -1;
        let sq = ((rx * rx * ry * ry) - (rx * rx * y1p * y1p) - (ry * ry * x1p * x1p)) / 
                 ((rx * rx * y1p * y1p) + (ry * ry * x1p * x1p));
        sq = sq < 0 ? 0 : sq; // Avoid negative sqrt
        
        const coef = sign * Math.sqrt(sq);
        const cxp = coef * ((rx * y1p) / ry);
        const cyp = coef * -((ry * x1p) / rx);
        
        // Transform back to the original coordinate system
        const cx = Math.cos(angleRad) * cxp - Math.sin(angleRad) * cyp + (x1 + x2) / 2;
        const cy = Math.sin(angleRad) * cxp + Math.cos(angleRad) * cyp + (y1 + y2) / 2;
        
        // Calculate start and end angles
        const startAngle = Math.atan2((y1p - cyp) / ry, (x1p - cxp) / rx);
        const endAngle = Math.atan2((-y1p - cyp) / ry, (-x1p - cxp) / rx);
        
        let deltaAngle = endAngle - startAngle;
        
        // Ensure correct sweep
        if (sweep === 0 && deltaAngle > 0) {
            deltaAngle -= 2 * Math.PI;
        } else if (sweep === 1 && deltaAngle < 0) {
            deltaAngle += 2 * Math.PI;
        }
        
        // Generate points along the arc
        const points = [];
        for (let i = 0; i <= segmentCount; i++) {
            const t = i / segmentCount;
            const angle = startAngle + t * deltaAngle;
            
            const x = cx + rx * Math.cos(angle) * Math.cos(angleRad) - ry * Math.sin(angle) * Math.sin(angleRad);
            const y = cy + rx * Math.cos(angle) * Math.sin(angleRad) + ry * Math.sin(angle) * Math.cos(angleRad);
            
            points.push({ x, y });
        }
        
        return points;
    }
    
    // Parse SVG path data to extract wall segments with updated handling of interaction types
    function parseSVGPath(pathData) {
        // Enhanced parser for SVG path data
        // It handles 'M' (move to), 'L' (line to), 'C' (cubic bezier),
        // 'Q' (quadratic bezier), 'A' (arc), and 'Z' (close path) commands
        
        // Regular expression to match path commands with their parameters
        const pathRegex = /([MLCQAZ])([^MLCQAZ]*)/gi;
        const points = [];
        let currentX = 0, currentY = 0;
        let firstX = 0, firstY = 0;
        let segmentCount = wallSettings.segmentCount; // Number of segments to approximate curves
        
        let match;
        while ((match = pathRegex.exec(pathData)) !== null) {
            const command = match[1].toUpperCase();
            const params = match[2].trim().split(/[\s,]+/).filter(p => p !== '').map(parseFloat);
            
            switch (command) {
                case 'M': // Move to
                    if (params.length >= 2) {
                        currentX = params[0];
                        currentY = params[1];
                        firstX = currentX; // Remember first point for 'Z' command
                        firstY = currentY;
                        points.push({ x: currentX, y: currentY });
                    }
                    break;
                    
                case 'L': // Line to
                    if (params.length >= 2) {
                        const newX = params[0];
                        const newY = params[1];
                        
                        walls.push({
                            x1: currentX,
                            y1: currentY,
                            x2: newX,
                            y2: newY,
                            color: wallSettings.color,
                            glowColor: wallSettings.glowColor,
                            force: wallSettings.wallForce,
                            interactionType: wallSettings.interactionType || INTERACTION_TYPES.ALL
                        });
                        
                        currentX = newX;
                        currentY = newY;
                    }
                    break;
                    
                case 'C': // Cubic Bezier curve
                    if (params.length >= 6) {
                        const cx1 = params[0];
                        const cy1 = params[1];
                        const cx2 = params[2];
                        const cy2 = params[3];
                        const x2 = params[4];
                        const y2 = params[5];
                        
                        // Approximate the curve with line segments
                        const curvePoints = approximateCubicBezier(
                            currentX, currentY, cx1, cy1, cx2, cy2, x2, y2, segmentCount
                        );
                        
                        // Create wall segments between the points
                        for (let i = 0; i < curvePoints.length - 1; i++) {
                            walls.push({
                                x1: curvePoints[i].x,
                                y1: curvePoints[i].y,
                                x2: curvePoints[i+1].x,
                                y2: curvePoints[i+1].y,
                                color: wallSettings.color,
                                glowColor: wallSettings.glowColor,
                                force: wallSettings.wallForce,
                                interactionType: wallSettings.interactionType || INTERACTION_TYPES.ALL
                            });
                        }
                        
                        currentX = x2;
                        currentY = y2;
                    }
                    break;
                    
                case 'Q': // Quadratic Bezier curve
                    if (params.length >= 4) {
                        const cx = params[0];
                        const cy = params[1];
                        const x2 = params[2];
                        const y2 = params[3];
                        
                        // Approximate the curve with line segments
                        const curvePoints = approximateQuadraticBezier(
                            currentX, currentY, cx, cy, x2, y2, segmentCount
                        );
                        
                        // Create wall segments between the points
                        for (let i = 0; i < curvePoints.length - 1; i++) {
                            walls.push({
                                x1: curvePoints[i].x,
                                y1: curvePoints[i].y,
                                x2: curvePoints[i+1].x,
                                y2: curvePoints[i+1].y,
                                color: wallSettings.color,
                                glowColor: wallSettings.glowColor,
                                force: wallSettings.wallForce,
                                interactionType: wallSettings.interactionType || INTERACTION_TYPES.ALL
                            });
                        }
                        
                        currentX = x2;
                        currentY = y2;
                    }
                    break;
                    
                case 'A': // Elliptical Arc
                    if (params.length >= 7) {
                        const rx = params[0];
                        const ry = params[1];
                        const angle = params[2];
                        const largeArc = params[3];
                        const sweep = params[4];
                        const x2 = params[5];
                        const y2 = params[6];
                        
                        // Approximate the arc with line segments
                        const arcPoints = approximateArc(
                            currentX, currentY, rx, ry, angle, largeArc, sweep, x2, y2, segmentCount
                        );
                        
                        // Create wall segments between the points
                        for (let i = 0; i < arcPoints.length - 1; i++) {
                            walls.push({
                                x1: arcPoints[i].x,
                                y1: arcPoints[i].y,
                                x2: arcPoints[i+1].x,
                                y2: arcPoints[i+1].y,
                                color: wallSettings.color,
                                glowColor: wallSettings.glowColor,
                                force: wallSettings.wallForce,
                                interactionType: wallSettings.interactionType || INTERACTION_TYPES.ALL
                            });
                        }
                        
                        currentX = x2;
                        currentY = y2;
                    }
                    break;
                    
                case 'Z': // Close path
                    walls.push({
                        x1: currentX,
                        y1: currentY,
                        x2: firstX,
                        y2: firstY,
                        color: wallSettings.color,
                        glowColor: wallSettings.glowColor,
                        force: wallSettings.wallForce,
                        interactionType: wallSettings.interactionType || INTERACTION_TYPES.ALL
                    });
                    
                    currentX = firstX;
                    currentY = firstY;
                    break;
            }
        }
        
        return walls;
    }
    
    // Load walls from an SVG file
    function loadWallsFromSVG(svgText) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const paths = svgDoc.querySelectorAll('path');
        
        // Clear existing walls
        walls = [];
        
        paths.forEach(path => {
            const pathData = path.getAttribute('d');
            const wallColor = path.getAttribute('stroke') || wallSettings.color;
            const wallForce = parseFloat(path.getAttribute('data-force') || wallSettings.wallForce);
            const wallGlowColor = path.getAttribute('data-glow-color') || getGlowColorFromStroke(wallColor);
            
            // Get the interaction type from data attribute or determine based on color
            let interactionType = INTERACTION_TYPES.ALL;
            
            // Check for data-interaction attribute first
            if (path.hasAttribute('data-interaction')) {
                const interactionName = path.getAttribute('data-interaction').toUpperCase();
                if (INTERACTION_TYPES[interactionName] !== undefined) {
                    interactionType = INTERACTION_TYPES[interactionName];
                }
            } 
            // Check for data-wall-type attribute
            else if (path.hasAttribute('data-wall-type')) {
                const wallType = path.getAttribute('data-wall-type').toUpperCase();
                if (WALL_PRESETS[wallType]) {
                    Object.assign(wallSettings, WALL_PRESETS[wallType]);
                    interactionType = WALL_PRESETS[wallType].interactionType;
                }
            }
            // If gold colored and no explicit type, assume golden path
            else if (wallColor.toLowerCase() === '#ffd700' || wallColor.toLowerCase() === 'gold') {
                Object.assign(wallSettings, WALL_PRESETS.GOLDEN_PATH);
                interactionType = INTERACTION_TYPES.NOT_ORBIE_FAMILY;
            }
            
            // Store original settings for this batch of walls
            const originalSettings = { ...wallSettings };
            
            // Apply current path settings
            wallSettings.color = wallColor;
            wallSettings.glowColor = wallGlowColor;
            wallSettings.wallForce = wallForce;
            wallSettings.interactionType = interactionType;
            
            // Parse the path data to extract wall segments
            parseSVGPath(pathData);
            
            // Restore original settings
            Object.assign(wallSettings, originalSettings);
        });
        
        return walls.length;
    }
    
    // Helper to generate a semi-transparent glow color from a stroke color
    function getGlowColorFromStroke(strokeColor) {
        // If it's already rgba, just adjust the alpha
        if (strokeColor.startsWith('rgba')) {
            return strokeColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d\.]+\)/, 'rgba($1, $2, $3, 0.3)');
        }
        
        // If it's hex format
        if (strokeColor.startsWith('#')) {
            let r, g, b;
            // Convert short hex (#RGB) to full hex (#RRGGBB)
            if (strokeColor.length === 4) {
                r = parseInt(strokeColor[1] + strokeColor[1], 16);
                g = parseInt(strokeColor[2] + strokeColor[2], 16);
                b = parseInt(strokeColor[3] + strokeColor[3], 16);
            } else {
                r = parseInt(strokeColor.substring(1, 3), 16);
                g = parseInt(strokeColor.substring(3, 5), 16);
                b = parseInt(strokeColor.substring(5, 7), 16);
            }
            return `rgba(${r}, ${g}, ${b}, 0.3)`;
        }
        
        // Default for other color formats
        return 'rgba(255, 255, 255, 0.3)';
    }
    
    // Render walls with enhanced visuals
    function renderWalls(ctx) {
        if (walls.length === 0) return;
        
        ctx.save();
        
        walls.forEach(wall => {
            // Set wall styles based on properties
            ctx.strokeStyle = wall.color || wallSettings.color;
            ctx.shadowColor = wall.glowColor || wallSettings.glowColor;
            ctx.shadowBlur = wallSettings.glowRadius;
            ctx.lineWidth = wallSettings.visualThickness;
            
            // Special rendering for golden walls
            if (wall.interactionType === INTERACTION_TYPES.NOT_ORBIE_FAMILY || 
                (wall.color && wall.color.toLowerCase() === '#ffd700')) {
                // Gold-specific glow effect
                ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
                ctx.shadowBlur = wallSettings.glowRadius * 1.5;
                
                // Golden pulse effect (optional)
                const time = Date.now() / 1000;
                const pulseIntensity = 0.5 + 0.5 * Math.sin(time * 2);
                ctx.shadowBlur = wallSettings.glowRadius * (1 + pulseIntensity);
            }
            
            // Draw the wall
            ctx.beginPath();
            ctx.moveTo(wall.x1, wall.y1);
            ctx.lineTo(wall.x2, wall.y2);
            ctx.stroke();
        });
        
        ctx.restore();
    }
    
    // Apply wall forces to a particle based on interaction type
    function applyWallForces(particle, prevX, prevY, wallCollisionEnabled = true) {
        if (walls.length === 0) return false;
        
        let hasCollided = false;
        
        // Determine entity type for interaction filtering
        let entityType = INTERACTION_TYPES.ZOT; // Default to ZOT
        
        if (particle.isOrbie) {
            entityType = INTERACTION_TYPES.ORBIE;
        } else if (particle.isOrbieSwarm) {
            entityType = INTERACTION_TYPES.ORBIE_SWARM;
        } else if (particle.isZotSwarm) {
            entityType = INTERACTION_TYPES.ZOT_SWARM;
        }
        
        // Process fewer walls on mobile for performance
        const wallStep = window.innerWidth < 768 ? 2 : 1;
        
        for (let w = 0; w < walls.length; w += wallStep) {
            const wall = walls[w];
            const wallForce = wall.force || wallSettings.wallForce;
            const interactionType = wall.interactionType || INTERACTION_TYPES.ALL;
            
            // Skip walls that don't interact with this entity type
            if ((interactionType & entityType) === 0) {
                continue;
            }
            
            // First check for collisions if enabled
            if (wallCollisionEnabled && lineSegmentsIntersect(
                prevX, prevY, particle.x, particle.y, 
                wall.x1, wall.y1, wall.x2, wall.y2
            )) {
                // Particle has crossed through wall, perform reflection
                const normal = normalToSegment(particle.x, particle.y, wall.x1, wall.y1, wall.x2, wall.y2);
                const dot = particle.vx * normal.x + particle.vy * normal.y;
                
                // Reflect velocity vector around the normal vector
                particle.vx -= 2 * dot * normal.x;
                particle.vy -= 2 * dot * normal.y;
                
                // Move particle slightly away from the wall
                particle.x = prevX + particle.vx * 0.5;
                particle.y = prevY + particle.vy * 0.5;
                
                // Apply some energy loss on collision
                particle.vx *= 0.8;
                particle.vy *= 0.8;
                
                hasCollided = true;
            }
            
            // Apply repulsion force when close to the wall
            const dist = distToSegment(particle.x, particle.y, wall.x1, wall.y1, wall.x2, wall.y2);
            if (dist < wallSettings.wallPerception) {
                const normal = normalToSegment(particle.x, particle.y, wall.x1, wall.y1, wall.x2, wall.y2);
                const force = (wallSettings.wallPerception - dist) / wallSettings.wallPerception * wallForce;
                
                particle.vx += normal.x * force;
                particle.vy += normal.y * force;
            }
        }
        
        return hasCollided;
    }
    
    // Public API
    return {
        // Initialize wall system
        init: function(settings = {}) {
            // Apply custom settings if provided
            Object.assign(wallSettings, settings);
            walls = [];
        },
        
        // Get the current walls array
        getWalls: function() {
            return walls;
        },
        
        // Get the current wall settings
        getSettings: function() {
            return wallSettings;
        },
        
        // Update wall settings
        updateSettings: function(settings = {}) {
            Object.assign(wallSettings, settings);
        },
        
        // Add a single wall segment
        addWall: function(x1, y1, x2, y2, options = {}) {
            const wall = {
                x1, y1, x2, y2,
                color: options.color || wallSettings.color,
                force: options.force || wallSettings.wallForce
            };
            walls.push(wall);
            return walls.length - 1; // Return index of the new wall
        },
        
        // Load walls from SVG string
        loadFromSVG: function(svgText) {
            return loadWallsFromSVG(svgText);
        },
        
        // Load walls from SVG file
        loadFromSVGFile: async function(filePath) {
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`Failed to load SVG file: ${response.statusText}`);
                }
                const svgText = await response.text();
                return loadWallsFromSVG(svgText);
            } catch (error) {
                console.error("Error loading SVG file:", error);
                return 0;
            }
        },
        
        // Clear all walls
        clearWalls: function() {
            walls = [];
        },
        
        // Apply wall forces to a particle
        applyForces: function(particle, prevX, prevY, collisionEnabled = true) {
            return applyWallForces(particle, prevX, prevY, collisionEnabled);
        },
        
        // Render walls
        render: function(ctx) {
            renderWalls(ctx);
        },
        
        // Export utility functions for external use
        utils: {
            distToSegment,
            normalToSegment,
            lineSegmentsIntersect
        }
    };
})(); 

// Handle canvas click for swarm placement
    canvas.addEventListener('click', function(e) {
        // Only handle if in swarm placement mode
        if (ParticleSystem.getActiveSwarmPlacement()) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Confirm placement at click position
            const config = getSwarmConfigFromUI();
            const swarmId = ParticleSystem.confirmSwarmPlacement(config);
            
            if (swarmId) {
                // Update the swarm list
                updateSwarmList();
                
                // Reset the Create Swarm button
                const createButton = document.getElementById('createSwarmButton');
                if (createButton) {
                    createButton.textContent = "Create Swarm";
                }
                
                // Reset touch handler
                TouchHandler.setSwarmPlacementMode(false, null);
            }
        }
    });// main.js - Application initialization
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    const menuToggle = document.getElementById('menuToggle');
    const fpsDisplay = document.getElementById('fps');
    const controlsPanel = document.getElementById('controls');
    
    console.log("DOM loaded - Menu elements:", menuToggle ? "✓" : "✗", controlsPanel ? "✓" : "✗");
    
    // Initialize the particle system
    ParticleSystem.init(canvas, fpsDisplay);
    
    // Initialize wall system
    WallSystem.init();
    
    // Add direct event listeners to menu toggle as a backup
    if (menuToggle && controlsPanel) {
        console.log("Adding direct event listeners to menu toggle");
        
        menuToggle.addEventListener('click', function(e) {
            console.log("Menu toggle clicked");
            e.preventDefault();
            controlsPanel.classList.toggle('collapsed');
        });
        
        menuToggle.addEventListener('touchstart', function(e) {
            console.log("Menu toggle touched");
            e.preventDefault();
            controlsPanel.classList.toggle('collapsed');
            e.stopPropagation();
        }, { passive: false });
    }
    
    // Initialize touch handler with callback
    TouchHandler.init(canvas, {
        onTouchStart: function(x, y) {
            ParticleSystem.setTouchPosition(x, y, true);
        },
        onTouchMove: function(x, y) {
            ParticleSystem.setTouchPosition(x, y, true);
        },
        onTouchEnd: function() {
            ParticleSystem.setTouchPosition(0, 0, false);
        },
        onDoubleTap: function() {
            const isAttract = ParticleSystem.toggleAttraction();
            menuToggle.classList.toggle('attract-mode', isAttract);
        },
        isAttractMode: function() {
            // This function allows the TouchHandler to check the current mode
            return ParticleSystem.isAttractMode();
        },
        onSwarmPlacement: function(x, y) {
            // Create a swarm at the touch position
            const config = getSwarmConfigFromUI();
            const swarmId = ParticleSystem.confirmSwarmPlacement(config);
            
            if (swarmId) {
                // Update the swarm list
                updateSwarmList();
                
                // Reset the Create Swarm button
                const createButton = document.getElementById('createSwarmButton');
                if (createButton) {
                    createButton.textContent = "Create Swarm";
                }
            }
        }
    });
    
    // Initialize menu system with callbacks
    try {
        console.log("Initializing MenuSystem...");
        MenuSystem.init({
            controlsPanel: controlsPanel,
            menuToggle: menuToggle
        }, {
            // Callbacks for settings updates
            updateOrbieSettings: function(property, value) {
                ParticleSystem.updateOrbieSettings(property, value);
            },
            updateSwarmSettings: function(swarmType, property, value) {
                ParticleSystem.updateSwarmSettings(swarmType, property, value);
            },
            updateSettings: function(group, property, value) {
                ParticleSystem.updateSettings(group, property, value);
            },
            resetOrbie: function() {
                ParticleSystem.resetOrbie();
            },
            resetAll: function() {
                ParticleSystem.resetAll();
                WallSystem.clearWalls();
            },
            changeColorTheme: function(theme) {
                ColorSystem.setTheme(theme);
            },
            updateWallSettings: function(property, value) {
                // Update wall settings
                const settings = {};
                settings[property] = parseFloat(value);
                WallSystem.updateSettings(settings);
            }
        });
        console.log("MenuSystem initialized");
    } catch (error) {
        console.error("Error initializing menu system:", error);
    }
    
    // Controls panel setup
    setupControls();
    
    // Setup wall controls
    setupWallControls();
    
    // Handle menu toggle
    menuToggle.addEventListener('click', function() {
        controlsPanel.classList.toggle('collapsed');
        
        // If closing the menu and there's an active swarm placement, cancel it
        if (controlsPanel.classList.contains('collapsed') && ParticleSystem.getActiveSwarmPlacement()) {
            ParticleSystem.cancelSwarmPlacement();
            TouchHandler.setSwarmPlacementMode(false, null);
            updateCreateSwarmUI();
        }
    });
    
    // Properly handle touch behavior on menu toggle button
    menuToggle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        controlsPanel.classList.toggle('collapsed');
        
        // If closing the menu and there's an active swarm placement, cancel it
        if (controlsPanel.classList.contains('collapsed') && ParticleSystem.getActiveSwarmPlacement()) {
            ParticleSystem.cancelSwarmPlacement();
            TouchHandler.setSwarmPlacementMode(false, null);
            updateCreateSwarmUI();
        }
        e.stopPropagation();
    }, { passive: false });
    
    // Cancel swarm placement when clicking/touching outside the menu
    document.addEventListener('click', function(e) {
        // Only if there's an active swarm placement and click is outside controls
        if (ParticleSystem.getActiveSwarmPlacement() && 
            !controlsPanel.contains(e.target) && 
            e.target !== menuToggle) {
            
            ParticleSystem.cancelSwarmPlacement();
            TouchHandler.setSwarmPlacementMode(false, null);
            updateCreateSwarmUI();
        }
    });
    
    // Function to set up all the control panel interactions
    function setupControls() {
        // Group selector dropdown
        const paramGroupSelect = document.getElementById('paramGroup');
        paramGroupSelect.addEventListener('change', function() {
            // Hide all parameter groups
            document.querySelectorAll('.param-group').forEach(group => {
                group.classList.remove('active');
            });
            
            // Show the selected group
            const selectedGroup = document.getElementById(this.value + 'Params');
            if (selectedGroup) {
                selectedGroup.classList.add('active');
            }
        });
        
        // Setup range sliders and UI elements
        setupOrbieControls();
        setupOrbieSwarmControls();
        setupZotSwarmControls();
        setupForceControls();
        
        // Setup reset buttons
        document.getElementById('resetOrbieButton').addEventListener('click', function() {
            // Reset Orbie's position to center
            ParticleSystem.resetOrbie();
        });
        
        document.getElementById('resetAllButton').addEventListener('click', function() {
            // Reset all particles and settings
            ParticleSystem.resetAll();
            
            // Update UI to reflect reset settings
            updateAllUIValues();
        });
    }
    
    // Setup Orbie control sliders
    function setupOrbieControls() {
        setupRangeInput('orbieSize', value => {
            ParticleSystem.updateOrbieSettings('size', value);
        });
        
        setupRangeInput('orbieGlowSize', value => {
            ParticleSystem.updateOrbieSettings('glowSize', value);
        });
        
        setupRangeInput('orbieGlowOpacity', value => {
            ParticleSystem.updateOrbieSettings('glowOpacity', value);
        });
        
        setupRangeInput('orbieSpeed', value => {
            ParticleSystem.updateOrbieSettings('speed', value);
        });
        
        setupRangeInput('orbiePulseSpeed', value => {
            ParticleSystem.updateOrbieSettings('pulseSpeed', value);
        });
        
        setupRangeInput('orbiePulseIntensity', value => {
            ParticleSystem.updateOrbieSettings('pulseIntensity', value);
        });
        
        setupRangeInput('orbieInfluenceRadius', value => {
            ParticleSystem.updateOrbieSettings('influenceRadius', value);
        });
        
        setupRangeInput('orbieInfluenceIntensity', value => {
            ParticleSystem.updateOrbieSettings('influenceIntensity', value);
        });
    }
    
    // Setup OrbieSwarm control sliders
    function setupOrbieSwarmControls() {
        setupRangeInput('orbieSwarmSpeed', value => {
            ParticleSystem.updateOrbieSwarmSettings('speed', value);
        });
        
        setupRangeInput('orbieSwarmDampening', value => {
            ParticleSystem.updateOrbieSwarmSettings('dampening', value);
        });
        
        setupRangeInput('orbieSwarmSeparation', value => {
            ParticleSystem.updateOrbieSwarmSettings('separation', value);
        });
        
        setupRangeInput('orbieSwarmAlignment', value => {
            ParticleSystem.updateOrbieSwarmSettings('alignment', value);
        });
        
        setupRangeInput('orbieSwarmCohesion', value => {
            ParticleSystem.updateOrbieSwarmSettings('cohesion', value);
        });
        
        setupRangeInput('orbieSwarmPerception', value => {
            ParticleSystem.updateOrbieSwarmSettings('perception', value);
        });
        
        setupRangeInput('orbieSwarmSparkleRate', value => {
            ParticleSystem.updateOrbieSwarmSettings('sparkleRate', value);
        });
    }
    
    // Setup Zot Swarm controls
    function setupZotSwarmControls() {
        // Regular sliders
        setupRangeInput('newSwarmZotCount', () => updateCreateSwarmUI());
        setupRangeInput('newSwarmSpeed', () => updateCreateSwarmUI());
        setupRangeInput('newSwarmSeparation', () => updateCreateSwarmUI());
        setupRangeInput('newSwarmAlignment', () => updateCreateSwarmUI());
        setupRangeInput('newSwarmCohesion', () => updateCreateSwarmUI());
        setupRangeInput('newSwarmPerception', () => updateCreateSwarmUI());
        
        // Min/Max size range slider
        setupDualRangeSlider('newSwarmMinSize', 'newSwarmMaxSize');
        
        // Preset selector
        const presetSelect = document.getElementById('swarmPreset');
        if (presetSelect) {
            presetSelect.addEventListener('change', function() {
                if (this.value === 'custom') {
                    // Keep current values
                    return;
                }
                
                // Apply preset values to UI
                const preset = ParticleSystem.applyPresetToNewSwarm(this.value);
                if (preset) {
                    document.getElementById('newSwarmZotCount').value = preset.zotCount;
                    document.getElementById('newSwarmSpeed').value = preset.speed;
                    document.getElementById('newSwarmSeparation').value = preset.separation;
                    document.getElementById('newSwarmAlignment').value = preset.alignment;
                    document.getElementById('newSwarmCohesion').value = preset.cohesion;
                    document.getElementById('newSwarmPerception').value = preset.perception;
                    
                    // Update displayed values
                    document.getElementById('newSwarmZotCountValue').textContent = preset.zotCount;
                    document.getElementById('newSwarmSpeedValue').textContent = preset.speed.toFixed(1);
                    document.getElementById('newSwarmSeparationValue').textContent = preset.separation.toFixed(1);
                    document.getElementById('newSwarmAlignmentValue').textContent = preset.alignment.toFixed(2);
                    document.getElementById('newSwarmCohesionValue').textContent = preset.cohesion.toFixed(1);
                    document.getElementById('newSwarmPerceptionValue').textContent = preset.perception;
                }
            });
        }
        
        // Color theme selector
        const colorPresets = document.querySelectorAll('.color-preset');
        colorPresets.forEach(preset => {
            preset.addEventListener('click', function() {
                // Remove active class from all presets
                colorPresets.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked preset
                this.classList.add('active');
                
                // Update current color theme
                updateCreateSwarmUI();
            });
        });
        
        // Create Swarm button
        const createSwarmButton = document.getElementById('createSwarmButton');
        if (createSwarmButton) {
            createSwarmButton.addEventListener('click', function() {
                const activeSwarm = ParticleSystem.getActiveSwarmPlacement();
                
                if (activeSwarm) {
                    // Confirm placement and create swarm
                    const config = getSwarmConfigFromUI();
                    const swarmId = ParticleSystem.confirmSwarmPlacement(config);
                    
                    if (swarmId) {
                        // Update the swarm list
                        updateSwarmList();
                        
                        // Reset button text
                        this.textContent = "Create Swarm";
                        
                        // Reset touch handler placement mode
                        TouchHandler.setSwarmPlacementMode(false, null);
                    }
                } else {
                    // Create a new placement indicator
                    const placement = ParticleSystem.createSwarmPlacementIndicator(getSwarmConfigFromUI());
                    
                    // Change button text
                    this.textContent = "Confirm Placement";
                    
                    // Set touch handler to swarm placement mode
                    if (placement) {
                        TouchHandler.setSwarmPlacementMode(true, placement.id);
                    }
                }
            });
        }
        
        // Initial swarm list update
        updateSwarmList();
    }
    
    // Setup Force controls
    function setupForceControls() {
        setupRangeInput('touchForce', value => {
            ParticleSystem.updateForceSettings('touchForce', value);
        });
        
        setupRangeInput('wallForce', value => {
            ParticleSystem.updateForceSettings('wallForce', value);
        });
        
        setupRangeInput('orbieTouchMultiplier', value => {
            ParticleSystem.updateOrbieSettings('touchMultiplier', value);
        });
        
        // Initialize zotTouchEnabled checkbox
        const zotTouchEnabled = document.getElementById('zotTouchEnabled');
        if (zotTouchEnabled) {
            // Get the current value from the particle system
            const currentValue = ParticleSystem.getForceSettingValue('zotTouchEnabled');
            zotTouchEnabled.checked = currentValue !== undefined ? currentValue : true;
            
            // Add event listener
            zotTouchEnabled.addEventListener('change', function() {
                ParticleSystem.updateSettings('forces', 'zotTouchEnabled', this.checked);
            });
        }
        
        // Initialize zotSwarmInteractionEnabled checkbox
        const zotSwarmInteractionEnabled = document.getElementById('zotSwarmInteractionEnabled');
        if (zotSwarmInteractionEnabled) {
            // Get the current value from the particle system
            const currentValue = ParticleSystem.getForceSettingValue('zotSwarmInteractionEnabled');
            zotSwarmInteractionEnabled.checked = currentValue !== undefined ? currentValue : true;
            
            // Add event listener
            zotSwarmInteractionEnabled.addEventListener('change', function() {
                ParticleSystem.updateSettings('forces', 'zotSwarmInteractionEnabled', this.checked);
            });
        }
    }
    
    // Helper function to set up a range input with its value display and change handler
    function setupRangeInput(id, changeCallback) {
        const input = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Value');
        
        if (input && valueDisplay) {
            // Set initial value
            const shouldRound = input.step === '1' || parseFloat(input.step) === 1;
            const precision = shouldRound ? 0 : 
                             input.step.includes('.01') ? 2 : 1;
            
            valueDisplay.textContent = parseFloat(input.value).toFixed(precision);
            
            // Add event listeners for input changes
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                valueDisplay.textContent = value.toFixed(precision);
                
                // Call the callback with the new value
                if (changeCallback) {
                    changeCallback(value);
                }
            });
        }
    }
    
    // Helper function to set up dual-thumb range slider for min/max values
    function setupDualRangeSlider(minId, maxId) {
        const minSlider = document.getElementById(minId);
        const maxSlider = document.getElementById(maxId);
        const minValueDisplay = document.getElementById(minId + 'Value');
        const maxValueDisplay = document.getElementById(maxId + 'Value');
        
        if (minSlider && maxSlider && minValueDisplay && maxValueDisplay) {
            // Update values displays
            function updateValues() {
                const minVal = parseFloat(minSlider.value);
                const maxVal = parseFloat(maxSlider.value);
                
                minValueDisplay.textContent = minVal.toFixed(1);
                maxValueDisplay.textContent = maxVal.toFixed(1);
                
                // Ensure thumb positions are visually reflecting the values
                updateThumbPositions();
                
                // Call callback to update UI
                updateCreateSwarmUI();
            }
            
            // Update the visual position of thumbs
            function updateThumbPositions() {
                const minVal = parseFloat(minSlider.value);
                const maxVal = parseFloat(maxSlider.value);
                
                // Calculate percentage of position along track
                const min = parseFloat(minSlider.min);
                const max = parseFloat(minSlider.max);
                const range = max - min;
                
                const minPercent = ((minVal - min) / range) * 100;
                const maxPercent = ((maxVal - min) / range) * 100;
                
                // Set the min/max slider background to show selected range
                // This creates a visual highlight between the two thumbs
                const sliderContainer = minSlider.closest('.range-slider-container');
                if (sliderContainer) {
                    const sliderTrack = sliderContainer.querySelector('.range-slider');
                    if (sliderTrack) {
                        sliderTrack.style.background = `linear-gradient(
                            to right,
                            #444 0%, #444 ${minPercent}%,
                            #4CAF50 ${minPercent}%, #4CAF50 ${maxPercent}%,
                            #444 ${maxPercent}%, #444 100%
                        )`;
                    }
                }
            }
            
            // Set initial values
            updateValues();
            
            // Ensure min doesn't exceed max and max doesn't go below min
            minSlider.addEventListener('input', function() {
                const minVal = parseFloat(this.value);
                const maxVal = parseFloat(maxSlider.value);
                
                if (minVal > maxVal) {
                    maxSlider.value = minVal;
                }
                
                updateValues();
            });
            
            maxSlider.addEventListener('input', function() {
                const maxVal = parseFloat(this.value);
                const minVal = parseFloat(minSlider.value);
                
                if (maxVal < minVal) {
                    minSlider.value = maxVal;
                }
                
                updateValues();
            });
            
            // Handle touch events for mobile
            // On touchend, ensure values are updated and saved
            minSlider.addEventListener('touchend', updateValues, { passive: true });
            maxSlider.addEventListener('touchend', updateValues, { passive: true });
        }
    }
    
    // Get the current swarm configuration from UI inputs
    function getSwarmConfigFromUI() {
        // Get the selected color theme
        const activeTheme = document.querySelector('.color-preset.active');
        const colorTheme = activeTheme ? activeTheme.getAttribute('data-theme') : 'blue';
        
        return {
            zotCount: parseInt(document.getElementById('newSwarmZotCount').value),
            minSize: parseFloat(document.getElementById('newSwarmMinSize').value),
            maxSize: parseFloat(document.getElementById('newSwarmMaxSize').value),
            speed: parseFloat(document.getElementById('newSwarmSpeed').value),
            separation: parseFloat(document.getElementById('newSwarmSeparation').value),
            alignment: parseFloat(document.getElementById('newSwarmAlignment').value),
            cohesion: parseFloat(document.getElementById('newSwarmCohesion').value),
            perception: parseInt(document.getElementById('newSwarmPerception').value),
            trailLength: 0, // No trails by default
            colorTheme: colorTheme
        };
    }
    
    // Update the Create Swarm UI when configuration changes
    function updateCreateSwarmUI() {
        // Reset the Create Swarm button if there's no active placement
        const activeSwarm = ParticleSystem.getActiveSwarmPlacement();
        const createButton = document.getElementById('createSwarmButton');
        
        if (createButton) {
            createButton.textContent = activeSwarm ? "Confirm Placement" : "Create Swarm";
            
            // Update TouchHandler swarm placement mode
            TouchHandler.setSwarmPlacementMode(!!activeSwarm, activeSwarm ? activeSwarm.id : null);
        }
    }
    
    // Update the list of active swarms
    function updateSwarmList() {
        const swarmList = document.getElementById('swarmList');
        if (!swarmList) return;
        
        // Get the current swarms
        const swarms = ParticleSystem.getZotSwarms();
        
        // Clear the list
        swarmList.innerHTML = '';
        
        // If no swarms, show message
        if (swarms.length === 0) {
            swarmList.innerHTML = '<div class="swarm-list-item"><span>No swarms created yet</span></div>';
            return;
        }
        
        // Add each swarm to the list
        swarms.forEach(swarm => {
            const swarmItem = document.createElement('div');
            swarmItem.className = 'swarm-list-item';
            
            const colorThemeName = Presets.colorThemes[swarm.settings.colorTheme]?.name || 'Custom';
            
            swarmItem.innerHTML = `
                <span>${colorThemeName} Swarm (${swarm.zotCount} zots)</span>
                <button class="remove-swarm" data-id="${swarm.id}">Remove</button>
            `;
            
            swarmList.appendChild(swarmItem);
        });
        
        // Add event listeners to remove buttons
        const removeButtons = swarmList.querySelectorAll('.remove-swarm');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const swarmId = this.getAttribute('data-id');
                if (swarmId) {
                    ParticleSystem.removeZotSwarm(swarmId);
                    updateSwarmList();
                }
            });
        });
    }
    
    // Update all UI values to match current settings
    function updateAllUIValues() {
        // Set Orbie parameter values
        document.getElementById('orbieSize').value = ParticleSystem.getOrbieSettings().size || 12;
        document.getElementById('orbieSizeValue').textContent = parseFloat(document.getElementById('orbieSize').value).toFixed(1);
        
        document.getElementById('orbieGlowSize').value = ParticleSystem.getOrbieSettings().glowSize || 3;
        document.getElementById('orbieGlowSizeValue').textContent = parseFloat(document.getElementById('orbieGlowSize').value).toFixed(1);
        
        document.getElementById('orbieGlowOpacity').value = ParticleSystem.getOrbieSettings().glowOpacity || 0.7;
        document.getElementById('orbieGlowOpacityValue').textContent = parseFloat(document.getElementById('orbieGlowOpacity').value).toFixed(2);
        
        document.getElementById('orbiePulseSpeed').value = ParticleSystem.getOrbieSettings().pulseSpeed || 0.05;
        document.getElementById('orbiePulseSpeedValue').textContent = parseFloat(document.getElementById('orbiePulseSpeed').value).toFixed(2);
        
        document.getElementById('orbiePulseIntensity').value = ParticleSystem.getOrbieSettings().pulseIntensity || 0.4;
        document.getElementById('orbiePulseIntensityValue').textContent = parseFloat(document.getElementById('orbiePulseIntensity').value).toFixed(2);
        
        document.getElementById('orbieInfluenceRadius').value = ParticleSystem.getOrbieSettings().influenceRadius || 100;
        document.getElementById('orbieInfluenceRadiusValue').textContent = parseFloat(document.getElementById('orbieInfluenceRadius').value).toFixed(0);
        
        document.getElementById('orbieInfluenceIntensity').value = ParticleSystem.getOrbieSettings().influenceIntensity || 0.5;
        document.getElementById('orbieInfluenceIntensityValue').textContent = parseFloat(document.getElementById('orbieInfluenceIntensity').value).toFixed(2);
        
        document.getElementById('orbieTouchMultiplier').value = ParticleSystem.getOrbieSettings().touchMultiplier || 0.15;
        document.getElementById('orbieTouchMultiplierValue').textContent = parseFloat(document.getElementById('orbieTouchMultiplier').value).toFixed(2);
        
        // Set OrbieSwarm parameter values
        // ... (existing code)
        
        // Set Forces parameter values
        document.getElementById('touchForce').value = ParticleSystem.getForceSettingValue('touchForce') || 3;
        document.getElementById('touchForceValue').textContent = parseFloat(document.getElementById('touchForce').value).toFixed(1);
        
        document.getElementById('wallForce').value = ParticleSystem.getForceSettingValue('wallForce') || 1;
        document.getElementById('wallForceValue').textContent = parseFloat(document.getElementById('wallForce').value).toFixed(1);
        
        // Set ZotTouchEnabled checkbox
        const zotTouchEnabled = document.getElementById('zotTouchEnabled');
        if (zotTouchEnabled) {
            zotTouchEnabled.checked = ParticleSystem.getForceSettingValue('zotTouchEnabled') !== false;
        }
        
        // Set ZotSwarmInteractionEnabled checkbox
        const zotSwarmInteractionEnabled = document.getElementById('zotSwarmInteractionEnabled');
        if (zotSwarmInteractionEnabled) {
            zotSwarmInteractionEnabled.checked = ParticleSystem.getForceSettingValue('zotSwarmInteractionEnabled') !== false;
        }
        
        // Update swarm list
        updateSwarmList();
        
        // Update create swarm UI
        updateCreateSwarmUI();
    }
    
    // Setup wall-related controls
    function setupWallControls() {
        const wallForceSlider = document.getElementById('wallsForce');
        if (wallForceSlider) {
            setupRangeInput('wallsForce', function(value) {
                WallSystem.updateSettings({ wallForce: parseFloat(value) });
            });
        }
        
        const wallPerceptionSlider = document.getElementById('wallPerception');
        if (wallPerceptionSlider) {
            setupRangeInput('wallPerception', function(value) {
                WallSystem.updateSettings({ wallPerception: parseFloat(value) });
            });
        }
        
        const loadWallsButton = document.getElementById('loadWallsButton');
        if (loadWallsButton) {
            loadWallsButton.addEventListener('click', function() {
                // Create file input dynamically
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.svg';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);
                
                fileInput.addEventListener('change', function(e) {
                    if (e.target.files.length > 0) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        
                        reader.onload = function(event) {
                            const svgText = event.target.result;
                            const wallCount = WallSystem.loadFromSVG(svgText);
                            console.log(`Loaded ${wallCount} wall segments from SVG`);
                        };
                        
                        reader.readAsText(file);
                    }
                    
                    // Clean up
                    document.body.removeChild(fileInput);
                });
                
                fileInput.click();
            });
        }
        
        const clearWallsButton = document.getElementById('clearWallsButton');
        if (clearWallsButton) {
            clearWallsButton.addEventListener('click', function() {
                WallSystem.clearWalls();
            });
        }
    }
});

// Initialize the simulation
function initializeSimulation() {
    // ... existing code ...
    
    try {
        console.log("Starting MenuSystem initialization...");
        menuSystem = new MenuSystem({
            containerElement: document.getElementById('simulation-container')
        });
        console.log("MenuSystem initialized successfully.");
    } catch (error) {
        console.error("Error initializing MenuSystem:", error);
    }
    
    // Initialize particle system with entity type identifiers
    try {
        console.log("Starting ParticleSystem initialization...");
        particleSystem = new ParticleSystem({
            canvasElement: document.getElementById('simulation-canvas'),
            // Other configuration parameters
        });
        
        // Add entity type identifiers for wall interaction
        particleSystem.addEntityTypeIdentifiers = function() {
            this.particles.forEach(particle => {
                // Default is a regular zot
                particle.isOrbie = false;
                particle.isOrbieSwarm = false;
                particle.isZotSwarm = false;
                
                // Identify Orbie
                if (particle.type === 'orbie') {
                    particle.isOrbie = true;
                }
                // Identify Orbie Swarm
                else if (particle.type === 'orbieSwarm') {
                    particle.isOrbieSwarm = true;
                }
                // Identify Zot Swarm
                else if (particle.type === 'zotSwarm') {
                    particle.isZotSwarm = true;
                }
            });
        };
        
        // Override the update method to add entity identifiers before physics
        const originalUpdate = particleSystem.update.bind(particleSystem);
        particleSystem.update = function(deltaTime) {
            // Add entity identifiers
            this.addEntityTypeIdentifiers();
            // Call the original update method
            return originalUpdate(deltaTime);
        };
        
        console.log("ParticleSystem initialized successfully with entity type identifiers");
    } catch (error) {
        console.error("Error initializing ParticleSystem:", error);
    }
    
    // ... existing code ...
}

