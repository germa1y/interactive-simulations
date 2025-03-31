// audioManager.js - Centralized audio system using Web Audio API
const AudioManager = (function() {
    // Web Audio API context
    let audioContext = null;
    
    // Audio tracks
    const tracks = {
        demoIntro: null,
        demoSlides: null,
        playlist: []
    };
    
    // State tracking
    let currentTrack = null;
    let isPlaying = false;
    let isMuted = false;
    let masterGainNode = null;
    let currentPlaylistIndex = -1;
    let shuffledPlaylist = [];
    
    // Preloaded buffers
    const audioBuffers = {};
    
    // Configuration
    const config = {
        fadeInTime: 0.5,  // seconds
        fadeOutTime: 0.5, // seconds
        playlistPaths: [
            './music/Playlist1.mp3',
            './music/Playlist2.mp3',
            './music/Playlist3.mp3',
            './music/Playlist4.mp3'
        ],
        demoIntroPath: './music/DemoIntro.mp3',
        demoSlidesPath: './music/DemoSlides.mp3'
    };
    
    // Callbacks
    let onPlayCallback = null;
    let onPauseCallback = null;
    let onTrackEndCallback = null;
    
    /**
     * Initialize the audio system and preload essential sounds
     * @returns {Promise} Resolves when initialization is complete
     */
    function init() {
        return new Promise((resolve, reject) => {
            try {
                // Create audio context with fallbacks for different browsers
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioContext = new AudioContext();
                
                // Create master gain node for volume control
                masterGainNode = audioContext.createGain();
                masterGainNode.gain.value = 1.0;
                masterGainNode.connect(audioContext.destination);
                
                console.log('Audio Manager: Initialized Web Audio API context');
                
                // Preload essential audio files
                preloadAudio(config.demoIntroPath, 'demoIntro')
                    .then(() => preloadAudio(config.demoSlidesPath, 'demoSlides'))
                    .then(() => {
                        console.log('Audio Manager: Essential audio files preloaded');
                        resolve();
                    })
                    .catch(err => {
                        console.error('Audio Manager: Error preloading audio:', err);
                        // Resolve anyway to not block app initialization
                        resolve();
                    });
            } catch (err) {
                console.error('Audio Manager: Failed to initialize audio context:', err);
                reject(err);
            }
        });
    }
    
    /**
     * Preload an audio file into buffer
     * @param {string} url - Path to audio file
     * @param {string} id - Identifier for the audio buffer
     * @returns {Promise} Resolves when audio is loaded
     */
    function preloadAudio(url, id) {
        return new Promise((resolve, reject) => {
            // Skip if already loaded
            if (audioBuffers[id]) {
                resolve(audioBuffers[id]);
                return;
            }
            
            // Fetch the audio file
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.arrayBuffer();
                })
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    audioBuffers[id] = audioBuffer;
                    console.log(`Audio Manager: Successfully preloaded "${id}"`);
                    resolve(audioBuffer);
                })
                .catch(err => {
                    console.error(`Audio Manager: Error preloading "${id}":`, err);
                    reject(err);
                });
        });
    }
    
    /**
     * Start/resume audio context after user interaction
     * (Required by browsers to enable audio playback)
     */
    function resumeAudioContext() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('Audio Manager: AudioContext resumed successfully');
            }).catch(err => {
                console.error('Audio Manager: Error resuming AudioContext:', err);
            });
        }
    }
    
    /**
     * Play audio from buffer with proper resource management
     * @param {string} id - ID of the preloaded audio buffer
     * @param {boolean} loop - Whether to loop the audio
     * @returns {Promise} Resolves when playback starts
     */
    function playAudio(id, loop = false) {
        return new Promise((resolve, reject) => {
            resumeAudioContext();
            
            // Stop any currently playing audio with fade out
            if (currentTrack) {
                stopWithFade();
            }
            
            // Check if buffer exists
            if (!audioBuffers[id]) {
                console.error(`Audio Manager: Buffer "${id}" not found`);
                reject(new Error(`Buffer "${id}" not found`));
                return;
            }
            
            try {
                // Create audio source
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffers[id];
                source.loop = loop;
                
                // Create gain node for this source (for fading)
                const gainNode = audioContext.createGain();
                gainNode.gain.value = 0; // Start silent for fade-in
                
                // Connect nodes
                source.connect(gainNode);
                gainNode.connect(masterGainNode);
                
                // Fade in
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + config.fadeInTime);
                
                // Store current track details
                currentTrack = {
                    source,
                    gainNode,
                    id
                };
                
                // Set up ended callback
                source.onended = () => {
                    if (currentTrack && currentTrack.source === source) {
                        currentTrack = null;
                        isPlaying = false;
                        
                        // Call track end callback if defined
                        if (onTrackEndCallback) {
                            onTrackEndCallback(id);
                        }
                        
                        // Auto-advance playlist if this was a playlist track
                        if (id.startsWith('playlist_') && !loop) {
                            playNextInPlaylist();
                        }
                    }
                };
                
                // Start playback
                source.start(0);
                isPlaying = true;
                
                // Call play callback if defined
                if (onPlayCallback) {
                    onPlayCallback(id);
                }
                
                console.log(`Audio Manager: Started playback of "${id}"`);
                resolve();
            } catch (err) {
                console.error(`Audio Manager: Error playing "${id}":`, err);
                reject(err);
            }
        });
    }
    
    /**
     * Stop currently playing audio with fade out
     * @param {number} fadeTime - Fade out time in seconds (default: config.fadeOutTime)
     * @returns {Promise} Resolves when audio is stopped
     */
    function stopWithFade(fadeTime = config.fadeOutTime) {
        return new Promise((resolve) => {
            if (!currentTrack) {
                resolve();
                return;
            }
            
            try {
                const { source, gainNode } = currentTrack;
                
                // Start fade out
                const startTime = audioContext.currentTime;
                const endTime = startTime + fadeTime;
                
                gainNode.gain.setValueAtTime(gainNode.gain.value, startTime);
                gainNode.gain.linearRampToValueAtTime(0, endTime);
                
                // Schedule stop after fade completes
                setTimeout(() => {
                    try {
                        source.stop();
                    } catch (err) {
                        // Ignore errors from already stopped sources
                    }
                    
                    isPlaying = false;
                    
                    // Call pause callback if defined
                    if (onPauseCallback) {
                        onPauseCallback(currentTrack.id);
                    }
                    
                    currentTrack = null;
                    resolve();
                }, fadeTime * 1000);
            } catch (err) {
                console.error('Audio Manager: Error stopping audio with fade:', err);
                
                // Force stop as fallback
                if (currentTrack && currentTrack.source) {
                    try {
                        currentTrack.source.stop();
                    } catch (e) {
                        // Ignore errors
                    }
                }
                
                isPlaying = false;
                currentTrack = null;
                resolve();
            }
        });
    }
    
    /**
     * Pause currently playing audio with fade out
     * @returns {Promise} Resolves when audio is paused
     */
    function pause() {
        return stopWithFade();
    }
    
    /**
     * Toggle play/pause state
     * @returns {Promise} Resolves when operation is complete
     */
    function togglePlayPause() {
        if (isPlaying) {
            return pause();
        } else {
            // If nothing is playing, start playlist or resume last track
            if (currentPlaylistIndex >= 0) {
                return playPlaylistTrack(currentPlaylistIndex);
            } else {
                // Start playlist from beginning
                return playNextInPlaylist();
            }
        }
    }
    
    /**
     * Initialize playlist with tracks and shuffle them
     * @returns {Promise} Resolves when playlist is initialized
     */
    function initializePlaylist() {
        const promises = config.playlistPaths.map((path, index) => {
            return preloadAudio(path, `playlist_${index}`);
        });
        
        return Promise.all(promises)
            .then(() => {
                // Create array of indices and shuffle
                shuffledPlaylist = Array.from({ length: config.playlistPaths.length }, (_, i) => i);
                shuffleArray(shuffledPlaylist);
                
                currentPlaylistIndex = -1; // Reset index
                console.log('Audio Manager: Playlist initialized and shuffled');
            });
    }
    
    /**
     * Play the next track in the shuffled playlist
     * @returns {Promise} Resolves when next track starts playing
     */
    function playNextInPlaylist() {
        // Move to next track
        currentPlaylistIndex = (currentPlaylistIndex + 1) % shuffledPlaylist.length;
        const trackIndex = shuffledPlaylist[currentPlaylistIndex];
        
        return playPlaylistTrack(trackIndex);
    }
    
    /**
     * Play a specific track from the playlist
     * @param {number} index - Index of the track in the playlist
     * @returns {Promise} Resolves when track starts playing
     */
    function playPlaylistTrack(index) {
        return playAudio(`playlist_${index}`, false);
    }
    
    /**
     * Play demo intro audio
     * @returns {Promise} Resolves when demo intro starts playing
     */
    function playDemoIntro() {
        return playAudio('demoIntro', false);
    }
    
    /**
     * Play demo slides audio
     * @returns {Promise} Resolves when demo slides starts playing
     */
    function playDemoSlides() {
        return playAudio('demoSlides', false);
    }
    
    /**
     * Set volume level (0.0 to 1.0)
     * @param {number} level - Volume level between 0 and 1
     */
    function setVolume(level) {
        if (masterGainNode) {
            // Clamp value between 0 and 1
            const volume = Math.max(0, Math.min(1, level));
            masterGainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            console.log(`Audio Manager: Volume set to ${volume}`);
        }
    }
    
    /**
     * Mute/unmute audio
     * @param {boolean} mute - Whether to mute (true) or unmute (false)
     */
    function setMute(mute) {
        isMuted = mute;
        setVolume(mute ? 0 : 1);
    }
    
    /**
     * Toggle mute state
     * @returns {boolean} New mute state
     */
    function toggleMute() {
        setMute(!isMuted);
        return isMuted;
    }
    
    /**
     * Register callbacks for audio events
     * @param {Object} callbacks - Object with callback functions
     */
    function registerCallbacks(callbacks) {
        if (callbacks.onPlay && typeof callbacks.onPlay === 'function') {
            onPlayCallback = callbacks.onPlay;
        }
        
        if (callbacks.onPause && typeof callbacks.onPause === 'function') {
            onPauseCallback = callbacks.onPause;
        }
        
        if (callbacks.onTrackEnd && typeof callbacks.onTrackEnd === 'function') {
            onTrackEndCallback = callbacks.onTrackEnd;
        }
    }
    
    /**
     * Check if audio is currently playing
     * @returns {boolean} True if audio is playing
     */
    function isAudioPlaying() {
        return isPlaying;
    }
    
    /**
     * Get the ID of the currently playing track
     * @returns {string|null} ID of current track or null if none playing
     */
    function getCurrentTrackId() {
        return currentTrack ? currentTrack.id : null;
    }
    
    /**
     * Shuffle an array in-place (Fisher-Yates algorithm)
     * @param {Array} array - Array to shuffle
     * @returns {Array} The shuffled array
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    /**
     * Clean up and release audio resources
     */
    function dispose() {
        // Stop any playing audio
        if (currentTrack && currentTrack.source) {
            try {
                currentTrack.source.stop();
            } catch (err) {
                // Ignore errors from already stopped sources
            }
        }
        
        // Close audio context
        if (audioContext) {
            audioContext.close().then(() => {
                console.log('Audio Manager: Audio context closed');
            }).catch(err => {
                console.error('Audio Manager: Error closing audio context:', err);
            });
        }
        
        // Clear references
        currentTrack = null;
        isPlaying = false;
    }
    
    // Public API
    return {
        init,
        playDemoIntro,
        playDemoSlides,
        initializePlaylist,
        playNextInPlaylist,
        togglePlayPause,
        pause,
        stopWithFade,
        setVolume,
        setMute,
        toggleMute,
        registerCallbacks,
        isAudioPlaying,
        getCurrentTrackId,
        resumeAudioContext
    };
})(); 