// demoMode.js - Automatic zot swarm demo mode
const DemoMode = (function() {
    // Track if demo mode is active
    let isActive = false;
    
    // Store created swarms for cleanup
    let demoSwarms = [];
    
    // Audio elements and state
    let demoAudio = null;
    let currentSongIndex = -1;
    let shuffledSongKeys = [];
    
    // Cycling properties
    let cycleInterval = null;
    let cycleIndex = -1; // Start at -1 so first increment goes to 0
    let isCycling = false;
    let touchDetected = false;
    let secondTouchDetected = false; // Track if second touch has been detected
    let isFirstLoop = true; // Track if we're in the first loop
    
    // Idle prompt properties
    let idleTimer = null;
    let promptElement = null;
    let promptActive = false;
    
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
        idleTimeout: 2000     // Show prompt after 2 seconds of inactivity
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
        // Atomic, Neon
        {
            name: "Atomic",
            configs: Array(6).fill({
                presetName: 'atomic',
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
        
        console.log('Starting Zot Swarm Demo Mode');
        
        // Make sure we have access to particle system
        if (!ParticleSystem || typeof ParticleSystem.createZotSwarm !== 'function') {
            console.error('Demo Mode: ParticleSystem not available');
            return;
        }
        
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
                startCycling();
                
                // Add second touch detection
                canvas.addEventListener('touchstart', detectSecondTouch);
                canvas.addEventListener('click', detectSecondTouch);
                
                console.log('Demo Mode: First touch detected, started cycling');
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
            console.log(`Demo Mode: Second touch detected at (${secondTouchX}, ${secondTouchY}), spawning remaining swarms`);
            
            // Create remaining swarms
            createRemainingSwarms();
            
            // Play demo intro audio
            playDemoAudio();
            
            // Enable music button if MusicController is available
            if (typeof MusicController !== 'undefined' && MusicController.enableButton) {
                MusicController.enableButton();
            }
            
            // Remove second touch listener
            canvas.removeEventListener('touchstart', detectSecondTouch);
            canvas.removeEventListener('click', detectSecondTouch);
        };
        
        // Add double tap detection
        const handleTap = function(e) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            
            if (tapLength < doubleTapDelay && tapLength > 0) {
                // Double tap detected
                console.log('Demo Mode: Double tap detected');
                
                // Hide push/pull prompt if active
                hidePushPullPrompt();
                
                // Restart cycling if it was stopped
                if (!isCycling) {
                    startCycling();
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
                    console.log(`Demo Mode: Swipe detected (${distance.toFixed(0)}px)`);
                    hideSwipePrompt();
                    startCycling(); // Resume cycling
                    
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
        console.log('Demo Mode: Showing touch prompt');
        
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
     */
    function startCycling() {
        if (isCycling) return;
        
        isCycling = true;
        
        // Only cycle if we haven't already (when resuming from paused state)
        if (cycleIndex === -1) {
            // Cycle immediately to first preset
            cycleToNextPreset();
        }
        
        // Set up interval to cycle through presets
        cycleInterval = setInterval(() => {
            cycleToNextPreset();
            
            // After a complete loop, mark it as no longer first loop
            if (cycleIndex === 0) {
                isFirstLoop = false;
            }
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
        
        // Don't cycle if we're showing a prompt
        if (pushPullPromptActive || swipePromptActive) {
            return;
        }
        
        cycleIndex = (cycleIndex + 1) % PRESET_CYCLES.length;
        const presetCycle = PRESET_CYCLES[cycleIndex];
        
        console.log(`Demo Mode: Cycling to preset "${presetCycle.name}"`);
        
        // Apply new configurations to each swarm
        demoSwarms.forEach((swarmId, index) => {
            const swarmConfig = presetCycle.configs[index % presetCycle.configs.length];
            updateSwarmParameters(swarmId, swarmConfig);
        });
        
        // Special behavior for different presets (only in first loop)
        if (isFirstLoop) {
            // Show special prompt for Atomic preset
            if (presetCycle.name === "Atomic") {
                stopCycling(); // Pause cycling
                showPushPullPrompt(); // Show the special prompt
            }
            // Show special swipe prompt for Torrential preset
            else if (presetCycle.name === "Torrential") {
                stopCycling(); // Pause cycling
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
                speed: preset.speed !== undefined ? preset.speed : 4,
                separation: preset.separation !== undefined ? preset.separation : 0.1,
                alignment: preset.alignment !== undefined ? preset.alignment : 0.1,
                cohesion: preset.cohesion !== undefined ? preset.cohesion : 5,
                perception: preset.perception !== undefined ? preset.perception : 100,
                colorTheme: preset.colorTheme || DEMO_CONFIG.colorTheme
            };
            
            // Update the swarm
            if (ParticleSystem.updateZotSwarm) {
                ParticleSystem.updateZotSwarm(swarmId, updateConfig);
                console.log(`Demo Mode: Updated swarm ${swarmId} to ${config.presetName} - ${updateConfig.colorTheme}`);
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
     * Show the Push/Pull double tap prompt
     */
    function showPushPullPrompt() {
        if (pushPullPromptActive || !isFirstLoop) return;
        
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
        
        console.log('Demo Mode: Showing Push/Pull prompt');
    }
    
    /**
     * Hide the Push/Pull prompt
     */
    function hidePushPullPrompt() {
        if (!pushPullPromptActive || !pushPullPromptElement) return;
        
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
        
        console.log('Demo Mode: Hiding Push/Pull prompt');
    }
    
    /**
     * Show the swipe prompt for Torrential preset
     */
    function showSwipePrompt() {
        if (swipePromptActive || !isFirstLoop) return;
        
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
        
        console.log('Demo Mode: Showing swipe prompt');
    }
    
    /**
     * Hide the swipe prompt
     */
    function hideSwipePrompt() {
        if (!swipePromptActive || !swipePromptElement) return;
        
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
        
        console.log('Demo Mode: Hiding swipe prompt');
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
                console.log('Demo Mode: Next preset key detected');
                goToNextPreset();
                e.preventDefault();
            }
            // Detect left arrow or "<" key
            else if (e.key === 'ArrowLeft' || e.key === '<') {
                console.log('Demo Mode: Previous preset key detected');
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
        cycleToNextPreset();
        
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
        cycleToNextPreset();
        
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
        
        console.log('Ending Zot Swarm Demo Mode');
        
        // Stop cycling
        stopCycling();
        
        // Stop and cleanup audio
        if (demoAudio) {
            demoAudio.pause();
            demoAudio = null;
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
                    console.error(`Demo Mode: Error removing swarm ${swarmId}:`, error);
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
            console.error('Demo Mode: Canvas not found');
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
            speed: preset.speed || 4,
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
                console.log(`Demo Mode: Created initial swarm ${swarmId} at center (${centerX.toFixed(0)}, ${centerY.toFixed(0)})`);
            }
        } catch (error) {
            console.error('Demo Mode: Error creating initial swarm:', error);
        }
    }
    
    /**
     * Create the remaining 7 swarms in a circular arrangement centered around the second touch location
     */
    function createRemainingSwarms() {
        // Get canvas dimensions
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            console.error('Demo Mode: Canvas not found');
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
                speed: preset.speed || 4,
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
                    console.log(`Demo Mode: Created additional swarm ${swarmId} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
                }
            } catch (error) {
                console.error('Demo Mode: Error creating additional swarm:', error);
            }
        }
        
        console.log(`Demo Mode: Created ${swarmCount} additional swarms, total: ${demoSwarms.length}`);
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
        shuffledSongKeys = shuffleArray(songKeys);
        currentSongIndex = -1; // Will be incremented to 0 on first play
        console.log('Demo Mode: Randomized song playlist:', shuffledSongKeys);
    }

    /**
     * Play the next song in the shuffled playlist
     */
    function playNextSong() {
        currentSongIndex = (currentSongIndex + 1) % shuffledSongKeys.length;
        const nextSongKey = shuffledSongKeys[currentSongIndex];
        
        // Create new audio element
        if (demoAudio) {
            demoAudio.pause();
        }
        demoAudio = new Audio();
        demoAudio.src = Config.getAudioPath(nextSongKey);
        
        // Set up ended event for continuous playback
        demoAudio.onended = playNextSong;
        
        // Add error handling
        demoAudio.onerror = function(err) {
            console.error(`Demo Mode: Error loading audio ${nextSongKey}:`, err);
            demoAudio = null;
            // Try to play next song on error
            setTimeout(playNextSong, 1000);
        };
        
        // Play the audio
        demoAudio.play().catch(err => {
            console.error(`Demo Mode: Error playing audio ${nextSongKey}:`, err);
            // Try to play next song on error
            setTimeout(playNextSong, 1000);
        });
        
        console.log(`Demo Mode: Playing song ${currentSongIndex + 1}/${shuffledSongKeys.length}: ${nextSongKey}`);
    }

    /**
     * Play the demo intro audio
     */
    function playDemoAudio() {
        try {
            // Create audio element if it doesn't exist
            if (!demoAudio) {
                demoAudio = new Audio();
                demoAudio.src = Config.getAudioPath('demoIntro');
                
                // Set up ended event to start random playlist
                demoAudio.onended = function() {
                    randomizeSongs();
                    playNextSong();
                };
                
                // Add error handling
                demoAudio.onerror = function(err) {
                    console.error('Demo Mode: Error loading intro audio:', err);
                    demoAudio = null;
                    // Start random playlist immediately on error
                    randomizeSongs();
                    playNextSong();
                };
            }
            
            // Play the audio
            demoAudio.play().catch(err => {
                console.error('Demo Mode: Error playing intro audio:', err);
                // Start random playlist immediately on error
                randomizeSongs();
                playNextSong();
            });
        } catch (err) {
            console.error('Demo Mode: Error setting up audio:', err);
            // Start random playlist immediately on error
            randomizeSongs();
            playNextSong();
        }
    }
    
    /**
     * Stop any playing demo audio
     */
    function stopAudio() {
        if (demoAudio) {
            demoAudio.pause();
            demoAudio = null;
            console.log('Demo Mode: Stopped demo audio');
        }
    }
    
    /**
     * Toggle pause/play state of demo audio
     * @returns {boolean} true if audio is now playing, false if paused
     */
    function togglePauseAudio() {
        if (!demoAudio) return false;
        
        if (demoAudio.paused) {
            // Resume playback
            demoAudio.play().catch(err => {
                console.error('Demo Mode: Error resuming audio:', err);
            });
            console.log('Demo Mode: Resumed demo audio');
            return true;
        } else {
            // Pause playback
            demoAudio.pause();
            console.log('Demo Mode: Paused demo audio');
            return false;
        }
    }
    
    /**
     * Resume audio playback if it's paused
     * @returns {boolean} true if successfully resumed, false otherwise
     */
    function resumeAudio() {
        if (!demoAudio || !demoAudio.paused) return false;
        
        demoAudio.play().catch(err => {
            console.error('Demo Mode: Error resuming audio:', err);
            return false;
        });
        console.log('Demo Mode: Resumed demo audio');
        return true;
    }
    
    /**
     * Check if demo audio is currently playing
     */
    function isAudioPlaying() {
        return demoAudio !== null && !demoAudio.paused;
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
        isAudioPlaying: isAudioPlaying
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = DemoMode;
} 