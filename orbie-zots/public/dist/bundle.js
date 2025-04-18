/**
 * Orbie Zots - Particle Swarm Simulation
 * Copyright (c) 2025
 * Built: 2025-04-16T02:05:34.506Z
 */

// config.js - Environment-specific configuration
const Config = (function() {
    // Environment detection
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';

    // Get base path - handles GitHub Pages and other hosting environments
    const getBasePath = function() {
        if (isLocal) {
            return './music/';  // Use relative path from the web root
        } else {
            // Check if we're on GitHub Pages or another hosting platform
            const path = window.location.pathname;
            // If we're at the root or a direct path, use relative path
            if (path === '/' || path.indexOf('.html') > -1) {
                return './music/';
            } else {
                // For deeper paths or subdirectories, ensure we go to the right place
                return './music/';
            }
        }
    };

    const basePath = getBasePath();

    // Audio paths
    const audioPaths = {
        // Original demo songs
        demoIntro: `${basePath}DemoIntro.mp3`,
        demoPulse: `${basePath}DemoPulse.mp3`,
        demoOrchestra: `${basePath}DemoOrchestra.mp3`,
        demoDubstep: `${basePath}DemoDubstep.mp3`,
        demoGlassandi: `${basePath}DemoGlassandi.mp3`,
        demoSlides: `${basePath}DemoSlides.mp3`,
        demoIntroV1: `${basePath}DemoIntro.v1.mp3`,
        
        // Additional music files
        eightBit: `${basePath}8-Bit.mp3`,
        arabianstep: `${basePath}Arabianstep.mp3`,
        ballroomWaltzDubstep: `${basePath}Ballroom_Waltz_Dubstep.mp3`,
        creepyForestCreatures: `${basePath}Creepy_Forest_Creatures_-_Xylophone_Bells.mp3`,
        digestiveSystem: `${basePath}Digestive_System.mp3`,
        egyptianFlamenco: `${basePath}Egyptian_Flamenco.mp3`,
        electricMerengue: `${basePath}Electric_Merengue.mp3`,
        epicExpanse: `${basePath}Epic_Expanse.mp3`,
        expansiveOpenPlains: `${basePath}Expansive_Open_Plains_-_Varying_Instruments.mp3`,
        footStompingFingerSnapping: `${basePath}Foot_Stomping_Finger_Snapping.mp3`,
        indianSitarNativeAmerican: `${basePath}Indian_Sitar_Native_American.mp3`,
        intenseChase: `${basePath}Intense_Chase.mp3`,
        liquidEphemeral: `${basePath}Liquid_Ephemeral.mp3`,
        monophonicPiano: `${basePath}Monophonic_Piano.mp3`,
        oldWesternSaloon: `${basePath}old_western_saloon.mp3`,
        ominousSuspense: `${basePath}Ominous_Suspense.mp3`,
        rancherSpaghettiWestern: `${basePath}Rancher_Spaghetti_Western.mp3`,
        zeldaDungeon: `${basePath}Zelda_Dungeon.mp3`
    };

    // Public API
    return {
        getAudioPath: function(key) {
            return audioPaths[key];
        },
        isLocal: isLocal,
        // Get all demo song keys except intro
        getDemoSongKeys: function() {
            return Object.keys(audioPaths).filter(key => key !== 'demoIntro');
        }
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Config;
} 

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
        },
        
        // Monochrome theme - grayscale only
        mono: function() {
            // Pure grayscale with varying brightness
            const brightness = 20 + Math.random() * 80; // 20-100% brightness range
            return `hsl(0, 0%, ${brightness}%)`;
        },
        
        // Bumble theme - yellow-gold and greys
        bumble: function() {
            // 50% chance for yellow-gold colors, 50% chance for greys
            if (Math.random() < 0.5) {
                // Yellow to gold gradient (hue range 40-55)
                const hue = 40 + Math.random() * 15; // Yellow to gold hue range
                const saturation = 70 + Math.random() * 30; // High saturation
                const lightness = 50 + Math.random() * 40; // Medium to bright
                return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            } else {
                // Grey to light black (very dark grey)
                const lightness = 10 + Math.random() * 40; // Dark to medium greys (10-50%)
                return `hsl(0, 0%, ${lightness}%)`;
            }
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
        torrential: {
            name: "Torrential",
            zotCount: 25,
            speed: 6,
            separation: 1,
            alignment: 0.25,
            cohesion: 2,
            perception: 50,
            trailLength: 0,
            colorTheme: 'blue',  // Default color theme for this preset
            opacity: 1.0
        },
        murmuration: {
            name: "Bird Flock",
            zotCount: 25,
            speed: 5,
            separation: 0.3,
            alignment: .25,
            cohesion: 2.5,
            perception: 75,
            trailLength: 0,
            colorTheme: 'rainbow',  // Default color theme for this preset
            opacity: 0.8
        },
        lavaLamp: {
            name: "Lava Lamp",
            zotCount: 25,
            speed: 2,
            separation: 0.1,
            alignment: 0.5,
            cohesion: 5,
            perception: 20,
            trailLength: 0,
            colorTheme: 'fire',  // Default color theme for this preset
            opacity: 0.9
        },
        cookingOil: {
            name: "Cooking Oil",
            zotCount: 25,
            speed: 2.5,
            separation: 0.2,
            alignment: 0.1,
            cohesion: 3,
            perception: 50,
            trailLength: 0,
            colorTheme: 'gold',  // Default color theme for this preset
            opacity: 0.7
        },
        jellyOrbs: {
            name: "Jelly Orbs",
            zotCount: 25,
            speed: 5,
            separation: 0.1,
            alignment: 0.1,
            cohesion: 5,
            perception: 100,
            trailLength: 0,
            colorTheme: 'green',  // Default color theme for this preset
            opacity: 0.6
        },
        bubble: {
            name: "Bubble",
            zotCount: 25,
            speed: 3,
            separation: 0.1,
            alignment: 0.1,
            cohesion: 5,
            perception: 200,
            trailLength: 0,
            colorTheme: 'sparkle',  // Default color theme for this preset
            opacity: 0.5
        },
        ringer: {
            name: "Ringer",
            zotCount: 25,
            speed: 3.5,
            separation: 0,
            alignment: -2,
            cohesion: 10,
            perception: 100,
            trailLength: 0,
            colorTheme: 'neon',  // Default color theme for this preset
            opacity: 0.85
        },
        fizzyPop: {
            name: "Fizzy Pop",
            zotCount: 25,
            speed: 2,
            separation: 0.1,
            alignment: 0,
            cohesion: 3.5,
            perception: 50,
            trailLength: 0,
            colorTheme: 'rainbow',  // Default color theme for this preset
            opacity: 0.75
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
        },
        colorblind: {
            name: "Colorblind-Friendly",
            getColor: function() {
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
        },
        bumble: {
            name: "Bumble",
            getColor: function() {
                // 50% chance for yellow-gold colors, 50% chance for greys
                if (Math.random() < 0.5) {
                    // Yellow to gold gradient (hue range 40-55)
                    const hue = 40 + Math.random() * 15; // Yellow to gold hue range
                    const saturation = 70 + Math.random() * 30; // High saturation
                    const lightness = 50 + Math.random() * 40; // Medium to bright
                    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                } else {
                    // Grey to light black (very dark grey)
                    const lightness = 10 + Math.random() * 40; // Dark to medium greys (10-50%)
                    return `hsl(0, 0%, ${lightness}%)`;
                }
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
            glowSize: 1.5,  // Multiplier of orbie size
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
            colorTheme: 'blue',
            opacity: 1.0
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
    let swipeModeActive = false;  // Track if we're in swipe mode
    let swipeStartX = 0;          // Starting X position of swipe
    let swipeStartY = 0;          // Starting Y position of swipe
    let swipeThreshold = 25;      // Minimum distance to trigger swipe detection
    let swipeDetected = false;    // Flag to indicate if swipe is detected
    
    // Callbacks for integration with particle system
    let callbacks = {
        onTouchStart: null,
        onTouchMove: null,
        onTouchEnd: null,
        onDoubleTap: null,
        isAttractMode: null
    };
    
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
            
            // Record the start position for swipe detection
            swipeStartX = x;
            swipeStartY = y;
            swipeDetected = false;
            
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
                    
                    // Update SwipeSplitSystem with new attract/repel mode
                    if (typeof SwipeSplitSystem !== 'undefined') {
                        const isAttract = callbacks.isAttractMode ? callbacks.isAttractMode() : false;
                        SwipeSplitSystem.setAttractMode(isAttract);
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
            
            // Initialize swipe path if SwipeSplitSystem is available
            if (typeof SwipeSplitSystem !== 'undefined') {
                // Set the current attract/repel mode
                const isAttract = callbacks.isAttractMode ? callbacks.isAttractMode() : false;
                SwipeSplitSystem.setAttractMode(isAttract);
                SwipeSplitSystem.startSwipePath(x, y);
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
            
            // Check for swipe
            if (!swipeDetected) {
                const dx = x - swipeStartX;
                const dy = y - swipeStartY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > swipeThreshold) {
                    swipeDetected = true;
                    // console.log("Swipe detected");
                }
            }
            
            // Continue updating swipe path if SwipeSplitSystem is available
            if (swipeDetected && typeof SwipeSplitSystem !== 'undefined') {
                SwipeSplitSystem.addPointToSwipePath(x, y);
            }
            
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
        
        // End swipe path if SwipeSplitSystem is available
        if (swipeDetected && typeof SwipeSplitSystem !== 'undefined') {
            SwipeSplitSystem.endSwipePath();
        }
        
        touchActive = false;
        swipeDetected = false;
        
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
            
            // Initialize the SwipeSplitSystem with the current mode if available
            if (typeof SwipeSplitSystem !== 'undefined') {
                const isAttract = callbacks.isAttractMode ? callbacks.isAttractMode() : false;
                SwipeSplitSystem.setAttractMode(isAttract);
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
        updateWallSettings: null,
        loadWallSVG: null  // Add new callback for loading SVG files
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
        
        // Setup dual range sliders for min/max values
        setupRangeSliders();
        
        // Set initial home button visibility based on menu state
        updateHomeButtonVisibility();
        
        isMenuInitialized = true;
    }
    
    // Setup menu toggle button
    function setupMenuToggle() {
        if (menuToggle && controlsPanel) {
            // Handle click for desktop
            menuToggle.addEventListener('click', function(e) {
                e.preventDefault();
                controlsPanel.classList.toggle('collapsed');
                updateHomeButtonVisibility();
            });
            
            // Handle touch for mobile - fixed to use touchstart instead of touchend
            menuToggle.addEventListener('touchstart', function(e) {
                e.preventDefault();
                controlsPanel.classList.toggle('collapsed');
                updateHomeButtonVisibility();
                e.stopPropagation();
            }, { passive: false });
            
            // Close menu when clicking/touching outside
            document.addEventListener('touchend', function(e) {
                if (!controlsPanel.classList.contains('collapsed') && 
                    !controlsPanel.contains(e.target) && 
                    e.target !== menuToggle) {
                    controlsPanel.classList.add('collapsed');
                    updateHomeButtonVisibility();
                }
            });
            
            document.addEventListener('click', function(e) {
                if (!controlsPanel.classList.contains('collapsed') && 
                    !controlsPanel.contains(e.target) && 
                    e.target !== menuToggle) {
                    controlsPanel.classList.add('collapsed');
                    updateHomeButtonVisibility();
                }
            });
        }
    }
    
    // Helper function to update home button visibility
    function updateHomeButtonVisibility() {
        const homeButton = document.getElementById('homeButton');
        if (homeButton) {
            if (controlsPanel.classList.contains('collapsed')) {
                homeButton.classList.add('visible');
            } else {
                homeButton.classList.remove('visible');
            }
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
        // Orbie toggle
        const orbieEnabled = document.getElementById('orbieEnabled');
        if (orbieEnabled && callbacks.updateOrbieSettings) {
            // Initialize from settings if possible
            if (typeof ParticleSystem !== 'undefined' && ParticleSystem.getOrbieSettings) {
                const settings = ParticleSystem.getOrbieSettings();
                orbieEnabled.checked = settings.enabled !== false; // Default to true if not set
            } else {
                orbieEnabled.checked = true; // Default to true if ParticleSystem isn't available
            }
            
            orbieEnabled.addEventListener('change', function() {
                orbieEnabled.checked = this.checked;
                callbacks.updateOrbieSettings('enabled', this.checked);
            });
        }
        
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
        
        // SwipeSplitSystem force controls
        if (typeof SwipeSplitSystem !== 'undefined') {
            // Get current settings to initialize UI elements
            const swipeSettings = SwipeSplitSystem.getSettings();
            
            // Force enable toggle
            const swipeForcesEnabled = document.getElementById('swipeForcesEnabled');
            if (swipeForcesEnabled) {
                // Initialize checkbox state from current settings
                swipeForcesEnabled.checked = swipeSettings.forceActive !== false;
                
                swipeForcesEnabled.addEventListener('change', function() {
                    SwipeSplitSystem.updateSettings({ forceActive: this.checked });
                });
            }
            
            // Range sliders for force parameters
            setupRangeInput('swipeForceRadius', value => {
                SwipeSplitSystem.updateSettings({ forceRadius: value });
            }, swipeSettings.forceRadius);
            
            setupRangeInput('swipeForceIntensity', value => {
                SwipeSplitSystem.updateSettings({ forceIntensity: value });
            }, swipeSettings.forceIntensity);
            
            // Separate controls for attract and repel multipliers
            setupRangeInput('swipeRepelMultiplier', value => {
                SwipeSplitSystem.updateSettings({ repelMultiplier: value });
            }, swipeSettings.repelMultiplier || 3.0);
            
            setupRangeInput('swipeAttractMultiplier', value => {
                SwipeSplitSystem.updateSettings({ attractMultiplier: value });
            }, swipeSettings.attractMultiplier || 0.2);
        }
        
        // Checkboxes for enabled/disabled features
        const zotTouchEnabled = document.getElementById('zotTouchEnabled');
        if (zotTouchEnabled) {
            zotTouchEnabled.addEventListener('change', function() {
                updateSetting('forces', 'zotTouchEnabled', this.checked);
            });
        }
        
        const zotSwarmInteractionEnabled = document.getElementById('zotSwarmInteractionEnabled');
        if (zotSwarmInteractionEnabled) {
            zotSwarmInteractionEnabled.addEventListener('change', function() {
                updateSetting('forces', 'zotSwarmInteractionEnabled', this.checked);
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

        // Setup Wall SVG selector
        setupWallSVGSelector();
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
    function setupRangeInput(id, changeCallback, initialValue) {
        const input = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Value');
        
        if (input && valueDisplay) {
            // Set initial value if provided
            if (initialValue !== undefined) {
                input.value = initialValue;
            }
            
            // Always show zot count, respect SliderControls.hideLabels for others
            if (id === 'newSwarmZotCount') {
                valueDisplay.textContent = parseFloat(input.value).toFixed(input.step.includes('.') ? 2 : 0);
                valueDisplay.style.display = '';  // Use default display
            } else {
                valueDisplay.textContent = parseFloat(input.value).toFixed(input.step.includes('.') ? 2 : 0);
                valueDisplay.style.display = window.SliderControls && window.SliderControls.hideLabels ? 'none' : '';
            }
            
            // Add event listeners for input changes
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                
                // Always update value text even if hidden
                valueDisplay.textContent = value.toFixed(this.step.includes('.') ? 2 : 0);
                
                // For non-zot-count sliders, respect the hideLabels setting
                if (id !== 'newSwarmZotCount' && window.SliderControls) {
                    valueDisplay.style.display = window.SliderControls.hideLabels ? 'none' : '';
                }
                
                // Call the callback with the new value
                if (changeCallback) {
                    changeCallback(value);
                }
            });
        }
    }
    
    // Setup Wall SVG selector
    function setupWallSVGSelector() {
        const wallSVGSelector = document.getElementById('wallSVG');
        if (wallSVGSelector && callbacks.loadWallSVG) {
            // Populate the dropdown with SVG files from the repository
            fetchSVGFiles(wallSVGSelector);
            
            // Add event listener for selection change
            wallSVGSelector.addEventListener('change', function() {
                if (this.value && callbacks.loadWallSVG) {
                    callbacks.loadWallSVG(this.value);
                }
            });
        }
    }
    
    // Fetch SVG files from the repository
    function fetchSVGFiles(selectElement) {
        // Clear existing options
        selectElement.innerHTML = '';
        
        // Add a placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = 'Select a wall design...';
        placeholderOption.selected = true;
        selectElement.appendChild(placeholderOption);
        
        // Known SVG files in the public directory
        const svgFiles = [
            { name: 'Sample Walls', path: './sample-walls.svg' },
            { name: 'Sample Walls with Curves', path: './sample-walls-curves.svg' },
            { name: 'Curves Sample', path: './curves-sample.svg' },
            { name: 'Maze', path: './maze_20250329_060553.svg' }
        ];
        
        // Add options for each SVG file
        svgFiles.forEach(file => {
            const option = document.createElement('option');
            option.value = file.path;
            option.textContent = file.name;
            selectElement.appendChild(option);
        });
    }
    
    function setupRangeSliders() {
        const minSlider = document.getElementById('newSwarmMinSize');
        const maxSlider = document.getElementById('newSwarmMaxSize');
        const minValue = document.getElementById('newSwarmMinSizeValue');
        const maxValue = document.getElementById('newSwarmMaxSizeValue');

        if (minSlider && maxSlider && minValue && maxValue) {
            // Set initial values with respect to hideLabels setting
            minValue.textContent = parseFloat(minSlider.value).toFixed(1);
            maxValue.textContent = parseFloat(maxSlider.value).toFixed(1);
            
            // Apply visibility based on SliderControls
            const hideLabels = window.SliderControls ? window.SliderControls.hideLabels : true;
            minValue.style.display = hideLabels ? 'none' : '';
            maxValue.style.display = hideLabels ? 'none' : '';
            
            minSlider.addEventListener('input', function() {
                if (parseFloat(this.value) > parseFloat(maxSlider.value)) {
                    this.value = maxSlider.value;
                }
                // Always update the content even if hidden
                minValue.textContent = parseFloat(this.value).toFixed(1);
            });

            maxSlider.addEventListener('input', function() {
                if (parseFloat(this.value) < parseFloat(minSlider.value)) {
                    this.value = minSlider.value;
                }
                // Always update the content even if hidden
                maxValue.textContent = parseFloat(this.value).toFixed(1);
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

// Add this to any cleanup function or window unload event
function cleanupAudio() {
    if (demoAudio) {
        demoAudio.pause();
        demoAudio.src = '';
        demoAudio.load();
        demoAudio = null;
    }
    
    if (audioContext) {
        audioContext.close().catch(e => {
            // console.error('Error closing AudioContext:', e);
        });
    }
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
    let zotsCounterDisplay; // Add Zots counter display element
    
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
        glowOpacity: 0.2, // Base opacity for the glow
        pulseSpeed: 0.05,
        pulseIntensity: 0.4,
        influenceRadius: 100,
        influenceIntensity: 0.05, // How strongly Orbie influences particles within its radius
        touchMultiplier: 0.15,
        enabled: true  // Whether Orbie is visible and active
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
        // console.log("Initializing Orbie at position:", width/2, height/2);
        orbie = {
            x: width / 2, // Center of screen
            y: height / 2, // Center of screen
            vx: 0,
            vy: 0,
            color: orbieSettings.color,
            size: orbieSettings.size,
            glowSize: orbieSettings.size * orbieSettings.glowSize,
            glowColor: orbieSettings.glowColor || 'rgba(255, 215, 0, 0.6)', // Ensure glowColor is set
            glowOpacity: orbieSettings.glowOpacity,
            pulseSpeed: orbieSettings.pulseSpeed,
            pulseIntensity: orbieSettings.pulseIntensity,
            history: []
        };
        
        // Confirm all required properties are set
        // console.log("Orbie initialized with: ", 
        //     "color:", orbie.color, 
        //     "size:", orbie.size, 
        //     "glowSize:", orbie.glowSize,
        //     "glowColor:", orbie.glowColor,
        //     "glowOpacity:", orbie.glowOpacity
        // );
    }
    
    // Create a new ZotSwarm
    function createZotSwarm(config) {
        // console.log("Creating new zot swarm with config:", config);
        
        // Get a unique ID for this swarm
        const swarmId = generateSwarmId();
        
        // Set default center position if not specified
        const centerX = config.centerX !== undefined ? config.centerX : canvas.width / 2;
        const centerY = config.centerY !== undefined ? config.centerY : canvas.height / 2;
        
        // Create a copy of config to store settings and add isRandomized property
        const settings = {...config};
        
        // Create the swarm object with settings
        const swarm = {
            id: swarmId,
            zotCount: config.zotCount || 25,
            zots: [],
            settings: settings,
            originalSettings: {...settings}, // Store original settings to revert to when leaving Orbie's influence
            inOrbieInfluence: false // Track if this swarm is in Orbie's influence
        };
        
        // Get the color generator function
        const getColor = Presets.colorThemes[config.colorTheme]?.getColor || 
                        Presets.colorThemes.blue.getColor;
        
        // Generate particles for this swarm
        for (let i = 0; i < config.zotCount; i++) {
            const zot = {
                x: centerX + (Math.random() * 100 - 50), // Cluster around center
                y: centerY + (Math.random() * 100 - 50), // Cluster around center
                vx: (Math.random() * 2 - 1) * (config.speed || 2),
                vy: (Math.random() * 2 - 1) * (config.speed || 2),
                size: config.minSize + Math.random() * (config.maxSize - config.minSize),
                color: getColor(),
                opacity: config.opacity !== undefined ? config.opacity : 1.0,
                history: [],
                inOrbieSwarm: false,
                swarmId: swarm.id,
                fromGlobalTheme: false
            };
            
            swarm.zots.push(zot);
        }
        
        // console.log(`Created swarm with ID ${swarm.id} containing ${swarm.zots.length} zots`);
        
        // Add the new swarm to our collection
        zotSwarms.push(swarm);
        
        // Update zot counter
        updateZotsCounter();
        
        return swarm.id;
    }
    
    // Update an existing ZotSwarm with new parameters
    function updateZotSwarm(swarmId, config) {
        // Find the swarm with the given ID
        const swarmIndex = zotSwarms.findIndex(swarm => swarm.id === swarmId);
        if (swarmIndex === -1) {
            // console.error(`Swarm with ID ${swarmId} not found`);
            return false;
        }
        
        const swarm = zotSwarms[swarmIndex];
        
        // Backup current particle positions and velocities
        const particleState = swarm.zots.map(zot => ({
            x: zot.x,
            y: zot.y,
            vx: zot.vx,
            vy: zot.vy
        }));
        
        // Update the swarm settings
        swarm.settings = { ...swarm.settings, ...config };
        swarm.originalSettings = { ...swarm.settings }; // Update original settings too
        
        // Set up color generator function
        const colorTheme = config.colorTheme || swarm.settings.colorTheme;
        const getColor = Presets.colorThemes[colorTheme]?.getColor || 
                        Presets.colorThemes.blue.getColor;
        
        // Handle particle count changes if needed
        const currentCount = swarm.zots.length;
        const targetCount = config.zotCount || currentCount;
        
        if (targetCount > currentCount) {
            // Add new particles
            for (let i = 0; i < targetCount - currentCount; i++) {
                // Try to add new particles near existing ones to avoid visual jumps
                const sourceIndex = Math.floor(Math.random() * currentCount);
                const sourceParticle = particleState[sourceIndex] || { 
                    x: width / 2, 
                    y: height / 2 
                };
                
                swarm.zots.push({
                    x: sourceParticle.x + (Math.random() * 100 - 50),
                    y: sourceParticle.y + (Math.random() * 100 - 50),
                    vx: (Math.random() * 2 - 1) * swarm.settings.speed,
                    vy: (Math.random() * 2 - 1) * swarm.settings.speed,
                    color: getColor(),
                    opacity: swarm.settings.opacity !== undefined ? swarm.settings.opacity : 1.0,
                    size: swarm.settings.minSize + Math.random() * (swarm.settings.maxSize - swarm.settings.minSize),
                    history: [],
                    inOrbieSwarm: false,
                    swarmId: swarm.id
                });
            }
        } else if (targetCount < currentCount) {
            // Remove excess particles
            swarm.zots = swarm.zots.slice(0, targetCount);
        }
        
        // Update existing particles with new properties
        for (let i = 0; i < targetCount && i < currentCount; i++) {
            const zot = swarm.zots[i];
            
            // Keep position and velocity from before
            zot.x = particleState[i].x;
            zot.y = particleState[i].y;
            zot.vx = particleState[i].vx;
            zot.vy = particleState[i].vy;
            
            // Update color if colorTheme changed
            if (config.colorTheme) {
                zot.color = getColor();
            }
            
            // Update opacity if changed
            if (config.opacity !== undefined) {
                zot.opacity = config.opacity;
            }
            
            // Update size if size range changed
            if (config.minSize !== undefined || config.maxSize !== undefined) {
                const minSize = config.minSize !== undefined ? config.minSize : swarm.settings.minSize;
                const maxSize = config.maxSize !== undefined ? config.maxSize : swarm.settings.maxSize;
                zot.size = minSize + Math.random() * (maxSize - minSize);
            }
        }
        
        return true;
    }
    
    // Create a letter indicator for new swarm placement
    function createSwarmPlacementIndicator(preset) {
        // This function has been removed as it's no longer needed
        return null;
    }
    
    // Create a swarm at the letter indicator position
    function confirmSwarmPlacement(config) {
        // This function is removed as part of removing confirm placement logic
        return null;
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
    
    // Remove all zot swarms
    function removeAllZotSwarms() {
        if (zotSwarms.length > 0) {
            zotSwarms = [];
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
        // Regular preset handling
        const preset = Presets.swarmPresets[presetName];
        if (!preset) return null;
        
        return {
            ...Presets.defaults.zotSwarm,
            ...preset
        };
    }
    
    // Get a random color theme from available themes
    function getRandomColorTheme() {
        const themes = Object.keys(Presets.colorThemes);
        return themes[Math.floor(Math.random() * themes.length)];
    }
    
    // Update all particles in the system
    function updateParticles() {
        // Update Orbie if enabled
        if (orbie && orbieSettings.enabled) {
            // Update Orbie's pulse effect only if pulseSpeed is not zero
            if (orbieSettings.pulseSpeed > 0) {
                orbiePulsePhase += orbieSettings.pulseSpeed;
                if (orbiePulsePhase > Math.PI * 2) {
                    orbiePulsePhase = 0;
                }
            }
            
            // Store previous position for wall collision
            const prevX = orbie.x;
            const prevY = orbie.y;
            
            // Apply touch force to Orbie
            if (touch.active) {
                const dx = touch.x - orbie.x;
                const dy = touch.y - orbie.y;
                const distSq = dx * dx + dy * dy;
                const maxDistSq = orbieSettings.influenceRadius * orbieSettings.influenceRadius;
                
                // Only apply force if within influence radius and not too close
                if (distSq > 1 && distSq < maxDistSq) {
                    const dist = Math.sqrt(distSq);
                    const force = touch.attract ? 
                        forceSettings.touchForce * orbieSettings.touchMultiplier :
                        -forceSettings.touchForce * orbieSettings.touchMultiplier;
                    
                    // Scale force by distance (stronger when closer)
                    const scaledForce = force * (1 - dist / orbieSettings.influenceRadius);
                    
                    // Normalize direction vector and apply force
                    orbie.vx += (dx / dist) * scaledForce;
                    orbie.vy += (dy / dist) * scaledForce;
                }
            }
            
            // Apply drag to Orbie's movement
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
            // Only apply influence if Orbie is enabled
            swarm.inOrbieInfluence = orbieSettings.enabled && (particlesInInfluence / swarm.zots.length) > 0.3;
            
            // If just left Orbie's influence, restore original settings
            if (wasInInfluence && !swarm.inOrbieInfluence) {
                // Restore original settings
                swarm.settings = {...swarm.originalSettings};
            }
        });
    }
    
    // Update a group of particles based on their settings
    function updateParticleGroup(particles, settings) {
        // Get current theme for color updates
        const currentTheme = ColorThemes.getCurrentTheme();
        const sparkleUpdateRate = 0.1; // Rate at which sparkle theme refreshes colors (increased for more visible effect)
        
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
            // Only consider particles to be in Orbie's influence if Orbie is enabled
            particle.inOrbieSwarm = orbieSettings.enabled && distanceToOrbie < orbieSettings.influenceRadius;
            
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
            } else if (currentTheme === 'sparkle' && Math.random() < sparkleUpdateRate) {
                // Only apply the sparkle effect to background particles (not to swarm zots)
                // or if this is a zot swarm that uses the 'sparkle' theme
                const isBackgroundParticle = particles === backgroundParticles;
                const isSparkleTheme = particle.swarmId && 
                    zotSwarms.find(s => s.id === particle.swarmId)?.settings.colorTheme === 'sparkle';
                
                if (isBackgroundParticle || isSparkleTheme) {
                    particle.color = ColorThemes.getColor();
                }
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
            if (particle.inOrbieSwarm && orbieSettings.influenceIntensity > 0 && orbieSettings.enabled) {
                // Apply force towards Orbie based on influenceIntensity
                particle.vx += (orbie.x - particle.x) * orbieSettings.influenceIntensity;
                particle.vy += (orbie.y - particle.y) * orbieSettings.influenceIntensity;
            }
            
            // Apply touch force if active AND (particle is in Orbie's swarm OR zot touch is enabled)
            if (touch.active && (particle.inOrbieSwarm || forceSettings.zotTouchEnabled)) {
                const dx = particle.x - touch.x;
                const dy = particle.y - touch.y;
                const distSq = dx * dx + dy * dy;
                const maxDistSq = orbieSettings.influenceRadius * orbieSettings.influenceRadius;
                
                if (distSq < maxDistSq) {
                    const distance = Math.sqrt(distSq);
                    const force = ((orbieSettings.influenceRadius - distance) / orbieSettings.influenceRadius) * forceSettings.touchForce;
                    
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
            
            // Apply SwipeSplitSystem forces if active
            if (typeof SwipeSplitSystem !== 'undefined' && SwipeSplitSystem.isSwipeActive()) {
                const swipeForces = SwipeSplitSystem.applyForces(particle);
                if (swipeForces.fx !== 0 || swipeForces.fy !== 0) {
                    particle.vx += swipeForces.fx;
                    particle.vy += swipeForces.fy;
                }
            }
            
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
        
        // Draw SwipeSplitSystem lines if available
        if (typeof SwipeSplitSystem !== 'undefined') {
            SwipeSplitSystem.draw();
        }
        
        // Draw background particles
        drawParticleGroup(backgroundParticles);
        
        // Draw all ZotSwarms
        zotSwarms.forEach(swarm => {
            drawParticleGroup(swarm.zots);
        });
        
        // Draw Orbie (our main character) if enabled
        if (orbie && orbieSettings.enabled) {
            try {
                // Ensure all required properties exist to prevent rendering errors
                if (!orbie.size) orbie.size = orbieSettings.size || 12;
                if (!orbie.glowSize) orbie.glowSize = orbie.size * (orbieSettings.glowSize || 3);
                if (!orbie.glowOpacity) orbie.glowOpacity = orbieSettings.glowOpacity || 0.2;
                if (!orbie.pulseSpeed) orbie.pulseSpeed = orbieSettings.pulseSpeed || 0.05;
                if (!orbie.pulseIntensity) orbie.pulseIntensity = orbieSettings.pulseIntensity || 0.4;
                
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
            } catch (e) {
                // console.error("Error rendering Orbie:", e);
                // console.log("Orbie state:", orbie);
                // console.log("orbieSettings:", orbieSettings);
            }
        }
    }
    
    // Draw a group of particles
    function drawParticleGroup(particles) {
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            
            // Set color based on whether particle is in Orbie's swarm and apply opacity
            let particleColor;
            
            if (particle.inOrbieSwarm) {
                // For particles in Orbie's swarm, apply slight transparency
                particleColor = particle.color.replace('hsl', 'hsla').replace(')', ', 0.9)');
            } else {
                // Apply the particle's custom opacity
                const opacity = particle.opacity !== undefined ? particle.opacity : 1.0;
                
                // Check if the color is already in hsla format
                if (particle.color.includes('hsla')) {
                    // Replace the existing alpha value
                    particleColor = particle.color.replace(/,[^,]*\)$/, `, ${opacity})`);
                } else if (particle.color.includes('hsl')) {
                    // Convert hsl to hsla
                    particleColor = particle.color.replace('hsl', 'hsla').replace(')', `, ${opacity})`);
                } else if (particle.color.includes('rgba')) {
                    // Replace the existing alpha value in rgba
                    particleColor = particle.color.replace(/,[^,]*\)$/, `, ${opacity})`);
                } else if (particle.color.includes('rgb')) {
                    // Convert rgb to rgba
                    particleColor = particle.color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
                } else {
                    // For any other color format, just use it as is
                    particleColor = particle.color;
                }
            }
            
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
            
            // Update Zots counter
            updateZotsCounter();
            
            frameCount = 0;
            lastTime = timestamp;
        }
        
        // Update and draw particles
        updateParticles();
        drawParticles();
    }
    
    // Count and update the Zots counter
    function updateZotsCounter() {
        let totalZots = 0;
        
        // Count zots in all swarms
        for (let i = 0; i < zotSwarms.length; i++) {
            if (zotSwarms[i] && zotSwarms[i].zots) {
                totalZots += zotSwarms[i].zots.length;
            }
        }
        
        // Count background particles if they're considered zots
        totalZots += backgroundParticles.length;
        
        // Update the counter display
        if (zotsCounterDisplay) {
            zotsCounterDisplay.textContent = `Zots: ${totalZots}`;
        }
    }
    
    // Initialize everything
    function init() {
        // Load default settings from Presets
        orbieSettings = JSON.parse(JSON.stringify(Presets.defaults.orbie));
        
        // Ensure glowOpacity has a default if it's missing from presets
        if (orbieSettings.glowOpacity === undefined) {
            orbieSettings.glowOpacity = 0.2;
        }
        
        // Ensure glowColor has a default if it's missing
        if (orbieSettings.glowColor === undefined) {
            orbieSettings.glowColor = 'rgba(255, 215, 0, 0.6)';
        }
        
        // Ensure enabled property is false by default
        orbieSettings.enabled = false;
        
        orbieSwarmSettings = {...Presets.defaults.orbieSwarm};
        forceSettings = {...Presets.defaults.forces};
        
        // Initialize canvas dimensions
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        
        // Reset mouse position
        touch.x = width / 2;
        touch.y = height / 2;
        
        // Clear particles arrays
        backgroundParticles = [];
        zotSwarms = [];
        
        // Reset Orbie pulse effect phase
        orbiePulsePhase = 0;
        
        // Initialize Orbie
        initOrbie();
        
        // console.log("Orbie initialized:", orbie, "Enabled:", orbieSettings.enabled);
        
        // Create background particles
        initBackgroundParticles();
        
        // Start animation
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Add new getter methods for force settings
    function getForceSettings() {
        // Return a copy of the force settings object
        return { ...forceSettings };
    }
    
    function getForceSettingValue(setting) {
        // Return a specific force setting value
        if (forceSettings.hasOwnProperty(setting)) {
            return forceSettings[setting];
        }
        return undefined;
    }
    
    function updateForceSettings(setting, value) {
        // Update a specific force setting
        if (forceSettings.hasOwnProperty(setting)) {
            forceSettings[setting] = value;
            return true;
        }
        return false;
    }
    
    function updateSettings(category, setting, value) {
        // General method to update settings in different categories
        if (category === 'forces') {
            return updateForceSettings(setting, value);
        } else if (category === 'orbieSwarm') {
            if (orbieSwarmSettings.hasOwnProperty(setting)) {
                orbieSwarmSettings[setting] = value;
                return true;
            }
        } else if (category === 'orbie') {
            return updateOrbieSettings(setting, value);
        }
        return false;
    }
    
    // Get all zot swarms with their complete data
    function getZotSwarms() {
        // Create a copy with the data needed for saving
        return zotSwarms.map(swarm => {
            return {
                id: swarm.id,
                zotCount: swarm.zots.length,
                settings: { ...swarm.settings },
                particles: swarm.zots.map(zot => ({
                    x: zot.x,
                    y: zot.y,
                    size: zot.size,
                    color: zot.color,
                    vx: zot.vx,
                    vy: zot.vy
                }))
            };
        });
    }
    
    // Public API - only expose necessary methods
    return {
        init: function(canvasElement, fpsElement) {
            canvas = canvasElement;
            ctx = canvas.getContext('2d', { alpha: false });
            fpsDisplay = fpsElement;
            zotsCounterDisplay = document.getElementById('zotsCounter');
            
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
                const previousValue = orbieSettings[property];
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
                    } else if (property === 'enabled') {
                        // When enabling, ensure all visual properties are fully refreshed
                        if (value === true) {
                            // console.log("Enabling Orbie, refreshing all visual properties");
                            // Force a complete refresh of Orbie's properties
                            orbie.color = orbieSettings.color || 'rgba(255, 250, 230, 0.9)';
                            orbie.size = orbieSettings.size;
                            orbie.glowSize = orbie.size * orbieSettings.glowSize;
                            orbie.glowColor = orbieSettings.glowColor || 'rgba(255, 215, 0, 0.6)';
                            orbie.glowOpacity = orbieSettings.glowOpacity;
                            orbie.pulseSpeed = orbieSettings.pulseSpeed;
                            orbie.pulseIntensity = orbieSettings.pulseIntensity;
                        }
                    }
                    // No action needed for other properties as they're checked during update/draw
                }
            }
            
            // Log state after property change
            if (property === 'enabled') {
                // console.log("Orbie enabled:", orbieSettings.enabled);
                // console.log("Orbie properties:", orbie.color, orbie.size, orbie.glowColor, orbie.glowOpacity);
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
        
        // Methods for ZotSwarm management
        createZotSwarm: function(config) {
            return createZotSwarm(config);
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
            
            // Reset settings to defaults
            orbieSettings = JSON.parse(JSON.stringify(Presets.defaults.orbie));
            orbieSettings.enabled = false; // Match initial app state (Orbie disabled)
            orbieSwarmSettings = {...Presets.defaults.orbieSwarm};
            forceSettings = {...Presets.defaults.forces};
            
            // Update UI toggle to match settings
            const orbieEnabled = document.getElementById('orbieEnabled');
            if (orbieEnabled) {
                orbieEnabled.checked = false; // Match initial app state
            }
            
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
            
            // Sanity check for Orbie's visual properties
            // console.log("After reset - Orbie enabled:", orbieSettings.enabled);
            // console.log("After reset - Orbie visual properties:", 
            //     orbie.color, orbie.size, orbie.glowColor, orbie.glowOpacity, orbie.glowSize);
        },
        
        // Add a wall segment - wrapper for WallSystem
        addWall: function(x1, y1, x2, y2) {
            return WallSystem.addWall(x1, y1, x2, y2);
        },
        
        // Clear all walls - wrapper for WallSystem
        clearWalls: function() {
            WallSystem.clearWalls();
        },
        
        // Remove all zot swarms
        removeAllZotSwarms: function() {
            return removeAllZotSwarms();
        },
        
        // Update an existing ZotSwarm with new parameters
        updateZotSwarm: function(swarmId, config) {
            return updateZotSwarm(swarmId, config);
        },
        
        // Add new public methods for force settings access
        getForceSettings: getForceSettings,
        getForceSettingValue: getForceSettingValue,
        updateForceSettings: function(property, value) {
            if (property in forceSettings) {
                forceSettings[property] = value;
            }
        },
        updateSettings: function(group, property, value) {
            if (group === 'forces' && property in forceSettings) {
                forceSettings[property] = value;
            }
        },
        
        // Enhanced getZotSwarms method that includes particle data
        getZotSwarms: getZotSwarms
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
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
                // console.error("Error loading SVG file:", error);
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
        
        // Get wall settings for saving
        getWallSettings: function() {
            return {
                ...wallSettings,
                wallCount: walls.length
            };
        },
        
        // Export utility functions for external use
        utils: {
            distToSegment,
            normalToSegment,
            lineSegmentsIntersect
        }
    };
})(); 

// swipeSplitSystem.js - Handle swipe path drawing and effects
const SwipeSplitSystem = (function() {
    // Private variables
    let canvas;
    let ctx;
    let swipePaths = []; // Array to hold multiple swipe paths
    let activePathIndex = -1; // Index of the currently active path
    let pathWidth = 6;
    let isAttractMode = false; // Track if we're in attract (pull) or repel (push) mode
    
    // Force field parameters
    let forceRadius = 75;         // How far the force extends from the path
    let forceIntensity = 2;       // Base intensity of the force
    let attractMultiplier = 0.2;  // Multiplier for attract force strength
    let repelMultiplier = 3.0;    // Multiplier for repel force strength
    let forceDecayFactor = 0.98;  // How quickly force decays per frame
    let forceActive = true;       // Whether forces are active
    let baseDuration = 800;       // Base duration in milliseconds for path visibility (reduced from 3000)
    let decayDelay = 1000;        // Delay in ms before decay starts (1 second)
    
    // Path colors based on mode
    const pathColors = {
        attract: 'rgba(0, 150, 255, 0.8)',  // Blue for attract/pull
        repel: 'rgba(255, 100, 0, 0.8)'     // Orange for repel/push
    };
    let pathColor = pathColors.repel; // Default to repel color
    
    let lastPointTime = 0;
    let pointsAddedSinceDecay = 0;
    let pathCreationTime = 0;     // Time when the path was created
    
    // Settings for path decay
    let currentDecaySpeed = 0.01; // How quickly the path fades out (will be dynamically adjusted)
    const decayInterval = 16;     // Update interval in ms
    const minOpacity = 0.1;       // Minimum opacity while actively drawing
    
    // Calculate path duration based on force parameters
    function calculatePathDuration() {
        // Get current multiplier based on mode
        const modeMultiplier = isAttractMode ? attractMultiplier : repelMultiplier;
        
        // Original decay speed was 0.01 per 16ms interval
        const originalDecayRatePerSecond = 0.01 * (1000 / decayInterval);
        
        // Calculate a factor based on force parameters - now with much less influence
        // We're keeping a small influence but greatly reducing it
        const radiusFactor = 1.0 + (forceRadius / 50 - 1) * 0.15;       // 15% influence
        const intensityFactor = 1.0 + (forceIntensity / 0.8 - 1) * 0.15; // 15% influence
        const multiplierFactor = 1.0 + (modeMultiplier / 1.0 - 1) * 0.15; // 15% influence
        
        // Combined factor with extremely reduced impact
        const combinedFactor = Math.min(radiusFactor * intensityFactor * multiplierFactor, 1.5);
        
        // Cap the max duration to prevent extremely slow decay
        return Math.min(baseDuration * combinedFactor, 1200);
    }
    
    // Internal methods
    function drawPaths() {
        if (!ctx) return;
        
        // Draw each path
        swipePaths.forEach(path => {
            if (path.points.length < 2) return;
            
            ctx.save();
            
            // Set drawing properties
            ctx.globalAlpha = path.opacity;
            ctx.strokeStyle = path.color;
            ctx.lineWidth = pathWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // Begin path drawing
            ctx.beginPath();
            ctx.moveTo(path.points[0].x, path.points[0].y);
            
            // Draw path through all points
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i].x, path.points[i].y);
            }
            
            ctx.stroke();
            ctx.restore();
        });
    }
    
    // Create a decay timer for a specific path
    function startPathDecay(pathIndex, isFinalDecay = false) {
        const path = swipePaths[pathIndex];
        if (!path) return;
        
        // Clear any existing decay timer for this path
        if (path.decayTimer) {
            clearInterval(path.decayTimer);
        }
        
        // Calculate decay speed based on the path's properties
        const modeMultiplier = path.isAttract ? attractMultiplier : repelMultiplier;
        const radiusFactor = 1.0 + (forceRadius / 50 - 1) * 0.15;
        const intensityFactor = 1.0 + (forceIntensity / 0.8 - 1) * 0.15;
        const multiplierFactor = 1.0 + (modeMultiplier / 1.0 - 1) * 0.15;
        
        const combinedFactor = Math.min(radiusFactor * intensityFactor * multiplierFactor, 1.5);
        const pathDuration = Math.min(baseDuration * combinedFactor, 1200);
        const decaySpeed = 1.0 / (pathDuration / decayInterval);
        
        // Always add delay before starting decay, even for "final" decay
        // If path doesn't have a decayStartTime yet, set it
        if (!path.decayStartTime || path.decayStartTime < Date.now()) {
            path.decayStartTime = Date.now() + decayDelay;
        }
        
        // Store the final decay state for later
        path.pendingFinalDecay = isFinalDecay;
        
        // Save pathIndex and reference to the actual path object to prevent index confusion
        const pathRef = path;
        const savedPathIndex = path.pathIndex;
        
        // Start a new decay timer
        path.decayTimer = setInterval(() => {
            // Get current index from the saved reference rather than using the original pathIndex
            // This ensures we always operate on the correct path even if indices have changed
            const currentPathIndex = pathRef.pathIndex;
            
            // Safety check to make sure this path still exists in the array
            if (!swipePaths.includes(pathRef)) {
                clearInterval(pathRef.decayTimer);
                return;
            }
            
            const now = Date.now();
            
            // Skip decay if we're still in the delay period
            if (now < pathRef.decayStartTime) {
                return;
            }
            
            // Once delay period is over, check if this should be a final decay
            const shouldFinalDecay = pathRef.pendingFinalDecay;
            
            if (shouldFinalDecay) {
                // Final decay - fade out completely
                pathRef.opacity -= decaySpeed * 2;
                
                if (pathRef.opacity <= 0) {
                    clearInterval(pathRef.decayTimer);
                    pathRef.decayTimer = null;
                    
                    // Find the current index of this path and remove it
                    const currentIndex = swipePaths.indexOf(pathRef);
                    if (currentIndex !== -1) {
                        swipePaths.splice(currentIndex, 1);
                        
                        // Update activePathIndex if needed
                        if (activePathIndex >= currentIndex) {
                            activePathIndex = Math.max(-1, activePathIndex - 1);
                        }
                        
                        // Reassign all path indices to ensure consistency
                        swipePaths.forEach((p, i) => {
                            p.pathIndex = i;
                        });
                    }
                }
            } else {
                // Active decay - diminish but maintain minimum opacity if still adding points
                const inactiveTime = Date.now() - pathRef.lastPointTime;
                
                // If we haven't added points for a while, switch to final decay
                if (inactiveTime > 100 && currentPathIndex === activePathIndex) {
                    clearInterval(pathRef.decayTimer);
                    
                    // Mark this path as no longer active
                    if (activePathIndex === currentPathIndex) {
                        activePathIndex = -1;
                    }
                    
                    // Start final decay
                    pathRef.pendingFinalDecay = true;
                    startPathDecay(currentPathIndex, true);
                    return;
                }
                
                // Only decrease opacity if we haven't added new points recently
                if (pathRef.pointsAddedSinceDecay === 0) {
                    pathRef.opacity = Math.max(pathRef.opacity - decaySpeed, pathRef.isActive ? minOpacity : 0);
                } else {
                    // Reset counter after processing decay
                    pathRef.pointsAddedSinceDecay = 0;
                }
            }
        }, decayInterval);
    }
    
    // Update color based on current attract/repel mode
    function updatePathColor() {
        pathColor = isAttractMode ? pathColors.attract : pathColors.repel;
    }
    
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
    
    // Calculate the force applied to a particle from all active paths
    function calculateForce(particle) {
        if (!forceActive || swipePaths.length === 0) return { fx: 0, fy: 0 };
        
        let totalFx = 0;
        let totalFy = 0;
        
        // Apply forces from all paths
        swipePaths.forEach(path => {
            if (path.points.length < 2) return;
            
            let minDist = Infinity;
            let closestPoint = { x: 0, y: 0 };
            
            // Find the closest point on this path to the particle
            for (let i = 1; i < path.points.length; i++) {
                const p1 = path.points[i-1];
                const p2 = path.points[i];
                
                // Calculate distance to this segment
                const dist = distToSegment(particle.x, particle.y, p1.x, p1.y, p2.x, p2.y);
                
                if (dist < minDist) {
                    minDist = dist;
                    
                    // Find the closest point on the segment (for force direction)
                    const A = particle.x - p1.x;
                    const B = particle.y - p1.y;
                    const C = p2.x - p1.x;
                    const D = p2.y - p1.y;
                    
                    const dot = A * C + B * D;
                    const len_sq = C * C + D * D;
                    let param = -1;
                    
                    if (len_sq !== 0) {
                        param = dot / len_sq;
                    }
                    
                    if (param < 0) {
                        closestPoint = { x: p1.x, y: p1.y };
                    } else if (param > 1) {
                        closestPoint = { x: p2.x, y: p2.y };
                    } else {
                        closestPoint = { 
                            x: p1.x + param * C,
                            y: p1.y + param * D
                        };
                    }
                }
            }
            
            // Calculate force if within range
            if (minDist < forceRadius) {
                // Force direction
                let dx = particle.x - closestPoint.x;
                let dy = particle.y - closestPoint.y;
                
                // Normalize direction
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    dx /= dist;
                    dy /= dist;
                }
                
                // If in attract mode, reverse the direction
                if (path.isAttract) {
                    dx = -dx;
                    dy = -dy;
                }
                
                // Calculate force strength (stronger when closer to the path)
                const forceFactor = (1 - minDist / forceRadius);
                
                // Apply appropriate multiplier based on mode
                const modeMultiplier = path.isAttract ? attractMultiplier : repelMultiplier;
                
                // Calculate force components for this path and add to total
                totalFx += dx * forceFactor * forceIntensity * modeMultiplier * path.opacity;
                totalFy += dy * forceFactor * forceIntensity * modeMultiplier * path.opacity;
            }
        });
        
        return { fx: totalFx, fy: totalFy };
    }
    
    // Public API
    return {
        init: function(canvasElement) {
            canvas = canvasElement;
            ctx = canvas.getContext('2d');
            
            // console.log("SwipeSplitSystem initialized");
            return this;
        },
        
        // Set attract/repel mode and update color
        setAttractMode: function(attractMode) {
            isAttractMode = attractMode;
            updatePathColor();
            return this;
        },
        
        // Start a new swipe path at the given coordinates
        startSwipePath: function(x, y) {
            // Create a new path
            const newPathIndex = swipePaths.length;
            const newPath = {
                points: [{ x, y }],
                isActive: true,
                opacity: 1.0,
                lastPointTime: Date.now(),
                creationTime: Date.now(),
                pointsAddedSinceDecay: 0,
                decayTimer: null,
                color: isAttractMode ? pathColors.attract : pathColors.repel,
                isAttract: isAttractMode,
                pathIndex: newPathIndex
            };
            
            // Add to paths array
            swipePaths.push(newPath);
            activePathIndex = newPathIndex;
            
            // Start the diminishing effect immediately
            startPathDecay(newPathIndex);
            
            // Ensure all paths have their correct pathIndex after adding a new one
            // This prevents index confusion when adding/removing paths
            swipePaths.forEach((path, idx) => {
                path.pathIndex = idx;
            });
            
            // console.log("Swipe path started at", x, y, "- Path #", newPathIndex);
            return this;
        },
        
        // Add a point to the current swipe path
        addPointToSwipePath: function(x, y) {
            // If no active path, ignore
            if (activePathIndex < 0 || activePathIndex >= swipePaths.length) return this;
            
            const path = swipePaths[activePathIndex];
            
            // Add the point to the active path
            path.points.push({ x, y });
            path.lastPointTime = Date.now();
            path.pointsAddedSinceDecay++;
            
            // Boost opacity slightly when adding new points to keep the line visible
            path.opacity = Math.min(path.opacity + 0.05, 1.0);
            
            return this;
        },
        
        // End the current swipe path and begin final decay
        endSwipePath: function() {
            // If no active path, ignore
            if (activePathIndex < 0 || activePathIndex >= swipePaths.length) return this;
            
            const path = swipePaths[activePathIndex];
            
            // console.log("Swipe path ended with", path.points.length, "points - Path #", activePathIndex);
            
            // Mark as inactive but keep it in the array to continue fading
            path.isActive = false;
            
            // Mark for final decay after the delay period
            path.pendingFinalDecay = true;
            
            // Make sure we have a decay timer running
            if (!path.decayTimer) {
                // If no timer exists, create one that will honor the delay
                startPathDecay(activePathIndex, true);
            }
            
            // No active path now
            activePathIndex = -1;
            
            return this;
        },
        
        // Draw the current swipe path (called from animation loop)
        draw: function() {
            if (swipePaths.length > 0) {
                drawPaths();
            }
            return this;
        },
        
        // Apply forces to a particle - returns the force to apply
        applyForces: function(particle) {
            if (!forceActive || swipePaths.length === 0) return { fx: 0, fy: 0 };
            return calculateForce(particle);
        },
        
        // Check if a swipe is currently active
        isSwipeActive: function() {
            return swipePaths.length > 0;
        },
        
        // Check if forces are active
        areForceEffectsActive: function() {
            return forceActive && swipePaths.length > 0;
        },
        
        // Update path and force settings (batch update)
        updateSettings: function(settings) {
            if (settings.pathColor) pathColor = settings.pathColor;
            if (settings.pathWidth) pathWidth = settings.pathWidth;
            if (settings.isAttractMode !== undefined) {
                isAttractMode = settings.isAttractMode;
                updatePathColor();
            }
            
            // Force settings
            if (settings.forceRadius !== undefined) {
                forceRadius = settings.forceRadius;
                // Update displayed value
                const radiusDisplay = document.getElementById('swipeForceRadiusValue');
                if (radiusDisplay) {
                    radiusDisplay.textContent = forceRadius;
                }
            }
            if (settings.forceIntensity !== undefined) {
                forceIntensity = settings.forceIntensity;
                // Update displayed value
                const intensityDisplay = document.getElementById('swipeForceIntensityValue');
                if (intensityDisplay) {
                    intensityDisplay.textContent = forceIntensity.toFixed(1);
                }
            }
            if (settings.attractMultiplier !== undefined) {
                attractMultiplier = settings.attractMultiplier;
                // Update displayed value
                const attractDisplay = document.getElementById('swipeAttractMultiplierValue');
                if (attractDisplay) {
                    attractDisplay.textContent = attractMultiplier.toFixed(1);
                }
            }
            if (settings.repelMultiplier !== undefined) {
                repelMultiplier = settings.repelMultiplier;
                // Update displayed value
                const repelDisplay = document.getElementById('swipeRepelMultiplierValue');
                if (repelDisplay) {
                    repelDisplay.textContent = repelMultiplier.toFixed(1);
                }
            }
            if (settings.forceActive !== undefined) forceActive = settings.forceActive;
            
            // If we have an active path, recalculate the decay speed
            if (activePathIndex >= 0 && swipePaths[activePathIndex].decayTimer) {
                clearInterval(swipePaths[activePathIndex].decayTimer);
                startPathDecay(activePathIndex, false);
            }
            
            return this;
        },
        
        // Get all settings for saving
        getSettings: function() {
            return {
                forceRadius,
                forceIntensity,
                attractMultiplier,
                repelMultiplier,
                forceActive,
                pathCount: swipePaths.length
            };
        },
        
        // Update a single setting - used when loading saved swarms
        updateSetting: function(key, value) {
            // Only update valid settings
            if (key === 'forceRadius' && typeof value === 'number') {
                forceRadius = value;
                // Update UI if present
                const radiusSlider = document.getElementById('swipeForceRadius');
                if (radiusSlider) radiusSlider.value = value;
                const radiusValue = document.getElementById('swipeForceRadiusValue');
                if (radiusValue) radiusValue.textContent = value;
            } 
            else if (key === 'forceIntensity' && typeof value === 'number') {
                forceIntensity = value;
                // Update UI if present
                const intensitySlider = document.getElementById('swipeForceIntensity');
                if (intensitySlider) intensitySlider.value = value;
                const intensityValue = document.getElementById('swipeForceIntensityValue');
                if (intensityValue) intensityValue.textContent = value;
            }
            else if (key === 'attractMultiplier' && typeof value === 'number') {
                attractMultiplier = value;
                // Update UI if present
                const attractSlider = document.getElementById('swipeAttractMultiplier');
                if (attractSlider) attractSlider.value = value;
                const attractValue = document.getElementById('swipeAttractMultiplierValue');
                if (attractValue) attractValue.textContent = value;
            }
            else if (key === 'repelMultiplier' && typeof value === 'number') {
                repelMultiplier = value;
                // Update UI if present
                const repelSlider = document.getElementById('swipeRepelMultiplier');
                if (repelSlider) repelSlider.value = value;
                const repelValue = document.getElementById('swipeRepelMultiplierValue');
                if (repelValue) repelValue.textContent = value;
            }
            else if (key === 'forceActive' && typeof value === 'boolean') {
                forceActive = value;
                // Update UI if present
                const forceToggle = document.getElementById('swipeForcesEnabled');
                if (forceToggle) forceToggle.checked = value;
            }
            return true;
        }
    };
})(); 

// demoMode.js - Automatic zot swarm demo mode
const DemoMode = (function() {
    // Track if demo mode is active
    let isActive = false;
    
    // Store created swarms for cleanup
    let demoSwarms = [];
    
    // Audio elements and state
    let demoAudio = null;
    let slideAudio = null; // New audio element for slide effect
    let introAudio = null; // Specific element for intro audio to keep it cached
    let currentSongIndex = -1;
    let shuffledSongKeys = [];
    
    // Cycling properties
    let cycleInterval = null;
    let cycleIndex = -1; // Start at -1 so first increment goes to 0
    let isCycling = false;
    let touchDetected = false;
    let secondTouchDetected = false; // Track if second touch has been detected
    let isFirstLoop = true; // Track if we're in the first loop
    
    // New flags for the modified behavior
    let allSwarmsSpawned = false; // Track if all swarms have been spawned
    let firstTouchAfterSpawnDetected = false; // Track if first touch after spawn has been detected
    
    // Idle prompt properties
    let idleTimer = null;
    let promptElement = null;
    let promptActive = false;
    
    // Audio loading state tracking
    let introAudioLoaded = false;
    let introAudioFailed = false;
    
    // Global variables for tracking the audio volume state
    let currentVolumeLevel = 1.0; // Track current volume level
    let previousVolumeLevel = 1.0; // Store previous volume level before fading
    let volumeFadeInterval = null; // Store the interval for volume fading
    
    // Configuration for demo mode
    const DEMO_CONFIG = {
        swarmCount: 8,         // Increased from 6 to 8 to handle all mixed swarm types
        zotsPerSwarm: 40,      // Number of zots in each swarm
        presetName: 'jellyOrbs', // Preset behavior to use
        colorTheme: 'green',   // Color theme to use (forest-like) - fallback only
        minSize: 2.5,            // Minimum zot size
        maxSize: 7.5,            // Maximum zot size
        circleRadius: 150,     // Fixed pixel value for swarm positioning (was 0.35 - a fraction of screen)
        cycleInterval: 10000,  // Cycle through presets every 10 seconds
        idleTimeout: 2000,     // Show prompt after 2 seconds of inactivity
        initialSpeed: 2,       // Initial speed for jellyOrbs (slower)
        finalSpeed: 5.5        // Final speed after first touch/tap/swipe
    };
    
    // Preset configurations to cycle through
    const PRESET_CYCLES = [
        // Initial configuration - jellyOrbs, green (when demo is initialized)
        {
            name: "Jelly Orbs",
            configs: Array(6).fill({
                presetName: 'jellyOrbs',
                zotCount: 40
            })
        },
        // Fizzy Pop, Neon
        {
            name: "Fizzy Pop",
            configs: Array(6).fill({
                presetName: 'fizzyPop',
                zotCount: 40
            })
        },
        // Cooking Oil, Gold
        {
            name: "Cooking Oil",
            configs: Array(6).fill({
                presetName: 'cookingOil',
                zotCount: 50
            })
        },
        // Torrential, Blue
        {
            name: "Torrential",
            configs: Array(6).fill({
                presetName: 'torrential',
                zotCount: 40
            })
        },
        // Bird Flock (murmuration), Rainbow, zotCount=150
        {
            name: "Bird Flock",
            configs: Array(6).fill({
                presetName: 'murmuration',
                zotCount: 75
            })
        },
        // Lava Lamp, Fire, zotCount=150
        {
            name: "Lava Lamp",
            configs: Array(6).fill({
                presetName: 'lavaLamp',
                zotCount: 100
            })
        },
        // Bubble, Sparkle
        {
            name: "Bubble",
            configs: Array(6).fill({
                presetName: 'bubble',
                zotCount: 40
            })
        },
        // Ringer, Neon
        {
            name: "Ringer",
            configs: Array(6).fill({
                presetName: 'ringer',
                zotCount: 40
            })
        },
        // Mix of multiple presets
        {
            name: "Mixed Swarms",
            configs: [
                { presetName: 'fizzyPop', zotCount: 50 },
                { presetName: 'bubble', zotCount: 50 },
                { presetName: 'jellyOrbs', zotCount: 50 },
                { presetName: 'torrential', zotCount: 50 }
            ]
        }
    ];
    
    // Store event handler references for cleanup
    let keyboardNavHandler = null;
    
    // Track touch location for swarm creation
    let secondTouchX = null;
    let secondTouchY = null;
    
    /**
     * Initialize and start the demo mode
     */
    function start() {
        if (isActive) return; // Prevent multiple starts
        
        // console.log('Starting Zot Swarm Demo Mode');
        
        // Make sure we have access to particle system
        if (!ParticleSystem || typeof ParticleSystem.createZotSwarm !== 'function') {
            // console.error('Demo Mode: ParticleSystem not available');
            return;
        }
        
        // Reset tracking variables
        allSwarmsSpawned = false;
        firstTouchAfterSpawnDetected = false;
        isFirstLoop = true; // Ensure we reset the first loop flag
        touchDetected = false;
        secondTouchDetected = false;
        
        // Preload the intro audio immediately
        preloadIntroAudio();
        
        // Delay to ensure all systems are properly initialized
        setTimeout(() => {
            createInitialSwarm(); // Create only one swarm initially
            setupMenuButtonListeners();
            setupTouchDetection();
            setupKeyboardNavigation();
            setupIdlePrompt();
            isActive = true;
        }, 500);
    }
    
    // Double tap detection variables
    let lastTapTime = 0;
    const doubleTapDelay = 300; // ms between taps to count as double tap
    
    // Track push/pull prompt state
    let pushPullPromptElement = null;
    let pushPullPromptActive = false;
    
    // Track swipe prompt state
    let swipePromptElement = null;
    let swipePromptActive = false;
    let lastSwipeStart = null;
    let lastSwipePosition = null;
    let minSwipeDistance = 100; // Minimum distance to trigger swipe (px)
    
    /**
     * Set up touch detection to start the cycle
     */
    function setupTouchDetection() {
        if (touchDetected) return;
        
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        
        // Create one-time event listeners for touch and click
        const startCyclingOnFirstTouch = function(e) {
            if (!isActive) return;
            
            // Hide the prompt if it's active
            if (promptActive) {
                hidePromptText();
            }
            
            if (!touchDetected) {
                touchDetected = true;
                // We no longer start cycling on first touch
                // Keeping the comment for clarity that this is a deliberate change
                // startCycling();
                
                // Add second touch detection
                canvas.addEventListener('touchstart', detectSecondTouch);
                canvas.addEventListener('click', detectSecondTouch);
                
                // console.log('Demo Mode: First touch detected, waiting for second touch');
            }
        };
        
        // Detect second touch to spawn remaining swarms
        const detectSecondTouch = function(e) {
            if (!isActive || secondTouchDetected) return;
            
            // Get touch coordinates
            if (e.type === 'touchstart') {
                secondTouchX = e.touches[0].clientX;
                secondTouchY = e.touches[0].clientY;
            } else {
                secondTouchX = e.clientX;
                secondTouchY = e.clientY;
            }
            
            secondTouchDetected = true;
            // console.log(`Demo Mode: Second touch detected at (${secondTouchX}, ${secondTouchY}), waiting 1 second before spawning remaining swarms`);
            
            // Start playing demo intro audio but don't start cycling yet
            try {
                if (demoAudio) {
                    demoAudio.pause();
                }
                
                // Use the preloaded intro audio if available
                if (introAudio && introAudioLoaded) {
                    // console.log('Demo Mode: Using cached intro audio for playback');
                    demoAudio = introAudio;
                    introAudio = null; // Clear reference to avoid duplicate usage
                } else {
                    // Create new audio element if preloaded one isn't available
                    // console.log('Demo Mode: Creating new audio element for intro');
                    demoAudio = new Audio();
                    demoAudio.preload = 'auto';
                    demoAudio.src = './music/DemoIntro.mp3';
                }
                
                // console.log('Demo Mode: Using path for demo intro audio:', demoAudio.src);
                
                // Set up ended event to start random playlist
                demoAudio.onended = function() {
                    // console.log('Demo Mode: Intro audio ended, starting random playlist');
                    randomizeSongs();
                    playNextSong();
                };
                
                // Play the audio
                setTimeout(() => {
                    try {
                        // Make sure user interaction has been recorded for autoplay policies
                        if (typeof document !== 'undefined' && document.documentElement) {
                            document.documentElement.setAttribute('data-user-interacted', 'true');
                        }
                        
                        const playPromise = demoAudio.play();
                        if (playPromise !== undefined) {
                            // console.log('Demo Mode: Intro audio playing successfully');
                        }
                    } catch (err) {
                        // console.error('Demo Mode: Error playing intro audio:', err);
                        // Fall back to random playlist on error
                        randomizeSongs();
                        playNextSong();
                    }
                }, 500);
            } catch (err) {
                // console.error('Demo Mode: Error setting up intro audio:', err);
                randomizeSongs();
                playNextSong();
            }
            
            // Remove second touch listener
            canvas.removeEventListener('touchstart', detectSecondTouch);
            canvas.removeEventListener('click', detectSecondTouch);
            
            // Add 1-second delay before spawning remaining swarms
            setTimeout(() => {
                // console.log('Demo Mode: 1-second delay complete, spawning remaining swarms');
                createRemainingSwarms();
                
                // Set flag that all swarms are spawned
                allSwarmsSpawned = true;
                
                // Add listener for the first touch after all swarms are spawned
                canvas.addEventListener('touchstart', detectFirstTouchAfterSpawn);
                canvas.addEventListener('click', detectFirstTouchAfterSpawn);
                
                // console.log('Demo Mode: All swarms spawned, waiting for first touch to increase speed and start cycling');
            }, 1000);
        };
        
        // New handler for detecting the first touch after all swarms are spawned
        const detectFirstTouchAfterSpawn = function(e) {
            if (!isActive || !allSwarmsSpawned || firstTouchAfterSpawnDetected) return;
            
            firstTouchAfterSpawnDetected = true;
            // console.log('Demo Mode: First touch after all swarms spawned detected, increasing speed and starting cycling');
            
            // Update all jellyOrb swarms to the final speed
            updateAllJellyOrbsSpeed(DEMO_CONFIG.finalSpeed);
            
            // Now start the cycling
            startCycling();
            
            // Remove this event listener
            canvas.removeEventListener('touchstart', detectFirstTouchAfterSpawn);
            canvas.removeEventListener('click', detectFirstTouchAfterSpawn);
        };
        
        // Add double tap detection
        const handleTap = function(e) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            
            if (tapLength < doubleTapDelay && tapLength > 0) {
                // Double tap detected
                // console.log('Demo Mode: Double tap detected');
                
                // Hide push/pull prompt if active
                hidePushPullPrompt();
                
                // Ensure volume is restored immediately to 100%
                fadeAudioVolume(1.0, 300);
                
                // Restart cycling if it was stopped
                if (!isCycling) {
                    // Pass true to skipImmediateCycle to prevent advancing to the next preset
                    // when resuming from push/pull prompt
                    startCycling(true);
                }
                
                e.preventDefault(); // Prevent default action
            }
            
            lastTapTime = currentTime;
        };

        // Add swipe detection
        const handleSwipeStart = function(e) {
            if (swipePromptActive) {
                lastSwipeStart = {
                    x: e.type === 'touchstart' ? e.touches[0].clientX : e.clientX,
                    y: e.type === 'touchstart' ? e.touches[0].clientY : e.clientY,
                    time: new Date().getTime()
                };
                lastSwipePosition = lastSwipeStart;
            }
        };

        const handleSwipeMove = function(e) {
            if (swipePromptActive && lastSwipeStart) {
                // Get current position
                const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
                const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
                
                // Update last position
                lastSwipePosition = {
                    x: currentX,
                    y: currentY,
                    time: new Date().getTime()
                };
                
                // Calculate distance from start
                const distance = Math.sqrt(
                    Math.pow(currentX - lastSwipeStart.x, 2) + 
                    Math.pow(currentY - lastSwipeStart.y, 2)
                );
                
                // If distance is enough, trigger swipe completion
                if (distance >= minSwipeDistance) {
                    // console.log(`Demo Mode: Swipe detected (${distance.toFixed(0)}px)`);
                    hideSwipePrompt();
                    
                    // Ensure volume is restored immediately to 100%
                    fadeAudioVolume(1.0, 300);
                    
                    startCycling(true); // Resume cycling with skipImmediateCycle=true to start the timer without advancing
                    
                    // Clear swipe tracking
                    lastSwipeStart = null;
                    lastSwipePosition = null;
                    
                    e.preventDefault();
                }
            }
        };

        const handleSwipeEnd = function(e) {
            // Reset swipe tracking
            lastSwipeStart = null;
            lastSwipePosition = null;
        };
        
        canvas.addEventListener('touchstart', startCyclingOnFirstTouch);
        canvas.addEventListener('click', startCyclingOnFirstTouch);
        
        // Add double tap listener (always active)
        canvas.addEventListener('touchstart', handleTap);
        canvas.addEventListener('click', handleTap);
        
        // Add swipe listeners
        canvas.addEventListener('touchstart', handleSwipeStart);
        canvas.addEventListener('mousedown', handleSwipeStart);
        canvas.addEventListener('touchmove', handleSwipeMove);
        canvas.addEventListener('mousemove', handleSwipeMove);
        canvas.addEventListener('touchend', handleSwipeEnd);
        canvas.addEventListener('mouseup', handleSwipeEnd);
    }
    
    /**
     * Set up idle timer to show prompt text
     */
    function setupIdlePrompt() {
        // Create timer to show prompt after idle period
        idleTimer = setTimeout(() => {
            if (isActive && !touchDetected) {
                showPromptText();
            }
        }, DEMO_CONFIG.idleTimeout);
        
        // Create prompt element
        createPromptElement();
    }
    
    /**
     * Create the prompt element to display
     */
    function createPromptElement() {
        // Check if the element already exists
        if (document.getElementById('demoPrompt')) {
            promptElement = document.getElementById('demoPrompt');
            return;
        }
        
        // Create new prompt element container
        promptElement = document.createElement('div');
        promptElement.id = 'demoPrompt';
        
        // Set styles for the container
        Object.assign(promptElement.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            opacity: '0',
            pointerEvents: 'none',
            zIndex: '1000',
            width: '80%'
        });
        
        // Create first part of text
        const firstPart = document.createElement('div');
        firstPart.id = 'demoPromptFirst';
        Object.assign(firstPart.style, {
            fontSize: '10vw',
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            opacity: '0',
            transform: 'scale(2)', // Start larger
            transition: 'opacity 1s, transform 1s ease-out' // Add transform transition
        });
        firstPart.textContent = 'Go ahead...';
        
        // Create second part of text (initially empty)
        const secondPart = document.createElement('div');
        secondPart.id = 'demoPromptSecond';
        Object.assign(secondPart.style, {
            fontSize: '10vw',
            position: 'relative',
            height: '15vw', // Make room for the animation
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center'
        });
        
        // Add parts to the container
        promptElement.appendChild(firstPart);
        promptElement.appendChild(secondPart);
        
        // Add to DOM
        document.body.appendChild(promptElement);
    }
    
    /**
     * Creates a ripple animation effect on text where characters rise and fall
     * @param {NodeList} chars - The character spans to animate
     * @param {number} interval - Time in ms between character animations
     * @param {number} pauseTime - Time in ms to pause between ripple cycles
     * @param {number} heightOffset - How high to raise characters in pixels
     * @returns {Object} - Animation control functions (stop)
     */
    function txtRipple(chars, interval = 40, pauseTime = 1000, heightOffset = 20) {
        if (!chars || chars.length === 0) return null;
        
        let rippleIndex = 0;
        let animationInterval = null;
        let isActive = true;
        
        // Durations for up and down animations
        const driftUpDuration = 150; // ms
        const driftDownDuration = driftUpDuration * 3; // 3x longer for drift down
        
        // Function to animate a single character
        function animateChar(index) {
            if (!isActive) return;
            
            const char = chars[index];
            
            // Set transition for drift up (fast)
            char.style.transition = `transform ${driftUpDuration}ms ease-out`;
            
            // Raise character with smooth transition
            char.style.transform = `translateY(-${heightOffset}px)`;
            
            // Wait for the drift up to complete before starting drift down
            setTimeout(() => {
                if (char && isActive) {
                    // Change transition for drift down (slower - 3x)
                    char.style.transition = `transform ${driftDownDuration}ms ease-in-out`;
                    char.style.transform = 'translateY(0)';
                }
            }, driftUpDuration + 20); // Small buffer after up animation completes
        }
        
        // Set up the ripple interval - fixed delay between starting each character's animation
        function startRipple() {
            rippleIndex = 0;
            
            // Use a fixed 100ms delay between starting each character's animation
            const sequenceDelay = 100; 
            
            // Clear any existing interval
            if (animationInterval) {
                clearInterval(animationInterval);
            }
            
            animationInterval = setInterval(() => {
                animateChar(rippleIndex);
                rippleIndex++;
                
                // If we've reached the end of the text, clear interval and wait before restarting
                if (rippleIndex >= chars.length) {
                    clearInterval(animationInterval);
                    animationInterval = null;
                    
                    // Calculate when all animations will be complete
                    // Last character start time + up duration + down duration
                    const animationCompleteTime = (chars.length * sequenceDelay) + driftUpDuration + driftDownDuration + 100;
                    
                    // Wait for all animations to complete before restarting the cycle
                    setTimeout(() => {
                        if (isActive) {
                            startRipple();
                        }
                    }, Math.max(pauseTime, animationCompleteTime));
                }
            }, sequenceDelay);
        }
        
        // Start the ripple animation
        startRipple();
        
        // Return control functions
        return {
            stop: function() {
                isActive = false;
                if (animationInterval) {
                    clearInterval(animationInterval);
                    animationInterval = null;
                }
            }
        };
    }
    
    /**
     * Creates a pulsing sine wave animation effect on an element
     * @param {HTMLElement} element - The element to animate
     * @param {number} frequency - Pulse frequency in Hz
     * @param {number} amplitude - Maximum scale change
     * @returns {Object} - Animation control functions (stop)
     */
    function txtPulse(element, frequency = 0.25, amplitude = 0.05) {
        if (!element) return null;
        
        let startTime = null;
        let animationFrame = null;
        let isActive = true;
        
        // Remember original transform
        const originalTransform = element.style.transform || 'translate(-50%, -50%)';
        
        // Animation function
        function animate(timestamp) {
            if (!isActive) return;
            
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            
            // Calculate sine wave value (ranges from -1 to 1)
            const phase = 2 * Math.PI * frequency * (elapsed / 1000);
            const sineValue = Math.sin(phase);
            
            // Map the sine value to a scale factor
            const scaleFactor = 1 + (sineValue * amplitude);
            
            // Apply the scale transformation while preserving original transform
            element.style.transform = `${originalTransform} scale(${scaleFactor})`;
            
            // Request next frame
            animationFrame = requestAnimationFrame(animate);
        }
        
        // Start the animation
        animationFrame = requestAnimationFrame(animate);
        
        // Return control functions
        return {
            stop: function() {
                isActive = false;
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
                // Reset to original transform
                element.style.transform = originalTransform;
            }
        };
    }
    
    /**
     * Creates a zoom fade-in animation effect for text introduction
     * @param {HTMLElement} element - The element to animate
     * @param {number} startScale - Initial scale factor (default: 2)
     * @param {number} endScale - Final scale factor (default: 1)
     * @param {number} duration - Animation duration in ms (default: 1000ms)
     * @param {Function} onComplete - Callback function after animation completes
     * @returns {Object} - Animation control functions (stop)
     */
    function txtZoomFadeIn(element, startScale = 2, endScale = 1, duration = 1000, onComplete = null) {
        if (!element) return null;
        
        let isActive = true;
        let animationStartTime = null;
        let animationFrame = null;
        
        // Set initial state
        element.style.transform = `scale(${startScale})`;
        element.style.opacity = '0';
        
        // Force reflow to ensure animation starts correctly
        element.offsetHeight;
        
        // Animation function
        function animate(timestamp) {
            if (!isActive) return;
            
            if (!animationStartTime) animationStartTime = timestamp;
            const elapsed = timestamp - animationStartTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out cubic)
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            // Calculate current scale and opacity
            const currentScale = startScale - (easedProgress * (startScale - endScale));
            const currentOpacity = easedProgress;
            
            // Apply current values
            element.style.transform = `scale(${currentScale})`;
            element.style.opacity = currentOpacity;
            
            if (progress < 1) {
                // Continue animation
                animationFrame = requestAnimationFrame(animate);
            } else {
                // Animation complete
                if (onComplete && typeof onComplete === 'function') {
                    onComplete(element);
                }
            }
        }
        
        // Start animation
        animationFrame = requestAnimationFrame(animate);
        
        // Return control functions
        return {
            stop: function() {
                isActive = false;
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
            }
        };
    }
    
    /**
     * Show the prompt text with animation
     */
    function showPromptText() {
        if (!promptElement || !isActive || touchDetected || promptActive || !isFirstLoop) return;
        
        // Only show prompts during first loop
        // console.log('Demo Mode: Showing touch prompt');
        
        // Animation controllers for cleanup
        let pulseAnimation = null;
        let zoomAnimation = null;
        
        // Reset the prompt content
        promptElement.innerHTML = '';
        
        // Create first part of text with initial zoom state
        const firstPart = document.createElement('div');
        firstPart.id = 'demoPromptFirst';
        Object.assign(firstPart.style, {
            fontSize: '10vw',
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            opacity: '0',
            transform: 'scale(2)', // Start larger
            transition: 'opacity 1s, transform 1s ease-out' // Add transform transition
        });
        firstPart.textContent = 'Go ahead...';
        
        // Create second part of text container (initially empty)
        const secondPart = document.createElement('div');
        secondPart.id = 'demoPromptSecond';
        Object.assign(secondPart.style, {
            fontSize: '10vw',
            position: 'relative',
            height: '15vw',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            opacity: '0' // Start hidden
        });
        
        // Add parts to the container
        promptElement.appendChild(firstPart);
        promptElement.appendChild(secondPart);
        
        // Display the prompt container
        promptElement.style.opacity = '0.5'; // 50% translucent
        promptActive = true;
        
        // Start pulse effect on the entire prompt
        pulseAnimation = txtPulse(promptElement, 0.25, 0.05);
        
        // Force reflow to ensure animation starts properly
        firstPart.offsetHeight;
        
        // Show first part with zoom effect
        firstPart.style.opacity = '1';
        firstPart.style.transform = 'scale(1)'; // Zoom to normal size
        
        // After first part finishes fading in (1 second), start showing the second part
        setTimeout(() => {
            if (!promptActive) return; // Stop if no longer active
            
            // Add the text
            secondPart.innerHTML = 'Give it a little<br>Pokie-Poke';
            
            // Apply zoom fade-in to second part
            zoomAnimation = txtZoomFadeIn(secondPart, 2, 1, 1000);
        }, 1500); // Wait 1.5s for first part to finish its animation
        
        // Store animation controllers in the element for cleanup
        promptElement.animations = {
            pulse: pulseAnimation,
            zoom: zoomAnimation
        };
    }
    
    /**
     * Hide the prompt text
     */
    function hidePromptText() {
        if (!promptElement || !promptActive) return;
        
        // Stop all animations
        if (promptElement.animations) {
            if (promptElement.animations.pulse) promptElement.animations.pulse.stop();
            if (promptElement.animations.zoom) promptElement.animations.zoom.stop();
            promptElement.animations = null;
        }
        
        promptElement.style.opacity = '0';
        promptActive = false;
        
        // Clear content after fade out
        setTimeout(() => {
            if (!promptActive && promptElement) {
                promptElement.innerHTML = '';
            }
        }, 1000);
    }
    
    /**
     * Start cycling through presets
     * @param {boolean} skipImmediateCycle - If true, don't cycle immediately (just set up interval)
     */
    function startCycling(skipImmediateCycle = false) {
        if (isCycling) return;
        
        // Only start cycling if we've detected the first touch after all swarms are spawned
        // or if we're in special circumstances like after a swipe
        if (!firstTouchAfterSpawnDetected && allSwarmsSpawned) {
            // console.log('Demo Mode: Not starting cycling yet, waiting for first touch after all swarms are spawned');
            return;
        }
        
        // console.log('Demo Mode: Starting preset cycling');
        
        // Don't reset cycle index if we're resuming after a prompt (swipe or push/pull)
        // Only reset if we're starting fresh (no cycling has happened yet)
        if (cycleIndex === -1) {
            // First time starting cycling
            // console.log('Demo Mode: First time starting cycle, initialize index to -1');
            // Keep cycleIndex at -1 so first increment goes to 0
        } else {
            // We're resuming after a prompt (like swipe or push/pull), maintain current preset
            // console.log(`Demo Mode: Resuming cycling from preset index ${cycleIndex}`);
            // No need to change cycleIndex, keep current preset
        }
        
        // Cycle immediately unless skipImmediateCycle is true
        if (!skipImmediateCycle) {
            cyclePreset();
        } else {
            // console.log('Demo Mode: Skipping immediate cycle, will cycle after interval');
        }
        
        // Set up cycling interval
        cycleInterval = setInterval(cyclePreset, DEMO_CONFIG.cycleInterval);
        isCycling = true;
    }
    
    /**
     * Cycle to the next preset configuration
     */
    function cyclePreset() {
        if (!isActive || demoSwarms.length === 0) {
            stopCycling();
            return;
        }
        
        // Don't cycle if we're showing a prompt
        if (pushPullPromptActive || swipePromptActive) {
            return;
        }
        
        // Calculate the next cycle index
        const nextCycleIndex = (cycleIndex + 1) % PRESET_CYCLES.length;
        
        // Check if we've completed a full cycle (gone through all presets)
        if (isFirstLoop && nextCycleIndex === 0 && cycleIndex !== -1) {
            // We've gone through all presets once and are looping back to the first preset
            // console.log('Demo Mode: First loop complete, disabling instructions and pauses');
            isFirstLoop = false;
        }
        
        // Update the cycle index
        cycleIndex = nextCycleIndex;
        const presetCycle = PRESET_CYCLES[cycleIndex];
        
        // console.log(`Demo Mode: Cycling to preset "${presetCycle.name}" (First Loop: ${isFirstLoop})`);
        
        // Apply new configurations to each swarm
        demoSwarms.forEach((swarmId, index) => {
            const swarmConfig = presetCycle.configs[index % presetCycle.configs.length];
            updateSwarmParameters(swarmId, swarmConfig);
        });
        
        // Special behavior for different presets (only in first loop)
        if (isFirstLoop) {
            // Show special prompt for Ringer preset
            if (presetCycle.name === "Ringer") {
                stopCycling(); // Pause cycling
                showPushPullPrompt(); // Show the special prompt
            }
            // Show special swipe prompt for Torrential preset
            else if (presetCycle.name === "Torrential") {
                stopCycling(); // Pause cycling
                
                // Enable music button if MusicController is available
                if (typeof MusicController !== 'undefined' && MusicController.enableButton) {
                    // console.log('Demo Mode: Enabling music button on Torrential preset detection');
                    MusicController.enableButton();
                }
                
                // Keep music playing - no audio changes needed
                
                showSwipePrompt(); // Show the swipe prompt
            }
        }
    }
    
    /**
     * Update parameters of an existing swarm
     */
    function updateSwarmParameters(swarmId, config) {
        try {
            // Get preset parameters
            const preset = Presets.swarmPresets[config.presetName] || {};
            
            // Create update config with behavior parameters
            const updateConfig = {
                zotCount: config.zotCount || DEMO_CONFIG.zotsPerSwarm,
                speed: preset.speed !== undefined ? preset.speed : 5.5,
                separation: preset.separation !== undefined ? preset.separation : 0.1,
                alignment: preset.alignment !== undefined ? preset.alignment : 0.1,
                cohesion: preset.cohesion !== undefined ? preset.cohesion : 5,
                perception: preset.perception !== undefined ? preset.perception : 100,
                colorTheme: preset.colorTheme || DEMO_CONFIG.colorTheme
            };
            
            // Update the swarm
            if (ParticleSystem.updateZotSwarm) {
                ParticleSystem.updateZotSwarm(swarmId, updateConfig);
                // console.log(`Demo Mode: Updated swarm ${swarmId} to ${config.presetName} - ${updateConfig.colorTheme}`);
            }
        } catch (error) {
            // console.error(`Demo Mode: Error updating swarm ${swarmId}:`, error);
        }
    }
    
    /**
     * Stop the cycling interval
     */
    function stopCycling() {
        if (cycleInterval) {
            clearInterval(cycleInterval);
            cycleInterval = null;
        }
        isCycling = false;
    }
    
    /**
     * Set up listeners for the menu button to end demo mode
     */
    function setupMenuButtonListeners() {
        const menuToggle = document.getElementById('menuToggle');
        if (!menuToggle) {
            // console.error('Demo Mode: Menu toggle button not found');
            return;
        }
        
        // Capture phase to ensure our handler runs before the menu toggle handlers
        const eventOptions = { capture: true };
        
        // Add handlers for both click and touch events
        menuToggle.addEventListener('click', endDemoMode, eventOptions);
        menuToggle.addEventListener('touchstart', endDemoMode, eventOptions);
    }
    
    /**
     * Fade audio volume to a target level over a specified duration
     * @param {number} targetVolume - Target volume level (0.0 to 1.0)
     * @param {number} duration - Fade duration in milliseconds
     * @param {function} callback - Optional callback after fade completes
     */
    function fadeAudioVolume(targetVolume, duration = 3000, callback = null) {
        // Clear any existing fade interval
        if (volumeFadeInterval) {
            clearInterval(volumeFadeInterval);
            volumeFadeInterval = null;
        }
        
        // Ensure target volume is within valid range
        const target = Math.max(0, Math.min(1, targetVolume));
        
        // Store previous volume before fading (for restoration)
        previousVolumeLevel = currentVolumeLevel;
        
        // Skip the fade if we're already at (or very close to) the target volume
        if (Math.abs(currentVolumeLevel - target) < 0.01) {
            if (callback && typeof callback === 'function') {
                callback();
            }
            return;
        }
        
        // If AudioManager is available, use it
        if (typeof AudioManager !== 'undefined' && AudioManager.setVolume) {
            // Set up fade parameters
            const fadeSteps = 30; // Number of steps for smooth fade
            const fadeStepTime = duration / fadeSteps; // Time between volume changes
            const startVolume = currentVolumeLevel;
            const volumeStep = (startVolume - target) / fadeSteps; // Volume change per step
            
            let currentStep = 0;
            
            // Create fade interval
            volumeFadeInterval = setInterval(() => {
                currentStep++;
                
                // Calculate new volume
                const newVolume = Math.max(0, Math.min(1, startVolume - (volumeStep * currentStep)));
                
                // Apply new volume
                AudioManager.setVolume(newVolume);
                currentVolumeLevel = newVolume;
                
                // Check if we've completed the fade
                if (currentStep >= fadeSteps || Math.abs(newVolume - target) < 0.01) {
                    clearInterval(volumeFadeInterval);
                    volumeFadeInterval = null;
                    
                    // Set exact target volume to ensure we reach it
                    AudioManager.setVolume(target);
                    currentVolumeLevel = target;
                    
                    // Call the callback if provided
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                }
            }, fadeStepTime);
        } else if (demoAudio && !demoAudio.paused) {
            // Fallback to using demoAudio directly if available
            const fadeSteps = 30;
            const fadeStepTime = duration / fadeSteps;
            const startVolume = demoAudio.volume;
            const volumeStep = (startVolume - target) / fadeSteps;
            
            let currentStep = 0;
            
            volumeFadeInterval = setInterval(() => {
                currentStep++;
                
                // Calculate new volume
                const newVolume = Math.max(0, Math.min(1, startVolume - (volumeStep * currentStep)));
                
                // Apply new volume
                demoAudio.volume = newVolume;
                currentVolumeLevel = newVolume;
                
                // Check if we've completed the fade
                if (currentStep >= fadeSteps || Math.abs(newVolume - target) < 0.01) {
                    clearInterval(volumeFadeInterval);
                    volumeFadeInterval = null;
                    
                    // Set exact target volume to ensure we reach it
                    demoAudio.volume = target;
                    currentVolumeLevel = target;
                    
                    // Call the callback if provided
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                }
            }, fadeStepTime);
        } else {
            // No audio playing, just update the current volume level
            currentVolumeLevel = target;
            
            // Call the callback if provided
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    }
    
    /**
     * Show the Push/Pull double tap prompt
     */
    function showPushPullPrompt() {
        if (pushPullPromptActive || !isFirstLoop) return;
        
        // Fade music to 25% when showing the prompt
        fadeAudioVolume(0.25, 3000);
        
        // Pause the idle timer
        if (idleTimer) {
            clearTimeout(idleTimer);
            idleTimer = null;
        }
        
        // Create container if it doesn't exist
        if (!pushPullPromptElement) {
            pushPullPromptElement = document.createElement('div');
            pushPullPromptElement.id = 'pushPullPrompt';
            
            // Set styles for the container - match demoPrompt styling
            Object.assign(pushPullPromptElement.style, {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                opacity: '0',
                pointerEvents: 'none',
                zIndex: '1000',
                width: '80%' // Match the width of standard prompt
            });
            
            document.body.appendChild(pushPullPromptElement);
        }
        
        // Animation controllers for cleanup
        let pulseAnimation = null;
        
        // Reset the prompt content
        pushPullPromptElement.innerHTML = '';
        
        // Create single text element with all content
        const textElement = document.createElement('div');
        textElement.id = 'pushPullPromptText';
        Object.assign(textElement.style, {
            fontSize: '10vw', // Same size as standard prompt
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            opacity: '0',
            transform: 'scale(2)', // Start larger
            transition: 'opacity 1s, transform 1s ease-out',
            lineHeight: '1.5'
        });
        
        // Set content with colored Push/Pull text
        textElement.innerHTML = 'Double Tap to<br><span style="color: #e67e22;">Push</span>  /  <span style="color: #3498db;">Pull</span>';
        
        // Add to the container
        pushPullPromptElement.appendChild(textElement);
        
        // Display the prompt container
        pushPullPromptElement.style.opacity = '0.5'; // 50% translucent like standard prompt
        pushPullPromptActive = true;
        
        // Start pulse effect on the entire prompt
        pulseAnimation = txtPulse(pushPullPromptElement, 0.25, 0.05);
        
        // Force reflow to ensure animation starts properly
        textElement.offsetHeight;
        
        // Show text with zoom effect
        textElement.style.opacity = '1';
        textElement.style.transform = 'scale(1)'; // Zoom to normal size
        
        // Store animation controllers in the element for cleanup
        pushPullPromptElement.animations = {
            pulse: pulseAnimation
        };
        
        // console.log('Demo Mode: Showing Push/Pull prompt');
    }
    
    /**
     * Hide the Push/Pull prompt
     */
    function hidePushPullPrompt() {
        if (!pushPullPromptActive || !pushPullPromptElement) return;
        
        // Restore audio to 100% when hiding the prompt
        fadeAudioVolume(1.0, 500);
        
        // Stop all animations
        if (pushPullPromptElement.animations) {
            if (pushPullPromptElement.animations.pulse) pushPullPromptElement.animations.pulse.stop();
            pushPullPromptElement.animations = null;
        }
        
        pushPullPromptElement.style.opacity = '0';
        pushPullPromptActive = false;
        
        // Clear content after fade out
        setTimeout(() => {
            if (!pushPullPromptActive && pushPullPromptElement) {
                pushPullPromptElement.innerHTML = '';
            }
        }, 1000);
        
        // console.log('Demo Mode: Hiding Push/Pull prompt');
    }
    
    /**
     * Show the swipe prompt for Torrential preset
     */
    function showSwipePrompt() {
        if (swipePromptActive || !isFirstLoop) return;
        
        // Fade music to 25% when showing the prompt
        fadeAudioVolume(0.25, 3000);
        
        // Create container if it doesn't exist
        if (!swipePromptElement) {
            swipePromptElement = document.createElement('div');
            swipePromptElement.id = 'swipePrompt';
            
            // Set styles for the container - match other prompt styling
            Object.assign(swipePromptElement.style, {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                opacity: '0',
                pointerEvents: 'none',
                zIndex: '1000',
                width: '80%' // Match the width of standard prompt
            });
            
            document.body.appendChild(swipePromptElement);
        }
        
        // Animation controllers for cleanup
        let pulseAnimation = null;
        let zoomAnimation = null;
        
        // Reset the prompt content
        swipePromptElement.innerHTML = '';
        
        // Create text element with full content
        const textElement = document.createElement('div');
        textElement.id = 'swipePromptText';
        Object.assign(textElement.style, {
            fontSize: '10vw', // Same size as standard prompt
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            opacity: '0',
            transform: 'scale(2)', // Start larger
            transition: 'opacity 1s, transform 1s ease-out',
            lineHeight: '1.5'
        });
        textElement.innerHTML = 'Gimme that<br>Good Swipe';
        
        // Add to the container
        swipePromptElement.appendChild(textElement);
        
        // Display the prompt container
        swipePromptElement.style.opacity = '0.5'; // 50% translucent like standard prompt
        swipePromptActive = true;
        
        // Start pulse effect on the entire prompt
        pulseAnimation = txtPulse(swipePromptElement, 0.25, 0.05);
        
        // Force reflow to ensure animation starts properly
        textElement.offsetHeight;
        
        // Show text with zoom effect
        textElement.style.opacity = '1';
        textElement.style.transform = 'scale(1)'; // Zoom to normal size
        
        // Store animation controllers in the element for cleanup
        swipePromptElement.animations = {
            pulse: pulseAnimation
        };
        
        // console.log('Demo Mode: Showing swipe prompt');
    }
    
    /**
     * Hide the swipe prompt
     */
    function hideSwipePrompt() {
        if (!swipePromptActive || !swipePromptElement) return;
        
        // Restore audio to 100% when hiding the prompt
        fadeAudioVolume(1.0, 500);
        
        // Stop all animations
        if (swipePromptElement.animations) {
            if (swipePromptElement.animations.pulse) swipePromptElement.animations.pulse.stop();
            swipePromptElement.animations = null;
        }
        
        swipePromptElement.style.opacity = '0';
        swipePromptActive = false;
        
        // Clear content after fade out
        setTimeout(() => {
            if (!swipePromptActive && swipePromptElement) {
                swipePromptElement.innerHTML = '';
            }
        }, 1000);
        
        // console.log('Demo Mode: Hiding swipe prompt');
    }
    
    /**
     * Set up keyboard navigation for cycling through presets
     */
    function setupKeyboardNavigation() {
        // Keyboard handler function
        keyboardNavHandler = function(e) {
            if (!isActive) return;
            
            // Detect right arrow or ">" key
            if (e.key === 'ArrowRight' || e.key === '>') {
                // console.log('Demo Mode: Next preset key detected');
                goToNextPreset();
                e.preventDefault();
            }
            // Detect left arrow or "<" key
            else if (e.key === 'ArrowLeft' || e.key === '<') {
                // console.log('Demo Mode: Previous preset key detected');
                goToPreviousPreset();
                e.preventDefault();
            }
        };
        
        // Add event listener to document
        document.addEventListener('keydown', keyboardNavHandler);
    }
    
    /**
     * Go to the next preset immediately
     */
    function goToNextPreset() {
        // Pause cycling if it's active
        const wasActive = isCycling;
        if (wasActive) {
            stopCycling();
        }
        
        // Move to next preset
        cyclePreset();
        
        // Restart cycling if it was active
        if (wasActive) {
            startCycling();
        }
    }
    
    /**
     * Go to the previous preset immediately
     */
    function goToPreviousPreset() {
        // Pause cycling if it's active
        const wasActive = isCycling;
        if (wasActive) {
            stopCycling();
        }
        
        // Calculate previous index
        cycleIndex = (cycleIndex - 2 + PRESET_CYCLES.length) % PRESET_CYCLES.length;
        
        // Move to previous preset
        cyclePreset();
        
        // Restart cycling if it was active
        if (wasActive) {
            startCycling();
        }
    }
    
    /**
     * End the demo mode by removing all swarms
     */
    function endDemoMode(event) {
        if (!isActive) return;
        
        // console.log('Ending Zot Swarm Demo Mode');
        
        // Stop cycling
        stopCycling();
        
        // Stop and cleanup audio
        if (demoAudio) {
            demoAudio.pause();
            demoAudio = null;
        }
        
        // Stop and cleanup slide audio
        if (slideAudio) {
            slideAudio.pause();
            slideAudio = null;
        }
        
        // Clean up intro audio if it exists
        if (introAudio) {
            introAudio.pause();
            introAudio = null;
            introAudioLoaded = false;
            introAudioFailed = false;
        }
        
        // Clear idle timer if active
        if (idleTimer) {
            clearTimeout(idleTimer);
            idleTimer = null;
        }
        
        // Remove prompt element if it exists
        if (promptElement) {
            promptElement.remove();
            promptElement = null;
            promptActive = false;
        }
        
        // Remove event listeners
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.removeEventListener('click', endDemoMode, { capture: true });
            menuToggle.removeEventListener('touchstart', endDemoMode, { capture: true });
        }
        
        // Remove keyboard navigation
        if (keyboardNavHandler) {
            document.removeEventListener('keydown', keyboardNavHandler);
            keyboardNavHandler = null;
        }
        
        // Remove all demo swarms
        if (demoSwarms.length > 0 && ParticleSystem && typeof ParticleSystem.removeZotSwarm === 'function') {
            demoSwarms.forEach(swarmId => {
                try {
                    ParticleSystem.removeZotSwarm(swarmId);
                } catch (error) {
                    // console.error(`Demo Mode: Error removing swarm ${swarmId}:`, error);
                }
            });
            demoSwarms = [];
        }
        
        // Remove push/pull prompt if active
        if (pushPullPromptElement) {
            if (pushPullPromptElement.parentNode) {
                pushPullPromptElement.parentNode.removeChild(pushPullPromptElement);
            }
            pushPullPromptElement = null;
            pushPullPromptActive = false;
        }
        
        // Remove swipe prompt if active
        if (swipePromptElement) {
            if (swipePromptElement.parentNode) {
                swipePromptElement.parentNode.removeChild(swipePromptElement);
            }
            swipePromptElement = null;
            swipePromptActive = false;
        }
        
        isActive = false;
        touchDetected = false;
        secondTouchDetected = false; // Reset second touch detection
        isFirstLoop = true; // Reset for next start
        
        // Enable the music button after demo mode ends
        if (typeof MusicController !== 'undefined' && MusicController.enableButton) {
            // console.log('Demo Mode: Enabling music button after demo mode ends');
            MusicController.enableButton();
        }
        
        // Allow the event to continue propagating after we've cleaned up
        // (so the menu button still works normally)
    }
    
    /**
     * Create the initial single jellyorb swarm
     */
    function createInitialSwarm() {
        // Get canvas dimensions
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            // console.error('Demo Mode: Canvas not found');
            return;
        }
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Configure the swarm with parameters from jellyOrbs preset
        const preset = Presets.swarmPresets[DEMO_CONFIG.presetName] || {};
        
        // Configuration object for the swarm
        const config = {
            // Swarm preset behavior parameters
            zotCount: DEMO_CONFIG.zotsPerSwarm,
            speed: DEMO_CONFIG.initialSpeed, // Use the slower initial speed
            separation: preset.separation || 0.1,
            alignment: preset.alignment || 0.1,
            cohesion: preset.cohesion || 5,
            perception: preset.perception || 100,
            
            // Position - center of canvas
            centerX: centerX,
            centerY: centerY,
            
            // Appearance
            colorTheme: DEMO_CONFIG.colorTheme,
            minSize: DEMO_CONFIG.minSize,
            maxSize: DEMO_CONFIG.maxSize,
            
            // Name
            name: `Demo Swarm 1`
        };
        
        // Create the swarm
        try {
            const swarmId = ParticleSystem.createZotSwarm(config);
            if (swarmId) {
                demoSwarms.push(swarmId);
                // console.log(`Demo Mode: Created initial swarm ${swarmId} at center (${centerX.toFixed(0)}, ${centerY.toFixed(0)}) with speed ${config.speed}`);
            }
        } catch (error) {
            // console.error('Demo Mode: Error creating initial swarm:', error);
        }
    }
    
    /**
     * Create the remaining 7 swarms in a circular arrangement centered around the second touch location
     */
    function createRemainingSwarms() {
        // Get canvas dimensions
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            // console.error('Demo Mode: Canvas not found');
            return;
        }
        
        // Use the second touch location as the center
        const centerX = secondTouchX !== null ? secondTouchX : canvas.width / 2;
        const centerY = secondTouchY !== null ? secondTouchY : canvas.height / 2;
        const radius = DEMO_CONFIG.circleRadius; // Use fixed radius value directly
        
        // Determine number of swarms to create
        const swarmCount = DEMO_CONFIG.swarmCount - 1; // -1 because we already created one
        
        // Create swarms in a circular pattern
        for (let i = 0; i < swarmCount; i++) {
            // Calculate position on circle with even distribution
            const angle = (i / swarmCount) * Math.PI * 2; // Evenly distribute swarms
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Configure the swarm with parameters from jellyOrbs preset
            const preset = Presets.swarmPresets[DEMO_CONFIG.presetName] || {};
            
            // Configuration object for the swarm
            const config = {
                // Swarm preset behavior parameters
                zotCount: DEMO_CONFIG.zotsPerSwarm,
                speed: DEMO_CONFIG.initialSpeed, // Use the slower initial speed
                separation: preset.separation || 0.1,
                alignment: preset.alignment || 0.1,
                cohesion: preset.cohesion || 5,
                perception: preset.perception || 100,
                
                // Position
                centerX: x,
                centerY: y,
                
                // Appearance
                colorTheme: DEMO_CONFIG.colorTheme,
                minSize: DEMO_CONFIG.minSize,
                maxSize: DEMO_CONFIG.maxSize,
                
                // Name
                name: `Demo Swarm ${i+2}` // Start numbering from 2
            };
            
            // Create the swarm
            try {
                const swarmId = ParticleSystem.createZotSwarm(config);
                if (swarmId) {
                    demoSwarms.push(swarmId);
                    // console.log(`Demo Mode: Created additional swarm ${swarmId} at (${x.toFixed(0)}, ${y.toFixed(0)}) with speed ${config.speed}`);
                }
            } catch (error) {
                // console.error('Demo Mode: Error creating additional swarm:', error);
            }
        }
        
        // console.log(`Demo Mode: Created ${swarmCount} additional swarms, total: ${demoSwarms.length}`);
    }
    
    /**
     * Shuffle an array using Fisher-Yates algorithm
     * @param {Array} array The array to shuffle
     * @returns {Array} A new shuffled array
     */
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Randomize and prepare the song playlist
     */
    function randomizeSongs() {
        // Get all demo song keys except intro
        const songKeys = Config.getDemoSongKeys();
        // console.log('Demo Mode: Available song keys:', songKeys);
        shuffledSongKeys = shuffleArray(songKeys);
        currentSongIndex = -1; // Will be incremented to 0 on first play
        // console.log('Demo Mode: Randomized song playlist:', shuffledSongKeys);
    }

    /**
     * Play the next song in the shuffled playlist
     */
    function playNextSong() {
        // Don't proceed if we don't have any songs
        if (!shuffledSongKeys || shuffledSongKeys.length === 0) {
            // console.error('Demo Mode: No songs in playlist, randomizing songs first');
            randomizeSongs();
            if (!shuffledSongKeys || shuffledSongKeys.length === 0) {
                // console.error('Demo Mode: Failed to get songs, cannot play music');
                return;
            }
        }
        
        currentSongIndex = (currentSongIndex + 1) % shuffledSongKeys.length;
        const nextSongKey = shuffledSongKeys[currentSongIndex];
        
        // console.log(`Demo Mode: Preparing to play next song: ${nextSongKey}`);
        
        // Create new audio element
        if (demoAudio) {
            demoAudio.pause();
        }
        
        demoAudio = new Audio();
        
        // Get source path - try two methods for more reliability
        let audioPath;
        try {
            // Try Config method first
            audioPath = Config.getAudioPath(nextSongKey);
            // console.log(`Demo Mode: Config provided path: ${audioPath}`);
            
            // If it's not a full path (doesn't start with http or /), convert to direct path
            if (!audioPath.startsWith('http') && !audioPath.startsWith('/')) {
                // Fall back to direct path if needed
                const fileName = nextSongKey.replace(/([A-Z])/g, '_$1').toLowerCase();
                if (fileName.startsWith('_')) {
                    audioPath = `./music/${fileName.substring(1)}.mp3`;
                } else {
                    audioPath = `./music/${fileName}.mp3`;
                }
                
                // Handle special cases for direct paths
                if (nextSongKey.startsWith('demo')) {
                    // Capitalize first letter for demo files
                    const demoName = nextSongKey.charAt(0).toUpperCase() + nextSongKey.slice(1);
                    audioPath = `./music/${demoName}.mp3`;
                } else if (nextSongKey === 'eightBit') {
                    audioPath = './music/8-Bit.mp3';
                }
                
                // console.log(`Demo Mode: Using direct path: ${audioPath}`);
            }
        } catch (err) {
            // console.error('Demo Mode: Error getting audio path from Config, using fallback path');
            
            // Use a fallback demo song if everything fails
            audioPath = './music/DemoPulse.mp3';
        }
        
        // console.log(`Demo Mode: Creating audio element with path: ${audioPath}`);
        
        // Preload setting
        demoAudio.preload = 'auto';
        
        // Set source
        demoAudio.src = audioPath;
        
        // Add load event handler
        demoAudio.onloadeddata = function() {
            // console.log(`Demo Mode: Song ${nextSongKey} loaded successfully`);
        };
        
        // Set up ended event for continuous playback
        demoAudio.onended = playNextSong;
        
        // Add error handling
        demoAudio.onerror = function(err) {
            // console.error(`Demo Mode: Error loading audio ${nextSongKey}:`, err);
            // console.error('Demo Mode: Audio error code:', demoAudio.error ? demoAudio.error.code : 'unknown');
            // console.error('Demo Mode: Audio src was:', demoAudio.src);
            
            // Try a direct fallback to a reliable file
            // console.log('Demo Mode: Trying fallback to DemoPulse.mp3');
            demoAudio.src = './music/DemoPulse.mp3';
            
            // Try to play the fallback, but prepare to move on if it fails
            try {
                demoAudio.play().catch(() => {
                    demoAudio = null;
                    // Try to play next song on error
                    setTimeout(playNextSong, 1000);
                });
            } catch (e) {
                demoAudio = null;
                // Try to play next song on error
                setTimeout(playNextSong, 1000);
            }
        };
        
        // Play the audio with a short delay to ensure loading starts
        setTimeout(() => {
            try {
                // console.log(`Demo Mode: Attempting to play song: ${nextSongKey}`);
                
                // Make sure user interaction has been recorded for autoplay policies
                if (typeof document !== 'undefined' && document.documentElement && 
                    typeof document.documentElement.hasAttribute === 'function' &&
                    !document.documentElement.hasAttribute('data-user-interacted')) {
                    document.documentElement.setAttribute('data-user-interacted', 'true');
                    // console.log('Demo Mode: Setting user interaction flag for autoplay');
                }
                
                const playPromise = demoAudio.play();
                
                // Handle the promise properly
                if (playPromise !== undefined) {
                    // console.log(`Demo Mode: Song ${nextSongKey} playing successfully`);
                }
            } catch (err) {
                // console.error(`Demo Mode: Error initiating audio playback for ${nextSongKey}:`, err);
                setTimeout(playNextSong, 1000);
            }
        }, 300);
        
        // console.log(`Demo Mode: Playing song ${currentSongIndex + 1}/${shuffledSongKeys.length}: ${nextSongKey}`);
    }

    /**
     * Preload the intro audio file so it's ready to play immediately when needed
     */
    function preloadIntroAudio() {
        if (introAudio || introAudioLoaded) {
            // console.log('Demo Mode: Intro audio already preloaded');
            return;
        }
        
        // console.log('Demo Mode: Preloading intro audio...');
        
        // Create a dedicated audio element just for the intro
        introAudio = new Audio();
        
        // Set highest preload priority
        introAudio.preload = 'auto';
        
        // Use a direct path to the audio file for maximum reliability
        introAudio.src = './music/DemoIntro.mp3';
        
        // Add load event handler
        introAudio.onloadeddata = function() {
            // console.log('Demo Mode: Intro audio loaded successfully and cached');
            introAudioLoaded = true;
            
            // Additional measure to ensure audio stays in memory
            // Force a play/pause with minimal volume to engage the audio subsystem
            try {
                introAudio.volume = 0.001; // Nearly silent
                const promise = introAudio.play();
                
                if (promise !== undefined) {
                    promise.then(() => {
                        // Immediately pause after successful play
                        setTimeout(() => {
                            introAudio.pause();
                            introAudio.currentTime = 0; // Reset to beginning
                            introAudio.volume = 1.0; // Reset volume
                            // console.log('Demo Mode: Intro audio primed for immediate playback');
                        }, 10);
                    }).catch(err => {
                        // Common error on browsers that require user interaction - not a problem
                        // console.log('Demo Mode: Audio priming required user interaction (expected):', err.name);
                        // Reset volume anyway
                        introAudio.volume = 1.0;
                    });
                }
            } catch (e) {
                // Silent failure is ok here - browser policy may prevent this technique
                introAudio.volume = 1.0; // Reset volume
            }
        };
        
        // Add canplaythrough event for more detailed loading feedback
        introAudio.oncanplaythrough = function() {
            // console.log('Demo Mode: Intro audio can play through without buffering');
        };
        
        // Add error handling with multiple fallback paths
        introAudio.onerror = function(err) {
            // console.error('Demo Mode: Error loading intro audio:', err);
            // console.error('Demo Mode: Audio error code:', introAudio.error ? introAudio.error.code : 'unknown');
            
            // Try alternative path
            if (introAudio.src.indexOf('./music/') === 0) {
                // console.log('Demo Mode: Trying alternative path for intro audio');
                introAudio.src = '/music/DemoIntro.mp3';
                
                // Handle second failure
                introAudio.onerror = function() {
                    // console.error('Demo Mode: Second attempt to load intro audio failed');
                    
                    // Try one more absolute fallback
                    if (typeof window !== 'undefined' && window.location) {
                        introAudio.src = window.location.origin + '/music/DemoIntro.mp3';
                        
                        // Final failure handler
                        introAudio.onerror = function() {
                            // console.error('Demo Mode: All attempts to load intro audio failed');
                            introAudioFailed = true;
                            introAudio = null;
                        };
                    } else {
                        introAudioFailed = true;
                        introAudio = null;
                    }
                };
            } else {
                introAudioFailed = true;
                introAudio = null;
            }
        };
        
        // Explicitly call load() to start loading the audio right away
        introAudio.load();
    }
    
    /**
     * Stop any playing demo audio with fade out effect
     * @param {number} fadeOutDuration - Fade out duration in ms (default 1500ms)
     */
    function stopAudio(fadeOutDuration = 3000) {
        if (!demoAudio) {
            // console.log('Demo Mode: No audio to stop');
            return;
        }
        
        // If audio is already paused, just cleanup
        if (demoAudio.paused) {
            demoAudio = null;
            // console.log('Demo Mode: Audio already paused, cleaned up audio element');
            return;
        }
        
        // console.log(`Demo Mode: Fading out audio over ${fadeOutDuration}ms`);
        
        // Store original volume for reference
        const originalVolume = demoAudio.volume;
        
        // Create a reference to the audio element that we'll keep for the fade
        const audioToFade = demoAudio;
        
        // Prevent setting demoAudio to null until fade completes
        demoAudio = null; // Clear the reference so new audio can be created if needed
        
        // Implement fade out
        const fadeSteps = 30; // Increase number of steps for smoother fade
        const fadeStepTime = fadeOutDuration / fadeSteps; // Time between volume changes
        const volumeStep = originalVolume / fadeSteps; // Amount to reduce volume each step
        
        let currentStep = 0;
        
        // Create fade interval
        const fadeInterval = setInterval(() => {
            currentStep++;
            
            // Calculate new volume
            const newVolume = Math.max(originalVolume - (volumeStep * currentStep), 0);
            
            // Apply new volume
            audioToFade.volume = newVolume;
            
            // Log every few steps to monitor the fade progress
            if (currentStep % 5 === 0) {
                // console.log(`Demo Mode: Fade progress - volume: ${newVolume.toFixed(2)} (step ${currentStep}/${fadeSteps})`);
            }
            
            // Check if we've completed the fade
            if (currentStep >= fadeSteps || newVolume <= 0) {
                clearInterval(fadeInterval);
                audioToFade.pause();
                
                // Reset volume for future use (not really needed since we're discarding the element)
                audioToFade.volume = originalVolume;
                
                // console.log('Demo Mode: Fade out complete, audio stopped');
            }
        }, fadeStepTime);
    }
    
    /**
     * Toggle pause/play state of demo audio
     * @returns {boolean} true if audio is now playing, false if paused
     */
    function togglePauseAudio() {
        if (!demoAudio) {
            // console.log('Demo Mode: No audio element exists to toggle');
            return false;
        }
        
        if (demoAudio.paused) {
            // Resume playback
            // console.log('Demo Mode: Attempting to resume paused audio');
            
            try {
                // Make sure user interaction has been recorded for autoplay policies
                if (typeof document !== 'undefined' && document.documentElement && 
                    typeof document.documentElement.hasAttribute === 'function' &&
                    !document.documentElement.hasAttribute('data-user-interacted')) {
                    document.documentElement.setAttribute('data-user-interacted', 'true');
                    // console.log('Demo Mode: Setting user interaction flag for autoplay');
                }
                
                const playPromise = demoAudio.play();
                
                // Handle the promise properly
                if (playPromise !== undefined) {
                    // console.log('Demo Mode: Audio resumed successfully on toggle');
                }
                
                // console.log('Demo Mode: Toggle - audio now playing (requested)');
                return true;
            } catch (err) {
                // console.error('Demo Mode: Error initiating audio resume on toggle:', err);
                return false;
            }
        } else {
            // Pause playback
            demoAudio.pause();
            // console.log('Demo Mode: Toggle - audio now paused');
            return false;
        }
    }
    
    /**
     * Resume audio playback if it's paused
     * @returns {boolean} true if successfully resumed, false otherwise
     */
    function resumeAudio() {
        if (!demoAudio) {
            // console.log('Demo Mode: No audio element exists to resume');
            return false;
        }
        
        if (!demoAudio.paused) {
            // console.log('Demo Mode: Audio is already playing, no need to resume');
            return false;
        }
        
        // console.log('Demo Mode: Attempting to resume audio playback');
        
        try {
            // Make sure user interaction has been recorded for autoplay policies
            if (typeof document !== 'undefined' && document.documentElement && 
                typeof document.documentElement.hasAttribute === 'function' &&
                !document.documentElement.hasAttribute('data-user-interacted')) {
                document.documentElement.setAttribute('data-user-interacted', 'true');
                // console.log('Demo Mode: Setting user interaction flag for autoplay');
            }
            
            const playPromise = demoAudio.play();
            
            // Handle the promise properly
            if (playPromise !== undefined) {
                // console.log('Demo Mode: Audio resumed successfully');
                return true;
            } else {
                // console.log('Demo Mode: Audio play did not return a promise, assuming success');
                return true;
            }
        } catch (err) {
            // console.error('Demo Mode: Error initiating audio resume:', err);
            return false;
        }
    }
    
    /**
     * Check if demo audio is currently playing
     */
    function isAudioPlaying() {
        return demoAudio !== null && !demoAudio.paused;
    }
    
    /**
     * Preload the slide audio file for quick playback when swipe is detected
     */
    function preloadSlideAudio() {
        try {
            // Create audio element if it doesn't exist
            if (!slideAudio) {
                // console.log('Demo Mode: Preloading DemoSlides.mp3');
                
                slideAudio = new Audio();
                
                // Set preload attribute to ensure it loads immediately
                slideAudio.preload = 'auto';
                
                // Set source - use direct path for reliability
                // Fix the file name (DemoSlides.mp3 with an 's', not DemoSlide.mp3)
                slideAudio.src = './music/DemoSlides.mp3';
                
                // Add load event handler
                slideAudio.onloadeddata = function() {
                    // console.log('Demo Mode: DemoSlides.mp3 loaded successfully');
                };
                
                // Add error handling with more detailed logging
                slideAudio.onerror = function(err) {
                    // console.error('Demo Mode: Error loading DemoSlides.mp3:', err);
                    // console.error('Demo Mode: Audio error code:', slideAudio.error ? slideAudio.error.code : 'unknown');
                    // console.error('Demo Mode: Audio src was:', slideAudio.src);
                    
                    // Try a fallback with the full path
                    // console.log('Demo Mode: Trying fallback path for DemoSlides.mp3');
                    slideAudio.src = '/music/DemoSlides.mp3';
                    
                    // If that still fails, try another fallback
                    slideAudio.onerror = function() {
                        // console.error('Demo Mode: Second attempt to load DemoSlides.mp3 failed');
                        
                        // Try one more absolute fallback
                        slideAudio.src = window.location.origin + '/music/DemoSlides.mp3';
                        slideAudio.onerror = function() {
                            // console.error('Demo Mode: All attempts to load DemoSlides.mp3 failed');
                            slideAudio = null;
                        };
                    };
                };
            }
        } catch (err) {
            // console.error('Demo Mode: Error setting up slide audio:', err);
            slideAudio = null;
        }
    }
    
    /**
     * Play the slide audio when swipe is detected
     */
    function playSlideAudio() {
        if (!slideAudio) {
            // Try to create it if it doesn't exist
            preloadSlideAudio();
            
            // If still doesn't exist, return
            if (!slideAudio) {
                // console.error('Demo Mode: Cannot play slide audio - element not available');
                return;
            }
        }
        
        try {
            // console.log('Demo Mode: Playing DemoSlides.mp3');
            
            // Make sure user interaction has been recorded for autoplay policies
            if (typeof document !== 'undefined' && document.documentElement && 
                typeof document.documentElement.hasAttribute === 'function' &&
                !document.documentElement.hasAttribute('data-user-interacted')) {
                document.documentElement.setAttribute('data-user-interacted', 'true');
                // console.log('Demo Mode: Setting user interaction flag for autoplay');
            }
            
            // Reset audio to beginning if it was played before
            slideAudio.currentTime = 0;
            
            const playPromise = slideAudio.play();
            
            // Handle the promise properly
            if (playPromise !== undefined) {
                // console.log('Demo Mode: DemoSlides.mp3 playing successfully');
            }
        } catch (err) {
            // console.error('Demo Mode: Error playing slide audio:', err);
        }
    }
    
    /**
     * Update all jellyOrb swarm speeds to a new value
     * @param {number} speed - The new speed to set for all jellyOrb swarms
     */
    function updateAllJellyOrbsSpeed(speed) {
        // console.log(`Demo Mode: Updating all jellyOrb swarms to speed ${speed}`);
        
        // Update each swarm in the demoSwarms array
        demoSwarms.forEach((swarmId, index) => {
            try {
                // Only update the speed property
                const updateConfig = {
                    speed: speed
                };
                
                // Update the swarm
                if (ParticleSystem.updateZotSwarm) {
                    ParticleSystem.updateZotSwarm(swarmId, updateConfig);
                    // console.log(`Demo Mode: Updated swarm ${swarmId} speed to ${speed}`);
                }
            } catch (error) {
                // console.error(`Demo Mode: Error updating swarm ${swarmId} speed:`, error);
            }
        });
    }
    
    // Public API
    return {
        start: start,
        end: endDemoMode,
        isActive: function() { return isActive; },
        isSecondTouchDetected: function() { return secondTouchDetected; },
        stopAudio: stopAudio,
        togglePauseAudio: togglePauseAudio,
        resumeAudio: resumeAudio,
        isAudioPlaying: isAudioPlaying,
        fadeAudioVolume: fadeAudioVolume, // Add the new fade function
        // Add a public method to force preload the intro audio
        preloadIntroAudio: preloadIntroAudio
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = DemoMode;
} 

// submitSwarms.js - Handle zot swarm submission and loading

const SubmitSwarms = (function() {
    // Track popup state
    let isPopupOpen = false;
    let popupOverlay = null;
    let popupContainer = null;
    let fileInput = null; // Reference to hidden file input element
    
    // Initialize the submit button in the UI
    function init() {
        // Find the button group container
        const buttonGroup = document.querySelector('#zotSwarmsParams .button-group');
        if (!buttonGroup) return;
        
        // Create the submit button
        const submitButton = document.createElement('button');
        submitButton.id = 'submitSwarmsButton';
        submitButton.textContent = 'Save';
        submitButton.className = 'submit-swarms-btn';
        
        // Insert below the button group (not between Create and Clear)
        const parentContainer = buttonGroup.parentElement;
        if (parentContainer) {
            // Create a new div for the save/load buttons that spans the width
            const saveButtonContainer = document.createElement('div');
            saveButtonContainer.className = 'save-button-container';
            saveButtonContainer.style.marginTop = '15px';
            saveButtonContainer.style.display = 'flex';
            saveButtonContainer.style.justifyContent = 'center';
            saveButtonContainer.style.flexDirection = 'column';
            saveButtonContainer.style.gap = '10px';
            
            // Add the save button
            saveButtonContainer.appendChild(submitButton);
            
            // Create load button
            const loadButton = document.createElement('button');
            loadButton.id = 'loadSwarmsButton';
            loadButton.textContent = 'Load';
            loadButton.className = 'load-swarms-btn';
            saveButtonContainer.appendChild(loadButton);
            
            // Create hidden file input for loading
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            fileInput.id = 'swarmFileInput';
            saveButtonContainer.appendChild(fileInput);
            
            // Insert below the button group
            parentContainer.insertBefore(saveButtonContainer, buttonGroup.nextSibling);
        }
        
        // Add click event to the submit button
        submitButton.addEventListener('click', showSubmitPopup);
        
        // Add click event to the load button
        const loadButton = document.getElementById('loadSwarmsButton');
        if (loadButton) {
            loadButton.addEventListener('click', () => {
                // Trigger the file input dialog
                if (fileInput) {
                    fileInput.click();
                }
            });
        }
        
        // Add change event to file input
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }
        
        // Create and add styles for the popup
        addPopupStyles();
    }
    
    // Add CSS styles for the popup
    function addPopupStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .popup-container {
                background: #333;
                border-radius: 8px;
                padding: 20px;
                width: 300px;
                max-width: 90%;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                position: relative;
                color: white;
            }
            
            .popup-title {
                margin-top: 0;
                font-size: 18px;
                border-bottom: 1px solid #444;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            
            .popup-content {
                margin-bottom: 20px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #ddd;
            }
            
            .form-group input, .form-group textarea {
                width: 100%;
                padding: 8px;
                border-radius: 4px;
                border: 1px solid #555;
                background-color: #444;
                color: white;
                font-family: inherit;
            }
            
            .form-group input:focus, .form-group textarea:focus {
                outline: none;
                border-color: #2196F3;
            }
            
            .submission-note {
                margin-top: 15px;
                padding: 10px;
                background-color: rgba(33, 150, 243, 0.1);
                border-left: 3px solid #2196F3;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .submission-note p {
                margin: 0;
                color: #bbb;
            }
            
            .popup-buttons {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .popup-button {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.2s;
            }
            
            .popup-button.submit {
                background-color: #4CAF50;
                color: white;
            }
            
            .popup-button.submit:hover {
                background-color: #388E3C;
            }
            
            .popup-button.cancel {
                background-color: #9e9e9e;
                color: white;
            }
            
            .popup-button.cancel:hover {
                background-color: #757575;
            }
            
            .submit-swarms-btn {
                background-color: #4CAF50;
                color: white;
                width: 100%;
                padding: 10px;
                font-weight: bold;
            }
            
            .submit-swarms-btn:hover {
                background-color: #388E3C;
            }
            
            .load-swarms-btn {
                background-color: #2196F3;
                color: white;
                width: 100%;
                padding: 10px;
                font-weight: bold;
            }
            
            .load-swarms-btn:hover {
                background-color: #0b7dda;
            }
            
            .error-message {
                color: #ff6b6b;
                margin-top: 10px;
                font-size: 14px;
            }
            
            .success-message {
                color: #4CAF50;
                margin-top: 10px;
                font-size: 14px;
            }
            
            .save-button-container {
                width: 100%;
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    // Handle file selection for loading
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                loadZotSwarms(data);
                // Reset file input so the same file can be selected again
                fileInput.value = '';
            } catch (error) {
                // console.error('[LOAD] Error parsing JSON file:', error);
                showLoadError('Error parsing file. Please select a valid JSON file.');
                fileInput.value = '';
            }
        };
        
        reader.onerror = function() {
            // console.error('[LOAD] Error reading file');
            showLoadError('Error reading file. Please try again.');
            fileInput.value = '';
        };
        
        reader.readAsText(file);
    }
    
    // Show error message for load operation
    function showLoadError(message) {
        // Create a popup for the error
        showLoadPopup('Load Error', message, 'error');
    }
    
    // Show success message for load operation
    function showLoadSuccess(message) {
        // Create a popup for the success message
        showLoadPopup('Load Successful', message, 'success');
    }
    
    // Show a popup for load operations
    function showLoadPopup(title, message, type) {
        if (isPopupOpen) closePopup();
        
        // Create overlay
        popupOverlay = document.createElement('div');
        popupOverlay.className = 'popup-overlay';
        
        // Create popup container
        popupContainer = document.createElement('div');
        popupContainer.className = 'popup-container';
        
        // Determine message class based on type
        const messageClass = type === 'error' ? 'error-message' : 'success-message';
        
        // Popup content
        popupContainer.innerHTML = `
            <h3 class="popup-title">${title}</h3>
            <div class="popup-content">
                <div class="${messageClass}">${message}</div>
            </div>
            <div class="popup-buttons">
                <button class="popup-button cancel">Close</button>
            </div>
        `;
        
        // Add to DOM
        popupOverlay.appendChild(popupContainer);
        document.body.appendChild(popupOverlay);
        
        // Set state
        isPopupOpen = true;
        
        // Add event listeners
        const closeBtn = popupContainer.querySelector('.popup-button.cancel');
        closeBtn.addEventListener('click', closePopup);
        
        // Auto-close success messages after 3 seconds
        if (type === 'success') {
            setTimeout(closePopup, 3000);
        }
    }
    
    // Load zot swarms from saved data
    function loadZotSwarms(data) {
        try {
            // console.log('[LOAD] Starting to load swarm data:', data);
            
            if (!data || !data.swarms || !Array.isArray(data.swarms) || data.swarms.length === 0) {
                showLoadError('Invalid data format or no swarms found in file.');
                return false;
            }
            
            // Check if ParticleSystem is available
            if (typeof ParticleSystem === 'undefined' || !ParticleSystem.removeAllZotSwarms || !ParticleSystem.createZotSwarm) {
                showLoadError('ParticleSystem not available for loading swarms.');
                return false;
            }
            
            // Clear existing swarms first
            ParticleSystem.removeAllZotSwarms();
            // console.log('[LOAD] Cleared existing swarms');
            
            // Apply global settings if available
            if (data.globalSettings) {
                if (data.globalSettings.forces && typeof ParticleSystem.updateForceSettings === 'function') {
                    Object.entries(data.globalSettings.forces).forEach(([key, value]) => {
                        ParticleSystem.updateForceSettings(key, value);
                    });
                }
                
                if (data.globalSettings.swipe && typeof SwipeSplitSystem !== 'undefined') {
                    // Apply swipe settings if SwipeSplitSystem has an update method
                    if (typeof SwipeSplitSystem.updateSetting === 'function') {
                        Object.entries(data.globalSettings.swipe).forEach(([key, value]) => {
                            if (key !== 'pathCount') { // Skip non-setting properties
                                SwipeSplitSystem.updateSetting(key, value);
                            }
                        });
                    }
                }
            }
            
            // Recreate each swarm
            const loadedSwarms = [];
            data.swarms.forEach(swarm => {
                // Ensure we have valid settings
                if (!swarm.settings) {
                    // console.warn('[LOAD] Skipping swarm with missing settings:', swarm);
                    return;
                }
                
                // Calculate center position if not present
                const config = {
                    ...swarm.settings,
                    centerX: window.innerWidth / 2,  // Default center position
                    centerY: window.innerHeight / 2
                };
                
                // Create the swarm with the saved configuration
                const swarmId = ParticleSystem.createZotSwarm(config);
                if (swarmId) {
                    loadedSwarms.push(swarmId);
                }
            });
            
            // console.log('[LOAD] Created swarms:', loadedSwarms);
            
            // Update UI to show swarms directly
            updateSwarmListUI();
            
            // Show success message
            showLoadSuccess(`Successfully loaded ${loadedSwarms.length} swarm${loadedSwarms.length !== 1 ? 's' : ''}.`);
            
            return true;
        } catch (error) {
            // console.error('[LOAD] Error loading swarms:', error);
            showLoadError(`Error loading swarms: ${error.message}`);
            return false;
        }
    }
    
    // Function to update the swarm list UI directly
    function updateSwarmListUI() {
        // console.log('[UPDATE] Starting updateSwarmListUI');
        const swarmDropdown = document.getElementById('swarmList');
        const removeButton = document.getElementById('removeSwarmBtn');
        const clearSwarmsButton = document.getElementById('clearSwarmsButton');
        
        if (!swarmDropdown || !removeButton) {
            // console.warn('[UPDATE] Required elements not found:', { 
            //     swarmDropdown: !!swarmDropdown, 
            //     removeButton: !!removeButton 
            // });
            return;
        }
        
        // Get the current swarms
        const swarms = ParticleSystem.getZotSwarms();
        // console.log('[UPDATE] Current swarms:', swarms);
        
        // Clear the dropdown
        swarmDropdown.innerHTML = '';
        
        // Disable the remove button if no swarms
        if (swarms.length === 0) {
            // console.log('[UPDATE] No swarms found, showing default option');
            const noSwarmsOption = document.createElement('option');
            noSwarmsOption.value = '';
            noSwarmsOption.textContent = 'No swarms created yet';
            swarmDropdown.appendChild(noSwarmsOption);
            
            removeButton.disabled = true;
            
            // Disable the clear swarms button
            if (clearSwarmsButton) {
                clearSwarmsButton.classList.add('disabled');
            }
            
            return;
        } else {
            removeButton.disabled = false;
            
            // Enable the clear swarms button
            if (clearSwarmsButton) {
                clearSwarmsButton.classList.remove('disabled');
            }
        }
        
        // Add each swarm to the dropdown
        swarms.forEach(swarm => {
            // console.log('[UPDATE] Adding swarm to dropdown:', swarm);
            const option = document.createElement('option');
            option.value = swarm.id;
            const colorThemeName = Presets.colorThemes[swarm.settings.colorTheme]?.name || 'Custom';
            
            // Check if this is a randomized swarm or settings don't match any preset
            let presetDisplayName;
            if (swarm.settings.isRandomized) {
                presetDisplayName = 'Random';
            } else {
                // Check if settings match any preset
                const matchedPreset = findMatchingPreset(swarm.settings);
                if (matchedPreset) {
                    presetDisplayName = Presets.swarmPresets[matchedPreset]?.name || 'Custom';
                } else {
                    presetDisplayName = 'Random';
                }
            }
            
            option.textContent = `${presetDisplayName} ${colorThemeName} (${swarm.zotCount})`;
            swarmDropdown.appendChild(option);
        });
        
        // Select the most recently created swarm (last in the array)
        if (swarms.length > 0) {
            const mostRecentSwarm = swarms[swarms.length - 1];
            swarmDropdown.value = mostRecentSwarm.id;
            // console.log('[UPDATE] Selected most recent swarm:', mostRecentSwarm.id);
        }
    }
    
    // Helper function to check if swarm settings match a preset
    function findMatchingPreset(settings) {
        // Check each preset
        for (const [presetId, preset] of Object.entries(Presets.swarmPresets)) {
            if (
                Math.abs(preset.speed - settings.speed) < 0.01 &&
                Math.abs(preset.separation - settings.separation) < 0.01 &&
                Math.abs(preset.alignment - settings.alignment) < 0.01 &&
                Math.abs(preset.cohesion - settings.cohesion) < 0.01 &&
                Math.abs(preset.perception - settings.perception) < 0.01 &&
                preset.colorTheme === settings.colorTheme
            ) {
                return presetId;
            }
        }
        return null;
    }
    
    // Show the submit popup
    function showSubmitPopup() {
        if (isPopupOpen) return;
        
        // Create overlay
        popupOverlay = document.createElement('div');
        popupOverlay.className = 'popup-overlay';
        
        // Create popup container
        popupContainer = document.createElement('div');
        popupContainer.className = 'popup-container';
        popupContainer.style.width = '400px'; // Make wider for the input fields
        
        // Popup content
        popupContainer.innerHTML = `
            <h3 class="popup-title">Save Zots</h3>
            <div class="popup-content">
                <div class="form-group">
                    <label for="presetName">Preset Name (optional):</label>
                    <input type="text" id="presetName" placeholder="Give your creation a name">
                </div>
                <div class="form-group">
                    <label for="presetDescription">Description (optional):</label>
                    <textarea id="presetDescription" placeholder="Tell us about your swarm or any feedback" rows="3"></textarea>
                </div>
                <div class="submission-note">
                    <p>Your preset might be featured in the app or even the demo for everyone to enjoy! 
                    Share your incredible creations with the community. Be sure to tag me on TikTok @germa1y #zoticles #zotswarms</p>
                </div>
            </div>
            <div id="submitError" class="error-message" style="display: none;"></div>
            <div class="popup-buttons">
                <button class="popup-button submit">Save</button>
                <button class="popup-button cancel">Cancel</button>
            </div>
        `;
        
        // Add to DOM
        popupOverlay.appendChild(popupContainer);
        document.body.appendChild(popupOverlay);
        
        // Set state
        isPopupOpen = true;
        
        // Add event listeners
        const submitBtn = popupContainer.querySelector('.popup-button.submit');
        const cancelBtn = popupContainer.querySelector('.popup-button.cancel');
        const errorElement = popupContainer.querySelector('#submitError');
        
        submitBtn.addEventListener('click', function() {
            // console.log('[SAVE] Save button clicked');
            
            // Get preset name and description
            const presetName = document.getElementById('presetName').value.trim();
            const presetDescription = document.getElementById('presetDescription').value.trim();
            
            // Validate if there are particles on screen
            if (typeof ParticleSystem !== 'undefined' && ParticleSystem.getZotSwarms) {
                // console.log('[SAVE] ParticleSystem is available');
                
                const swarms = ParticleSystem.getZotSwarms();
                // console.log(`[SAVE] Found ${swarms ? swarms.length : 0} swarms`);
                
                if (!swarms || swarms.length === 0) {
                    // Show error message if no particles
                    // console.error('[SAVE] No swarms found');
                    errorElement.textContent = "No zot swarms found! Please create at least one swarm.";
                    errorElement.style.display = "block";
                    return;
                }
                
                // Try to save the data, but we'll show an error if it fails
                try {
                    // Create and save the JSON file
                    const result = saveZotSwarms(swarms);
                    
                    // Show success or error message
                    if (result) {
                        closePopup();
                    } else {
                        errorElement.innerHTML = "Browser security prevents saving directly.<br>Check the browser console (F12) for more details.";
                        errorElement.style.display = "block";
                        
                        // Don't close the popup so user can see the error
                        submitBtn.disabled = true;
                        submitBtn.textContent = "Error";
                    }
                } catch (error) {
                    // console.error('[SAVE] Error during save:', error);
                    errorElement.textContent = "An error occurred: " + error.message;
                    errorElement.style.display = "block";
                }
            } else {
                // console.error('[SAVE] ParticleSystem not available');
                errorElement.textContent = "Error: ParticleSystem not available.";
                errorElement.style.display = "block";
            }
        });
        
        cancelBtn.addEventListener('click', closePopup);
        
        // Stop propagation of clicks inside the popup
        popupContainer.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // Clicking outside the popup should not close it (events are blocked)
        popupOverlay.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Save zot swarms data as JSON file
    function saveZotSwarms(swarms) {
        try {
            // Get preset name and description from DOM elements
            const presetName = document.getElementById('presetName')?.value.trim() || '';
            const presetDescription = document.getElementById('presetDescription')?.value.trim() || '';
            
            // Collect global force settings from ParticleSystem
            const forceSettings = {};
            
            // Try to get all force-related parameters (if these methods exist)
            if (typeof ParticleSystem.getForceSettings === 'function') {
                Object.assign(forceSettings, ParticleSystem.getForceSettings());
            } else {
                // Fallback to collecting individual settings
                if (typeof ParticleSystem.getForceSettingValue === 'function') {
                    forceSettings.touchForce = ParticleSystem.getForceSettingValue('touchForce');
                    forceSettings.wallForce = ParticleSystem.getForceSettingValue('wallForce');
                    forceSettings.zotTouchEnabled = ParticleSystem.getForceSettingValue('zotTouchEnabled');
                    forceSettings.zotSwarmInteractionEnabled = ParticleSystem.getForceSettingValue('zotSwarmInteractionEnabled');
                }
            }
            
            // Wall forces removed as they're inconsequential for saving purposes
            
            // Get swipe force settings if available
            const swipeSettings = {};
            if (typeof SwipeSplitSystem !== 'undefined' && typeof SwipeSplitSystem.getSettings === 'function') {
                Object.assign(swipeSettings, SwipeSplitSystem.getSettings());
            }

            // Create data object with swarm settings and metadata
            const data = {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                presetName: presetName,
                description: presetDescription,
                screenSize: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                // Include all global settings that affect swarm behavior
                globalSettings: {
                    forces: forceSettings,
                    // walls removed as they're inconsequential for saving
                    swipe: swipeSettings
                },
                swarms: swarms.map(swarm => ({
                    id: swarm.id,
                    zotCount: swarm.zotCount,
                    // Include full settings object to ensure all parameters are saved
                    settings: swarm.settings
                    // Individual particle data removed as it's not necessary
                }))
            };
            
            // Convert to JSON string
            const jsonString = JSON.stringify(data, null, 2);
            
            // Create a Blob with the JSON data
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // Create a unique timestamp filename (no underscores or spaces)
            const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '');
            const filename = `preset${timestamp}.json`;
            
            // console.log(`[SAVE] Attempting to save data to ${filename}`);
            // console.log(`[SAVE] Data size: ${Math.round(jsonString.length / 1024)} KB`);
            // console.log(`[SAVE] Number of swarms: ${swarms.length}`);
            
            // Attempt to trigger download for the user to save manually
            try {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                // console.log(`[SAVE] Download attempted for ${filename}`);
                return true;
            } catch (downloadError) {
                // console.error(`[SAVE] Download attempt failed:`, downloadError);
                return false;
            }
        } catch (error) {
            // console.error(`[SAVE] ERROR: Failed to process swarm data`);
            // console.error(`[SAVE] Error details:`, error);
            // console.error(`[SAVE] Error name: ${error.name}`);
            // console.error(`[SAVE] Error message: ${error.message}`);
            // console.error(`[SAVE] Error stack:`, error.stack);
            return false;
        }
    }
    
    // Close the popup
    function closePopup() {
        if (!isPopupOpen || !popupOverlay) return;
        
        document.body.removeChild(popupOverlay);
        popupOverlay = null;
        popupContainer = null;
        isPopupOpen = false;
    }
    
    // Public API
    return {
        init: init
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SubmitSwarms;
} 

// main.js - Application initialization
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    const menuToggle = document.getElementById('menuToggle');
    const homeButton = document.getElementById('homeButton');
    const fpsDisplay = document.getElementById('fps');
    const controlsPanel = document.getElementById('controls');
    
    // Global control for slider value labels
    window.SliderControls = {
        hideLabels: true, // Default state - show all labels
        
        // Toggle all slider value labels except for zot count and size ranges
        toggleLabels: function() {
            this.hideLabels = !this.hideLabels;
            this.updateAllLabelVisibility();
            // console.log(`Slider labels are now ${this.hideLabels ? 'hidden' : 'visible'} (except zot count which is always visible)`);
            return this.hideLabels;
        },
        
        // Update all slider value displays based on current state
        updateAllLabelVisibility: function() {
            const valueDisplays = document.querySelectorAll('[id$="Value"]');
            valueDisplays.forEach(display => {
                const sliderId = display.id.replace('Value', '');
                
                // Skip zot count and max size - always visible
                if (sliderId === 'newSwarmZotCount' || sliderId === 'newSwarmMaxSize') {
                    const slider = document.getElementById(sliderId);
                    if (slider) {
                        const precision = sliderId === 'newSwarmMaxSize' ? 1 : 
                                         (slider.step === '1' || parseFloat(slider.step) === 1) ? 0 : 
                                         slider.step.includes('.01') ? 2 : 1;
                        display.textContent = parseFloat(slider.value).toFixed(precision);
                    }
                    display.style.display = '';
                    return;
                }
                
                // For min size slider - show when labels are visible
                if (sliderId === 'newSwarmMinSize') {
                    display.style.display = this.hideLabels ? 'none' : '';
                    if (!this.hideLabels) {
                        // Update value if showing
                        const slider = document.getElementById(sliderId);
                        if (slider) {
                            display.textContent = parseFloat(slider.value).toFixed(1);
                        }
                    }
                    return;
                }
                
                // For all other sliders
                display.style.display = this.hideLabels ? 'none' : '';
                if (!this.hideLabels) {
                    // Update value if showing
                    const slider = document.getElementById(sliderId);
                    if (slider) {
                        const shouldRound = slider.step === '1' || parseFloat(slider.step) === 1;
                        const precision = shouldRound ? 0 : 
                                         slider.step.includes('.01') ? 2 : 1;
                        display.textContent = parseFloat(slider.value).toFixed(precision);
                    }
                }
            });
        }
    };
    
    // Document the toggle function in console for easy access
    // console.log("To toggle slider value labels, use: SliderControls.toggleLabels()");
    
    // console.log("DOM loaded - Menu elements:", menuToggle ? "✓" : "✗", controlsPanel ? "✓" : "✗", homeButton ? "✓" : "✗");
    
    // Initialize the particle system
    ParticleSystem.init(canvas, fpsDisplay);
    
    // Initialize wall system
    WallSystem.init();
    
    // Initialize swipe split system
    if (typeof SwipeSplitSystem !== 'undefined') {
        // console.log("Initializing SwipeSplitSystem...");
        SwipeSplitSystem.init(canvas);
    } else {
        // console.error("SwipeSplitSystem module not available");
    }
    
    // Start demo mode
    if (typeof DemoMode !== 'undefined') {
        // console.log("Starting zot swarm demo mode...");
        setTimeout(() => {
            DemoMode.start();
        }, 200); // Short delay to ensure all systems are fully initialized
    } else {
        // console.error("Demo Mode module not available");
    }
    
    // Add direct event listeners to menu toggle as a backup
    if (menuToggle && controlsPanel) {
        // console.log("Adding direct event listeners to menu toggle");
        
        menuToggle.addEventListener('click', function(e) {
            // console.log("Menu toggle clicked");
            e.preventDefault();
            controlsPanel.classList.toggle('collapsed');
            updateHomeButtonVisibility();
        });
        
        menuToggle.addEventListener('touchstart', function(e) {
            // console.log("Menu toggle touched");
            e.preventDefault();
            controlsPanel.classList.toggle('collapsed');
            updateHomeButtonVisibility();
            e.stopPropagation();
        }, { passive: false });
    }
    
    // Set up home button event listener
    if (homeButton) {
        // console.log("Setting up home button");
        
        // Set initial state of home button based on menu state
        updateHomeButtonVisibility();
        
        // Add click event listener to navigate to home page
        homeButton.addEventListener('click', function(e) {
            e.preventDefault();
            // console.log("Home button clicked, navigating to home page");
            window.location.href = 'https://interactive-simulations.com/';
        });
        
        // Add touch event listener for mobile
        homeButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            // console.log("Home button touched, navigating to home page");
            window.location.href = 'https://interactive-simulations.com/';
            e.stopPropagation();
        }, { passive: false });
    }
    
    // Function to update home button visibility based on menu state
    function updateHomeButtonVisibility() {
        if (homeButton) {
            if (controlsPanel.classList.contains('collapsed')) {
                homeButton.classList.add('visible');
            } else {
                homeButton.classList.remove('visible');
            }
        }
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
    });
    
    // Initialize menu system with callbacks
    try {
        // console.log("Initializing MenuSystem...");
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
                ColorThemes.setTheme(theme);
            },
            updateWallSettings: function(property, value) {
                // Update wall settings
                const settings = {};
                settings[property] = parseFloat(value);
                WallSystem.updateSettings(settings);
            },
            loadWallSVG: function(svgPath) {
                // Load the selected SVG file
                fetch(svgPath)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.text();
                    })
                    .then(svgText => {
                        const wallCount = WallSystem.loadFromSVG(svgText);
                        // console.log(`Loaded ${wallCount} wall segments from SVG`);
                    })
                    .catch(error => {
                        // console.error('Error loading SVG file:', error);
                    });
            }
        });
        // console.log("MenuSystem initialized");
    } catch (error) {
        // console.error("Error initializing menu system:", error);
    }
    
    // Controls panel setup
    setupControls();
    
    // Setup wall controls
    setupWallControls();
    
    // Event handlers for menu interactions
    menuToggle.addEventListener('click', function() {
        controlsPanel.classList.toggle('collapsed');
        updateHomeButtonVisibility();
    });
    
    // Properly handle touch behavior on menu toggle button
    menuToggle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        controlsPanel.classList.toggle('collapsed');
        updateHomeButtonVisibility();
        e.stopPropagation();
    }, { passive: false });
    
    // Close controls panel with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            controlsPanel.classList.add('collapsed');
            updateHomeButtonVisibility();
        }
    });
    
    // Cancel any active placement if we close the controls panel while in placement mode
    controlsPanel.addEventListener('transitionend', function(e) {
        if (e.propertyName === 'right' && 
            controlsPanel.classList.contains('collapsed')) {
            updateHomeButtonVisibility();
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
        // Flag to track if randomize was used or settings were manually changed
        let isRandomized = false;
        
        // Regular sliders with manual change detection
        setupRangeInput('newSwarmZotCount');
        setupRangeInput('newSwarmSpeed', function() { isRandomized = true; });
        setupRangeInput('newSwarmSeparation', function() { isRandomized = true; });
        setupRangeInput('newSwarmAlignment', function() { isRandomized = true; });
        setupRangeInput('newSwarmCohesion', function() { isRandomized = true; });
        setupRangeInput('newSwarmPerception', function() { isRandomized = true; });
        
        // Min/Max size range slider
        setupDualRangeSlider('newSwarmMinSize', 'newSwarmMaxSize');
        
        // Set up color theme selection to mark as randomized
        const colorPresets = document.querySelectorAll('.color-preset');
        colorPresets.forEach(preset => {
            preset.addEventListener('click', function() {
                // Mark as randomized when manually changing color theme
                // (But not when a preset is selected, which also sets color theme)
                if (!preset.hasAttribute('data-from-preset')) {
                    isRandomized = true;
                }
                // Remove the attribute after handling, so next click is treated as manual
                colorPresets.forEach(p => p.removeAttribute('data-from-preset'));
            });
        });
        
        // Randomize button
        const randomizeButton = document.getElementById('randomizeButton');
        if (randomizeButton) {
            randomizeButton.addEventListener('click', function() {
                randomizeZotSwarmSettings();
                isRandomized = true;
            });
        }
        
        // When preset is selected, reset randomized flag
        const presetSelect = document.getElementById('swarmPreset');
        if (presetSelect) {
            presetSelect.addEventListener('change', function() {
                isRandomized = false;
                const preset = Presets.swarmPresets[this.value];
                
                if (preset) {
                    // Keep the current zot count
                    const currentZotCount = document.getElementById('newSwarmZotCount').value;
                    
                    // Apply preset values but preserve zot count
                    document.getElementById('newSwarmSpeed').value = preset.speed;
                    document.getElementById('newSwarmSeparation').value = preset.separation;
                    document.getElementById('newSwarmAlignment').value = preset.alignment;
                    document.getElementById('newSwarmCohesion').value = preset.cohesion;
                    document.getElementById('newSwarmPerception').value = preset.perception;
                    
                    // Trigger input events to update the displayed values
                    updateSliderValueDisplay('newSwarmSpeed');
                    updateSliderValueDisplay('newSwarmSeparation');
                    updateSliderValueDisplay('newSwarmAlignment');
                    updateSliderValueDisplay('newSwarmCohesion');
                    updateSliderValueDisplay('newSwarmPerception');
                    
                    // Update displayed values, keeping the current zot count
                    // HIDDEN: All slider values are hidden to protect IP
                    
                    document.getElementById('newSwarmZotCountValue').textContent = currentZotCount;
                    
                    // Also update min/max size if present in preset
                    if (preset.minSize !== undefined && preset.maxSize !== undefined) {
                        document.getElementById('newSwarmMinSize').value = preset.minSize;
                        document.getElementById('newSwarmMaxSize').value = preset.maxSize;
                        document.getElementById('newSwarmMinSizeValue').textContent = preset.minSize.toFixed(1);
                        document.getElementById('newSwarmMaxSizeValue').textContent = preset.maxSize.toFixed(1);
                        
                        // Update the dual slider visuals
                        updateDualSliderVisuals('newSwarmMinSize', 'newSwarmMaxSize');
                    }
                    
                    // Update color theme selector
                    if (preset.colorTheme) {
                        const colorPresets = document.querySelectorAll('.color-preset');
                        colorPresets.forEach(themeBtn => {
                            if (themeBtn.dataset.theme === preset.colorTheme) {
                                // Mark this as from preset selection to avoid triggering randomized flag
                                themeBtn.setAttribute('data-from-preset', 'true');
                                // Remove active class from all presets
                                colorPresets.forEach(p => p.classList.remove('active'));
                                // Add active class to matching preset
                                themeBtn.classList.add('active');
                                // Update the color theme
                                if (ColorThemes && typeof ColorThemes.setTheme === 'function') {
                                    ColorThemes.setTheme(preset.colorTheme);
                                }
                            }
                        });
                    }
                }
            });
            
            // Add click handler to handle selecting the same preset
            presetSelect.addEventListener('click', function() {
                // When clicking on the dropdown, store the currently selected value
                presetSelect._lastSelectedValue = this.value;
            });
            
            // Add mouseup handler to detect when selection is complete
            presetSelect.addEventListener('mouseup', function() {
                // If the value hasn't changed (selected same item), still update UI
                if (this.value === presetSelect._lastSelectedValue && this.value) {
                    isRandomized = false;
                    const preset = Presets.swarmPresets[this.value];
                    
                    if (preset) {
                        // Apply preset values again to ensure UI is updated
                        const currentZotCount = document.getElementById('newSwarmZotCount').value;
                        
                        document.getElementById('newSwarmSpeed').value = preset.speed;
                        document.getElementById('newSwarmSeparation').value = preset.separation;
                        document.getElementById('newSwarmAlignment').value = preset.alignment;
                        document.getElementById('newSwarmCohesion').value = preset.cohesion;
                        document.getElementById('newSwarmPerception').value = preset.perception;
                        
                        updateSliderValueDisplay('newSwarmSpeed');
                        updateSliderValueDisplay('newSwarmSeparation');
                        updateSliderValueDisplay('newSwarmAlignment');
                        updateSliderValueDisplay('newSwarmCohesion');
                        updateSliderValueDisplay('newSwarmPerception');
                        
                        document.getElementById('newSwarmZotCountValue').textContent = currentZotCount;
                        
                        // Update color theme if set in the preset
                        if (preset.colorTheme) {
                            const colorPresets = document.querySelectorAll('.color-preset');
                            colorPresets.forEach(themeBtn => {
                                if (themeBtn.dataset.theme === preset.colorTheme) {
                                    themeBtn.setAttribute('data-from-preset', 'true');
                                    colorPresets.forEach(p => p.classList.remove('active'));
                                    themeBtn.classList.add('active');
                                    if (ColorThemes && typeof ColorThemes.setTheme === 'function') {
                                        ColorThemes.setTheme(preset.colorTheme);
                                    }
                                }
                            });
                        }
                    }
                }
            });
        }
        
        // Function to randomize zot swarm settings
        function randomizeZotSwarmSettings() {
            // Keep current zot count and size ranges
            const currentZotCount = document.getElementById('newSwarmZotCount').value;
            const currentMinSize = document.getElementById('newSwarmMinSize').value;
            const currentMaxSize = document.getElementById('newSwarmMaxSize').value;
            
            // Randomize other settings
            const randomConfig = {
                zotCount: currentZotCount, // Keep current value
                speed: Math.random() * 6,  // Random between 0-6
                separation: Math.random() * 4, // Random between 0-4
                alignment: Math.random() * 3,  // Random between 0-3
                cohesion: Math.random() * 5,   // Random between 0-5
                perception: Math.floor(Math.random() * 180) + 20, // Random between 20-200
                opacity: 0.2 + Math.random() * 0.8 // Random between 0.2-1.0
            };
            
            // Apply to UI
            document.getElementById('newSwarmSpeed').value = randomConfig.speed;
            document.getElementById('newSwarmSeparation').value = randomConfig.separation;
            document.getElementById('newSwarmAlignment').value = randomConfig.alignment;
            document.getElementById('newSwarmCohesion').value = randomConfig.cohesion;
            document.getElementById('newSwarmPerception').value = randomConfig.perception;
            document.getElementById('newSwarmOpacity').value = randomConfig.opacity;
            
            // Trigger input events to update the displayed values
            updateSliderValueDisplay('newSwarmSpeed');
            updateSliderValueDisplay('newSwarmSeparation');
            updateSliderValueDisplay('newSwarmAlignment');
            updateSliderValueDisplay('newSwarmCohesion');
            updateSliderValueDisplay('newSwarmPerception');
            updateSliderValueDisplay('newSwarmOpacity');
            
            // Randomize color theme
            const colorThemes = Object.keys(Presets.colorThemes);
            const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
            
            // Update color theme selector
            const colorPresets = document.querySelectorAll('.color-preset');
            colorPresets.forEach(themeBtn => {
                if (themeBtn.dataset.theme === randomTheme) {
                    // Remove active class from all presets
                    colorPresets.forEach(p => p.classList.remove('active'));
                    // Add active class to matching preset
                    themeBtn.classList.add('active');
                    // Update the color theme
                    if (ColorThemes && typeof ColorThemes.setTheme === 'function') {
                        ColorThemes.setTheme(randomTheme);
                    }
                }
            });
        }
        
        // Helper function to update slider value display by triggering the input event
        function updateSliderValueDisplay(sliderId) {
            const slider = document.getElementById(sliderId);
            if (slider) {
                // Create and dispatch an input event to update the displayed value
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
        }
        
        // Helper function to update dual slider visuals after changing values
        function updateDualSliderVisuals(minId, maxId) {
            const minSlider = document.getElementById(minId);
            const maxSlider = document.getElementById(maxId);
            
            if (minSlider && maxSlider) {
                const minVal = parseFloat(minSlider.value);
                const maxVal = parseFloat(maxSlider.value);
                
                // Calculate percentage of position along track
                const min = parseFloat(minSlider.min);
                const max = parseFloat(minSlider.max);
                const range = max - min;
                
                const minPercent = ((minVal - min) / range) * 100;
                const maxPercent = ((maxVal - min) / range) * 100;
                
                // Set the min/max slider background to show selected range
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
        }
        
        // Create and setup the swarm color theme tooltips
        const themeContainer = document.querySelector('.color-presets-container');
        if (themeContainer) {
            // Add click handler
            themeContainer.addEventListener('click', function(e) {
                const themeBtn = e.target.closest('.color-preset');
                if (themeBtn) {
                    // Set all buttons to inactive
                    themeContainer.querySelectorAll('.color-preset').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Set clicked button to active
                    themeBtn.classList.add('active');
                    
                    // Show tooltip with theme name
                    const themeName = themeBtn.dataset.theme;
                    showThemeNameTooltip(themeName, themeBtn);
                    
                    // Set the color theme
                    if (ColorThemes && typeof ColorThemes.setTheme === 'function') {
                        ColorThemes.setTheme(themeName);
                    }
                }
            });
        }
        
        // Add direct touch handlers to each color theme button
        document.querySelectorAll('.color-preset').forEach(button => {
            button.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Get the container to update all buttons
                const container = this.closest('.color-presets-container') || this.parentElement;
                
                // Set all buttons to inactive
                if (container) {
                    container.querySelectorAll('.color-preset').forEach(btn => {
                        btn.classList.remove('active');
                    });
                }
                
                // Set this button to active
                this.classList.add('active');
                
                // Show tooltip with theme name
                const themeName = this.dataset.theme;
                showThemeNameTooltip(themeName, this);
                
                // Set the color theme
                if (ColorThemes && typeof ColorThemes.setTheme === 'function') {
                    ColorThemes.setTheme(themeName);
                }
                
                // console.log('Color theme button touched:', themeName);
            }, { passive: false });
        });
        
        // Implementation of the showThemeNameTooltip function
        function showThemeNameTooltip(themeName, element) {
            // Remove any existing tooltips first
            const existingTooltips = document.querySelectorAll('.theme-name-tooltip');
            existingTooltips.forEach(tooltip => tooltip.remove());
            
            // Get the tooltip text from data-tooltip attribute or use the theme name
            const tooltipText = element.dataset.tooltip || themeName;
            
            // Create a new tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'theme-name-tooltip';
            tooltip.textContent = tooltipText;
            
            // Position the tooltip above the element
            const rect = element.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.left = rect.left + (rect.width / 2) + 'px';
            tooltip.style.top = rect.top - 25 + 'px';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.background = 'rgba(0, 0, 0, 0.7)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '4px 8px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '12px';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.zIndex = '1000';
            
            // Add to the document
            document.body.appendChild(tooltip);
            
            // Automatically remove the tooltip after 1.5 seconds
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 1500);
        }
        
        // Create Swarm button
        const createSwarmButton = document.getElementById('createSwarmButton');
        if (createSwarmButton) {
            createSwarmButton.addEventListener('click', function() {
                // Create a new swarm at center of canvas
                const config = getSwarmConfigFromUI();
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                
                // Add position to config
                config.centerX = centerX;
                config.centerY = centerY;
                
                // Add randomized flag to config if not set by getSwarmConfigFromUI
                if (config.isRandomized === undefined) {
                    config.isRandomized = isRandomized;
                }
                
                // Create the swarm directly
                const swarmId = ParticleSystem.createZotSwarm(config);
                
                if (swarmId) {
                    // Update the swarm list
                    updateSwarmList();
                    // Reset randomized flag after swarm creation
                    isRandomized = false;
                }
            });
        }
        
        // Clear Swarms button
        const clearSwarmsButton = document.getElementById('clearSwarmsButton');
        if (clearSwarmsButton) {
            clearSwarmsButton.addEventListener('click', function() {
                if (!this.classList.contains('disabled')) {
                    // Remove all zot swarms
                    ParticleSystem.removeAllZotSwarms();
                    // Update the swarm list
                    updateSwarmList();
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
            
            // Always show zot count, respect SliderControls.hideLabels for others
            if (id === 'newSwarmZotCount') {
                valueDisplay.textContent = parseFloat(input.value).toFixed(precision);
                valueDisplay.style.display = '';  // Use default display
            } else {
                valueDisplay.textContent = parseFloat(input.value).toFixed(precision);
                valueDisplay.style.display = window.SliderControls.hideLabels ? 'none' : '';
            }
            
            // Add event listeners for input changes
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                
                // Always update value text even if hidden
                valueDisplay.textContent = value.toFixed(precision);
                
                // For non-zot-count sliders, respect the hideLabels setting
                if (id !== 'newSwarmZotCount') {
                    valueDisplay.style.display = window.SliderControls.hideLabels ? 'none' : '';
                }
                
                // Call the callback with the new value if provided
                if (typeof changeCallback === 'function') {
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
            // Set initial values but respect hideLabels setting for min value only
            const minVal = parseFloat(minSlider.value);
            const maxVal = parseFloat(maxSlider.value);
            minValueDisplay.textContent = minVal.toFixed(1);
            maxValueDisplay.textContent = maxVal.toFixed(1);
            
            // Always show max size value, respect hideLabels setting for min size
            if (maxId === 'newSwarmMaxSize') {
                maxValueDisplay.style.display = '';
            } else {
                maxValueDisplay.style.display = window.SliderControls.hideLabels ? 'none' : '';
            }
            
            minValueDisplay.style.display = window.SliderControls.hideLabels ? 'none' : '';
            
            // Update values displays
            function updateValues() {
                const minVal = parseFloat(minSlider.value);
                const maxVal = parseFloat(maxSlider.value);
                
                // Always update text content
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
    
    // Get configuration from the UI elements
    function getSwarmConfigFromUI() {
        const config = {};
        
        // Get zot count
        const zotCountSlider = document.getElementById('newSwarmZotCount');
        if (zotCountSlider) {
            config.zotCount = parseInt(zotCountSlider.value, 10);
        }
        
        // Get swarm preset
        const presetSelect = document.getElementById('swarmPreset');
        if (presetSelect && presetSelect.value) {
            config.presetName = presetSelect.value;
            
            // When a preset is explicitly selected, ensure it's not marked as randomized
            // This ensures the preset name appears in the dropdown instead of "Random"
            config.isRandomized = false;
        }
        
        // Get color theme
        const activeThemeBtn = document.querySelector('#colorPresets .color-preset.active');
        if (activeThemeBtn) {
            config.colorTheme = activeThemeBtn.dataset.theme;
        } else {
            // Fallback to default theme
            config.colorTheme = 'rainbow';
        }
        
        // Get size range
        config.minSize = parseFloat(document.getElementById('newSwarmMinSize')?.value || 3);
        config.maxSize = parseFloat(document.getElementById('newSwarmMaxSize')?.value || 8);
        
        // Get other properties
        config.speed = parseFloat(document.getElementById('newSwarmSpeed')?.value || 2);
        config.separation = parseFloat(document.getElementById('newSwarmSeparation')?.value || 25);
        config.alignment = parseFloat(document.getElementById('newSwarmAlignment')?.value || 0.1);
        config.cohesion = parseFloat(document.getElementById('newSwarmCohesion')?.value || 0.1);
        config.perception = parseFloat(document.getElementById('newSwarmPerception')?.value || 50);
        config.opacity = parseFloat(document.getElementById('newSwarmOpacity')?.value || 1.0);
        
        return config;
    }
    
    // Function no longer needed since we removed confirm placement
    function updateCreateSwarmUI() {
        // This function is no longer needed
    }
    
    // Setup function to initialize UI just once 
    function setupSwarmManagementUI() {
        const removeButton = document.getElementById('removeSwarmBtn');
        if (removeButton && !removeButton.hasEventListener) {
            removeButton.addEventListener('click', function() {
                const swarmDropdown = document.getElementById('swarmList');
                const selectedSwarmId = swarmDropdown.value;
                if (selectedSwarmId) {
                    // Store current index before removal
                    const swarms = ParticleSystem.getZotSwarms();
                    const currentIndex = swarms.findIndex(swarm => swarm.id === selectedSwarmId);
                    
                    // Remove the swarm
                    ParticleSystem.removeZotSwarm(selectedSwarmId);
                    
                    // Update the dropdown without auto-selecting the most recent swarm
                    updateSwarmList(false);
                    
                    // Get updated swarms list
                    const updatedSwarms = ParticleSystem.getZotSwarms();
                    
                    // If we have swarms left, select the next one by index
                    if (updatedSwarms.length > 0) {
                        // Calculate next index, but don't exceed array bounds
                        const nextIndex = Math.min(currentIndex, updatedSwarms.length - 1);
                        // Select the swarm at the calculated index
                        swarmDropdown.value = updatedSwarms[nextIndex].id;
                    }
                }
            });
            removeButton.hasEventListener = true;
        }
    }
    
    // Update the list of active swarms
    function updateSwarmList(selectMostRecent = true) {
        // console.log('[UPDATE] Starting updateSwarmList');
        const swarmDropdown = document.getElementById('swarmList');
        const removeButton = document.getElementById('removeSwarmBtn');
        const clearSwarmsButton = document.getElementById('clearSwarmsButton');
        
        if (!swarmDropdown || !removeButton) {
            // console.warn('[UPDATE] Required elements not found:', { 
            //     swarmDropdown: !!swarmDropdown, 
            //     removeButton: !!removeButton 
            // });
            return;
        }
        
        // Setup event handlers only once
        setupSwarmManagementUI();
        
        // Add event listener for swarm selection
        if (!swarmDropdown.hasEventListener) {
            swarmDropdown.addEventListener('change', function() {
                const selectedSwarmId = this.value;
                if (selectedSwarmId) {
                    updateUIForSelectedSwarm(selectedSwarmId);
                }
            });
            
            // Add click handler to handle selecting the same item
            swarmDropdown.addEventListener('click', function() {
                // When clicking on the dropdown, store the currently selected value
                swarmDropdown._lastSelectedValue = this.value;
            });
            
            // Add mouseup handler to detect when selection is complete
            swarmDropdown.addEventListener('mouseup', function() {
                // If the value hasn't changed (selected same item), still update UI
                if (this.value === swarmDropdown._lastSelectedValue && this.value) {
                    updateUIForSelectedSwarm(this.value);
                }
            });
            
            swarmDropdown.hasEventListener = true;
        }
        
        // Get the current swarms
        const swarms = ParticleSystem.getZotSwarms();
        // console.log('[UPDATE] Current swarms:', swarms);
        
        // Clear the dropdown
        swarmDropdown.innerHTML = '';
        
        // Disable the remove button if no swarms
        if (swarms.length === 0) {
            // console.log('[UPDATE] No swarms found, showing default option');
            const noSwarmsOption = document.createElement('option');
            noSwarmsOption.value = '';
            noSwarmsOption.textContent = 'No swarms created yet';
            swarmDropdown.appendChild(noSwarmsOption);
            
            removeButton.disabled = true;
            
            // Disable the clear swarms button
            if (clearSwarmsButton) {
                clearSwarmsButton.classList.add('disabled');
            }
            
            return;
        } else {
            removeButton.disabled = false;
            
            // Enable the clear swarms button
            if (clearSwarmsButton) {
                clearSwarmsButton.classList.remove('disabled');
            }
        }
        
        // Add each swarm to the dropdown
        swarms.forEach(swarm => {
            // console.log('[UPDATE] Adding swarm to dropdown:', swarm);
            const option = document.createElement('option');
            option.value = swarm.id;
            const colorThemeName = Presets.colorThemes[swarm.settings.colorTheme]?.name || 'Custom';
            
            // Check if this is a randomized swarm or settings don't match any preset
            let presetDisplayName;
            if (swarm.settings.isRandomized) {
                presetDisplayName = 'Random';
            } else {
                // Check if settings match any preset
                const matchedPreset = findMatchingPreset(swarm.settings);
                if (matchedPreset) {
                    presetDisplayName = Presets.swarmPresets[matchedPreset]?.name || 'Custom';
                } else {
                    presetDisplayName = 'Random';
                }
            }
            
            option.textContent = `${presetDisplayName} ${colorThemeName} (${swarm.zotCount})`;
            swarmDropdown.appendChild(option);
        });
        
        // Select the most recently created swarm (last in the array) only when requested
        if (selectMostRecent && swarms.length > 0) {
            const mostRecentSwarm = swarms[swarms.length - 1];
            swarmDropdown.value = mostRecentSwarm.id;
            // console.log('[UPDATE] Selected most recent swarm:', mostRecentSwarm.id);
            
            // Update UI to match the selected swarm's settings
            updateUIForSelectedSwarm(mostRecentSwarm.id);
        }
    }
    
    // Helper function to check if swarm settings match a preset
    function findMatchingPreset(settings) {
        // Check each preset
        for (const [presetId, preset] of Object.entries(Presets.swarmPresets)) {
            if (
                Math.abs(preset.speed - settings.speed) < 0.01 &&
                Math.abs(preset.separation - settings.separation) < 0.01 &&
                Math.abs(preset.alignment - settings.alignment) < 0.01 &&
                Math.abs(preset.cohesion - settings.cohesion) < 0.01 &&
                Math.abs(preset.perception - settings.perception) < 0.01 &&
                (preset.opacity === undefined || Math.abs(preset.opacity - settings.opacity) < 0.01) &&
                preset.colorTheme === settings.colorTheme
            ) {
                return presetId;
            }
        }
        return null;
    }
    
    // Update UI sliders and color theme for selected swarm
    function updateUIForSelectedSwarm(swarmId) {
        // console.log('[UPDATE UI] Updating UI for selected swarm:', swarmId);
        const swarms = ParticleSystem.getZotSwarms();
        const selectedSwarm = swarms.find(swarm => swarm.id === swarmId);
        
        if (!selectedSwarm) {
            // console.warn('[UPDATE UI] Selected swarm not found:', swarmId);
            return;
        }
        
        const settings = selectedSwarm.settings;
        // console.log('[UPDATE UI] Swarm settings:', settings);
        
        // Update all the sliders
        const swarmSpeedSlider = document.getElementById('newSwarmSpeed');
        if (swarmSpeedSlider) {
            swarmSpeedSlider.value = settings.speed;
            updateSliderValue(swarmSpeedSlider, document.getElementById('newSwarmSpeedValue'), 1);
        }
        
        const separationSlider = document.getElementById('newSwarmSeparation');
        if (separationSlider) {
            separationSlider.value = settings.separation;
            updateSliderValue(separationSlider, document.getElementById('newSwarmSeparationValue'), 2);
        }
        
        const alignmentSlider = document.getElementById('newSwarmAlignment');
        if (alignmentSlider) {
            alignmentSlider.value = settings.alignment;
            updateSliderValue(alignmentSlider, document.getElementById('newSwarmAlignmentValue'), 2);
        }
        
        const cohesionSlider = document.getElementById('newSwarmCohesion');
        if (cohesionSlider) {
            cohesionSlider.value = settings.cohesion;
            updateSliderValue(cohesionSlider, document.getElementById('newSwarmCohesionValue'), 2);
        }
        
        const perceptionSlider = document.getElementById('newSwarmPerception');
        if (perceptionSlider) {
            perceptionSlider.value = settings.perception;
            updateSliderValue(perceptionSlider, document.getElementById('newSwarmPerceptionValue'), 0);
        }
        
        const opacitySlider = document.getElementById('newSwarmOpacity');
        if (opacitySlider && settings.opacity !== undefined) {
            opacitySlider.value = settings.opacity;
            updateSliderValue(opacitySlider, document.getElementById('newSwarmOpacityValue'), 2);
        }
        
        const minSizeSlider = document.getElementById('newSwarmMinSize');
        if (minSizeSlider && settings.minSize) {
            minSizeSlider.value = settings.minSize;
            updateSliderValue(minSizeSlider, document.getElementById('newSwarmMinSizeValue'), 1);
        }
        
        const maxSizeSlider = document.getElementById('newSwarmMaxSize');
        if (maxSizeSlider && settings.maxSize) {
            maxSizeSlider.value = settings.maxSize;
            updateSliderValue(maxSizeSlider, document.getElementById('newSwarmMaxSizeValue'), 1);
        }
        
        // Update color theme
        if (settings.colorTheme) {
            const colorThemeButtons = document.querySelectorAll('#colorPresets .color-preset');
            colorThemeButtons.forEach(btn => {
                if (btn.dataset.theme === settings.colorTheme) {
                    // Remove active class from all buttons
                    colorThemeButtons.forEach(b => b.classList.remove('active'));
                    // Add active class to the matching button
                    btn.classList.add('active');
                }
            });
        }
        
        // Update preset dropdown if applicable
        const presetSelect = document.getElementById('swarmPreset');
        if (presetSelect) {
            const matchedPreset = findMatchingPreset(settings);
            if (matchedPreset) {
                presetSelect.value = matchedPreset;
            } else {
                presetSelect.value = 'random';
            }
        }
    }
    
    // Update all UI values to match current settings
    function updateAllUIValues() {
        // Set Orbie parameter values
        document.getElementById('orbieSize').value = ParticleSystem.getOrbieSettings().size || 12;
        // HIDDEN: All slider values are hidden to protect IP
        // document.getElementById('orbieSizeValue').textContent = parseFloat(document.getElementById('orbieSize').value).toFixed(1);
        
        document.getElementById('orbieGlowSize').value = ParticleSystem.getOrbieSettings().glowSize || 1.5;
        // document.getElementById('orbieGlowSizeValue').textContent = parseFloat(document.getElementById('orbieGlowSize').value).toFixed(1);
        
        document.getElementById('orbieGlowOpacity').value = ParticleSystem.getOrbieSettings().glowOpacity || 0.2;
        // document.getElementById('orbieGlowOpacityValue').textContent = parseFloat(document.getElementById('orbieGlowOpacity').value).toFixed(2);
        
        document.getElementById('orbiePulseSpeed').value = ParticleSystem.getOrbieSettings().pulseSpeed || 0.05;
        // document.getElementById('orbiePulseSpeedValue').textContent = parseFloat(document.getElementById('orbiePulseSpeed').value).toFixed(2);
        
        document.getElementById('orbiePulseIntensity').value = ParticleSystem.getOrbieSettings().pulseIntensity || 0.4;
        // document.getElementById('orbiePulseIntensityValue').textContent = parseFloat(document.getElementById('orbiePulseIntensity').value).toFixed(2);
        
        document.getElementById('orbieInfluenceRadius').value = ParticleSystem.getOrbieSettings().influenceRadius || 100;
        // document.getElementById('orbieInfluenceRadiusValue').textContent = parseFloat(document.getElementById('orbieInfluenceRadius').value).toFixed(0);
        
        document.getElementById('orbieInfluenceIntensity').value = ParticleSystem.getOrbieSettings().influenceIntensity || 0.5;
        // document.getElementById('orbieInfluenceIntensityValue').textContent = parseFloat(document.getElementById('orbieInfluenceIntensity').value).toFixed(2);
        
        document.getElementById('orbieTouchMultiplier').value = ParticleSystem.getOrbieSettings().touchMultiplier || 0.15;
        // document.getElementById('orbieTouchMultiplierValue').textContent = parseFloat(document.getElementById('orbieTouchMultiplier').value).toFixed(2);
        
        // Set OrbieSwarm parameter values
        // ... (existing code)
        
        // Set Forces parameter values
        document.getElementById('touchForce').value = ParticleSystem.getForceSettingValue('touchForce') || 3;
        // document.getElementById('touchForceValue').textContent = parseFloat(document.getElementById('touchForce').value).toFixed(1);
        
        document.getElementById('wallForce').value = ParticleSystem.getForceSettingValue('wallForce') || 1;
        // document.getElementById('wallForceValue').textContent = parseFloat(document.getElementById('wallForce').value).toFixed(1);
        
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
        
        // No need for updateCreateSwarmUI call anymore
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
        
        // Setup wall SVG dropdown
        const wallSVGSelector = document.getElementById('wallSVG');
        if (wallSVGSelector) {
            wallSVGSelector.addEventListener('change', function() {
                if (this.value) {
                    // Load the selected SVG file
                    fetch(this.value)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.text();
                        })
                        .then(svgText => {
                            const wallCount = WallSystem.loadFromSVG(svgText);
                            // console.log(`Loaded ${wallCount} wall segments from SVG`);
                        })
                        .catch(error => {
                            // console.error('Error loading SVG file:', error);
                        });
                }
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
                            // console.log(`Loaded ${wallCount} wall segments from SVG`);
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

    // Initialize SubmitSwarms module
    if (typeof SubmitSwarms !== 'undefined' && SubmitSwarms.init) {
        SubmitSwarms.init();
    }

    // After all setup is done, ensure all sliders have correct visibility
    setTimeout(() => {
        if (window.SliderControls) {
            window.SliderControls.updateAllLabelVisibility();
        }
    }, 100);
});

// Initialize the simulation
function initializeSimulation() {
    // ... existing code ...
    
    try {
        // console.log("Starting MenuSystem initialization...");
        menuSystem = new MenuSystem({
            containerElement: document.getElementById('simulation-container')
        });
        // console.log("MenuSystem initialized successfully.");
    } catch (error) {
        // console.error("Error initializing MenuSystem:", error);
    }
    
    // Initialize particle system with entity type identifiers
    try {
        // console.log("Starting ParticleSystem initialization...");
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
        
        // console.log("ParticleSystem initialized successfully with entity type identifiers");
    } catch (error) {
        // console.error("Error initializing ParticleSystem:", error);
    }
    
    // ... existing code ...
}

// Helper function to handle input events on sliders
function updateSliderValue(input, valueDisplay, precision = 1) {
    // Only show value for zot count slider
    if (input.id === 'newSwarmZotCount' && valueDisplay) {
        valueDisplay.textContent = parseFloat(input.value).toFixed(precision);
    }
}

// Event handler for slider input events
function handleSliderInput(event, precision = 1) {
    const value = parseFloat(this.value);
    const valueDisplay = document.getElementById(this.id + 'Value');
    // Only show value for zot count slider
    if (this.id === 'newSwarmZotCount' && valueDisplay) {
        valueDisplay.textContent = value.toFixed(precision);
    }
}

