// demoAudio.js - Demo mode audio integration with AudioManager
const DemoAudio = (function() {
    // Track state
    let initialized = false;
    let demoActive = false;
    let slidesAudioActive = false;
    
    /**
     * Initialize the demo audio system
     * @returns {Promise} Resolves when initialization is complete
     */
    function init() {
        return new Promise((resolve, reject) => {
            if (initialized) {
                resolve();
                return;
            }
            
            // Check if AudioManager is available
            if (typeof AudioManager === 'undefined') {
                console.error('Demo Audio: AudioManager is not available');
                reject(new Error('AudioManager not available'));
                return;
            }
            
            console.log('Demo Audio: Initializing');
            
            // Register for AudioManager callbacks
            AudioManager.registerCallbacks({
                onTrackEnd: function(trackId) {
                    if (trackId === 'demoIntro') {
                        console.log('Demo Audio: Demo intro ended, starting playlist');
                        
                        // Initialize playlist and play first song
                        AudioManager.initializePlaylist()
                            .then(() => AudioManager.playNextInPlaylist())
                            .catch(err => {
                                console.error('Demo Audio: Error starting playlist after intro:', err);
                            });
                    } else if (trackId === 'demoSlides') {
                        console.log('Demo Audio: Demo slides track ended, returning to playlist');
                        slidesAudioActive = false;
                        
                        // Return to playlist
                        AudioManager.playNextInPlaylist().catch(err => {
                            console.error('Demo Audio: Error returning to playlist after slides:', err);
                        });
                    }
                }
            });
            
            initialized = true;
            console.log('Demo Audio: Initialized successfully');
            resolve();
        });
    }
    
    /**
     * Play the demo intro audio
     * @returns {Promise} Resolves when playback starts
     */
    function playIntro() {
        return new Promise((resolve, reject) => {
            if (!initialized) {
                init().then(playIntro).then(resolve).catch(reject);
                return;
            }
            
            console.log('Demo Audio: Playing intro audio');
            demoActive = true;
            
            // Resume audio context (needed for some browsers)
            AudioManager.resumeAudioContext();
            
            // Play demo intro audio
            AudioManager.playDemoIntro().then(resolve).catch(err => {
                console.error('Demo Audio: Error playing intro:', err);
                reject(err);
                
                // Fallback to playlist on error
                AudioManager.initializePlaylist()
                    .then(() => AudioManager.playNextInPlaylist())
                    .catch(err => {
                        console.error('Demo Audio: Error starting playlist as fallback:', err);
                    });
            });
        });
    }
    
    /**
     * Play the demo slides audio (for swipe transitions)
     * @returns {Promise} Resolves when playback starts
     */
    function playSlides() {
        return new Promise((resolve, reject) => {
            if (!initialized) {
                init().then(playSlides).then(resolve).catch(reject);
                return;
            }
            
            console.log('Demo Audio: Playing slides audio');
            slidesAudioActive = true;
            
            // Resume audio context (needed for some browsers)
            AudioManager.resumeAudioContext();
            
            // Play demo slides audio
            AudioManager.playDemoSlides().then(resolve).catch(err => {
                console.error('Demo Audio: Error playing slides audio:', err);
                slidesAudioActive = false;
                reject(err);
            });
        });
    }
    
    /**
     * Stop any playing demo audio with fade
     * @param {number} fadeTime - Fade time in seconds (default: 0.5)
     * @returns {Promise} Resolves when audio is stopped
     */
    function stop(fadeTime = 0.5) {
        return new Promise((resolve) => {
            if (!initialized) {
                resolve();
                return;
            }
            
            demoActive = false;
            slidesAudioActive = false;
            
            console.log('Demo Audio: Stopping audio with fade');
            
            // Stop current audio with fade
            AudioManager.stopWithFade(fadeTime).then(resolve).catch(() => {
                // Always resolve even on error
                resolve();
            });
        });
    }
    
    /**
     * Toggle pause/play state
     * @returns {Promise} Resolves when operation is complete
     */
    function togglePause() {
        return new Promise((resolve) => {
            if (!initialized) {
                resolve(false);
                return;
            }
            
            console.log('Demo Audio: Toggling pause state');
            
            // Use AudioManager's toggle function
            AudioManager.togglePlayPause().then(() => {
                resolve(AudioManager.isAudioPlaying());
            }).catch(() => {
                // Always resolve even on error
                resolve(AudioManager.isAudioPlaying());
            });
        });
    }
    
    /**
     * Resume playback if paused
     * @returns {Promise<boolean>} Resolves with true if resumed, false otherwise
     */
    function resume() {
        return new Promise((resolve) => {
            if (!initialized || AudioManager.isAudioPlaying()) {
                resolve(AudioManager.isAudioPlaying());
                return;
            }
            
            console.log('Demo Audio: Resuming playback');
            
            // Toggle pause/play if not already playing
            AudioManager.togglePlayPause().then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
    }
    
    /**
     * Check if any demo audio is playing
     * @returns {boolean} True if audio is playing
     */
    function isPlaying() {
        if (!initialized) return false;
        return AudioManager.isAudioPlaying();
    }
    
    /**
     * Check if demo slides audio is currently active
     * @returns {boolean} True if slides audio is active
     */
    function isSlidesAudioActive() {
        return slidesAudioActive;
    }
    
    /**
     * Check if any demo-related audio is active
     * @returns {boolean} True if demo audio is active
     */
    function isDemoAudioActive() {
        return demoActive;
    }
    
    // Public API
    return {
        init,
        playIntro,
        playSlides,
        stop,
        togglePause,
        resume,
        isPlaying,
        isSlidesAudioActive,
        isDemoAudioActive
    };
})(); 