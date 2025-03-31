// musicButton.js - Music button UI component
const MusicButton = (function() {
    // DOM elements
    let buttonElement = null;
    let tooltipElement = null;
    
    // State
    let isEnabled = false;
    let isFirstTouch = true;
    let tooltipShown = false;
    
    // Double-tap detection
    let lastTapTime = 0;
    const doubleTapDelay = 300; // ms between taps to count as double tap
    let tapTimer = null;
    
    /**
     * Initialize the music button
     * @returns {Promise} Resolves when button is initialized
     */
    function init() {
        return new Promise((resolve) => {
            console.log('Music Button: Initializing...');
            
            // Find or create button element
            buttonElement = document.getElementById('musicButton');
            
            if (!buttonElement) {
                buttonElement = createButtonElement();
                console.log('Music Button: Created music button element');
            }
            
            // Set initial state (disabled)
            setDisabledState();
            
            // Set up event listeners
            setupEventListeners();
            
            // Make button visible but disabled
            showButton();
            
            // Set up callbacks for AudioManager
            setupAudioManagerCallbacks();
            
            console.log('Music Button: Initialized successfully');
            resolve();
        });
    }
    
    /**
     * Create the music button DOM element
     * @returns {HTMLElement} The created button element
     */
    function createButtonElement() {
        const button = document.createElement('button');
        button.id = 'musicButton';
        
        // Create SVG icon for music note
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M12 3l0.01 10.55c-0.59-0.34-1.27-0.55-2-0.55c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3H12z');
        path.setAttribute('fill', 'rgba(255, 255, 255, 0.5)'); // Start with 50% opaque white
        
        svg.appendChild(path);
        button.appendChild(svg);
        
        // Apply styles
        Object.assign(button.style, {
            position: 'fixed',
            zIndex: '2000',
            bottom: '2.6rem',
            left: '0.6rem',
            backgroundColor: 'rgba(100, 100, 100, 0.75)', // Start with disabled color
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '3rem',
            height: '3rem',
            cursor: 'not-allowed', // Show not-allowed cursor when disabled
            transition: 'all 0.2s ease',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            outline: 'none',
            opacity: '0', // Start hidden, will be shown after initialization
            pointerEvents: 'none',
            padding: '0'
        });
        
        // Add to DOM
        document.body.appendChild(button);
        return button;
    }
    
    /**
     * Set up event listeners for the button
     */
    function setupEventListeners() {
        // Remove any existing listeners
        buttonElement.removeEventListener('click', handleClick);
        
        // Add click event
        buttonElement.addEventListener('click', handleClick);
        
        // Add touch event
        buttonElement.addEventListener('touchstart', function(e) {
            // Only provide visual feedback if button is enabled
            if (isEnabled) {
                applyTapVisualEffect();
            }
        });
    }
    
    /**
     * Set up callbacks for AudioManager
     */
    function setupAudioManagerCallbacks() {
        if (typeof AudioManager !== 'undefined') {
            AudioManager.registerCallbacks({
                onPlay: function(trackId) {
                    updateButtonState(true);
                },
                onPause: function(trackId) {
                    updateButtonState(false);
                },
                onTrackEnd: function(trackId) {
                    // Track ended naturally, update UI if needed
                    updateButtonState(false);
                }
            });
        }
    }
    
    /**
     * Show the button
     */
    function showButton() {
        buttonElement.style.opacity = '1';
        buttonElement.style.pointerEvents = 'auto';
    }
    
    /**
     * Handle click/tap on the button
     * @param {Event} event - The click/touch event
     */
    function handleClick(event) {
        // Ignore clicks when disabled
        if (!isEnabled) return;
        
        // Prevent any default behaviors
        event.preventDefault();
        
        // Get current time for double-tap detection
        const currentTime = new Date().getTime();
        const tapTimeDiff = currentTime - lastTapTime;
        
        // If this is the first touch after enabling
        if (isFirstTouch) {
            handleFirstTouch();
            return;
        }
        
        // Check for double-tap
        if (tapTimeDiff < doubleTapDelay) {
            // Clear the single tap timer
            if (tapTimer) {
                clearTimeout(tapTimer);
                tapTimer = null;
            }
            
            // Handle double-tap (skip to next song)
            handleDoubleTap();
            
            // Reset last tap time to prevent triple-tap detection
            lastTapTime = 0;
        } else {
            // Set up timer for single tap
            lastTapTime = currentTime;
            
            if (tapTimer) {
                clearTimeout(tapTimer);
            }
            
            tapTimer = setTimeout(() => {
                // Handle single tap (play/pause toggle)
                handleSingleTap();
                tapTimer = null;
            }, doubleTapDelay);
        }
    }
    
    /**
     * Handle first touch after button is enabled
     */
    function handleFirstTouch() {
        console.log('Music Button: First touch detected');
        
        // Show tooltip on first touch
        showTooltip();
        
        isFirstTouch = false; // No longer first touch
        
        // Also toggle play/pause
        handleSingleTap();
    }
    
    /**
     * Handle single tap (toggle play/pause)
     */
    function handleSingleTap() {
        console.log('Music Button: Single tap - toggling play/pause');
        
        // Resume audio context (required for web audio on some browsers)
        if (typeof AudioManager !== 'undefined') {
            AudioManager.resumeAudioContext();
            
            // Toggle play/pause using the Audio Manager
            AudioManager.togglePlayPause().catch(err => {
                console.error('Music Button: Error toggling play/pause:', err);
            });
        }
    }
    
    /**
     * Handle double tap (skip to next song)
     */
    function handleDoubleTap() {
        console.log('Music Button: Double tap - skipping to next track');
        
        // Skip to next song in playlist using the Audio Manager
        if (typeof AudioManager !== 'undefined') {
            AudioManager.resumeAudioContext();
            
            AudioManager.playNextInPlaylist().catch(err => {
                console.error('Music Button: Error skipping to next track:', err);
            });
        }
    }
    
    /**
     * Apply visual feedback when button is tapped
     */
    function applyTapVisualEffect() {
        // Store original background color
        const originalColor = buttonElement.style.backgroundColor;
        
        // Flash effect - briefly turn white
        buttonElement.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        
        // Scale effect - grow slightly
        buttonElement.style.transform = 'scale(1.15)';
        
        // Return to original state after short delay
        setTimeout(() => {
            // Return button to its proper state
            updateButtonState();
            
            // Return to original scale
            buttonElement.style.transform = 'scale(1)';
        }, 150);
    }
    
    /**
     * Set button to disabled state
     */
    function setDisabledState() {
        buttonElement.style.backgroundColor = 'rgba(100, 100, 100, 0.75)';
        buttonElement.style.cursor = 'not-allowed';
        
        // Make the SVG icon 50% opaque
        const svgPath = buttonElement.querySelector('svg path');
        if (svgPath) {
            svgPath.setAttribute('fill', 'rgba(255, 255, 255, 0.5)');
        }
    }
    
    /**
     * Set button to play state (blue)
     */
    function setPlayState() {
        buttonElement.style.backgroundColor = 'rgba(0, 119, 255, 0.75)'; // Blue when playing
        buttonElement.style.cursor = 'pointer';
        
        // Make the SVG icon fully opaque
        const svgPath = buttonElement.querySelector('svg path');
        if (svgPath) {
            svgPath.setAttribute('fill', 'white');
        }
    }
    
    /**
     * Set button to pause state (green)
     */
    function setPauseState() {
        buttonElement.style.backgroundColor = 'rgba(0, 180, 100, 0.75)'; // Green when paused
        buttonElement.style.cursor = 'pointer';
        
        // Make the SVG icon fully opaque
        const svgPath = buttonElement.querySelector('svg path');
        if (svgPath) {
            svgPath.setAttribute('fill', 'white');
        }
    }
    
    /**
     * Update button state based on audio playing status
     * @param {boolean} [isAudioPlaying] - Optional explicit playing state
     */
    function updateButtonState(isAudioPlaying) {
        // If not explicitly provided, check with Audio Manager
        if (isAudioPlaying === undefined && typeof AudioManager !== 'undefined') {
            isAudioPlaying = AudioManager.isAudioPlaying();
        }
        
        if (!isEnabled) {
            setDisabledState();
        } else if (isAudioPlaying) {
            setPlayState();
        } else {
            setPauseState();
        }
    }
    
    /**
     * Create and show tooltip
     */
    function showTooltip() {
        if (tooltipShown) return;
        
        // Create tooltip element if it doesn't exist
        if (!tooltipElement) {
            tooltipElement = document.createElement('div');
            tooltipElement.id = 'musicButtonTooltip';
            
            // Set content
            tooltipElement.innerHTML = 'Tap ⏸️.<br>Double-Tap ⏩.';
            
            // Apply styles
            Object.assign(tooltipElement.style, {
                position: 'fixed',
                zIndex: '2001', // Above the music button
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                color: 'white',
                padding: '0.8rem 1.2rem',
                borderRadius: '12px',
                fontSize: '1rem',
                lineHeight: '1.4',
                whiteSpace: 'nowrap',
                opacity: '0',
                transform: 'translateY(10px)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                pointerEvents: 'none', // Ignore pointer events
                left: '3.8rem', // Position to the right of the music button
                bottom: '2.6rem', // Same bottom as music button
                maxWidth: '70vw', // Limit width on small screens
                textAlign: 'center'
            });
            
            // Add to DOM
            document.body.appendChild(tooltipElement);
        }
        
        // Show with animation
        setTimeout(() => {
            tooltipElement.style.opacity = '1';
            tooltipElement.style.transform = 'translateY(0)';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                hideTooltip();
            }, 5000);
            
            tooltipShown = true;
        }, 10);
    }
    
    /**
     * Hide tooltip
     */
    function hideTooltip() {
        if (tooltipElement) {
            tooltipElement.style.opacity = '0';
            tooltipElement.style.transform = 'translateY(10px)';
        }
    }
    
    /**
     * Enable the button
     */
    function enable() {
        if (!isEnabled) {
            isEnabled = true;
            isFirstTouch = true;
            updateButtonState();
            console.log('Music Button: Enabled');
        }
    }
    
    /**
     * Disable the button
     */
    function disable() {
        if (isEnabled) {
            isEnabled = false;
            setDisabledState();
            console.log('Music Button: Disabled');
        }
    }
    
    // Public API
    return {
        init,
        enable,
        disable,
        updateButtonState
    };
})(); 