// demoMode.js - Automatic zot swarm demo mode
const DemoMode = (function() {
    // Track if demo mode is active
    let isActive = false;
    
    // Store created swarms for cleanup
    let demoSwarms = [];
    
    // Cycling properties
    let cycleInterval = null;
    let cycleIndex = 0;
    let isCycling = false;
    let touchDetected = false;
    
    // Configuration for demo mode
    const DEMO_CONFIG = {
        swarmCount: 6,         // Number of swarms to create
        zotsPerSwarm: 50,      // Number of zots in each swarm
        presetName: 'jellyOrbs', // Preset behavior to use
        colorTheme: 'green',   // Color theme to use (forest-like)
        minSize: 1,            // Minimum zot size
        maxSize: 8,            // Maximum zot size
        circleRadius: 0.35,    // Circle radius as a fraction of screen dimension for positioning
        cycleInterval: 10000   // Cycle through presets every 10 seconds
    };
    
    // Preset configurations to cycle through
    const PRESET_CYCLES = [
        // Initial configuration - jellyOrbs, green (when demo is initialized)
        {
            name: "Jelly Orbs - Green",
            configs: Array(6).fill({
                presetName: 'jellyOrbs',
                colorTheme: 'green',
                zotCount: 50
            })
        },
        // Fizzy Pop, Neon
        {
            name: "Fizzy Pop - Neon",
            configs: Array(6).fill({
                presetName: 'fizzyOrb',
                colorTheme: 'neon',
                zotCount: 50
            })
        },
        // Cooking Oil, Gold
        {
            name: "Cooking Oil - Gold",
            configs: Array(6).fill({
                presetName: 'cookingOil',
                colorTheme: 'gold',
                zotCount: 50
            })
        },
        // Bird Flock (murmuration), Rainbow, zotCount=150
        {
            name: "Bird Flock - Rainbow",
            configs: Array(6).fill({
                presetName: 'murmuration',
                colorTheme: 'rainbow',
                zotCount: 150
            })
        },
        // Lava Lamp, Fire, zotCount=150
        {
            name: "Lava Lamp - Fire",
            configs: Array(6).fill({
                presetName: 'lavaLamp',
                colorTheme: 'fire',
                zotCount: 150
            })
        },
        // Atomic, Sparkle
        {
            name: "Atomic - Sparkle",
            configs: Array(6).fill({
                presetName: 'atomic',
                colorTheme: 'sparkle',
                zotCount: 50
            })
        },
        // 2 of each - Mix of all presets
        {
            name: "Mixed Swarms",
            configs: [
                { presetName: 'fizzyOrb', colorTheme: 'neon', zotCount: 50 },
                { presetName: 'fizzyOrb', colorTheme: 'neon', zotCount: 50 },
                { presetName: 'cookingOil', colorTheme: 'gold', zotCount: 50 },
                { presetName: 'cookingOil', colorTheme: 'gold', zotCount: 50 },
                { presetName: 'murmuration', colorTheme: 'rainbow', zotCount: 50 },
                { presetName: 'murmuration', colorTheme: 'rainbow', zotCount: 50 }
            ]
        }
    ];
    
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
        
        // Delay to ensure all systems are properly initialized
        setTimeout(() => {
            createDemoSwarms();
            setupMenuButtonListeners();
            setupTouchDetection();
            isActive = true;
        }, 500);
    }
    
    /**
     * Create the demo swarms in a circular arrangement
     */
    function createDemoSwarms() {
        // Get canvas dimensions
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            console.error('Demo Mode: Canvas not found');
            return;
        }
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * DEMO_CONFIG.circleRadius;
        
        // Create swarms in a circular pattern
        for (let i = 0; i < DEMO_CONFIG.swarmCount; i++) {
            // Calculate position on circle
            const angle = (i / DEMO_CONFIG.swarmCount) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Configure the swarm with parameters from jellyOrbs preset
            const preset = Presets.swarmPresets[DEMO_CONFIG.presetName] || {};
            
            // Configuration object for the swarm
            const config = {
                // Swarm preset behavior parameters
                zotCount: DEMO_CONFIG.zotsPerSwarm,
                speed: preset.speed || 3,
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
                name: `Demo Swarm ${i+1}`
            };
            
            // Create the swarm
            try {
                const swarmId = ParticleSystem.createZotSwarm(config);
                if (swarmId) {
                    demoSwarms.push(swarmId);
                    console.log(`Demo Mode: Created swarm ${swarmId} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
                }
            } catch (error) {
                console.error('Demo Mode: Error creating swarm:', error);
            }
        }
        
        console.log(`Demo Mode: Created ${demoSwarms.length} swarms`);
    }
    
    /**
     * Set up touch detection to start the cycle
     */
    function setupTouchDetection() {
        if (touchDetected) return;
        
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        
        // Create one-time event listeners for touch and click
        const startCyclingOnFirstTouch = function(e) {
            if (!touchDetected && isActive) {
                touchDetected = true;
                startCycling();
                
                // Remove event listeners once triggered
                canvas.removeEventListener('touchstart', startCyclingOnFirstTouch);
                canvas.removeEventListener('click', startCyclingOnFirstTouch);
                
                console.log('Demo Mode: First touch detected, started cycling');
            }
        };
        
        canvas.addEventListener('touchstart', startCyclingOnFirstTouch);
        canvas.addEventListener('click', startCyclingOnFirstTouch);
    }
    
    /**
     * Start cycling through presets
     */
    function startCycling() {
        if (isCycling) return;
        
        isCycling = true;
        cycleIndex = 0; // Start with the first preset (after the initial one)
        
        // Set up interval to cycle through presets
        cycleInterval = setInterval(() => {
            cycleToNextPreset();
        }, DEMO_CONFIG.cycleInterval);
    }
    
    /**
     * Cycle to the next preset configuration
     */
    function cycleToNextPreset() {
        if (!isActive || demoSwarms.length === 0) {
            stopCycling();
            return;
        }
        
        cycleIndex = (cycleIndex + 1) % PRESET_CYCLES.length;
        const presetCycle = PRESET_CYCLES[cycleIndex];
        
        console.log(`Demo Mode: Cycling to preset "${presetCycle.name}"`);
        
        // Apply new configurations to each swarm
        demoSwarms.forEach((swarmId, index) => {
            const swarmConfig = presetCycle.configs[index % presetCycle.configs.length];
            updateSwarmParameters(swarmId, swarmConfig);
        });
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
                speed: preset.speed || 3,
                separation: preset.separation || 0.1,
                alignment: preset.alignment || 0.1,
                cohesion: preset.cohesion || 5,
                perception: preset.perception || 100,
                colorTheme: config.colorTheme || DEMO_CONFIG.colorTheme
            };
            
            // Update the swarm
            if (ParticleSystem.updateZotSwarm) {
                ParticleSystem.updateZotSwarm(swarmId, updateConfig);
                console.log(`Demo Mode: Updated swarm ${swarmId} to ${config.presetName} - ${config.colorTheme}`);
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
     * End the demo mode by removing all swarms
     */
    function endDemoMode(event) {
        if (!isActive) return;
        
        console.log('Ending Zot Swarm Demo Mode');
        
        // Stop cycling
        stopCycling();
        
        // Remove event listeners
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.removeEventListener('click', endDemoMode, { capture: true });
            menuToggle.removeEventListener('touchstart', endDemoMode, { capture: true });
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
        
        isActive = false;
        touchDetected = false;
        
        // Allow the event to continue propagating after we've cleaned up
        // (so the menu button still works normally)
    }
    
    // Public API
    return {
        start: start,
        end: endDemoMode,
        isActive: function() { return isActive; }
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = DemoMode;
} 