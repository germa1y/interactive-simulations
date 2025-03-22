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