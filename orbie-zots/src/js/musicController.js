// musicController.js - Music player control for Orbie Zots
const MusicController = (function() {
    // Audio element and state
    let audioElement = null;
    let currentSongIndex = -1;
    let shuffledSongKeys = [];
    let isPlaying = false;
    let isEnabled = false; // Flag to track if button is enabled
    let isFirstTouch = true; // Flag to track first touch after enabling
    let isDemoIntroAudioPlaying = false; // Track if DemoMode intro is playing
    let tooltipShown = false; // Track if tooltip has been shown
    let hasSwitchedToPlaylist = false; // Track if we've switched to our own playlist
    
    // Music button element
    let musicButton = null;
    let tooltipElement = null; // Store tooltip element reference
    
    // Double-tap detection
    let lastTapTime = 0;
    const doubleTapDelay = 300; // ms between taps to count as double tap
    let tapTimer = null;
    
    /**
     * Initialize the music controller and UI elements
     */
    function init() {
        console.log('Music Controller: Initializing...');
        
        // Find music button or create it if missing
        musicButton = document.getElementById('musicButton');
        
        if (!musicButton) {
            // Create the button if it doesn't exist
            musicButton = createMusicButton();
            console.log('Music Controller: Created missing music button');
        }
        
        if (musicButton) {
            // Set up event listeners
            setupEventListeners();
            
            // Show the button immediately but in disabled state
            musicButton.style.opacity = '1';
            musicButton.style.pointerEvents = 'auto';
            musicButton.classList.add('visible');
            
            // Start in disabled state
            setDisabledState();
            
            // Set up integration with DemoMode
            setupDemoModeIntegration();
            
            // Start checking audio status
            startAudioStatusCheck();
            
            console.log('Music Controller: Initialized successfully');
        } else {
            console.error('Music Controller: Failed to initialize music button');
        }
    }
    
    /**
     * Start periodic check of audio status to keep button state in sync
     */
    function startAudioStatusCheck() {
        // Update button state immediately
        updateAudioPlayingState();
        
        // Set up interval to check audio status every 500ms
        setInterval(updateAudioPlayingState, 500);
    }
    
    /**
     * Update the isPlaying state based on all audio sources
     */
    function updateAudioPlayingState() {
        // Only run checks if button is enabled
        if (!isEnabled) return;
        
        const wasPlaying = isPlaying;
        
        // Check if our audio is playing
        const isMusicPlaying = audioElement && !audioElement.paused;
        
        // Check if DemoMode intro is playing
        isDemoIntroAudioPlaying = false;
        if (typeof DemoMode !== 'undefined' && DemoMode.isAudioPlaying && typeof DemoMode.isAudioPlaying === 'function') {
            isDemoIntroAudioPlaying = DemoMode.isAudioPlaying();
        }
        
        // Update the isPlaying state based on any audio playing
        isPlaying = isMusicPlaying || isDemoIntroAudioPlaying;
        
        // If state changed, update button appearance
        if (wasPlaying !== isPlaying) {
            updateButtonState();
        }
    }
    
    /**
     * Set up integration with DemoMode to enable button after second touch
     */
    function setupDemoModeIntegration() {
        // Check if DemoMode exists and set up an interval to check for secondTouchDetected
        if (typeof DemoMode !== 'undefined') {
            const checkInterval = setInterval(function() {
                if (DemoMode.isActive && DemoMode.isSecondTouchDetected && DemoMode.isSecondTouchDetected()) {
                    console.log('Music Controller: Second touch detected, enabling music button');
                    enableButton();
                    clearInterval(checkInterval);
                }
            }, 500);
        } else {
            console.log('Music Controller: DemoMode not available, enabling button directly');
            enableButton();
        }
    }
    
    /**
     * Enable the music button
     */
    function enableButton() {
        if (!isEnabled) {
            isEnabled = true;
            isFirstTouch = true; // Reset first touch flag when enabled
            
            // Check if DemoMode is playing audio and update state
            updateAudioPlayingState();
            
            // Update button appearance
            updateButtonState();
            
            console.log('Music Controller: Button enabled, audio playing: ' + isPlaying);
        }
    }
    
    /**
     * Set the button to disabled state (gray)
     */
    function setDisabledState() {
        if (musicButton) {
            musicButton.style.backgroundColor = 'rgba(100, 100, 100, 0.5)'; // Lighter gray when disabled
            musicButton.style.cursor = 'not-allowed';
            
            // Make the SVG icon 50% opaque
            const svgPath = musicButton.querySelector('svg path');
            if (svgPath) {
                svgPath.setAttribute('fill', 'rgba(255, 255, 255, 0.5)'); // 50% opaque white
            }
        }
    }
    
    /**
     * Create the music button element and add it to the DOM
     */
    function createMusicButton() {
        const button = document.createElement('button');
        button.id = 'musicButton';
        
        // Create SVG icon
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
            backgroundColor: 'rgba(100, 100, 100, 0.5)', // Start with disabled color
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
            // Make the button visible by default
            opacity: '1',
            pointerEvents: 'auto',
            padding: '0'
        });
        
        // Add to DOM
        document.body.appendChild(button);
        return button;
    }
    
    /**
     * Setup event listeners for the music button
     */
    function setupEventListeners() {
        // Remove existing listeners if any
        musicButton.removeEventListener('click', handleClick);
        
        // Add the click event
        musicButton.addEventListener('click', handleClick);
        
        // Prevent default on touchstart to avoid issues on mobile
        // But don't prevent click events
        musicButton.addEventListener('touchstart', function(e) {
            // Don't prevent default here to allow tap events to trigger
            // Instead, add the visual feedback directly if button is enabled
            if (isEnabled) {
                applyTapVisualEffect();
            }
        });
    }
    
    /**
     * Create and show the tooltip
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
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                textAlign: 'left',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                animation: 'tooltipPulse 2s infinite'
            });
            
            // Add keyframes for the pulse animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes tooltipPulse {
                    0% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
                    50% { box-shadow: 0 4px 25px rgba(76, 175, 80, 0.3); }
                    100% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(tooltipElement);
        }
        
        // Position the tooltip
        const buttonRect = musicButton.getBoundingClientRect();
        const tooltipWidth = tooltipElement.offsetWidth;
        const tooltipHeight = tooltipElement.offsetHeight;
        
        // Calculate position above the button
        let left = buttonRect.left + (buttonRect.width - tooltipWidth) / 2; // Center horizontally
        let top = buttonRect.top - tooltipHeight - 20; // 20px gap above button
        
        // Ensure tooltip stays within viewport
        if (left < 20) left = 20; // Minimum 20px from left edge
        if (left + tooltipWidth > window.innerWidth - 20) {
            left = window.innerWidth - tooltipWidth - 20; // Minimum 20px from right edge
        }
        if (top < 20) {
            // If there's not enough space above, position below the button
            top = buttonRect.bottom + 20;
        }
        
        tooltipElement.style.left = `${left}px`;
        tooltipElement.style.top = `${top}px`;
        
        // Show tooltip with animation
        requestAnimationFrame(() => {
            tooltipElement.style.opacity = '1';
            tooltipElement.style.transform = 'translateY(0)';
        });
        
        tooltipShown = true;
        
        // Hide after 5 seconds with animation
        setTimeout(() => {
            tooltipElement.style.opacity = '0';
            tooltipElement.style.transform = 'translateY(10px)';
        }, 5000);
    }
    
    /**
     * Handle click/tap event with visual feedback
     */
    function handleClick(event) {
        // Only handle clicks when button is enabled
        if (!isEnabled) {
            console.log('Music Controller: Button disabled, ignoring click');
            return;
        }
        
        // Show tooltip on first tap
        if (!tooltipShown) {
            showTooltip();
        }
        
        // Visual feedback - flash effect
        applyTapVisualEffect();
        
        // Check for double tap
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        
        if (tapLength < doubleTapDelay && tapLength > 0) {
            // Double tap detected - randomize songs
            console.log('Music Controller: Double tap detected - randomizing playlist');
            clearTimeout(tapTimer);
            
            // Only randomize if we're already playing music or have DemoMode audio paused
            if (isPlaying || (isDemoIntroAudioPlaying && DemoMode && DemoMode.isAudioPlaying && !DemoMode.isAudioPlaying())) {
                randomizeSongs();
                playNextSong();
            }
            
            // Reset the tap timer
            lastTapTime = 0;
            return;
        }
        
        // Set a timer for single tap handling
        lastTapTime = currentTime;
        
        // Clear any existing timer
        if (tapTimer) {
            clearTimeout(tapTimer);
        }
        
        // Set timer for single tap action
        tapTimer = setTimeout(() => {
            // Handle as single tap
            handleSingleTap();
        }, doubleTapDelay);
    }
    
    /**
     * Handle a regular single tap after confirming it's not part of a double-tap
     */
    function handleSingleTap() {
        console.log('Music Controller: Single tap processed');
        
        // Special handling for first touch after being enabled
        if (isFirstTouch) {
            console.log('Music Controller: First touch after enabling - stopping any playing audio');
            handleFirstTouch();
            return;
        }
        
        // Update audio playing state to ensure we have the latest status
        updateAudioPlayingState();
        
        // Normal toggle play state for subsequent touches
        if (isPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    }
    
    /**
     * Handle the first touch after the button is enabled
     */
    function handleFirstTouch() {
        isFirstTouch = false; // No longer first touch
        
        // Update audio status before taking action
        updateAudioPlayingState();
        
        // If any audio is playing, stop it
        if (isPlaying) {
            stopAnyPlayingAudio();
            isPlaying = false;
        }
        
        // Update button appearance to paused state
        updateButtonState();
        
        console.log('Music Controller: First touch handled - all audio stopped, ready for normal playback');
    }
    
    /**
     * Stop any playing audio, including the intro track from DemoMode
     */
    function stopAnyPlayingAudio() {
        let wasAudioStopped = false;
        
        // First check our own audio
        if (audioElement && !audioElement.paused) {
            audioElement.pause();
            wasAudioStopped = true;
            console.log('Music Controller: Stopped our audio element');
        }
        
        // Stop DemoMode's audio if available
        if (typeof DemoMode !== 'undefined' && DemoMode.stopAudio && typeof DemoMode.stopAudio === 'function') {
            // During first touch, stop the DemoMode audio completely
            if (isFirstTouch) {
                if (DemoMode.isAudioPlaying && DemoMode.isAudioPlaying()) {
                    DemoMode.stopAudio();
                    wasAudioStopped = true;
                    isDemoIntroAudioPlaying = false;
                    console.log('Music Controller: Stopped DemoMode audio');
                }
            } 
            // For subsequent touches, just pause it
            else if (DemoMode.togglePauseAudio && typeof DemoMode.togglePauseAudio === 'function') {
                if (DemoMode.isAudioPlaying && DemoMode.isAudioPlaying()) {
                    DemoMode.togglePauseAudio();
                    wasAudioStopped = true;
                    console.log('Music Controller: Paused DemoMode audio');
                }
            }
        }
        
        // Find and pause all audio elements as a fallback
        const allAudioElements = document.querySelectorAll('audio');
        allAudioElements.forEach(audio => {
            try {
                if (!audio.paused) {
                    audio.pause();
                    wasAudioStopped = true;
                    console.log('Music Controller: Paused an active audio element');
                }
            } catch (err) {
                console.error('Music Controller: Error pausing audio element:', err);
            }
        });
        
        // Update button state after stopping audio
        if (wasAudioStopped) {
            isPlaying = false;
            updateButtonState();
        }
        
        return wasAudioStopped;
    }
    
    /**
     * Apply visual feedback effects when button is tapped
     */
    function applyTapVisualEffect() {
        console.log('Music Controller: Applying visual effect');
        
        // Store original background color
        const originalColor = musicButton.style.backgroundColor;
        
        // Flash effect - briefly turn white
        musicButton.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        
        // Scale effect - grow slightly
        musicButton.style.transform = 'scale(1.15)';
        
        // Return to original state after short delay
        setTimeout(() => {
            // Return to original color or state-based color
            updateButtonState();
            
            // Return to original scale
            musicButton.style.transform = 'scale(1)';
        }, 150);
    }
    
    /**
     * Play music - pick up where it left off or start a new song
     */
    function playMusic() {
        console.log('Music Controller: Playing music');
        
        if (isPlaying || !isEnabled) return;
        
        // Only check DemoMode audio if we haven't switched to our own playlist
        if (!hasSwitchedToPlaylist && typeof DemoMode !== 'undefined' && DemoMode.isAudioPlaying && typeof DemoMode.isAudioPlaying === 'function') {
            if (DemoMode.resumeAudio && typeof DemoMode.resumeAudio === 'function') {
                // Try to resume DemoMode audio if it's paused
                const resumed = DemoMode.resumeAudio();
                if (resumed) {
                    isDemoIntroAudioPlaying = true;
                    isPlaying = true;
                    updateButtonState();
                    return;
                }
            }
        }
        
        // If not dealing with DemoMode audio or resume failed, play our own music
        
        // If no audio element or no current song, start fresh
        if (!audioElement || currentSongIndex === -1) {
            randomizeSongs();
            playNextSong();
        } else {
            // Resume current song
            audioElement.play().catch(err => {
                console.error('Music Controller: Error resuming audio:', err);
                
                // Try to play next song if current one fails
                playNextSong();
            });
        }
        
        isPlaying = true;
        updateButtonState();
    }
    
    /**
     * Pause the currently playing music
     */
    function pauseMusic() {
        console.log('Music Controller: Pausing music');
        
        // Check if the button is enabled
        if (!isEnabled) return;
        
        // Update audio status before taking action
        updateAudioPlayingState();
        
        // Check if DemoMode intro is playing and use togglePause
        if (isDemoIntroAudioPlaying && typeof DemoMode !== 'undefined' && DemoMode.togglePauseAudio && typeof DemoMode.togglePauseAudio === 'function') {
            DemoMode.togglePauseAudio();
            isPlaying = false;
            updateButtonState();
            console.log('Music Controller: Toggled DemoMode audio pause state');
        } else {
            // Otherwise stop any of our own audio that's playing
            if (audioElement && !audioElement.paused) {
                audioElement.pause();
                isPlaying = false;
                updateButtonState();
                console.log('Music Controller: Paused our audio element');
            }
        }
    }
    
    /**
     * Update button appearance based on current state
     */
    function updateButtonState() {
        if (!musicButton) return;
        
        // Get the SVG path element
        const svgPath = musicButton.querySelector('svg path');
        
        if (!isEnabled) {
            // Disabled state
            setDisabledState();
        } else {
            // Enabled state - update cursor
            musicButton.style.cursor = 'pointer';
            
            // Make SVG fully opaque when enabled
            if (svgPath) {
                svgPath.setAttribute('fill', 'white'); // Fully opaque white
            }
            
            // Update background color based on play state
            if (isPlaying) {
                musicButton.style.backgroundColor = 'rgba(76, 175, 80, 0.9)'; // Green when active
            } else {
                musicButton.style.backgroundColor = 'rgba(40, 40, 40, 0.9)'; // Gray when inactive
            }
        }
    }
    
    /**
     * Randomize and prepare the song playlist
     */
    function randomizeSongs() {
        try {
            // Get all song keys including intro
            const allSongKeys = ['demoIntro', ...Config.getDemoSongKeys()];
            
            if (!allSongKeys || allSongKeys.length === 0) {
                console.error('Music Controller: No songs available');
                return;
            }
            
            // If we don't have a playlist yet, create one
            if (!shuffledSongKeys || shuffledSongKeys.length === 0) {
                // Create a shuffled playlist
                shuffledSongKeys = shuffleArray(allSongKeys);
                currentSongIndex = -1; // Will be incremented to 0 on first play
                console.log('Music Controller: Created new shuffled playlist:', shuffledSongKeys);
            } else {
                // If we've played all songs, reset to the beginning of the current playlist
                if (currentSongIndex >= shuffledSongKeys.length - 1) {
                    currentSongIndex = -1; // Will be incremented to 0 on next play
                    console.log('Music Controller: Reached end of playlist, resetting to beginning');
                }
            }
        } catch (err) {
            console.error('Music Controller: Error managing song playlist:', err);
        }
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
     * Play the next song in the shuffled playlist
     */
    function playNextSong() {
        // Don't play if not enabled
        if (!isEnabled) return;
        
        // First stop any DemoMode audio that might be playing
        if (isDemoIntroAudioPlaying) {
            stopAnyPlayingAudio();
        }
        
        // Mark that we've switched to our own playlist
        hasSwitchedToPlaylist = true;
        
        // Validate we have songs to play
        if (!shuffledSongKeys || shuffledSongKeys.length === 0) {
            console.error('Music Controller: No songs in playlist');
            return;
        }
        
        currentSongIndex = (currentSongIndex + 1) % shuffledSongKeys.length;
        const nextSongKey = shuffledSongKeys[currentSongIndex];
        
        // Create new audio element or reuse existing
        if (!audioElement) {
            audioElement = new Audio();
        } else {
            audioElement.pause();
        }
        
        try {
            // Set up new audio
            audioElement.src = Config.getAudioPath(nextSongKey);
            
            // Set up ended event for continuous playback
            audioElement.onended = playNextSong;
            
            // Add error handling
            audioElement.onerror = function(err) {
                console.error(`Music Controller: Error loading audio ${nextSongKey}:`, err);
                // Try to play next song on error
                setTimeout(playNextSong, 1000);
            };
            
            // Play the audio
            audioElement.play().catch(err => {
                console.error(`Music Controller: Error playing audio ${nextSongKey}:`, err);
                // Try to play next song on error
                setTimeout(playNextSong, 1000);
            });
            
            isPlaying = true;
            updateButtonState();
            
            console.log(`Music Controller: Playing song ${currentSongIndex + 1}/${shuffledSongKeys.length}: ${nextSongKey}`);
        } catch (err) {
            console.error('Music Controller: Error setting up audio:', err);
        }
    }
    
    // Self-initialize when script loads
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // Document already ready, initialize immediately
        setTimeout(init, 100);
    } else {
        // Wait for document to be ready
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(init, 100);
        });
    }
    
    // Public API
    return {
        init: init,
        playMusic: playMusic,
        pauseMusic: pauseMusic,
        playNextSong: playNextSong,
        randomizeSongs: randomizeSongs,
        isPlaying: function() { return isPlaying; },
        enableButton: enableButton, // Expose this to allow enabling from outside
        stopAnyPlayingAudio: stopAnyPlayingAudio // Expose to allow stopping audio from outside
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = MusicController;
} 