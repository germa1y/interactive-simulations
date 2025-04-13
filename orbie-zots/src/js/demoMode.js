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
        
        console.log('Starting Zot Swarm Demo Mode');
        
        // Make sure we have access to particle system
        if (!ParticleSystem || typeof ParticleSystem.createZotSwarm !== 'function') {
            console.error('Demo Mode: ParticleSystem not available');
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
                
                console.log('Demo Mode: First touch detected, waiting for second touch');
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
            console.log(`Demo Mode: Second touch detected at (${secondTouchX}, ${secondTouchY}), waiting 1 second before spawning remaining swarms`);
            
            // Start playing demo intro audio but don't start cycling yet
            try {
                if (demoAudio) {
                    demoAudio.pause();
                }
                
                // Use the preloaded intro audio if available
                if (introAudio && introAudioLoaded) {
                    console.log('Demo Mode: Using cached intro audio for playback');
                    demoAudio = introAudio;
                    introAudio = null; // Clear reference to avoid duplicate usage
                } else {
                    // Create new audio element if preloaded one isn't available
                    console.log('Demo Mode: Creating new audio element for intro');
                    demoAudio = new Audio();
                    demoAudio.preload = 'auto';
                    demoAudio.src = './music/DemoIntro.mp3';
                }
                
                console.log('Demo Mode: Using path for demo intro audio:', demoAudio.src);
                
                // Set up ended event to start random playlist
                demoAudio.onended = function() {
                    console.log('Demo Mode: Intro audio ended, starting random playlist');
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
                            playPromise.then(() => {
                                console.log('Demo Mode: Intro audio playing successfully');
                            }).catch(err => {
                                console.error('Demo Mode: Error playing intro audio:', err);
                                // Fall back to random playlist on error
                                randomizeSongs();
                                playNextSong();
                            });
                        }
                    } catch (err) {
                        console.error('Demo Mode: Error initiating intro audio playback:', err);
                        randomizeSongs();
                        playNextSong();
                    }
                }, 500);
            } catch (err) {
                console.error('Demo Mode: Error setting up intro audio:', err);
                randomizeSongs();
                playNextSong();
            }
            
            // Remove second touch listener
            canvas.removeEventListener('touchstart', detectSecondTouch);
            canvas.removeEventListener('click', detectSecondTouch);
            
            // Add 1-second delay before spawning remaining swarms
            setTimeout(() => {
                console.log('Demo Mode: 1-second delay complete, spawning remaining swarms');
                createRemainingSwarms();
                
                // Set flag that all swarms are spawned
                allSwarmsSpawned = true;
                
                // Add listener for the first touch after all swarms are spawned
                canvas.addEventListener('touchstart', detectFirstTouchAfterSpawn);
                canvas.addEventListener('click', detectFirstTouchAfterSpawn);
                
                console.log('Demo Mode: All swarms spawned, waiting for first touch to increase speed and start cycling');
            }, 1000);
        };
        
        // New handler for detecting the first touch after all swarms are spawned
        const detectFirstTouchAfterSpawn = function(e) {
            if (!isActive || !allSwarmsSpawned || firstTouchAfterSpawnDetected) return;
            
            firstTouchAfterSpawnDetected = true;
            console.log('Demo Mode: First touch after all swarms spawned detected, increasing speed and starting cycling');
            
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
                console.log('Demo Mode: Double tap detected');
                
                // Hide push/pull prompt if active
                hidePushPullPrompt();
                
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
     * @param {boolean} skipImmediateCycle - If true, don't cycle immediately (just set up interval)
     */
    function startCycling(skipImmediateCycle = false) {
        if (isCycling) return;
        
        // Only start cycling if we've detected the first touch after all swarms are spawned
        // or if we're in special circumstances like after a swipe
        if (!firstTouchAfterSpawnDetected && allSwarmsSpawned) {
            console.log('Demo Mode: Not starting cycling yet, waiting for first touch after all swarms are spawned');
            return;
        }
        
        console.log('Demo Mode: Starting preset cycling');
        
        // Don't reset cycle index if we're resuming after a prompt (swipe or push/pull)
        // Only reset if we're starting fresh (no cycling has happened yet)
        if (cycleIndex === -1) {
            // First time starting cycling
            console.log('Demo Mode: First time starting cycle, initialize index to -1');
            // Keep cycleIndex at -1 so first increment goes to 0
        } else {
            // We're resuming after a prompt (like swipe or push/pull), maintain current preset
            console.log(`Demo Mode: Resuming cycling from preset index ${cycleIndex}`);
            // No need to change cycleIndex, keep current preset
        }
        
        // Cycle immediately unless skipImmediateCycle is true
        if (!skipImmediateCycle) {
            cyclePreset();
        } else {
            console.log('Demo Mode: Skipping immediate cycle, will cycle after interval');
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
            console.log('Demo Mode: First loop complete, disabling instructions and pauses');
            isFirstLoop = false;
        }
        
        // Update the cycle index
        cycleIndex = nextCycleIndex;
        const presetCycle = PRESET_CYCLES[cycleIndex];
        
        console.log(`Demo Mode: Cycling to preset "${presetCycle.name}" (First Loop: ${isFirstLoop})`);
        
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
                    console.log('Demo Mode: Enabling music button on Torrential preset detection');
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
        
        console.log('Ending Zot Swarm Demo Mode');
        
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
        
        // Enable the music button after demo mode ends
        if (typeof MusicController !== 'undefined' && MusicController.enableButton) {
            console.log('Demo Mode: Enabling music button after demo mode ends');
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
                console.log(`Demo Mode: Created initial swarm ${swarmId} at center (${centerX.toFixed(0)}, ${centerY.toFixed(0)}) with speed ${config.speed}`);
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
                    console.log(`Demo Mode: Created additional swarm ${swarmId} at (${x.toFixed(0)}, ${y.toFixed(0)}) with speed ${config.speed}`);
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
        console.log('Demo Mode: Available song keys:', songKeys);
        shuffledSongKeys = shuffleArray(songKeys);
        currentSongIndex = -1; // Will be incremented to 0 on first play
        console.log('Demo Mode: Randomized song playlist:', shuffledSongKeys);
    }

    /**
     * Play the next song in the shuffled playlist
     */
    function playNextSong() {
        // Don't proceed if we don't have any songs
        if (!shuffledSongKeys || shuffledSongKeys.length === 0) {
            console.error('Demo Mode: No songs in playlist, randomizing songs first');
            randomizeSongs();
            if (!shuffledSongKeys || shuffledSongKeys.length === 0) {
                console.error('Demo Mode: Failed to get songs, cannot play music');
                return;
            }
        }
        
        currentSongIndex = (currentSongIndex + 1) % shuffledSongKeys.length;
        const nextSongKey = shuffledSongKeys[currentSongIndex];
        
        console.log(`Demo Mode: Preparing to play next song: ${nextSongKey}`);
        
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
            console.log(`Demo Mode: Config provided path: ${audioPath}`);
            
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
                
                console.log(`Demo Mode: Using direct path: ${audioPath}`);
            }
        } catch (err) {
            console.error('Demo Mode: Error getting audio path from Config, using fallback path');
            
            // Use a fallback demo song if everything fails
            audioPath = './music/DemoPulse.mp3';
        }
        
        console.log(`Demo Mode: Creating audio element with path: ${audioPath}`);
        
        // Preload setting
        demoAudio.preload = 'auto';
        
        // Set source
        demoAudio.src = audioPath;
        
        // Add load event handler
        demoAudio.onloadeddata = function() {
            console.log(`Demo Mode: Song ${nextSongKey} loaded successfully`);
        };
        
        // Set up ended event for continuous playback
        demoAudio.onended = playNextSong;
        
        // Add error handling
        demoAudio.onerror = function(err) {
            console.error(`Demo Mode: Error loading audio ${nextSongKey}:`, err);
            console.error('Demo Mode: Audio error code:', demoAudio.error ? demoAudio.error.code : 'unknown');
            console.error('Demo Mode: Audio src was:', demoAudio.src);
            
            // Try a direct fallback to a reliable file
            console.log('Demo Mode: Trying fallback to DemoPulse.mp3');
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
                console.log(`Demo Mode: Attempting to play song: ${nextSongKey}`);
                
                // Make sure user interaction has been recorded for autoplay policies
                if (typeof document !== 'undefined' && document.documentElement && 
                    typeof document.documentElement.hasAttribute === 'function' &&
                    !document.documentElement.hasAttribute('data-user-interacted')) {
                    document.documentElement.setAttribute('data-user-interacted', 'true');
                    console.log('Demo Mode: Setting user interaction flag for autoplay');
                }
                
                const playPromise = demoAudio.play();
                
                // Handle the promise properly
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log(`Demo Mode: Song ${nextSongKey} playing successfully`);
                    }).catch(err => {
                        console.error(`Demo Mode: Error playing audio ${nextSongKey}:`, err);
                        // Try to play next song on error
                        setTimeout(playNextSong, 1000);
                    });
                } else {
                    console.log('Demo Mode: Audio play did not return a promise');
                }
            } catch (err) {
                console.error(`Demo Mode: Error initiating audio playback for ${nextSongKey}:`, err);
                setTimeout(playNextSong, 1000);
            }
        }, 300);
        
        console.log(`Demo Mode: Playing song ${currentSongIndex + 1}/${shuffledSongKeys.length}: ${nextSongKey}`);
    }

    /**
     * Preload the intro audio file so it's ready to play immediately when needed
     */
    function preloadIntroAudio() {
        if (introAudio || introAudioLoaded) {
            console.log('Demo Mode: Intro audio already preloaded');
            return;
        }
        
        console.log('Demo Mode: Preloading intro audio...');
        
        // Create a dedicated audio element just for the intro
        introAudio = new Audio();
        
        // Set highest preload priority
        introAudio.preload = 'auto';
        
        // Use a direct path to the audio file for maximum reliability
        introAudio.src = './music/DemoIntro.mp3';
        
        // Add load event handler
        introAudio.onloadeddata = function() {
            console.log('Demo Mode: Intro audio loaded successfully and cached');
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
                            console.log('Demo Mode: Intro audio primed for immediate playback');
                        }, 10);
                    }).catch(err => {
                        // Common error on browsers that require user interaction - not a problem
                        console.log('Demo Mode: Audio priming required user interaction (expected):', err.name);
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
            console.log('Demo Mode: Intro audio can play through without buffering');
        };
        
        // Add error handling with multiple fallback paths
        introAudio.onerror = function(err) {
            console.error('Demo Mode: Error loading intro audio:', err);
            console.error('Demo Mode: Audio error code:', introAudio.error ? introAudio.error.code : 'unknown');
            
            // Try alternative path
            if (introAudio.src.indexOf('./music/') === 0) {
                console.log('Demo Mode: Trying alternative path for intro audio');
                introAudio.src = '/music/DemoIntro.mp3';
                
                // Handle second failure
                introAudio.onerror = function() {
                    console.error('Demo Mode: Second attempt to load intro audio failed');
                    
                    // Try one more absolute fallback
                    if (typeof window !== 'undefined' && window.location) {
                        introAudio.src = window.location.origin + '/music/DemoIntro.mp3';
                        
                        // Final failure handler
                        introAudio.onerror = function() {
                            console.error('Demo Mode: All attempts to load intro audio failed');
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
            console.log('Demo Mode: No audio to stop');
            return;
        }
        
        // If audio is already paused, just cleanup
        if (demoAudio.paused) {
            demoAudio = null;
            console.log('Demo Mode: Audio already paused, cleaned up audio element');
            return;
        }
        
        console.log(`Demo Mode: Fading out audio over ${fadeOutDuration}ms`);
        
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
                console.log(`Demo Mode: Fade progress - volume: ${newVolume.toFixed(2)} (step ${currentStep}/${fadeSteps})`);
            }
            
            // Check if we've completed the fade
            if (currentStep >= fadeSteps || newVolume <= 0) {
                clearInterval(fadeInterval);
                audioToFade.pause();
                
                // Reset volume for future use (not really needed since we're discarding the element)
                audioToFade.volume = originalVolume;
                
                console.log('Demo Mode: Fade out complete, audio stopped');
            }
        }, fadeStepTime);
    }
    
    /**
     * Toggle pause/play state of demo audio
     * @returns {boolean} true if audio is now playing, false if paused
     */
    function togglePauseAudio() {
        if (!demoAudio) {
            console.log('Demo Mode: No audio element exists to toggle');
            return false;
        }
        
        if (demoAudio.paused) {
            // Resume playback
            console.log('Demo Mode: Attempting to resume paused audio');
            
            try {
                // Make sure user interaction has been recorded for autoplay policies
                if (typeof document !== 'undefined' && document.documentElement && 
                    typeof document.documentElement.hasAttribute === 'function' &&
                    !document.documentElement.hasAttribute('data-user-interacted')) {
                    document.documentElement.setAttribute('data-user-interacted', 'true');
                    console.log('Demo Mode: Setting user interaction flag for autoplay');
                }
                
                const playPromise = demoAudio.play();
                
                // Handle the promise properly
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('Demo Mode: Audio resumed successfully on toggle');
                    }).catch(err => {
                        console.error('Demo Mode: Error resuming audio on toggle:', err);
                        console.error('Demo Mode: Audio error code:', demoAudio.error ? demoAudio.error.code : 'unknown');
                        
                        // If we get a "NotAllowedError", it's likely due to autoplay policy
                        if (err.name === 'NotAllowedError') {
                            console.error('Demo Mode: Autoplay policy prevented playback - user interaction required');
                        }
                    });
                } else {
                    console.log('Demo Mode: Audio play did not return a promise, assuming success');
                }
                
                console.log('Demo Mode: Toggle - audio now playing (requested)');
                return true;
            } catch (err) {
                console.error('Demo Mode: Error initiating audio resume on toggle:', err);
                return false;
            }
        } else {
            // Pause playback
            demoAudio.pause();
            console.log('Demo Mode: Toggle - audio now paused');
            return false;
        }
    }
    
    /**
     * Resume audio playback if it's paused
     * @returns {boolean} true if successfully resumed, false otherwise
     */
    function resumeAudio() {
        if (!demoAudio) {
            console.log('Demo Mode: No audio element exists to resume');
            return false;
        }
        
        if (!demoAudio.paused) {
            console.log('Demo Mode: Audio is already playing, no need to resume');
            return false;
        }
        
        console.log('Demo Mode: Attempting to resume audio playback');
        
        try {
            // Make sure user interaction has been recorded for autoplay policies
            if (typeof document !== 'undefined' && document.documentElement && 
                typeof document.documentElement.hasAttribute === 'function' &&
                !document.documentElement.hasAttribute('data-user-interacted')) {
                document.documentElement.setAttribute('data-user-interacted', 'true');
                console.log('Demo Mode: Setting user interaction flag for autoplay');
            }
            
            const playPromise = demoAudio.play();
            
            // Handle the promise properly
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Demo Mode: Audio resumed successfully');
                    return true;
                }).catch(err => {
                    console.error('Demo Mode: Error resuming audio:', err);
                    console.error('Demo Mode: Audio error code:', demoAudio.error ? demoAudio.error.code : 'unknown');
                    
                    // If we get a "NotAllowedError", it's likely due to autoplay policy
                    if (err.name === 'NotAllowedError') {
                        console.error('Demo Mode: Autoplay policy prevented playback - user interaction required');
                    }
                    
                    return false;
                });
                
                // For immediate return value consistency, we'll return true here
                // The actual success/failure will be logged asynchronously
                console.log('Demo Mode: Resume audio requested (pending)');
                return true;
            } else {
                console.log('Demo Mode: Audio play did not return a promise, assuming success');
                return true;
            }
        } catch (err) {
            console.error('Demo Mode: Error initiating audio resume:', err);
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
                console.log('Demo Mode: Preloading DemoSlides.mp3');
                
                slideAudio = new Audio();
                
                // Set preload attribute to ensure it loads immediately
                slideAudio.preload = 'auto';
                
                // Set source - use direct path for reliability
                // Fix the file name (DemoSlides.mp3 with an 's', not DemoSlide.mp3)
                slideAudio.src = './music/DemoSlides.mp3';
                
                // Add load event handler
                slideAudio.onloadeddata = function() {
                    console.log('Demo Mode: DemoSlides.mp3 loaded successfully');
                };
                
                // Add error handling with more detailed logging
                slideAudio.onerror = function(err) {
                    console.error('Demo Mode: Error loading DemoSlides.mp3:', err);
                    console.error('Demo Mode: Audio error code:', slideAudio.error ? slideAudio.error.code : 'unknown');
                    console.error('Demo Mode: Audio src was:', slideAudio.src);
                    
                    // Try a fallback with the full path
                    console.log('Demo Mode: Trying fallback path for DemoSlides.mp3');
                    slideAudio.src = '/music/DemoSlides.mp3';
                    
                    // If that still fails, try another fallback
                    slideAudio.onerror = function() {
                        console.error('Demo Mode: Second attempt to load DemoSlides.mp3 failed');
                        
                        // Try one more absolute fallback
                        slideAudio.src = window.location.origin + '/music/DemoSlides.mp3';
                        slideAudio.onerror = function() {
                            console.error('Demo Mode: All attempts to load DemoSlides.mp3 failed');
                            slideAudio = null;
                        };
                    };
                };
            }
        } catch (err) {
            console.error('Demo Mode: Error setting up slide audio:', err);
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
                console.error('Demo Mode: Cannot play slide audio - element not available');
                return;
            }
        }
        
        try {
            console.log('Demo Mode: Playing DemoSlides.mp3');
            
            // Make sure user interaction has been recorded for autoplay policies
            if (typeof document !== 'undefined' && document.documentElement && 
                typeof document.documentElement.hasAttribute === 'function' &&
                !document.documentElement.hasAttribute('data-user-interacted')) {
                document.documentElement.setAttribute('data-user-interacted', 'true');
                console.log('Demo Mode: Setting user interaction flag for autoplay');
            }
            
            // Reset audio to beginning if it was played before
            slideAudio.currentTime = 0;
            
            const playPromise = slideAudio.play();
            
            // Handle the promise properly
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Demo Mode: DemoSlides.mp3 playing successfully');
                }).catch(err => {
                    console.error('Demo Mode: Error playing DemoSlides.mp3:', err);
                    console.error('Demo Mode: Audio src on error was:', slideAudio.src);
                    
                    // Try a final fallback to a more directly accessible path
                    console.log('Demo Mode: Trying alternative method to play slide audio after error');
                    
                    // Create new audio as a last resort
                    const lastResortAudio = new Audio('./music/DemoSlides.mp3');
                    lastResortAudio.play().catch(e => {
                        console.error('Demo Mode: Last resort audio play failed:', e);
                    });
                });
            } else {
                console.log('Demo Mode: Audio play did not return a promise');
            }
        } catch (err) {
            console.error('Demo Mode: Error playing slide audio:', err);
        }
    }
    
    /**
     * Update all jellyOrb swarm speeds to a new value
     * @param {number} speed - The new speed to set for all jellyOrb swarms
     */
    function updateAllJellyOrbsSpeed(speed) {
        console.log(`Demo Mode: Updating all jellyOrb swarms to speed ${speed}`);
        
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
                    console.log(`Demo Mode: Updated swarm ${swarmId} speed to ${speed}`);
                }
            } catch (error) {
                console.error(`Demo Mode: Error updating swarm ${swarmId} speed:`, error);
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
        // Add a public method to force preload the intro audio
        preloadIntroAudio: preloadIntroAudio
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = DemoMode;
} 