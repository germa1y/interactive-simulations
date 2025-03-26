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
    
    // Zot swarm settings
    let zotSwarmSettings = {
        particleCount: 50,
        speed: 2,
        separation: 2,
        alignment: 1,
        cohesion: 2.5,
        perception: 100,
        touchForce: 1.5,
        showExteriorStroke: false, // New setting to toggle the exterior stroke
        exteriorStrokeWidth: 3 // Width of the exterior stroke in pixels
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
        // Reset the array
        backgroundParticles = [];
        
        // Create some initial particles to ensure the system works
        createInitialParticles();
    }
    
    // Create some initial particles to demonstrate the system is working
    function createInitialParticles() {
        console.log("Creating initial particles");
        
        // Create a simple test swarm
        const testSwarmConfig = {
            centerX: width / 2,
            centerY: height / 2,
            zotCount: 30,
            minSize: 3,
            maxSize: 6,
            speed: 2,
            colorTheme: 'rainbow'
        };
        
        createZotSwarm(testSwarmConfig);
    }
    
    // Initialize Orbie
    function initOrbie() {
        console.log("Initializing Orbie at position:", width/2, height/2);
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
        console.log("Orbie initialized with: ", 
            "color:", orbie.color, 
            "size:", orbie.size, 
            "glowSize:", orbie.glowSize,
            "glowColor:", orbie.glowColor,
            "glowOpacity:", orbie.glowOpacity
        );
    }
    
    // Create a new ZotSwarm
    function createZotSwarm(config) {
        console.log("Creating ZotSwarm with config:", config);
        
        try {
            // Generate a unique ID for this swarm
            const swarmId = generateSwarmId();
            
            // Create swarm object with settings
            const swarm = {
                id: swarmId,
                zots: [],
                settings: {...config},
                originalSettings: {...config},
                inOrbieInfluence: false
            };
            
            // Get the color generator function - try to handle missing Presets
            let getColor;
            
            if (typeof Presets !== 'undefined' && Presets.colorThemes) {
                const theme = config.colorTheme || 'rainbow';
                getColor = Presets.colorThemes[theme]?.getColor || 
                          Presets.colorThemes['rainbow']?.getColor ||
                          function() { return 'rgba(200, 200, 200, 0.8)'; }; // Fallback color
            } else {
                // Simple fallback if Presets is not available
                getColor = function() { return 'rgba(200, 200, 200, 0.8)'; };
            }
            
            // Default configuration values if not specified
            const zotCount = config.zotCount || 25;
            const minSize = config.minSize || 2;
            const maxSize = config.maxSize || 4;
            const speed = config.speed || 2;
            const centerX = config.centerX || (width / 2);
            const centerY = config.centerY || (height / 2);
            
            console.log(`Creating ${zotCount} zots at position (${centerX}, ${centerY})`);
            
            // Generate particles for this swarm
            for (let i = 0; i < zotCount; i++) {
                const zot = {
                    x: centerX + (Math.random() * 100 - 50), // Cluster around center
                    y: centerY + (Math.random() * 100 - 50), // Cluster around center
                    vx: (Math.random() * 2 - 1) * speed,
                    vy: (Math.random() * 2 - 1) * speed,
                    color: getColor(),
                    size: minSize + Math.random() * (maxSize - minSize),
                    history: [],
                    inOrbieSwarm: false,
                    swarmId: swarmId,
                    fromGlobalTheme: false
                };
                
                swarm.zots.push(zot);
            }
            
            // Add the swarm to our collection
            zotSwarms.push(swarm);
            console.log(`Created ZotSwarm with ID ${swarmId} containing ${swarm.zots.length} zots`);
            
            return swarmId;
        } catch (error) {
            console.error("Error creating ZotSwarm:", error);
            return null;
        }
    }
    
    // Update an existing ZotSwarm with new parameters
    function updateZotSwarm(swarmId, config) {
        // Find the swarm with the given ID
        const swarmIndex = zotSwarms.findIndex(swarm => swarm.id === swarmId);
        if (swarmIndex === -1) {
            console.error(`Swarm with ID ${swarmId} not found`);
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
        // Simple implementation - you could use a UUID library in production
        return 'swarm-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
    
    // Apply preset to new swarm settings
    function applyPresetToNewSwarm(presetName) {
        // Special handling for the random preset
        if (presetName === 'random') {
            return {
                ...Presets.defaults.zotSwarm,
                name: "Random",
                zotCount: 25, // Keep fixed at 25
                speed: 2,     // Keep fixed at 2
                separation: Math.random() * 4, // Random between 0-4
                alignment: Math.random() * 3,  // Random between 0-3
                cohesion: Math.random() * 5,   // Random between 0-5
                perception: Math.floor(Math.random() * 180) + 20, // Random between 20-200
                // Random size range
                minSize: 0.5 + Math.random() * 2, // 0.5-2.5
                maxSize: 3 + Math.random() * 2,   // 3-5
                // Random color theme from available themes
                colorTheme: getRandomColorTheme()
            };
        }
        
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
    
    // Update all particles in the simulation
    function updateParticles() {
        // Get elapsed time since last update for time-based movement
        const now = performance.now();
        const delta = now - lastTime;
        lastTime = now;
        
        // Update FPS counter every 500ms
        frameCount++;
        if (now - lastFpsUpdate > 500) {
            const fps = Math.round(frameCount / ((now - lastFpsUpdate) / 1000));
            if (fpsDisplay) {
                fpsDisplay.textContent = fps;
            }
            frameCount = 0;
            lastFpsUpdate = now;
            
            // Also update the zots counter
            updateZotsCounter();
        }
        
        // Update Orbie pulsing effect
        if (orbie) {
            orbiePulsePhase += orbieSettings.pulseSpeed || 0.05;
            if (orbiePulsePhase > Math.PI * 2) {
                orbiePulsePhase = 0;
            }
        }
        
        // Update Orbie if it exists
        if (orbie && orbieSettings.enabled) {
            console.log("Updating Orbie position");
            // Store previous position for collision detection
            const prevX = orbie.x;
            const prevY = orbie.y;
            
            // Apply inertia (drag/dampening)
            orbie.vx *= 0.98;
            orbie.vy *= 0.98;
            
            // Apply influence from user touch input if active
            if (touch.active) {
                // Calculate vector from orbie to touch point
                const dx = touch.x - orbie.x;
                const dy = touch.y - orbie.y;
                
                // Calculate distance
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    // Normalize the direction vector
                    const nx = dx / distance;
                    const ny = dy / distance;
                    
                    // Apply force with falloff based on distance
                    const forceFactor = Math.min(1, 120 / distance) * orbieSettings.touchMultiplier;
                    const baseFactor = orbieSettings.speed;
                    
                    // Update velocity based on touch input and orbie speed setting
                    orbie.vx += nx * baseFactor * forceFactor;
                    orbie.vy += ny * baseFactor * forceFactor;
                }
            }
            
            // Update position
            orbie.x += orbie.vx;
            orbie.y += orbie.vy;
            
            // Apply boundary constraints
            applyBoundaryConstraints(orbie);
            
            // Update Orbie's history for trail effects
            if (orbie.history) {
                orbie.history.unshift({ x: orbie.x, y: orbie.y });
                if (orbie.history.length > 20) { // Limit history length
                    orbie.history.pop();
                }
            }
        }
        
        // Update Zot swarms
        if (zotSwarms.length > 0) {
            console.log(`Updating ${zotSwarms.length} zot swarms`);
            for (let i = 0; i < zotSwarms.length; i++) {
                // Get the current swarm
                const swarm = zotSwarms[i];
                const swarmSettings = swarm.settings;
                
                // Update particles in this swarm
                updateParticleGroup(swarm.zots, swarmSettings);
            }
        } else {
            console.log("No zot swarms to update");
        }
        
        // Update membranes if available
        if (typeof MembraneSystem !== 'undefined') {
            MembraneSystem.updateMembranes();
        }
    }
    
    // Update a group of particles with boid-like behaviors
    function updateParticleGroup(particles, settings) {
        // No particles to update
        if (!particles || particles.length === 0) {
            return;
        }
        
        console.log(`Updating ${particles.length} particles in group`);
        
        // Use default settings if none provided
        const defaultSettings = {
            speed: 2,
            separation: 2,
            alignment: 1,
            cohesion: 2,
            perception: 100,
            dampening: 0.98
        };
        
        // Merge with defaults
        const finalSettings = {...defaultSettings, ...settings};
        
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            
            // Skip particles that are already in Orbie's swarm
            if (particle.inOrbieSwarm) continue;
            
            // Store previous position for collision detection
            const prevX = particle.x;
            const prevY = particle.y;
            
            // Simple movement - just update position based on velocity
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply dampening
            particle.vx *= finalSettings.dampening;
            particle.vy *= finalSettings.dampening;
            
            // Apply simple boundary wrapping
            if (particle.x < 0) particle.x = width;
            if (particle.x > width) particle.x = 0;
            if (particle.y < 0) particle.y = height;
            if (particle.y > height) particle.y = 0;
            
            // Update particle history for trails if present
            if (particle.history && finalSettings.trailLength > 0) {
                particle.history.unshift({ x: particle.x, y: particle.y });
                while (particle.history.length > finalSettings.trailLength) {
                    particle.history.pop();
                }
            }
        }
    }
    
    // Draw particles, swarms, and Orbie
    function drawParticles() {
        // Clear canvas
        if (ctx) {
            ctx.clearRect(0, 0, width, height);
            
            console.log("Drawing particles...");
            
            // Draw all swarms
            let totalParticles = 0;
            for (const swarm of zotSwarms) {
                if (swarm && swarm.zots) {
                    totalParticles += swarm.zots.length;
                    drawParticleGroup(swarm.zots);
                }
            }
            console.log(`Drew ${totalParticles} particles from ${zotSwarms.length} swarms`);
            
            // Draw Orbie last (so it's on top of everything)
            if (orbie && orbieSettings.enabled) {
                // Calculate pulsating effect
                const pulseAmount = Math.sin(orbiePulsePhase) * orbieSettings.pulseIntensity;
                const scaledSize = orbie.size * (1 + pulseAmount);
                
                // Draw Orbie
                ctx.beginPath();
                ctx.arc(orbie.x, orbie.y, scaledSize, 0, Math.PI * 2);
                ctx.fillStyle = orbie.color || 'white';
                ctx.fill();
                
                // Debug - draw a red dot at Orbie's position
                ctx.beginPath();
                ctx.arc(orbie.x, orbie.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = 'red';
                ctx.fill();
            }
        } else {
            console.error("Cannot draw particles - ctx is not defined");
        }
    }
    
    // Draw a group of particles
    function drawParticleGroup(particles) {
        if (!ctx || !particles) return;
        
        // Draw each particle
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            
            // Draw the particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color || 'white';
            ctx.fill();
        }
    }
    
    // Animation loop
    function animate(timestamp) {
        try {
            // Clear the previous animation frame ID and request a new one first
            // This ensures we continue the loop even if there's an error later
            animationFrameId = null;
            animationFrameId = requestAnimationFrame(animate);
            
            // Update particle positions
            updateParticles();
            
            // Draw particles
            drawParticles();
        } catch (error) {
            console.error("Error in animation loop:", error);
            // Try to continue the animation even after error
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(animate);
            }
        }
    }
    
    // Update the zots counter display
    function updateZotsCounter() {
        const zotsCounterElement = document.getElementById('zotsCounter');
        if (!zotsCounterElement) return;
        
        let totalZots = 0;
        
        // Count zots in all swarms
        for (const swarm of zotSwarms) {
            totalZots += swarm.zots.length;
        }
        
        // Update the display
        zotsCounterElement.textContent = `Zots: ${totalZots}`;
    }
    
    // Apply standard boundary constraints (non-membrane boundaries)
    function applyBoundaryConstraints(particle) {
        // Keep particles within boundaries
        if (particle === orbie) {
            // For Orbie, constrain to prevent going off screen
            const padding = particle.size || 10;
            if (particle.x < padding) particle.x = padding;
            if (particle.x > width - padding) particle.x = width - padding;
            if (particle.y < padding) particle.y = padding;
            if (particle.y > height - padding) particle.y = height - padding;
        } else {
            // For other particles, wrap around screen edges (toroidal)
            if (particle.x < 0) particle.x = width;
            if (particle.x > width) particle.x = 0;
            if (particle.y < 0) particle.y = height;
            if (particle.y > height) particle.y = 0;
        }
    }
    
    // Initialize everything
    function init(canvasElement, fpsElement) {
        console.log("ParticleSystem.init called with:", canvasElement, fpsElement);
        
        // Store references to DOM elements
        canvas = canvasElement;
        fpsDisplay = fpsElement;
        
        // Get the drawing context
        if (canvas) {
            ctx = canvas.getContext('2d');
            console.log("Canvas context obtained:", ctx ? "✓" : "✗");
        } else {
            console.error("Canvas element is null or undefined");
            return false;
        }
        
        // Set up canvas with DPR handling
        setupCanvas();
        
        // Initialize elements
        initBackgroundParticles();
        initOrbie();
        
        console.log("Initialization complete, starting animation loop");
        // Start the animation loop if not already running
        if (!animationFrameId) {
            lastTime = performance.now();
            lastFpsUpdate = lastTime;
            frameCount = 0;
            
            // Force first frame to draw
            drawParticles();
            // Start animation loop
            animationFrameId = requestAnimationFrame(animate);
            console.log("Animation loop started with ID:", animationFrameId);
        }
        
        return true;
    }
    
    // Public API - only expose necessary methods
    return {
        init: function(canvasElement, fpsElement) {
            return init(canvasElement, fpsElement);
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
                            console.log("Enabling Orbie, refreshing all visual properties");
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
                console.log("Orbie enabled:", orbieSettings.enabled);
                console.log("Orbie properties:", orbie.color, orbie.size, orbie.glowColor, orbie.glowOpacity);
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
            if (group === 'orbie') {
                this.updateOrbieSettings(property, value);
            } else if (group === 'orbieSwarm') {
                this.updateOrbieSwarmSettings(property, value);
            } else if (group === 'forces') {
                forceSettings[property] = value;
                console.log(`Updated Force ${property} to ${value}`);
            } else if (group === 'zotSwarms') {
                // Handle update to global zot swarm settings
                if (property === 'showExteriorStroke') {
                    zotSwarmSettings.showExteriorStroke = value;
                    console.log(`Updated Zot Swarms exterior stroke to ${value ? 'enabled' : 'disabled'}`);
                } else if (property === 'exteriorStrokeWidth') {
                    zotSwarmSettings.exteriorStrokeWidth = value;
                    console.log(`Updated Zot Swarms exterior stroke width to ${value}px`);
                } else {
                    zotSwarmSettings[property] = value;
                    console.log(`Updated Zot Swarms ${property} to ${value}`);
                }
            }
        },
        
        // Get a force setting value
        getForceSettingValue: function(property) {
            return property in forceSettings ? forceSettings[property] : undefined;
        },
        
        // Methods for ZotSwarm management
        createZotSwarm: function(config) {
            return createZotSwarm(config);
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
            console.log("After reset - Orbie enabled:", orbieSettings.enabled);
            console.log("After reset - Orbie visual properties:", 
                orbie.color, orbie.size, orbie.glowColor, orbie.glowOpacity, orbie.glowSize);
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
        
        // Get current zot swarm settings
        getZotSwarmSettings: function() {
            return {...zotSwarmSettings};
        }
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ParticleSystem;
}