// demoMode.js - Automatic zot swarm demo mode
const DemoMode = (function() {
    // Track if demo mode is active
    let isActive = false;
    
    // Store created swarms for cleanup
    let demoSwarms = [];
    
    // Cycling properties
    let cycleInterval = null;
    let cycleIndex = 0;
    let isCycling = false;
    let touchDetected = false;
    
    // Idle prompt properties
    let idleTimer = null;
    let promptElement = null;
    let promptActive = false;
    
    // Configuration for demo mode
    const DEMO_CONFIG = {
        swarmCount: 6,         // Number of swarms to create
        zotsPerSwarm: 50,      // Number of zots in each swarm
        presetName: 'jellyOrbs', // Preset behavior to use
        colorTheme: 'green',   // Color theme to use (forest-like) - fallback only
        minSize: 1,            // Minimum zot size
        maxSize: 8,            // Maximum zot size
        circleRadius: 150,     // Fixed pixel value for swarm positioning (was 0.35 - a fraction of screen)
        cycleInterval: 10000,  // Cycle through presets every 10 seconds
        idleTimeout: 5000     // Show prompt after 5 seconds of inactivity
    };
    
    // Preset configurations to cycle through
    const PRESET_CYCLES = [
        // Initial configuration - jellyOrbs, green (when demo is initialized)
        {
            name: "Jelly Orbs",
            configs: Array(6).fill({
                presetName: 'jellyOrbs',
                zotCount: 50
            })
        },
        // Fizzy Pop, Neon
        {
            name: "Fizzy Pop",
            configs: Array(6).fill({
                presetName: 'fizzyPop',
                zotCount: 50
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
        // Bird Flock (murmuration), Rainbow, zotCount=150
        {
            name: "Bird Flock",
            configs: Array(6).fill({
                presetName: 'murmuration',
                zotCount: 150
            })
        },
        // Lava Lamp, Fire, zotCount=150
        {
            name: "Lava Lamp",
            configs: Array(6).fill({
                presetName: 'lavaLamp',
                zotCount: 150
            })
        },
        // Atomic, Sparkle
        {
            name: "Atomic",
            configs: Array(6).fill({
                presetName: 'atomic',
                zotCount: 50
            })
        },
        // 2 of each - Mix of all presets
        {
            name: "Mixed Swarms",
            configs: [
                { presetName: 'fizzyPop', zotCount: 50 },
                { presetName: 'fizzyPop', zotCount: 50 },
                { presetName: 'cookingOil', zotCount: 50 },
                { presetName: 'cookingOil', zotCount: 50 },
                { presetName: 'murmuration', zotCount: 50 },
                { presetName: 'murmuration', zotCount: 50 },
                { presetName: 'lavaLamp', zotCount: 50 },
                { presetName: 'lavaLamp', zotCount: 50 },
                { presetName: 'atomic', zotCount: 50 },
                { presetName: 'atomic', zotCount: 50 },
                { presetName: 'jellyOrbs', zotCount: 50 },
                { presetName: 'jellyOrbs', zotCount: 50 }
            ]
        }
    ];
    
    /**
     * Initialize and start the demo mode
     */
    function start() {
        if (isActive) return; // Prevent multiple starts
        
        console.log('Starting Zot Swarm Demo Mode');
        
        // Make sure we have access to particle system
        if (!ParticleSystem || typeof ParticleSystem.createZotSwarm !== 'function') {
            console.error('Demo Mode: ParticleSystem not available');
            return;
        }
        
        // Delay to ensure all systems are properly initialized
        setTimeout(() => {
            createDemoSwarms();
            setupMenuButtonListeners();
            setupTouchDetection();
            setupIdlePrompt();
            isActive = true;
        }, 500);
    }
    
    /**
     * Create the demo swarms in a circular arrangement
     */
    function createDemoSwarms() {
        // Get canvas dimensions
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            console.error('Demo Mode: Canvas not found');
            return;
        }
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = DEMO_CONFIG.circleRadius; // Use fixed radius value directly
        
        // Create swarms in a circular pattern
        for (let i = 0; i < DEMO_CONFIG.swarmCount; i++) {
            // Calculate position on circle
            const angle = (i / DEMO_CONFIG.swarmCount) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Configure the swarm with parameters from jellyOrbs preset
            const preset = Presets.swarmPresets[DEMO_CONFIG.presetName] || {};
            
            // Configuration object for the swarm
            const config = {
                // Swarm preset behavior parameters
                zotCount: DEMO_CONFIG.zotsPerSwarm,
                speed: preset.speed || 3,
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
                name: `Demo Swarm ${i+1}`
            };
            
            // Create the swarm
            try {
                const swarmId = ParticleSystem.createZotSwarm(config);
                if (swarmId) {
                    demoSwarms.push(swarmId);
                    console.log(`Demo Mode: Created swarm ${swarmId} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
                }
            } catch (error) {
                console.error('Demo Mode: Error creating swarm:', error);
            }
        }
        
        console.log(`Demo Mode: Created ${demoSwarms.length} swarms`);
    }
    
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
                startCycling();
                
                // Remove event listeners once triggered
                canvas.removeEventListener('touchstart', startCyclingOnFirstTouch);
                canvas.removeEventListener('click', startCyclingOnFirstTouch);
                
                console.log('Demo Mode: First touch detected, started cycling');
            }
        };
        
        canvas.addEventListener('touchstart', startCyclingOnFirstTouch);
        canvas.addEventListener('click', startCyclingOnFirstTouch);
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
        if (!promptElement || !isActive || touchDetected || promptActive) return;
        
        console.log('Demo Mode: Showing touch prompt');
        
        // Animation controllers for cleanup
        let pulseAnimation = null;
        let zoomAnimation = null;
        let rippleAnimation = null;
        
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
            
            // Add the "T-T-T-Touch Me" text
            secondPart.textContent = 'T-T-T-Touch Me';
            
            // Apply zoom fade-in to second part
            zoomAnimation = txtZoomFadeIn(secondPart, 2, 1, 1000, () => {
                // Only after the zoom-in is complete, start the ripple effect
                // Get all characters for the ripple effect
                secondPart.innerHTML = ''; // Clear for individual chars
                
                // Content for the second part with hyphens
                const text = 'T-T-T-Touch Me';
                
                // Animation variables
                let letterIndex = 0;
                
                // Create span elements for each character
                for (let i = 0; i < text.length; i++) {
                    const charSpan = document.createElement('span');
                    
                    // Special handling for spaces to prevent trimming
                    if (text[i] === ' ') {
                        charSpan.innerHTML = '&nbsp;';
                        charSpan.style.width = '0.5em';
                    } else {
                        charSpan.textContent = text[i];
                    }
                    
                    charSpan.style.opacity = '1'; // Make visible immediately since we already faded in
                    charSpan.style.display = 'inline-block';
                    charSpan.style.position = 'relative';
                    charSpan.style.transition = 'transform 0.1s ease-out';
                    secondPart.appendChild(charSpan);
                }
                
                // Start the ripple effect immediately
                const chars = secondPart.querySelectorAll('span');
                rippleAnimation = txtRipple(chars);
            });
        }, 1500); // Wait 1.5s for first part to finish its animation
        
        // Store animation controllers in the element for cleanup
        promptElement.animations = {
            pulse: pulseAnimation,
            zoom: zoomAnimation,
            ripple: rippleAnimation
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
            if (promptElement.animations.ripple) promptElement.animations.ripple.stop();
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
     */
    function startCycling() {
        if (isCycling) return;
        
        isCycling = true;
        cycleIndex = 0; // Start with the first preset (after the initial one)
        
        // Make sure we start with push mode by default
        if (ParticleSystem.isAttractMode()) {
            ParticleSystem.toggleAttraction(); // Ensure we start in push (repel) mode
            console.log('Demo Mode: Initializing touch mode to PUSH');
        }
        
        // Set up interval to cycle through presets
        cycleInterval = setInterval(() => {
            cycleToNextPreset();
        }, DEMO_CONFIG.cycleInterval);
    }
    
    /**
     * Cycle to the next preset configuration
     */
    function cycleToNextPreset() {
        if (!isActive || demoSwarms.length === 0) {
            stopCycling();
            return;
        }
        
        cycleIndex = (cycleIndex + 1) % PRESET_CYCLES.length;
        const presetCycle = PRESET_CYCLES[cycleIndex];
        
        console.log(`Demo Mode: Cycling to preset "${presetCycle.name}"`);
        
        // Check if this is the murmuration preset
        const isMurmuration = presetCycle.name === "Bird Flock";
        
        // If this is the murmuration preset, set touch to "pull" (attract mode)
        if (isMurmuration && !ParticleSystem.isAttractMode()) {
            ParticleSystem.toggleAttraction(); // Enable attract mode for murmuration
            console.log('Demo Mode: Setting touch mode to PULL for murmuration');
        } 
        // If we're moving away from murmuration preset to something else, set touch to "push"
        else if (!isMurmuration && ParticleSystem.isAttractMode()) {
            ParticleSystem.toggleAttraction(); // Disable attract mode for other presets
            console.log('Demo Mode: Setting touch mode to PUSH for non-murmuration preset');
        }
        
        // Apply new configurations to each swarm
        demoSwarms.forEach((swarmId, index) => {
            const swarmConfig = presetCycle.configs[index % presetCycle.configs.length];
            updateSwarmParameters(swarmId, swarmConfig);
        });
    }
    
    /**
     * Update parameters of an existing swarm
     */
    function updateSwarmParameters(swarmId, config) {
        try {
            // Get preset parameters
            const preset = Presets.swarmPresets[config.presetName] || {};
            
            // Map preset names to specific color themes
            const presetColorThemes = {
                murmuration: 'rainbow',
                lavaLamp: 'fire',
                cookingOil: 'gold',
                jellyOrbs: 'green',
                atomic: 'sparkle',
                fizzyPop: 'neon'
            };
            
            // Use the mapped color theme based on preset name or fallback
            const colorTheme = presetColorThemes[config.presetName] || DEMO_CONFIG.colorTheme;
            
            // Create update config with behavior parameters
            const updateConfig = {
                zotCount: config.zotCount || DEMO_CONFIG.zotsPerSwarm,
                speed: preset.speed !== undefined ? preset.speed : 3,
                separation: preset.separation !== undefined ? preset.separation : 0.1,
                alignment: preset.alignment !== undefined ? preset.alignment : 0.1,
                cohesion: preset.cohesion !== undefined ? preset.cohesion : 5,
                perception: preset.perception !== undefined ? preset.perception : 100,
                colorTheme: colorTheme
            };
            
            // Update the swarm
            if (ParticleSystem.updateZotSwarm) {
                ParticleSystem.updateZotSwarm(swarmId, updateConfig);
                console.log(`Demo Mode: Updated swarm ${swarmId} to ${config.presetName} - ${colorTheme}`);
            }
        } catch (error) {
            console.error(`Demo Mode: Error updating swarm ${swarmId}:`, error);
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
            console.error('Demo Mode: Menu toggle button not found');
            return;
        }
        
        // Capture phase to ensure our handler runs before the menu toggle handlers
        const eventOptions = { capture: true };
        
        // Add handlers for both click and touch events
        menuToggle.addEventListener('click', endDemoMode, eventOptions);
        menuToggle.addEventListener('touchstart', endDemoMode, eventOptions);
    }
    
    /**
     * End the demo mode by removing all swarms
     */
    function endDemoMode(event) {
        if (!isActive) return;
        
        console.log('Ending Zot Swarm Demo Mode');
        
        // Stop cycling
        stopCycling();
        
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
        
        // Remove all demo swarms
        if (demoSwarms.length > 0 && ParticleSystem && typeof ParticleSystem.removeZotSwarm === 'function') {
            demoSwarms.forEach(swarmId => {
                try {
                    ParticleSystem.removeZotSwarm(swarmId);
                } catch (error) {
                    console.error(`Demo Mode: Error removing swarm ${swarmId}:`, error);
                }
            });
            demoSwarms = [];
        }
        
        isActive = false;
        touchDetected = false;
        
        // Allow the event to continue propagating after we've cleaned up
        // (so the menu button still works normally)
    }
    
    // Public API
    return {
        start: start,
        end: endDemoMode,
        isActive: function() { return isActive; }
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = DemoMode;
} 