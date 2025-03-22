// Handle canvas click for swarm placement
    canvas.addEventListener('click', function(e) {
        // Only handle if in swarm placement mode
        if (ParticleSystem.getActiveSwarmPlacement()) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Confirm placement at click position
            const config = getSwarmConfigFromUI();
            const swarmId = ParticleSystem.confirmSwarmPlacement(config);
            
            if (swarmId) {
                // Update the swarm list
                updateSwarmList();
                
                // Reset the Create Swarm button
                const createButton = document.getElementById('createSwarmButton');
                if (createButton) {
                    createButton.textContent = "Create Swarm";
                }
                
                // Reset touch handler
                TouchHandler.setSwarmPlacementMode(false, null);
            }
        }
    });// main.js - Application initialization
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    const menuToggle = document.getElementById('menuToggle');
    const fpsDisplay = document.getElementById('fps');
    const controlsPanel = document.getElementById('controls');
    
    console.log("DOM loaded - Menu elements:", menuToggle ? "✓" : "✗", controlsPanel ? "✓" : "✗");
    
    // Initialize the particle system
    ParticleSystem.init(canvas, fpsDisplay);
    
    // Initialize wall system
    WallSystem.init();
    
    // Add direct event listeners to menu toggle as a backup
    if (menuToggle && controlsPanel) {
        console.log("Adding direct event listeners to menu toggle");
        
        menuToggle.addEventListener('click', function(e) {
            console.log("Menu toggle clicked");
            e.preventDefault();
            controlsPanel.classList.toggle('collapsed');
        });
        
        menuToggle.addEventListener('touchstart', function(e) {
            console.log("Menu toggle touched");
            e.preventDefault();
            controlsPanel.classList.toggle('collapsed');
            e.stopPropagation();
        }, { passive: false });
    }
    
    // Initialize touch handler with callback
    TouchHandler.init(canvas, {
        onTouchStart: function(x, y) {
            ParticleSystem.setTouchPosition(x, y, true);
        },
        onTouchMove: function(x, y) {
            ParticleSystem.setTouchPosition(x, y, true);
        },
        onTouchEnd: function() {
            ParticleSystem.setTouchPosition(0, 0, false);
        },
        onDoubleTap: function() {
            const isAttract = ParticleSystem.toggleAttraction();
            menuToggle.classList.toggle('attract-mode', isAttract);
        },
        isAttractMode: function() {
            // This function allows the TouchHandler to check the current mode
            return ParticleSystem.isAttractMode();
        },
        onSwarmPlacement: function(x, y) {
            // Create a swarm at the touch position
            const config = getSwarmConfigFromUI();
            const swarmId = ParticleSystem.confirmSwarmPlacement(config);
            
            if (swarmId) {
                // Update the swarm list
                updateSwarmList();
                
                // Reset the Create Swarm button
                const createButton = document.getElementById('createSwarmButton');
                if (createButton) {
                    createButton.textContent = "Create Swarm";
                }
            }
        }
    });
    
    // Initialize menu system with callbacks
    try {
        console.log("Initializing MenuSystem...");
        MenuSystem.init({
            controlsPanel: controlsPanel,
            menuToggle: menuToggle
        }, {
            // Callbacks for settings updates
            updateOrbieSettings: function(property, value) {
                ParticleSystem.updateOrbieSettings(property, value);
            },
            updateSwarmSettings: function(swarmType, property, value) {
                ParticleSystem.updateSwarmSettings(swarmType, property, value);
            },
            updateSettings: function(group, property, value) {
                ParticleSystem.updateSettings(group, property, value);
            },
            resetOrbie: function() {
                ParticleSystem.resetOrbie();
            },
            resetAll: function() {
                ParticleSystem.resetAll();
                WallSystem.clearWalls();
            },
            changeColorTheme: function(theme) {
                ColorSystem.setTheme(theme);
            },
            updateWallSettings: function(property, value) {
                // Update wall settings
                const settings = {};
                settings[property] = parseFloat(value);
                WallSystem.updateSettings(settings);
            }
        });
        console.log("MenuSystem initialized");
    } catch (error) {
        console.error("Error initializing menu system:", error);
    }
    
    // Controls panel setup
    setupControls();
    
    // Setup wall controls
    setupWallControls();
    
    // Handle menu toggle
    menuToggle.addEventListener('click', function() {
        controlsPanel.classList.toggle('collapsed');
        
        // If closing the menu and there's an active swarm placement, cancel it
        if (controlsPanel.classList.contains('collapsed') && ParticleSystem.getActiveSwarmPlacement()) {
            ParticleSystem.cancelSwarmPlacement();
            TouchHandler.setSwarmPlacementMode(false, null);
            updateCreateSwarmUI();
        }
    });
    
    // Properly handle touch behavior on menu toggle button
    menuToggle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        controlsPanel.classList.toggle('collapsed');
        
        // If closing the menu and there's an active swarm placement, cancel it
        if (controlsPanel.classList.contains('collapsed') && ParticleSystem.getActiveSwarmPlacement()) {
            ParticleSystem.cancelSwarmPlacement();
            TouchHandler.setSwarmPlacementMode(false, null);
            updateCreateSwarmUI();
        }
        e.stopPropagation();
    }, { passive: false });
    
    // Cancel swarm placement when clicking/touching outside the menu
    document.addEventListener('click', function(e) {
        // Only if there's an active swarm placement and click is outside controls
        if (ParticleSystem.getActiveSwarmPlacement() && 
            !controlsPanel.contains(e.target) && 
            e.target !== menuToggle) {
            
            ParticleSystem.cancelSwarmPlacement();
            TouchHandler.setSwarmPlacementMode(false, null);
            updateCreateSwarmUI();
        }
    });
    
    // Function to set up all the control panel interactions
    function setupControls() {
        // Group selector dropdown
        const paramGroupSelect = document.getElementById('paramGroup');
        paramGroupSelect.addEventListener('change', function() {
            // Hide all parameter groups
            document.querySelectorAll('.param-group').forEach(group => {
                group.classList.remove('active');
            });
            
            // Show the selected group
            const selectedGroup = document.getElementById(this.value + 'Params');
            if (selectedGroup) {
                selectedGroup.classList.add('active');
            }
        });
        
        // Setup range sliders and UI elements
        setupOrbieControls();
        setupOrbieSwarmControls();
        setupZotSwarmControls();
        setupForceControls();
        
        // Setup reset buttons
        document.getElementById('resetOrbieButton').addEventListener('click', function() {
            // Reset Orbie's position to center
            ParticleSystem.resetOrbie();
        });
        
        document.getElementById('resetAllButton').addEventListener('click', function() {
            // Reset all particles and settings
            ParticleSystem.resetAll();
            
            // Update UI to reflect reset settings
            updateAllUIValues();
        });
    }
    
    // Setup Orbie control sliders
    function setupOrbieControls() {
        setupRangeInput('orbieSize', value => {
            ParticleSystem.updateOrbieSettings('size', value);
        });
        
        setupRangeInput('orbieGlowSize', value => {
            ParticleSystem.updateOrbieSettings('glowSize', value);
        });
        
        setupRangeInput('orbieGlowOpacity', value => {
            ParticleSystem.updateOrbieSettings('glowOpacity', value);
        });
        
        setupRangeInput('orbieSpeed', value => {
            ParticleSystem.updateOrbieSettings('speed', value);
        });
        
        setupRangeInput('orbiePulseSpeed', value => {
            ParticleSystem.updateOrbieSettings('pulseSpeed', value);
        });
        
        setupRangeInput('orbiePulseIntensity', value => {
            ParticleSystem.updateOrbieSettings('pulseIntensity', value);
        });
        
        setupRangeInput('orbieInfluenceRadius', value => {
            ParticleSystem.updateOrbieSettings('influenceRadius', value);
        });
        
        setupRangeInput('orbieInfluenceIntensity', value => {
            ParticleSystem.updateOrbieSettings('influenceIntensity', value);
        });
    }
    
    // Setup OrbieSwarm control sliders
    function setupOrbieSwarmControls() {
        setupRangeInput('orbieSwarmSpeed', value => {
            ParticleSystem.updateOrbieSwarmSettings('speed', value);
        });
        
        setupRangeInput('orbieSwarmDampening', value => {
            ParticleSystem.updateOrbieSwarmSettings('dampening', value);
        });
        
        setupRangeInput('orbieSwarmSeparation', value => {
            ParticleSystem.updateOrbieSwarmSettings('separation', value);
        });
        
        setupRangeInput('orbieSwarmAlignment', value => {
            ParticleSystem.updateOrbieSwarmSettings('alignment', value);
        });
        
        setupRangeInput('orbieSwarmCohesion', value => {
            ParticleSystem.updateOrbieSwarmSettings('cohesion', value);
        });
        
        setupRangeInput('orbieSwarmPerception', value => {
            ParticleSystem.updateOrbieSwarmSettings('perception', value);
        });
        
        setupRangeInput('orbieSwarmSparkleRate', value => {
            ParticleSystem.updateOrbieSwarmSettings('sparkleRate', value);
        });
    }
    
    // Setup Zot Swarm controls
    function setupZotSwarmControls() {
        // Regular sliders
        setupRangeInput('newSwarmZotCount', () => updateCreateSwarmUI());
        setupRangeInput('newSwarmSpeed', () => updateCreateSwarmUI());
        setupRangeInput('newSwarmSeparation', () => updateCreateSwarmUI());
        setupRangeInput('newSwarmAlignment', () => updateCreateSwarmUI());
        setupRangeInput('newSwarmCohesion', () => updateCreateSwarmUI());
        setupRangeInput('newSwarmPerception', () => updateCreateSwarmUI());
        
        // Min/Max size range slider
        setupDualRangeSlider('newSwarmMinSize', 'newSwarmMaxSize');
        
        // Preset selector
        const presetSelect = document.getElementById('swarmPreset');
        if (presetSelect) {
            presetSelect.addEventListener('change', function() {
                if (this.value === 'custom') {
                    // Keep current values
                    return;
                }
                
                // Apply preset values to UI
                const preset = ParticleSystem.applyPresetToNewSwarm(this.value);
                if (preset) {
                    document.getElementById('newSwarmZotCount').value = preset.zotCount;
                    document.getElementById('newSwarmSpeed').value = preset.speed;
                    document.getElementById('newSwarmSeparation').value = preset.separation;
                    document.getElementById('newSwarmAlignment').value = preset.alignment;
                    document.getElementById('newSwarmCohesion').value = preset.cohesion;
                    document.getElementById('newSwarmPerception').value = preset.perception;
                    
                    // Update displayed values
                    document.getElementById('newSwarmZotCountValue').textContent = preset.zotCount;
                    document.getElementById('newSwarmSpeedValue').textContent = preset.speed.toFixed(1);
                    document.getElementById('newSwarmSeparationValue').textContent = preset.separation.toFixed(1);
                    document.getElementById('newSwarmAlignmentValue').textContent = preset.alignment.toFixed(2);
                    document.getElementById('newSwarmCohesionValue').textContent = preset.cohesion.toFixed(1);
                    document.getElementById('newSwarmPerceptionValue').textContent = preset.perception;
                }
            });
        }
        
        // Color theme selector
        const colorPresets = document.querySelectorAll('.color-preset');
        colorPresets.forEach(preset => {
            preset.addEventListener('click', function() {
                // Remove active class from all presets
                colorPresets.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked preset
                this.classList.add('active');
                
                // Update current color theme
                updateCreateSwarmUI();
            });
        });
        
        // Create Swarm button
        const createSwarmButton = document.getElementById('createSwarmButton');
        if (createSwarmButton) {
            createSwarmButton.addEventListener('click', function() {
                const activeSwarm = ParticleSystem.getActiveSwarmPlacement();
                
                if (activeSwarm) {
                    // Confirm placement and create swarm
                    const config = getSwarmConfigFromUI();
                    const swarmId = ParticleSystem.confirmSwarmPlacement(config);
                    
                    if (swarmId) {
                        // Update the swarm list
                        updateSwarmList();
                        
                        // Reset button text
                        this.textContent = "Create Swarm";
                        
                        // Reset touch handler placement mode
                        TouchHandler.setSwarmPlacementMode(false, null);
                    }
                } else {
                    // Create a new placement indicator
                    const placement = ParticleSystem.createSwarmPlacementIndicator(getSwarmConfigFromUI());
                    
                    // Change button text
                    this.textContent = "Confirm Placement";
                    
                    // Set touch handler to swarm placement mode
                    if (placement) {
                        TouchHandler.setSwarmPlacementMode(true, placement.id);
                    }
                }
            });
        }
        
        // Initial swarm list update
        updateSwarmList();
    }
    
    // Setup Force controls
    function setupForceControls() {
        setupRangeInput('touchForce', value => {
            ParticleSystem.updateForceSettings('touchForce', value);
        });
        
        setupRangeInput('wallForce', value => {
            ParticleSystem.updateForceSettings('wallForce', value);
        });
        
        setupRangeInput('orbieTouchMultiplier', value => {
            ParticleSystem.updateOrbieSettings('touchMultiplier', value);
        });
        
        // Initialize zotTouchEnabled checkbox
        const zotTouchEnabled = document.getElementById('zotTouchEnabled');
        if (zotTouchEnabled) {
            // Get the current value from the particle system
            const currentValue = ParticleSystem.getForceSettingValue('zotTouchEnabled');
            zotTouchEnabled.checked = currentValue !== undefined ? currentValue : true;
            
            // Add event listener
            zotTouchEnabled.addEventListener('change', function() {
                ParticleSystem.updateSettings('forces', 'zotTouchEnabled', this.checked);
            });
        }
        
        // Initialize zotSwarmInteractionEnabled checkbox
        const zotSwarmInteractionEnabled = document.getElementById('zotSwarmInteractionEnabled');
        if (zotSwarmInteractionEnabled) {
            // Get the current value from the particle system
            const currentValue = ParticleSystem.getForceSettingValue('zotSwarmInteractionEnabled');
            zotSwarmInteractionEnabled.checked = currentValue !== undefined ? currentValue : true;
            
            // Add event listener
            zotSwarmInteractionEnabled.addEventListener('change', function() {
                ParticleSystem.updateSettings('forces', 'zotSwarmInteractionEnabled', this.checked);
            });
        }
    }
    
    // Helper function to set up a range input with its value display and change handler
    function setupRangeInput(id, changeCallback) {
        const input = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Value');
        
        if (input && valueDisplay) {
            // Set initial value
            const shouldRound = input.step === '1' || parseFloat(input.step) === 1;
            const precision = shouldRound ? 0 : 
                             input.step.includes('.01') ? 2 : 1;
            
            valueDisplay.textContent = parseFloat(input.value).toFixed(precision);
            
            // Add event listeners for input changes
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                valueDisplay.textContent = value.toFixed(precision);
                
                // Call the callback with the new value
                if (changeCallback) {
                    changeCallback(value);
                }
            });
        }
    }
    
    // Helper function to set up dual-thumb range slider for min/max values
    function setupDualRangeSlider(minId, maxId) {
        const minSlider = document.getElementById(minId);
        const maxSlider = document.getElementById(maxId);
        const minValueDisplay = document.getElementById(minId + 'Value');
        const maxValueDisplay = document.getElementById(maxId + 'Value');
        
        if (minSlider && maxSlider && minValueDisplay && maxValueDisplay) {
            // Update values displays
            function updateValues() {
                const minVal = parseFloat(minSlider.value);
                const maxVal = parseFloat(maxSlider.value);
                
                minValueDisplay.textContent = minVal.toFixed(1);
                maxValueDisplay.textContent = maxVal.toFixed(1);
                
                // Ensure thumb positions are visually reflecting the values
                updateThumbPositions();
                
                // Call callback to update UI
                updateCreateSwarmUI();
            }
            
            // Update the visual position of thumbs
            function updateThumbPositions() {
                const minVal = parseFloat(minSlider.value);
                const maxVal = parseFloat(maxSlider.value);
                
                // Calculate percentage of position along track
                const min = parseFloat(minSlider.min);
                const max = parseFloat(minSlider.max);
                const range = max - min;
                
                const minPercent = ((minVal - min) / range) * 100;
                const maxPercent = ((maxVal - min) / range) * 100;
                
                // Set the min/max slider background to show selected range
                // This creates a visual highlight between the two thumbs
                const sliderContainer = minSlider.closest('.range-slider-container');
                if (sliderContainer) {
                    const sliderTrack = sliderContainer.querySelector('.range-slider');
                    if (sliderTrack) {
                        sliderTrack.style.background = `linear-gradient(
                            to right,
                            #444 0%, #444 ${minPercent}%,
                            #4CAF50 ${minPercent}%, #4CAF50 ${maxPercent}%,
                            #444 ${maxPercent}%, #444 100%
                        )`;
                    }
                }
            }
            
            // Set initial values
            updateValues();
            
            // Ensure min doesn't exceed max and max doesn't go below min
            minSlider.addEventListener('input', function() {
                const minVal = parseFloat(this.value);
                const maxVal = parseFloat(maxSlider.value);
                
                if (minVal > maxVal) {
                    maxSlider.value = minVal;
                }
                
                updateValues();
            });
            
            maxSlider.addEventListener('input', function() {
                const maxVal = parseFloat(this.value);
                const minVal = parseFloat(minSlider.value);
                
                if (maxVal < minVal) {
                    minSlider.value = maxVal;
                }
                
                updateValues();
            });
            
            // Handle touch events for mobile
            // On touchend, ensure values are updated and saved
            minSlider.addEventListener('touchend', updateValues, { passive: true });
            maxSlider.addEventListener('touchend', updateValues, { passive: true });
        }
    }
    
    // Get the current swarm configuration from UI inputs
    function getSwarmConfigFromUI() {
        // Get the selected color theme
        const activeTheme = document.querySelector('.color-preset.active');
        const colorTheme = activeTheme ? activeTheme.getAttribute('data-theme') : 'blue';
        
        return {
            zotCount: parseInt(document.getElementById('newSwarmZotCount').value),
            minSize: parseFloat(document.getElementById('newSwarmMinSize').value),
            maxSize: parseFloat(document.getElementById('newSwarmMaxSize').value),
            speed: parseFloat(document.getElementById('newSwarmSpeed').value),
            separation: parseFloat(document.getElementById('newSwarmSeparation').value),
            alignment: parseFloat(document.getElementById('newSwarmAlignment').value),
            cohesion: parseFloat(document.getElementById('newSwarmCohesion').value),
            perception: parseInt(document.getElementById('newSwarmPerception').value),
            trailLength: 0, // No trails by default
            colorTheme: colorTheme
        };
    }
    
    // Update the Create Swarm UI when configuration changes
    function updateCreateSwarmUI() {
        // Reset the Create Swarm button if there's no active placement
        const activeSwarm = ParticleSystem.getActiveSwarmPlacement();
        const createButton = document.getElementById('createSwarmButton');
        
        if (createButton) {
            createButton.textContent = activeSwarm ? "Confirm Placement" : "Create Swarm";
            
            // Update TouchHandler swarm placement mode
            TouchHandler.setSwarmPlacementMode(!!activeSwarm, activeSwarm ? activeSwarm.id : null);
        }
    }
    
    // Update the list of active swarms
    function updateSwarmList() {
        const swarmList = document.getElementById('swarmList');
        if (!swarmList) return;
        
        // Get the current swarms
        const swarms = ParticleSystem.getZotSwarms();
        
        // Clear the list
        swarmList.innerHTML = '';
        
        // If no swarms, show message
        if (swarms.length === 0) {
            swarmList.innerHTML = '<div class="swarm-list-item"><span>No swarms created yet</span></div>';
            return;
        }
        
        // Add each swarm to the list
        swarms.forEach(swarm => {
            const swarmItem = document.createElement('div');
            swarmItem.className = 'swarm-list-item';
            
            const colorThemeName = Presets.colorThemes[swarm.settings.colorTheme]?.name || 'Custom';
            
            swarmItem.innerHTML = `
                <span>${colorThemeName} Swarm (${swarm.zotCount} zots)</span>
                <button class="remove-swarm" data-id="${swarm.id}">Remove</button>
            `;
            
            swarmList.appendChild(swarmItem);
        });
        
        // Add event listeners to remove buttons
        const removeButtons = swarmList.querySelectorAll('.remove-swarm');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const swarmId = this.getAttribute('data-id');
                if (swarmId) {
                    ParticleSystem.removeZotSwarm(swarmId);
                    updateSwarmList();
                }
            });
        });
    }
    
    // Update all UI values to match current settings
    function updateAllUIValues() {
        // Set Orbie parameter values
        document.getElementById('orbieSize').value = ParticleSystem.getOrbieSettings().size || 12;
        document.getElementById('orbieSizeValue').textContent = parseFloat(document.getElementById('orbieSize').value).toFixed(1);
        
        document.getElementById('orbieGlowSize').value = ParticleSystem.getOrbieSettings().glowSize || 3;
        document.getElementById('orbieGlowSizeValue').textContent = parseFloat(document.getElementById('orbieGlowSize').value).toFixed(1);
        
        document.getElementById('orbieGlowOpacity').value = ParticleSystem.getOrbieSettings().glowOpacity || 0.7;
        document.getElementById('orbieGlowOpacityValue').textContent = parseFloat(document.getElementById('orbieGlowOpacity').value).toFixed(2);
        
        document.getElementById('orbiePulseSpeed').value = ParticleSystem.getOrbieSettings().pulseSpeed || 0.05;
        document.getElementById('orbiePulseSpeedValue').textContent = parseFloat(document.getElementById('orbiePulseSpeed').value).toFixed(2);
        
        document.getElementById('orbiePulseIntensity').value = ParticleSystem.getOrbieSettings().pulseIntensity || 0.4;
        document.getElementById('orbiePulseIntensityValue').textContent = parseFloat(document.getElementById('orbiePulseIntensity').value).toFixed(2);
        
        document.getElementById('orbieInfluenceRadius').value = ParticleSystem.getOrbieSettings().influenceRadius || 100;
        document.getElementById('orbieInfluenceRadiusValue').textContent = parseFloat(document.getElementById('orbieInfluenceRadius').value).toFixed(0);
        
        document.getElementById('orbieInfluenceIntensity').value = ParticleSystem.getOrbieSettings().influenceIntensity || 0.5;
        document.getElementById('orbieInfluenceIntensityValue').textContent = parseFloat(document.getElementById('orbieInfluenceIntensity').value).toFixed(2);
        
        document.getElementById('orbieTouchMultiplier').value = ParticleSystem.getOrbieSettings().touchMultiplier || 0.15;
        document.getElementById('orbieTouchMultiplierValue').textContent = parseFloat(document.getElementById('orbieTouchMultiplier').value).toFixed(2);
        
        // Set OrbieSwarm parameter values
        // ... (existing code)
        
        // Set Forces parameter values
        document.getElementById('touchForce').value = ParticleSystem.getForceSettingValue('touchForce') || 3;
        document.getElementById('touchForceValue').textContent = parseFloat(document.getElementById('touchForce').value).toFixed(1);
        
        document.getElementById('wallForce').value = ParticleSystem.getForceSettingValue('wallForce') || 1;
        document.getElementById('wallForceValue').textContent = parseFloat(document.getElementById('wallForce').value).toFixed(1);
        
        // Set ZotTouchEnabled checkbox
        const zotTouchEnabled = document.getElementById('zotTouchEnabled');
        if (zotTouchEnabled) {
            zotTouchEnabled.checked = ParticleSystem.getForceSettingValue('zotTouchEnabled') !== false;
        }
        
        // Set ZotSwarmInteractionEnabled checkbox
        const zotSwarmInteractionEnabled = document.getElementById('zotSwarmInteractionEnabled');
        if (zotSwarmInteractionEnabled) {
            zotSwarmInteractionEnabled.checked = ParticleSystem.getForceSettingValue('zotSwarmInteractionEnabled') !== false;
        }
        
        // Update swarm list
        updateSwarmList();
        
        // Update create swarm UI
        updateCreateSwarmUI();
    }
    
    // Setup wall-related controls
    function setupWallControls() {
        const wallForceSlider = document.getElementById('wallsForce');
        if (wallForceSlider) {
            setupRangeInput('wallsForce', function(value) {
                WallSystem.updateSettings({ wallForce: parseFloat(value) });
            });
        }
        
        const wallPerceptionSlider = document.getElementById('wallPerception');
        if (wallPerceptionSlider) {
            setupRangeInput('wallPerception', function(value) {
                WallSystem.updateSettings({ wallPerception: parseFloat(value) });
            });
        }
        
        const loadWallsButton = document.getElementById('loadWallsButton');
        if (loadWallsButton) {
            loadWallsButton.addEventListener('click', function() {
                // Create file input dynamically
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.svg';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);
                
                fileInput.addEventListener('change', function(e) {
                    if (e.target.files.length > 0) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        
                        reader.onload = function(event) {
                            const svgText = event.target.result;
                            const wallCount = WallSystem.loadFromSVG(svgText);
                            console.log(`Loaded ${wallCount} wall segments from SVG`);
                        };
                        
                        reader.readAsText(file);
                    }
                    
                    // Clean up
                    document.body.removeChild(fileInput);
                });
                
                fileInput.click();
            });
        }
        
        const clearWallsButton = document.getElementById('clearWallsButton');
        if (clearWallsButton) {
            clearWallsButton.addEventListener('click', function() {
                WallSystem.clearWalls();
            });
        }
    }
});

