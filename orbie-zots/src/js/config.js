// config.js - Environment-specific configuration
const Config = (function() {
    // Environment detection
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';

    // Audio paths
    const audioPaths = {
        demoIntro: isLocal 
            ? '/music/DemoIntro.mp3'
            : '/music/DemoIntro.mp3',
        demoPulse: isLocal
            ? '/music/DemoPulse.mp3'
            : '/music/DemoPulse.mp3',
        demoOrchestra: isLocal
            ? '/music/DemoOrchestra.mp3'
            : '/music/DemoOrchestra.mp3',
        demoDubstep: isLocal
            ? '/music/DemoDubstep.mp3'
            : '/music/DemoDubstep.mp3',
        demoGlassandi: isLocal
            ? '/music/DemoGlassandi.mp3'
            : '/music/DemoGlassandi.mp3'
    };

    // Public API
    return {
        getAudioPath: function(key) {
            return audioPaths[key];
        },
        isLocal: isLocal,
        // Get all demo song keys except intro
        getDemoSongKeys: function() {
            return Object.keys(audioPaths).filter(key => key !== 'demoIntro');
        }
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Config;
} 