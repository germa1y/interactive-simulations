// menu.js - Menu UI handlers and settings management
const MenuSystem = (function() {
    // Private variables
    let controlsPanel;
    let menuToggle;
    let isMenuInitialized = false;
    
    // Callbacks for different settings
    let callbacks = {
        updateOrbieSettings: null,
        updateSwarmSettings: null,
        updateSettings: null,
        resetOrbie: null,
        resetAll: null,
        changeColorTheme: null,
        updateWallSettings: null,
        loadWallSVG: null  // Add new callback for loading SVG files
    };
    
    // Initialize menu with necessary DOM elements and callbacks
    function init(elements, callbackFunctions) {
        // Skip if already initialized
        if (isMenuInitialized) return;
        
        // Store elements
        controlsPanel = elements.controlsPanel || document.getElementById('controls');
        menuToggle = elements.menuToggle || document.getElementById('menuToggle');
        
        // Store callbacks
        if (callbackFunctions) {
            callbacks = {...callbacks, ...callbackFunctions};
        }
        
        // Setup menu toggle
        setupMenuToggle();
        
        // Setup parameter groups
        setupParameterGroups();
        
        // Setup all input controls
        setupInputControls();
        
        // Setup color theme selector if available
        setupColorThemes();
        
        // Setup dual range sliders for min/max values
        setupRangeSliders();
        
        isMenuInitialized = true;
    }
    
    // Setup menu toggle button
    function setupMenuToggle() {
        if (menuToggle && controlsPanel) {
            // Handle click for desktop
            menuToggle.addEventListener('click', function(e) {
                e.preventDefault();
                controlsPanel.classList.toggle('collapsed');
            });
            
            // Handle touch for mobile - fixed to use touchstart instead of touchend
            menuToggle.addEventListener('touchstart', function(e) {
                e.preventDefault();
                controlsPanel.classList.toggle('collapsed');
                e.stopPropagation();
            }, { passive: false });
            
            // Close menu when clicking/touching outside
            document.addEventListener('touchend', function(e) {
                if (!controlsPanel.classList.contains('collapsed') && 
                    !controlsPanel.contains(e.target) && 
                    e.target !== menuToggle) {
                    controlsPanel.classList.add('collapsed');
                }
            });
            
            document.addEventListener('click', function(e) {
                if (!controlsPanel.classList.contains('collapsed') && 
                    !controlsPanel.contains(e.target) && 
                    e.target !== menuToggle) {
                    controlsPanel.classList.add('collapsed');
                }
            });
        }
    }
    
    // Setup parameter groups
    function setupParameterGroups() {
        const paramGroup = document.getElementById('paramGroup');
        if (!paramGroup) return;
        
        const paramGroups = {
            orbie: document.getElementById('orbieParams'),
            orbieSwarm: document.getElementById('orbieSwarmParams'),
            zotSwarms: document.getElementById('zotSwarmsParams'),
            forces: document.getElementById('forcesParams'),
            walls: document.getElementById('wallsParams')
        };
        
        paramGroup.addEventListener('change', function() {
            // Hide all parameter groups
            document.querySelectorAll('.param-group').forEach(group => {
                group.classList.remove('active');
            });
            
            // Show the selected group
            const selectedGroup = paramGroups[this.value];
            if (selectedGroup) {
                selectedGroup.classList.add('active');
            }
        });
    }
    
    // Setup all input controls and their event handlers
    function setupInputControls() {
        // Orbie toggle
        const orbieEnabled = document.getElementById('orbieEnabled');
        if (orbieEnabled && callbacks.updateOrbieSettings) {
            // Initialize from settings if possible
            if (typeof ParticleSystem !== 'undefined' && ParticleSystem.getOrbieSettings) {
                const settings = ParticleSystem.getOrbieSettings();
                console.log("Setting orbieEnabled checkbox from settings:", settings.enabled);
                orbieEnabled.checked = settings.enabled !== false; // Default to true if not set
            } else {
                console.log("ParticleSystem not available, defaulting orbieEnabled to true");
                orbieEnabled.checked = true; // Default to true if ParticleSystem isn't available
            }
            
            orbieEnabled.addEventListener('change', function() {
                console.log("Orbie toggle changed to:", this.checked);
                callbacks.updateOrbieSettings('enabled', this.checked);
            });
        }
        
        // Orbie controls
        setupRangeInput('orbieSize', value => updateSetting('orbie', 'size', value));
        setupRangeInput('orbieGlowSize', value => updateSetting('orbie', 'glowSize', value));
        setupRangeInput('orbiePulseSpeed', value => updateSetting('orbie', 'pulseSpeed', value));
        setupRangeInput('orbiePulseIntensity', value => updateSetting('orbie', 'pulseIntensity', value));
        setupRangeInput('orbieInfluenceRadius', value => updateSetting('orbie', 'influenceRadius', value));
        setupRangeInput('orbieTouchMultiplier', value => updateSetting('orbie', 'touchMultiplier', value));
        
        // Swarm controls
        setupRangeInput('swarmSpeed', value => updateSetting('orbieSwarm', 'speed', value));
        setupRangeInput('swarmSeparation', value => updateSetting('orbieSwarm', 'separation', value));
        setupRangeInput('swarmAlignment', value => updateSetting('orbieSwarm', 'alignment', value));
        setupRangeInput('swarmCohesion', value => updateSetting('orbieSwarm', 'cohesion', value));
        setupRangeInput('swarmPerception', value => updateSetting('orbieSwarm', 'perception', value));
        setupRangeInput('swarmSparkleRate', value => updateSetting('orbieSwarm', 'sparkleRate', value));
        
        // Zots controls
        setupRangeInput('zotsCount', value => updateSetting('zotSwarms', 'particleCount', value));
        setupRangeInput('zotsSpeed', value => updateSetting('zotSwarms', 'speed', value));
        setupRangeInput('zotsSeparation', value => updateSetting('zotSwarms', 'separation', value));
        setupRangeInput('zotsAlignment', value => updateSetting('zotSwarms', 'alignment', value));
        setupRangeInput('zotsCohesion', value => updateSetting('zotSwarms', 'cohesion', value));
        setupRangeInput('zotsPerception', value => updateSetting('zotSwarms', 'perception', value));
        setupRangeInput('zotsTouchForce', value => updateSetting('zotSwarms', 'touchForce', value));
        
        // Force controls
        setupRangeInput('touchForce', value => updateSetting('forces', 'touchForce', value));
        setupRangeInput('wallForce', value => updateSetting('forces', 'wallForce', value));
        
        // SwipeSplitSystem force controls
        if (typeof SwipeSplitSystem !== 'undefined') {
            // Get current settings to initialize UI elements
            const swipeSettings = SwipeSplitSystem.getSettings();
            
            // Force enable toggle
            const swipeForcesEnabled = document.getElementById('swipeForcesEnabled');
            if (swipeForcesEnabled) {
                // Initialize checkbox state from current settings
                swipeForcesEnabled.checked = swipeSettings.forceActive !== false;
                
                swipeForcesEnabled.addEventListener('change', function() {
                    SwipeSplitSystem.updateSettings({ forceActive: this.checked });
                });
            }
            
            // Range sliders for force parameters
            setupRangeInput('swipeForceRadius', value => {
                SwipeSplitSystem.updateSettings({ forceRadius: value });
            }, swipeSettings.forceRadius);
            
            setupRangeInput('swipeForceIntensity', value => {
                SwipeSplitSystem.updateSettings({ forceIntensity: value });
            }, swipeSettings.forceIntensity);
            
            // Separate controls for attract and repel multipliers
            setupRangeInput('swipeRepelMultiplier', value => {
                SwipeSplitSystem.updateSettings({ repelMultiplier: value });
            }, swipeSettings.repelMultiplier || 3.0);
            
            setupRangeInput('swipeAttractMultiplier', value => {
                SwipeSplitSystem.updateSettings({ attractMultiplier: value });
            }, swipeSettings.attractMultiplier || 1.0);
        }
        
        // Checkboxes for enabled/disabled features
        const zotTouchEnabled = document.getElementById('zotTouchEnabled');
        if (zotTouchEnabled) {
            zotTouchEnabled.addEventListener('change', function() {
                updateSetting('forces', 'zotTouchEnabled', this.checked);
            });
        }
        
        const zotSwarmInteractionEnabled = document.getElementById('zotSwarmInteractionEnabled');
        if (zotSwarmInteractionEnabled) {
            zotSwarmInteractionEnabled.addEventListener('change', function() {
                updateSetting('forces', 'zotSwarmInteractionEnabled', this.checked);
            });
        }
        
        // Reset buttons
        const resetOrbieButton = document.getElementById('resetButton');
        if (resetOrbieButton && callbacks.resetOrbie) {
            resetOrbieButton.addEventListener('click', callbacks.resetOrbie);
        }
        
        const resetAllButton = document.getElementById('resetAllButton');
        if (resetAllButton && callbacks.resetAll) {
            resetAllButton.addEventListener('click', callbacks.resetAll);
        }

        // Setup Wall SVG selector
        setupWallSVGSelector();
    }
    
    // Setup color theme selector
    function setupColorThemes() {
        const colorThemeSelect = document.getElementById('colorTheme');
        if (colorThemeSelect && callbacks.changeColorTheme) {
            // Populate theme options if we have the theme list
            if (ColorThemes && typeof ColorThemes.getThemeList === 'function') {
                const themes = ColorThemes.getThemeList();
                const currentTheme = ColorThemes.getCurrentTheme();
                
                themes.forEach(theme => {
                    const option = document.createElement('option');
                    option.value = theme;
                    option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1); // Capitalize first letter
                    option.selected = (theme === currentTheme);
                    colorThemeSelect.appendChild(option);
                });
            }
            
            // Add event listener for theme change
            colorThemeSelect.addEventListener('change', function() {
                callbacks.changeColorTheme(this.value);
            });
        }
        
        // Sparkle theme settings if they exist
        setupRangeInput('sparkleGrayscale', value => updateSparkleSettings('grayscaleChance', value));
        setupRangeInput('sparkleColor', value => updateSparkleSettings('colorSaturation', value));
        setupRangeInput('sparkleBrightness', value => updateSparkleSettings('brightnessFactor', value));
    }
    
    // Helper function to update sparkle settings
    function updateSparkleSettings(setting, value) {
        if (ColorThemes && typeof ColorThemes.updateSparkleSettings === 'function') {
            const settings = {};
            settings[setting] = value;
            ColorThemes.updateSparkleSettings(settings);
        }
    }
    
    // Update a setting in any group
    function updateSetting(group, property, value) {
        // Handle Orbie settings
        if (group === 'orbie') {
            if (callbacks.updateOrbieSettings) {
                callbacks.updateOrbieSettings(property, value);
            }
        }
        // Handle Orbie swarm settings
        else if (group === 'orbieSwarm') {
            if (callbacks.updateSwarmSettings) {
                callbacks.updateSwarmSettings('orbieSwarm', property, value);
            }
        }
        // Handle Zot swarm settings (handled differently, through UI)
        else if (group === 'zotSwarms') {
            // These are handled through the UI directly
        }
        // Handle Forces settings
        else if (group === 'forces') {
            if (callbacks.updateSettings) {
                callbacks.updateSettings('forces', property, value);
            }
        }
        // Handle Wall settings
        else if (group === 'walls') {
            if (callbacks.updateWallSettings) {
                callbacks.updateWallSettings(property, value);
            }
        }
    }
    
    // Helper function to set up a range input
    function setupRangeInput(id, changeCallback, initialValue) {
        const input = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Value');
        
        if (input && valueDisplay) {
            // Set initial value from settings if provided
            if (initialValue !== undefined) {
                input.value = initialValue;
            }
            
            // Set initial value display
            valueDisplay.textContent = parseFloat(input.value).toFixed(input.step.includes('.') ? 2 : 0);
            
            // Add event listeners for input changes
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                valueDisplay.textContent = value.toFixed(this.step.includes('.') ? 2 : 0);
                
                // Call the callback with the new value
                if (changeCallback) {
                    changeCallback(value);
                }
            });
        }
    }
    
    // Setup Wall SVG selector
    function setupWallSVGSelector() {
        const wallSVGSelector = document.getElementById('wallSVG');
        if (wallSVGSelector && callbacks.loadWallSVG) {
            // Populate the dropdown with SVG files from the repository
            fetchSVGFiles(wallSVGSelector);
            
            // Add event listener for selection change
            wallSVGSelector.addEventListener('change', function() {
                if (this.value && callbacks.loadWallSVG) {
                    callbacks.loadWallSVG(this.value);
                }
            });
        }
    }
    
    // Fetch SVG files from the repository
    function fetchSVGFiles(selectElement) {
        // Clear existing options
        selectElement.innerHTML = '';
        
        // Add a placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = 'Select a wall design...';
        placeholderOption.selected = true;
        selectElement.appendChild(placeholderOption);
        
        // Known SVG files in the public directory
        const svgFiles = [
            { name: 'Sample Walls', path: './sample-walls.svg' },
            { name: 'Sample Walls with Curves', path: './sample-walls-curves.svg' },
            { name: 'Curves Sample', path: './curves-sample.svg' }
        ];
        
        // Add options for each SVG file
        svgFiles.forEach(file => {
            const option = document.createElement('option');
            option.value = file.path;
            option.textContent = file.name;
            selectElement.appendChild(option);
        });
    }
    
    function setupRangeSliders() {
        const minSlider = document.getElementById('newSwarmMinSize');
        const maxSlider = document.getElementById('newSwarmMaxSize');
        const minValue = document.getElementById('newSwarmMinSizeValue');
        const maxValue = document.getElementById('newSwarmMaxSizeValue');

        if (minSlider && maxSlider && minValue && maxValue) {
            minSlider.addEventListener('input', function() {
                if (parseFloat(this.value) > parseFloat(maxSlider.value)) {
                    this.value = maxSlider.value;
                }
                minValue.textContent = parseFloat(this.value).toFixed(1);
            });

            maxSlider.addEventListener('input', function() {
                if (parseFloat(this.value) < parseFloat(minSlider.value)) {
                    this.value = minSlider.value;
                }
                maxValue.textContent = parseFloat(this.value).toFixed(1);
            });
        }
    }
    
    // Public API
    return {
        init: init,
        toggleMenu: function() {
            if (controlsPanel) {
                controlsPanel.classList.toggle('collapsed');
            }
        }
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = MenuSystem;
}