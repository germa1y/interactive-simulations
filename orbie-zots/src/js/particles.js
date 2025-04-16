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