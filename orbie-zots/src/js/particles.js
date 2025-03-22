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