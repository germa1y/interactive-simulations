// initAudio.js - Bootstrap the audio system
(function() {
    /**
     * Initialize audio components in proper order
     */
    function initializeAudio() {
        console.log('Initializing audio system...');
        
        // First check if elements are available
        if (typeof AudioManager === 'undefined') {
            console.error('Audio initialization failed: AudioManager not available');
            return Promise.reject(new Error('AudioManager not available'));
        }
        
        if (typeof MusicController === 'undefined') {
            console.error('Audio initialization failed: MusicController not available');
            return Promise.reject(new Error('MusicController not available'));
        }
        
        // Initialize Audio Manager first
        return AudioManager.init()
            .then(() => {
                console.log('AudioManager initialized successfully');
                
                // Initialize DemoAudio if available
                if (typeof DemoAudio !== 'undefined') {
                    return DemoAudio.init()
                        .then(() => console.log('DemoAudio initialized successfully'))
                        .catch(err => console.error('DemoAudio initialization error:', err));
                }
                
                return Promise.resolve();
            })
            .then(() => {
                // Initialize Music Controller
                return MusicController.init()
                    .then(() => console.log('MusicController initialized successfully'));
            })
            .then(() => {
                console.log('Audio system initialized successfully');
                
                // Set up integration with DemoMode if available
                setupDemoModeIntegration();
                
                return Promise.resolve();
            })
            .catch(err => {
                console.error('Audio system initialization error:', err);
                return Promise.reject(err);
            });
    }
    
    /**
     * Set up integration with DemoMode
     */
    function setupDemoModeIntegration() {
        if (typeof DemoMode === 'undefined') {
            console.log('DemoMode not available for audio integration');
            // MusicController could still be enabled
            setTimeout(() => MusicController.enableButton(), 3000);
            return;
        }
        
        // Check for demo activation
        const checkInterval = setInterval(function() {
            if (typeof DemoMode.isActive === 'function' && 
                DemoMode.isActive() && 
                typeof DemoMode.isSecondTouchDetected === 'function') {
                
                // If second touch is already detected, enable button now
                if (DemoMode.isSecondTouchDetected()) {
                    console.log('Second touch already detected, enabling music button');
                    MusicController.enableButton();
                    clearInterval(checkInterval);
                } else {
                    // Set up a one-time check for second touch
                    const secondTouchInterval = setInterval(function() {
                        if (DemoMode.isSecondTouchDetected()) {
                            console.log('Second touch detected, enabling music button');
                            MusicController.enableButton();
                            clearInterval(secondTouchInterval);
                        }
                    }, 500);
                    
                    // Don't check indefinitely
                    setTimeout(() => clearInterval(secondTouchInterval), 60000);
                    clearInterval(checkInterval);
                }
            }
        }, 1000);
        
        // Don't check indefinitely
        setTimeout(() => clearInterval(checkInterval), 60000);
    }
    
    /**
     * Initialize audio system when DOM is ready
     */
    function onDOMReady() {
        initializeAudio().catch(err => {
            console.error('Failed to initialize audio system:', err);
        });
    }
    
    // Set up initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMReady);
    } else {
        // DOM already loaded, initialize now
        onDOMReady();
    }
})(); 