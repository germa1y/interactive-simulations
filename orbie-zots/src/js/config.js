// config.js - Environment-specific configuration
const Config = (function() {
    // Environment detection
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';

    // Get base path - handles GitHub Pages and other hosting environments
    const getBasePath = function() {
        if (isLocal) {
            return 'D:\\.apps\\interactive-simulations\\orbie-zots\\src\\music\\';
        } else {
            // Check if we're on GitHub Pages or another hosting platform
            const path = window.location.pathname;
            // If we're at the root or a direct path, use relative path
            if (path === '/' || path.indexOf('.html') > -1) {
                return './music/';
            } else {
                // For deeper paths or subdirectories, ensure we go to the right place
                return './music/';
            }
        }
    };

    const basePath = getBasePath();

    // Audio paths
    const audioPaths = {
        demoIntro: `${basePath}DemoIntro.mp3`,
        demoPulse: `${basePath}DemoPulse.mp3`,
        demoOrchestra: `${basePath}DemoOrchestra.mp3`,
        demoDubstep: `${basePath}DemoDubstep.mp3`,
        demoGlassandi: `${basePath}DemoGlassandi.mp3`
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