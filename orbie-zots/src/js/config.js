// config.js - Environment-specific configuration
const Config = (function() {
    // Environment detection
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';

    // Audio paths
    const audioPaths = {
        demoIntro: isLocal 
            ? 'D:\\.apps\\interactive-simulations\\orbie-zots\\src\\music\\DemoIntro.mp3'
            : './music/DemoIntro.mp3',
        demoPulse: isLocal
            ? 'D:\\.apps\\interactive-simulations\\orbie-zots\\src\\music\\DemoPulse.mp3'
            : './music/DemoPulse.mp3',
        demoOrchestra: isLocal
            ? 'D:\\.apps\\interactive-simulations\\orbie-zots\\src\\music\\DemoOrchestra.mp3'
            : './music/DemoOrchestra.mp3',
        demoDubstep: isLocal
            ? 'D:\\.apps\\interactive-simulations\\orbie-zots\\src\\music\\DemoDubstep.mp3'
            : './music/DemoDubstep.mp3',
        demoGlassandi: isLocal
            ? 'D:\\.apps\\interactive-simulations\\orbie-zots\\src\\music\\DemoGlassandi.mp3'
            : './music/DemoGlassandi.mp3'
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