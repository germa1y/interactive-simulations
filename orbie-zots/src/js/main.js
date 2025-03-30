// main.js - Application initialization
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    const menuToggle = document.getElementById('menuToggle');
    const homeButton = document.getElementById('homeButton');
    const fpsDisplay = document.getElementById('fps');
    const controlsPanel = document.getElementById('controls');
    
    console.log("DOM loaded - Menu elements:", menuToggle ? "✓" : "✗", controlsPanel ? "✓" : "✗", homeButton ? "✓" : "✗");
    
    // Initialize the particle system
    ParticleSystem.init(canvas, fpsDisplay);
    
    // Initialize wall system
    WallSystem.init();
    
    // Initialize swipe split system
    if (typeof SwipeSplitSystem !== 'undefined') {
        console.log("Initializing SwipeSplitSystem...");
        SwipeSplitSystem.init(canvas);
    } else {
        console.error("SwipeSplitSystem module not available");
    }
    
    // Start demo mode
    if (typeof DemoMode !== 'undefined') {
        console.log("Starting zot swarm demo mode...");
        setTimeout(() => {
            DemoMode.start();
        }, 200); // Short delay to ensure all systems are fully initialized
    } else {
        console.error("Demo Mode module not available");
    }
    
    // Add direct event listeners to menu toggle as a backup
    if (menuToggle && controlsPanel) {
        console.log("Adding direct event listeners to menu toggle");
        
        menuToggle.addEventListener('click', function(e) {
            console.log("Menu toggle clicked");
            e.preventDefault();
            controlsPanel.classList.toggle('collapsed');
            updateHomeButtonVisibility();
        });
        
        menuToggle.addEventListener('touchstart', function(e) {
            console.log("Menu toggle touched");
            e.preventDefault();
            controlsPanel.classList.toggle('collapsed');
            updateHomeButtonVisibility();
            e.stopPropagation();
        }, { passive: false });
    }
    
    // Set up home button event listener
    if (homeButton) {
        console.log("Setting up home button");
        
        // Set initial state of home button based on menu state
        updateHomeButtonVisibility();
        
        // Add click event listener to navigate to home page
        homeButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Home button clicked, navigating to home page");
            window.location.href = 'https://interactive-simulations.com/';
        });
        
        // Add touch event listener for mobile
        homeButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            console.log("Home button touched, navigating to home page");
            window.location.href = 'https://interactive-simulations.com/';
            e.stopPropagation();
        }, { passive: false });
    }
    
    // Function to update home button visibility based on menu state
    function updateHomeButtonVisibility() {
        if (homeButton) {
            if (controlsPanel.classList.contains('collapsed')) {
                homeButton.classList.add('visible');
            } else {
                homeButton.classList.remove('visible');
            }
        }
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
                ColorThemes.setTheme(theme);
            },
            updateWallSettings: function(property, value) {
                // Update wall settings
                const settings = {};
                settings[property] = parseFloat(value);
                WallSystem.updateSettings(settings);
            },
            loadWallSVG: function(svgPath) {
                // Load the selected SVG file
                fetch(svgPath)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.text();
                    })
                    .then(svgText => {
                        const wallCount = WallSystem.loadFromSVG(svgText);
                        console.log(`Loaded ${wallCount} wall segments from SVG`);
                    })
                    .catch(error => {
                        console.error('Error loading SVG file:', error);
                    });
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
    
    // Event handlers for menu interactions
    menuToggle.addEventListener('click', function() {
        controlsPanel.classList.toggle('collapsed');
        updateHomeButtonVisibility();
    });
    
    // Properly handle touch behavior on menu toggle button
    menuToggle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        controlsPanel.classList.toggle('collapsed');
        updateHomeButtonVisibility();
        e.stopPropagation();
    }, { passive: false });
    
    // Close controls panel with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            controlsPanel.classList.add('collapsed');
            updateHomeButtonVisibility();
        }
    });
    
    // Cancel any active placement if we close the controls panel while in placement mode
    controlsPanel.addEventListener('transitionend', function(e) {
        if (e.propertyName === 'right' && 
            controlsPanel.classList.contains('collapsed')) {
            updateHomeButtonVisibility();
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
        setupRangeInput('newSwarmZotCount');
        setupRangeInput('newSwarmSpeed');
        setupRangeInput('newSwarmSeparation');
        setupRangeInput('newSwarmAlignment');
        setupRangeInput('newSwarmCohesion');
        setupRangeInput('newSwarmPerception');
        
        // Min/Max size range slider
        setupDualRangeSlider('newSwarmMinSize', 'newSwarmMaxSize');
        
        // Preset selector
        const presetSelect = document.getElementById('swarmPreset');
        if (presetSelect) {
            presetSelect.addEventListener('change', function() {
                if (this.value === 'random') {
                    // Apply random values to UI but keep count=25 and speed=2
                    const randomConfig = {
                        zotCount: 25, // Keep fixed at 25
                        speed: 2,     // Keep fixed at 2
                        separation: Math.random() * 4, // Random between 0-4
                        alignment: Math.random() * 3,  // Random between 0-3
                        cohesion: Math.random() * 5,   // Random between 0-5
                        perception: Math.floor(Math.random() * 180) + 20 // Random between 20-200
                    };
                    
                    // Apply to UI
                    document.getElementById('newSwarmZotCount').value = randomConfig.zotCount;
                    document.getElementById('newSwarmSpeed').value = randomConfig.speed;
                    document.getElementById('newSwarmSeparation').value = randomConfig.separation;
                    document.getElementById('newSwarmAlignment').value = randomConfig.alignment;
                    document.getElementById('newSwarmCohesion').value = randomConfig.cohesion;
                    document.getElementById('newSwarmPerception').value = randomConfig.perception;
                    
                    // Also randomize size range (but keep sensible)
                    const minSize = 0.5 + Math.random() * 2; // Random between 0.5-2.5
                    const maxSize = minSize + 1 + Math.random() * 3; // At least 1 larger than min
                    document.getElementById('newSwarmMinSize').value = minSize;
                    document.getElementById('newSwarmMaxSize').value = maxSize;
                    
                    // Update displayed values
                    // HIDDEN: All slider values are hidden to protect IP
                    
                    document.getElementById('newSwarmZotCountValue').textContent = randomConfig.zotCount;
                    document.getElementById('newSwarmMinSizeValue').textContent = minSize.toFixed(1);
                    document.getElementById('newSwarmMaxSizeValue').textContent = maxSize.toFixed(1);
                    
                    // Also update the dual slider visuals
                    updateDualSliderVisuals('newSwarmMinSize', 'newSwarmMaxSize');
                    
                    return;
                }
                
                // Apply preset values to UI
                const preset = ParticleSystem.applyPresetToNewSwarm(this.value);
                if (preset) {
                    // Keep the current zot count
                    const currentZotCount = document.getElementById('newSwarmZotCount').value;
                    
                    // Apply preset values but preserve zot count
                    document.getElementById('newSwarmSpeed').value = preset.speed;
                    document.getElementById('newSwarmSeparation').value = preset.separation;
                    document.getElementById('newSwarmAlignment').value = preset.alignment;
                    document.getElementById('newSwarmCohesion').value = preset.cohesion;
                    document.getElementById('newSwarmPerception').value = preset.perception;
                    
                    // Update displayed values, keeping the current zot count
                    // HIDDEN: All slider values are hidden to protect IP
                    
                    document.getElementById('newSwarmZotCountValue').textContent = currentZotCount;
                    
                    // Also update min/max size if present in preset
                    if (preset.minSize !== undefined && preset.maxSize !== undefined) {
                        document.getElementById('newSwarmMinSize').value = preset.minSize;
                        document.getElementById('newSwarmMaxSize').value = preset.maxSize;
                        document.getElementById('newSwarmMinSizeValue').textContent = preset.minSize.toFixed(1);
                        document.getElementById('newSwarmMaxSizeValue').textContent = preset.maxSize.toFixed(1);
                        
                        // Update the dual slider visuals
                        updateDualSliderVisuals('newSwarmMinSize', 'newSwarmMaxSize');
                    }
                    
                    // Update color theme selector
                    if (preset.colorTheme) {
                        const colorPresets = document.querySelectorAll('.color-preset');
                        colorPresets.forEach(themeBtn => {
                            if (themeBtn.dataset.theme === preset.colorTheme) {
                                // Remove active class from all presets
                                colorPresets.forEach(p => p.classList.remove('active'));
                                // Add active class to matching preset
                                themeBtn.classList.add('active');
                                // Update the color theme
                                if (ColorThemes && typeof ColorThemes.setTheme === 'function') {
                                    ColorThemes.setTheme(preset.colorTheme);
                                }
                            }
                        });
                    }
                }
            });
        }
        
        // Helper function to update dual slider visuals after changing values
        function updateDualSliderVisuals(minId, maxId) {
            const minSlider = document.getElementById(minId);
            const maxSlider = document.getElementById(maxId);
            
            if (minSlider && maxSlider) {
                const minVal = parseFloat(minSlider.value);
                const maxVal = parseFloat(maxSlider.value);
                
                // Calculate percentage of position along track
                const min = parseFloat(minSlider.min);
                const max = parseFloat(minSlider.max);
                const range = max - min;
                
                const minPercent = ((minVal - min) / range) * 100;
                const maxPercent = ((maxVal - min) / range) * 100;
                
                // Set the min/max slider background to show selected range
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
        }
        
        // Create and setup the swarm color theme tooltips
        const themeContainer = document.querySelector('.color-presets-container');
        if (themeContainer) {
            // Add click handler
            themeContainer.addEventListener('click', function(e) {
                const themeBtn = e.target.closest('.color-preset');
                if (themeBtn) {
                    // Set all buttons to inactive
                    themeContainer.querySelectorAll('.color-preset').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Set clicked button to active
                    themeBtn.classList.add('active');
                    
                    // Show tooltip with theme name
                    const themeName = themeBtn.dataset.theme;
                    showThemeNameTooltip(themeName, themeBtn);
                    
                    // Set the color theme
                    if (ColorThemes && typeof ColorThemes.setTheme === 'function') {
                        ColorThemes.setTheme(themeName);
                    }
                }
            });
        }
        
        // Add direct touch handlers to each color theme button
        document.querySelectorAll('.color-preset').forEach(button => {
            button.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Get the container to update all buttons
                const container = this.closest('.color-presets-container') || this.parentElement;
                
                // Set all buttons to inactive
                if (container) {
                    container.querySelectorAll('.color-preset').forEach(btn => {
                        btn.classList.remove('active');
                    });
                }
                
                // Set this button to active
                this.classList.add('active');
                
                // Show tooltip with theme name
                const themeName = this.dataset.theme;
                showThemeNameTooltip(themeName, this);
                
                // Set the color theme
                if (ColorThemes && typeof ColorThemes.setTheme === 'function') {
                    ColorThemes.setTheme(themeName);
                }
                
                console.log('Color theme button touched:', themeName);
            }, { passive: false });
        });
        
        // Implementation of the showThemeNameTooltip function
        function showThemeNameTooltip(themeName, element) {
            // Remove any existing tooltips first
            const existingTooltips = document.querySelectorAll('.theme-name-tooltip');
            existingTooltips.forEach(tooltip => tooltip.remove());
            
            // Get the tooltip text from data-tooltip attribute or use the theme name
            const tooltipText = element.dataset.tooltip || themeName;
            
            // Create a new tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'theme-name-tooltip';
            tooltip.textContent = tooltipText;
            
            // Position the tooltip above the element
            const rect = element.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.left = rect.left + (rect.width / 2) + 'px';
            tooltip.style.top = rect.top - 25 + 'px';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.background = 'rgba(0, 0, 0, 0.7)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '4px 8px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '12px';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.zIndex = '1000';
            
            // Add to the document
            document.body.appendChild(tooltip);
            
            // Automatically remove the tooltip after 1.5 seconds
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 1500);
        }
        
        // Create Swarm button
        const createSwarmButton = document.getElementById('createSwarmButton');
        if (createSwarmButton) {
            createSwarmButton.addEventListener('click', function() {
                // Create a new swarm at center of canvas
                const config = getSwarmConfigFromUI();
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                
                // Add position to config
                config.centerX = centerX;
                config.centerY = centerY;
                
                // Create the swarm directly
                const swarmId = ParticleSystem.createZotSwarm(config);
                
                if (swarmId) {
                    // Update the swarm list
                    updateSwarmList();
                }
            });
        }
        
        // Clear Swarms button
        const clearSwarmsButton = document.getElementById('clearSwarmsButton');
        if (clearSwarmsButton) {
            clearSwarmsButton.addEventListener('click', function() {
                if (!this.classList.contains('disabled')) {
                    // Remove all zot swarms
                    ParticleSystem.removeAllZotSwarms();
                    // Update the swarm list
                    updateSwarmList();
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
            
            // HIDDEN: All slider values are hidden to protect IP
            valueDisplay.textContent = parseFloat(input.value).toFixed(precision);
            
            // Add event listeners for input changes
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                // HIDDEN: All slider values are hidden to protect IP
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
            // Set initial values display
            const minVal = parseFloat(minSlider.value);
            const maxVal = parseFloat(maxSlider.value);
            minValueDisplay.textContent = minVal.toFixed(1);
            maxValueDisplay.textContent = maxVal.toFixed(1);
            
            // Update values displays
            function updateValues() {
                const minVal = parseFloat(minSlider.value);
                const maxVal = parseFloat(maxSlider.value);
                
                // HIDDEN: All slider values are hidden to protect IP
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
    
    // Get configuration from the UI elements
    function getSwarmConfigFromUI() {
        const config = {};
        
        // Get zot count
        const zotCountSlider = document.getElementById('newSwarmZotCount');
        if (zotCountSlider) {
            config.zotCount = parseInt(zotCountSlider.value, 10);
        }
        
        // Get swarm preset
        const presetSelect = document.getElementById('swarmPreset');
        if (presetSelect && presetSelect.value) {
            config.presetName = presetSelect.value;
        }
        
        // Get color theme
        const activeThemeBtn = document.querySelector('#colorPresets .color-preset.active');
        if (activeThemeBtn) {
            config.colorTheme = activeThemeBtn.dataset.theme;
        } else {
            // Fallback to default theme
            config.colorTheme = 'rainbow';
        }
        
        // Get size range
        config.minSize = parseFloat(document.getElementById('newSwarmMinSize')?.value || 3);
        config.maxSize = parseFloat(document.getElementById('newSwarmMaxSize')?.value || 8);
        
        // Get other properties
        config.speed = parseFloat(document.getElementById('newSwarmSpeed')?.value || 2);
        config.separation = parseFloat(document.getElementById('newSwarmSeparation')?.value || 25);
        config.alignment = parseFloat(document.getElementById('newSwarmAlignment')?.value || 0.1);
        config.cohesion = parseFloat(document.getElementById('newSwarmCohesion')?.value || 0.1);
        config.perception = parseFloat(document.getElementById('newSwarmPerception')?.value || 50);
        
        return config;
    }
    
    // Function no longer needed since we removed confirm placement
    function updateCreateSwarmUI() {
        // This function is no longer needed
    }
    
    // Setup function to initialize UI just once 
    function setupSwarmManagementUI() {
        const removeButton = document.getElementById('removeSwarmBtn');
        if (removeButton && !removeButton.hasEventListener) {
            removeButton.addEventListener('click', function() {
                const swarmDropdown = document.getElementById('swarmList');
                const selectedSwarmId = swarmDropdown.value;
                if (selectedSwarmId) {
                    ParticleSystem.removeZotSwarm(selectedSwarmId);
                    updateSwarmList();
                }
            });
            removeButton.hasEventListener = true;
        }
    }
    
    // Update the list of active swarms
    function updateSwarmList() {
        const swarmDropdown = document.getElementById('swarmList');
        const removeButton = document.getElementById('removeSwarmBtn');
        const clearSwarmsButton = document.getElementById('clearSwarmsButton');
        
        if (!swarmDropdown || !removeButton) return;
        
        // Setup event handlers only once
        setupSwarmManagementUI();
        
        // Get the current swarms
        const swarms = ParticleSystem.getZotSwarms();
        
        // Clear the dropdown
        swarmDropdown.innerHTML = '';
        
        // Disable the remove button if no swarms
        if (swarms.length === 0) {
            const noSwarmsOption = document.createElement('option');
            noSwarmsOption.value = '';
            noSwarmsOption.textContent = 'No swarms created yet';
            swarmDropdown.appendChild(noSwarmsOption);
            
            removeButton.disabled = true;
            
            // Disable the clear swarms button
            if (clearSwarmsButton) {
                clearSwarmsButton.classList.add('disabled');
            }
            
            return;
        } else {
            removeButton.disabled = false;
            
            // Enable the clear swarms button
            if (clearSwarmsButton) {
                clearSwarmsButton.classList.remove('disabled');
            }
        }
        
        // Add each swarm to the dropdown
        swarms.forEach(swarm => {
            const option = document.createElement('option');
            option.value = swarm.id;
            const colorThemeName = Presets.colorThemes[swarm.settings.colorTheme]?.name || 'Custom';
            const presetDisplayName = Presets.swarmPresets[swarm.settings.presetName]?.name || 'Custom';
            option.textContent = `${presetDisplayName} ${colorThemeName} (${swarm.zotCount})`;
            swarmDropdown.appendChild(option);
        });
    }
    
    // Update all UI values to match current settings
    function updateAllUIValues() {
        // Set Orbie parameter values
        document.getElementById('orbieSize').value = ParticleSystem.getOrbieSettings().size || 12;
        // HIDDEN: All slider values are hidden to protect IP
        // document.getElementById('orbieSizeValue').textContent = parseFloat(document.getElementById('orbieSize').value).toFixed(1);
        
        document.getElementById('orbieGlowSize').value = ParticleSystem.getOrbieSettings().glowSize || 1.5;
        // document.getElementById('orbieGlowSizeValue').textContent = parseFloat(document.getElementById('orbieGlowSize').value).toFixed(1);
        
        document.getElementById('orbieGlowOpacity').value = ParticleSystem.getOrbieSettings().glowOpacity || 0.2;
        // document.getElementById('orbieGlowOpacityValue').textContent = parseFloat(document.getElementById('orbieGlowOpacity').value).toFixed(2);
        
        document.getElementById('orbiePulseSpeed').value = ParticleSystem.getOrbieSettings().pulseSpeed || 0.05;
        // document.getElementById('orbiePulseSpeedValue').textContent = parseFloat(document.getElementById('orbiePulseSpeed').value).toFixed(2);
        
        document.getElementById('orbiePulseIntensity').value = ParticleSystem.getOrbieSettings().pulseIntensity || 0.4;
        // document.getElementById('orbiePulseIntensityValue').textContent = parseFloat(document.getElementById('orbiePulseIntensity').value).toFixed(2);
        
        document.getElementById('orbieInfluenceRadius').value = ParticleSystem.getOrbieSettings().influenceRadius || 100;
        // document.getElementById('orbieInfluenceRadiusValue').textContent = parseFloat(document.getElementById('orbieInfluenceRadius').value).toFixed(0);
        
        document.getElementById('orbieInfluenceIntensity').value = ParticleSystem.getOrbieSettings().influenceIntensity || 0.5;
        // document.getElementById('orbieInfluenceIntensityValue').textContent = parseFloat(document.getElementById('orbieInfluenceIntensity').value).toFixed(2);
        
        document.getElementById('orbieTouchMultiplier').value = ParticleSystem.getOrbieSettings().touchMultiplier || 0.15;
        // document.getElementById('orbieTouchMultiplierValue').textContent = parseFloat(document.getElementById('orbieTouchMultiplier').value).toFixed(2);
        
        // Set OrbieSwarm parameter values
        // ... (existing code)
        
        // Set Forces parameter values
        document.getElementById('touchForce').value = ParticleSystem.getForceSettingValue('touchForce') || 3;
        // document.getElementById('touchForceValue').textContent = parseFloat(document.getElementById('touchForce').value).toFixed(1);
        
        document.getElementById('wallForce').value = ParticleSystem.getForceSettingValue('wallForce') || 1;
        // document.getElementById('wallForceValue').textContent = parseFloat(document.getElementById('wallForce').value).toFixed(1);
        
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
        
        // No need for updateCreateSwarmUI call anymore
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
        
        // Setup wall SVG dropdown
        const wallSVGSelector = document.getElementById('wallSVG');
        if (wallSVGSelector) {
            wallSVGSelector.addEventListener('change', function() {
                if (this.value) {
                    // Load the selected SVG file
                    fetch(this.value)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.text();
                        })
                        .then(svgText => {
                            const wallCount = WallSystem.loadFromSVG(svgText);
                            console.log(`Loaded ${wallCount} wall segments from SVG`);
                        })
                        .catch(error => {
                            console.error('Error loading SVG file:', error);
                        });
                }
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

    // Initialize SubmitSwarms module
    if (typeof SubmitSwarms !== 'undefined' && SubmitSwarms.init) {
        SubmitSwarms.init();
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

// Helper function to handle input events on sliders
function updateSliderValue(input, valueDisplay, precision = 1) {
    // Don't update text content for sliders since we've hidden them to protect IP
    // valueDisplay.textContent = parseFloat(input.value).toFixed(precision);
}

// Event handler for slider input events
function handleSliderInput(event, precision = 1) {
    const value = parseFloat(this.value);
    const valueDisplay = document.getElementById(this.id + 'Value');
    if (valueDisplay) {
        // Don't update text content for sliders since we've hidden them to protect IP
        // valueDisplay.textContent = value.toFixed(precision);
    }
}