// Initialize the simulation
function initializeSimulation() {
    // ... existing code ...
    
    try {
        console.log("Starting MenuSystem initialization...");
        menuSystem = new MenuSystem({
            containerElement: document.getElementById('simulation-container')
        });
        console.log("MenuSystem initialized successfully.");
    } catch (error) {
        console.error("Error initializing MenuSystem:", error);
    }
    
    // Initialize particle system with entity type identifiers
    try {
        console.log("Starting ParticleSystem initialization...");
        particleSystem = new ParticleSystem({
            canvasElement: document.getElementById('simulation-canvas'),
            // Other configuration parameters
        });
        
        // Add entity type identifiers for wall interaction
        particleSystem.addEntityTypeIdentifiers = function() {
            this.particles.forEach(particle => {
                // Default is a regular zot
                particle.isOrbie = false;
                particle.isOrbieSwarm = false;
                particle.isZotSwarm = false;
                
                // Identify Orbie
                if (particle.type === 'orbie') {
                    particle.isOrbie = true;
                }
                // Identify Orbie Swarm
                else if (particle.type === 'orbieSwarm') {
                    particle.isOrbieSwarm = true;
                }
                // Identify Zot Swarm
                else if (particle.type === 'zotSwarm') {
                    particle.isZotSwarm = true;
                }
            });
        };
        
        // Override the update method to add entity identifiers before physics
        const originalUpdate = particleSystem.update.bind(particleSystem);
        particleSystem.update = function(deltaTime) {
            // Add entity identifiers
            this.addEntityTypeIdentifiers();
            // Call the original update method
            return originalUpdate(deltaTime);
        };
        
        console.log("ParticleSystem initialized successfully with entity type identifiers");
    } catch (error) {
        console.error("Error initializing ParticleSystem:", error);
    }
    
    // ... existing code ...
}