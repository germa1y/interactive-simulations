// config.js - Environment-specific configuration
const Config = (function() {
    // Environment detection
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';

    // Get base path - handles GitHub Pages and other hosting environments
    const getBasePath = function() {
        if (isLocal) {
            return './music/';  // Use relative path from the web root
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
        // Original demo songs
        demoIntro: `${basePath}DemoIntro.mp3`,
        demoPulse: `${basePath}DemoPulse.mp3`,
        demoOrchestra: `${basePath}DemoOrchestra.mp3`,
        demoDubstep: `${basePath}DemoDubstep.mp3`,
        demoGlassandi: `${basePath}DemoGlassandi.mp3`,
        demoSlides: `${basePath}DemoSlides.mp3`,
        demoIntroV1: `${basePath}DemoIntro.v1.mp3`,
        
        // Additional music files
        eightBit: `${basePath}8-Bit.mp3`,
        arabianstep: `${basePath}Arabianstep.mp3`,
        ballroomWaltzDubstep: `${basePath}Ballroom_Waltz_Dubstep.mp3`,
        creepyForestCreatures: `${basePath}Creepy_Forest_Creatures_-_Xylophone_Bells.mp3`,
        digestiveSystem: `${basePath}Digestive_System.mp3`,
        egyptianFlamenco: `${basePath}Egyptian_Flamenco.mp3`,
        electricMerengue: `${basePath}Electric_Merengue.mp3`,
        epicExpanse: `${basePath}Epic_Expanse.mp3`,
        expansiveOpenPlains: `${basePath}Expansive_Open_Plains_-_Varying_Instruments.mp3`,
        footStompingFingerSnapping: `${basePath}Foot_Stomping_Finger_Snapping.mp3`,
        indianSitarNativeAmerican: `${basePath}Indian_Sitar_Native_American.mp3`,
        intenseChase: `${basePath}Intense_Chase.mp3`,
        liquidEphemeral: `${basePath}Liquid_Ephemeral.mp3`,
        monophonicPiano: `${basePath}Monophonic_Piano.mp3`,
        oldWesternSaloon: `${basePath}old_western_saloon.mp3`,
        ominousSuspense: `${basePath}Ominous_Suspense.mp3`,
        rancherSpaghettiWestern: `${basePath}Rancher_Spaghetti_Western.mp3`,
        zeldaDungeon: `${basePath}Zelda_Dungeon.mp3`
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