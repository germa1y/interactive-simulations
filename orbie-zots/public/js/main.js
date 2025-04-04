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
    
    // Initialize zot-centric mobility system
    if (typeof ZotCentricMobility !== 'undefined') {
        console.log("Initializing ZotCentricMobility...");
        ZotCentricMobility.init({
            particleSystem: ParticleSystem,
            wallSystem: WallSystem,
            canvas: canvas
        });
    } else {
        console.error("ZotCentricMobility module not available");
    }
    
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
                    /*
                    document.getElementById('newSwarmZotCountValue').textContent = randomConfig.zotCount;
                    document.getElementById('newSwarmSpeedValue').textContent = randomConfig.speed.toFixed(1);
                    document.getElementById('newSwarmSeparationValue').textContent = randomConfig.separation.toFixed(1);
                    document.getElementById('newSwarmAlignmentValue').textContent = randomConfig.alignment.toFixed(2);
                    document.getElementById('newSwarmCohesionValue').textContent = randomConfig.cohesion.toFixed(1);
                    document.getElementById('newSwarmPerceptionValue').textContent = randomConfig.perception;
                    document.getElementById('newSwarmMinSizeValue').textContent = minSize.toFixed(1);
                    document.getElementById('newSwarmMaxSizeValue').textContent = maxSize.toFixed(1);
                    */
                    
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
                    
                    // Trigger input events to update the displayed values
                    updateSliderValueDisplay('newSwarmSpeed');
                    updateSliderValueDisplay('newSwarmSeparation');
                    updateSliderValueDisplay('newSwarmAlignment');
                    updateSliderValueDisplay('newSwarmCohesion');
                    updateSliderValueDisplay('newSwarmPerception');
                    
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
        
        // Helper function to update slider value display by triggering the input event
        function updateSliderValueDisplay(sliderId) {
            const slider = document.getElementById(sliderId);
            if (slider) {
                // Create and dispatch an input event to update the displayed value
                const event = new Event('input', { bubbles: true });
                slider.dispatchEvent(event);
            }
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
            // Force a layout reflow to fix initial thumb position
            // This addresses the issue with sliders that have modified min/max values
            input.style.visibility = 'hidden';
            
            // Set initial value
            const shouldRound = input.step === '1' || parseFloat(input.step) === 1;
            const precision = shouldRound ? 0 : 
                             input.step.includes('.01') ? 2 : 1;
            
            // HIDDEN: All slider values are hidden to protect IP
            // valueDisplay.textContent = parseFloat(input.value).toFixed(precision);
            
            // Add increment/decrement buttons
            const container = input.closest('.slider-overlay-container');
            if (container) {
                // Remove any existing buttons first to avoid duplicates
                const existingButtons = container.querySelectorAll('.slider-button');
                existingButtons.forEach(button => button.remove());
                
                // Add decrease button (-)
                const decreaseBtn = document.createElement('div');
                decreaseBtn.className = 'slider-button decrease';
                decreaseBtn.textContent = '-';
                decreaseBtn.setAttribute('role', 'button');
                decreaseBtn.setAttribute('aria-label', 'Decrease value');
                decreaseBtn.style.zIndex = '9999'; // Extreme z-index
                decreaseBtn.style.boxShadow = '0 0 15px 5px rgba(255, 87, 34, 0.9)'; // Stronger glow
                decreaseBtn.style.color = 'white';
                
                // Add increase button (+)
                const increaseBtn = document.createElement('div');
                increaseBtn.className = 'slider-button increase';
                increaseBtn.textContent = '+';
                increaseBtn.setAttribute('role', 'button');
                increaseBtn.setAttribute('aria-label', 'Increase value');
                increaseBtn.style.zIndex = '9999'; // Extreme z-index
                increaseBtn.style.boxShadow = '0 0 15px 5px rgba(255, 87, 34, 0.9)'; // Stronger glow
                increaseBtn.style.color = 'white';
                
                // Add event listeners for the buttons
                decreaseBtn.addEventListener('click', function() {
                    const step = parseFloat(input.step) || 1;
                    const min = parseFloat(input.min);
                    const newValue = Math.max(min, parseFloat(input.value) - step);
                    input.value = newValue;
                    
                    // Trigger input event to update the value display and call the callback
                    const event = new Event('input', { bubbles: true });
                    input.dispatchEvent(event);
                });
                
                increaseBtn.addEventListener('click', function() {
                    const step = parseFloat(input.step) || 1;
                    const max = parseFloat(input.max);
                    const newValue = Math.min(max, parseFloat(input.value) + step);
                    input.value = newValue;
                    
                    // Trigger input event to update the value display and call the callback
                    const event = new Event('input', { bubbles: true });
                    input.dispatchEvent(event);
                });
                
                // Add the buttons to the container
                container.appendChild(decreaseBtn);
                container.appendChild(increaseBtn);
                
                // Force layout to ensure buttons are rendered
                void container.offsetWidth;
            }
            
            // Trigger browser reflow and reset visibility
            void input.offsetWidth;
            input.style.visibility = 'visible';
            
            // Add event listeners for input changes
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                // HIDDEN: All slider values are hidden to protect IP
                // valueDisplay.textContent = value.toFixed(precision);
                
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
            // Track which thumb is selected (min or max)
            let activeThumb = null;
            let decreaseBtn = null;
            let increaseBtn = null;
            
            // Add increment/decrement buttons for min slider container
            const sliderContainer = minSlider.closest('.range-slider-container');
            if (sliderContainer) {
                // Remove any existing buttons first to avoid duplicates
                const existingButtons = sliderContainer.querySelectorAll('.slider-button');
                existingButtons.forEach(button => button.remove());
                
                // Add decrease button (-)
                decreaseBtn = document.createElement('div');
                decreaseBtn.className = 'slider-button decrease';
                decreaseBtn.textContent = '-';
                decreaseBtn.setAttribute('role', 'button');
                decreaseBtn.setAttribute('aria-label', 'Decrease value');
                decreaseBtn.style.zIndex = '9999'; // Extreme z-index
                decreaseBtn.style.boxShadow = '0 0 15px 5px rgba(255, 87, 34, 0.9)'; // Stronger glow
                decreaseBtn.style.color = 'white';
                
                // Add increase button (+)
                increaseBtn = document.createElement('div');
                increaseBtn.className = 'slider-button increase';
                increaseBtn.textContent = '+';
                increaseBtn.setAttribute('role', 'button');
                increaseBtn.setAttribute('aria-label', 'Increase value');
                increaseBtn.style.zIndex = '9999'; // Extreme z-index
                increaseBtn.style.boxShadow = '0 0 15px 5px rgba(255, 87, 34, 0.9)'; // Stronger glow
                increaseBtn.style.color = 'white';
                
                // Add the buttons to the container
                sliderContainer.appendChild(decreaseBtn);
                sliderContainer.appendChild(increaseBtn);
                
                // Force layout to ensure buttons are rendered
                void sliderContainer.offsetWidth;
                
                console.log("Dual slider buttons created:", decreaseBtn, increaseBtn);
            }
            
            // Function to set the active thumb
            function setActiveThumb(slider) {
                // Remove active class from both sliders
                minSlider.classList.remove('active');
                maxSlider.classList.remove('active');
                
                // Add active class to the selected slider
                slider.classList.add('active');
                
                // Update active thumb reference
                activeThumb = slider;
                
                // Enable both buttons
                if (decreaseBtn && increaseBtn) {
                    decreaseBtn.classList.remove('disabled');
                    increaseBtn.classList.remove('disabled');
                }
            }
            
            // Function to reset selection state
            function resetSelection() {
                // Remove active class from both sliders
                minSlider.classList.remove('active');
                maxSlider.classList.remove('active');
                
                // Disable buttons
                if (decreaseBtn && increaseBtn) {
                    decreaseBtn.classList.add('disabled');
                    increaseBtn.classList.add('disabled');
                }
                
                activeThumb = null;
            }
            
            // Add event listeners for button clicks
            if (decreaseBtn) {
                decreaseBtn.addEventListener('click', function() {
                    if (this.classList.contains('disabled') || !activeThumb) return;
                    
                    const step = parseFloat(activeThumb.step) || 1;
                    const min = parseFloat(activeThumb.min);
                    const newValue = Math.max(min, parseFloat(activeThumb.value) - step);
                    activeThumb.value = newValue;
                    
                    // If adjusting min thumb, ensure max is not smaller
                    if (activeThumb === minSlider) {
                        const maxVal = parseFloat(maxSlider.value);
                        if (newValue > maxVal) {
                            maxSlider.value = newValue;
                        }
                    }
                    // If adjusting max thumb, ensure min is not larger
                    else if (activeThumb === maxSlider) {
                        const minVal = parseFloat(minSlider.value);
                        if (newValue < minVal) {
                            minSlider.value = newValue;
                        }
                    }
                    
                    // Update values and visual state
                    updateValues();
                });
            }
            
            if (increaseBtn) {
                increaseBtn.addEventListener('click', function() {
                    if (this.classList.contains('disabled') || !activeThumb) return;
                    
                    const step = parseFloat(activeThumb.step) || 1;
                    const max = parseFloat(activeThumb.max);
                    const newValue = Math.min(max, parseFloat(activeThumb.value) + step);
                    activeThumb.value = newValue;
                    
                    // If adjusting min thumb, ensure max is not smaller
                    if (activeThumb === minSlider) {
                        const maxVal = parseFloat(maxSlider.value);
                        if (newValue > maxVal) {
                            maxSlider.value = newValue;
                        }
                    }
                    // If adjusting max thumb, ensure min is not larger
                    else if (activeThumb === maxSlider) {
                        const minVal = parseFloat(minSlider.value);
                        if (newValue < minVal) {
                            minSlider.value = newValue;
                        }
                    }
                    
                    // Update values and visual state
                    updateValues();
                });
            }
            
            // Add thumb selection events
            minSlider.addEventListener('mousedown', function() {
                setActiveThumb(minSlider);
            });
            
            maxSlider.addEventListener('mousedown', function() {
                setActiveThumb(maxSlider);
            });
            
            // Touch events for mobile
            minSlider.addEventListener('touchstart', function() {
                setActiveThumb(minSlider);
            }, { passive: true });
            
            maxSlider.addEventListener('touchstart', function() {
                setActiveThumb(maxSlider);
            }, { passive: true });
            
            // Reset selection when clicking outside
            document.addEventListener('click', function(e) {
                // If click is not on a slider or the buttons, reset selection
                if (!e.target.closest('.range-slider-container') || 
                    (e.target !== minSlider && 
                     e.target !== maxSlider && 
                     e.target !== decreaseBtn && 
                     e.target !== increaseBtn)) {
                    resetSelection();
                }
            });
            
            // Update values displays
            function updateValues() {
                const minVal = parseFloat(minSlider.value);
                const maxVal = parseFloat(maxSlider.value);
                
                // HIDDEN: All slider values are hidden to protect IP
                // minValueDisplay.textContent = minVal.toFixed(1);
                // maxValueDisplay.textContent = maxVal.toFixed(1);
                
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
    
    // Update the list of active swarms
    function updateSwarmList(selectMostRecent = true) {
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
        
        // Select the most recently created swarm (last in the array) only when requested
        if (selectMostRecent && swarms.length > 0) {
            const mostRecentSwarm = swarms[swarms.length - 1];
            swarmDropdown.value = mostRecentSwarm.id;
        }
    }
    
    // Setup function to initialize UI just once 
    function setupSwarmManagementUI() {
        const removeButton = document.getElementById('removeSwarmBtn');
        if (removeButton && !removeButton.hasEventListener) {
            removeButton.addEventListener('click', function() {
                const swarmDropdown = document.getElementById('swarmList');
                const selectedSwarmId = swarmDropdown.value;
                if (selectedSwarmId) {
                    // Store current index before removal
                    const swarms = ParticleSystem.getZotSwarms();
                    const currentIndex = swarms.findIndex(swarm => swarm.id === selectedSwarmId);
                    
                    // Remove the swarm
                    ParticleSystem.removeZotSwarm(selectedSwarmId);
                    
                    // Update the dropdown without auto-selecting the most recent swarm
                    updateSwarmList(false);
                    
                    // Get updated swarms list
                    const updatedSwarms = ParticleSystem.getZotSwarms();
                    
                    // If we have swarms left, select the next one by index
                    if (updatedSwarms.length > 0) {
                        // Calculate next index, but don't exceed array bounds
                        const nextIndex = Math.min(currentIndex, updatedSwarms.length - 1);
                        // Select the swarm at the calculated index
                        swarmDropdown.value = updatedSwarms[nextIndex].id;
                    }
                }
            });
            removeButton.hasEventListener = true;
        }
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
        
        // Setup joystick controls
        setupJoystickControls();
        
        // Function to create jellyorb preset swarm
        function createJellyorbSwarm() {
            const config = {
                zotCount: 200,
                speed: 2,
                separation: 0.5,
                alignment: 0.3,
                cohesion: 0.8,
                perception: 100,
                minSize: 2,
                maxSize: 4,
                colorTheme: 'jellyorb',
                presetName: 'jellyorb'
            };
            
            // Create the swarm at the center of the canvas
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Add position to config
            config.centerX = centerX;
            config.centerY = centerY;
            
            // Create the swarm
            const swarmId = ParticleSystem.createZotSwarm(config);
            
            if (swarmId) {
                console.log('Created jellyorb swarm with ID:', swarmId);
                updateSwarmList();
            }
        }
        
        // Function to show joystick controls after map loading
        function showJoystickControls() {
            const joystickControls = document.getElementById('joystickControls');
            if (joystickControls) {
                joystickControls.style.display = 'block';
                
                // Switch to Walls tab to make the joystick controls visible
                const paramGroupSelect = document.getElementById('paramGroup');
                if (paramGroupSelect) {
                    paramGroupSelect.value = 'walls';
                    
                    // Trigger change event to update the displayed panel
                    const event = new Event('change');
                    paramGroupSelect.dispatchEvent(event);
                }
            }
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
                            
                            // Create jellyorb swarm after loading the map
                            createJellyorbSwarm();
                            
                            // Show the joystick controls
                            showJoystickControls();
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
                            
                            // Create jellyorb swarm after loading the map
                            createJellyorbSwarm();
                            
                            // Show the joystick controls
                            showJoystickControls();
                        };
                        
                        reader.readAsText(file);
                    }
                    
                    // Clean up
                    document.body.removeChild(fileInput);
                });
                
                fileInput.click();
            });
        }
        
        // Add Load Local Map button
        const wallControlsContainer = document.getElementById('wallsParams');
        if (wallControlsContainer) {
            // Create the Load Local Map button
            const loadLocalMapButton = document.createElement('button');
            loadLocalMapButton.id = 'loadLocalMapButton';
            loadLocalMapButton.className = 'control-button';
            loadLocalMapButton.textContent = 'Load Local Map';
            
            // Insert the button before the clearWallsButton if it exists
            const clearWallsButton = document.getElementById('clearWallsButton');
            if (clearWallsButton) {
                clearWallsButton.parentNode.insertBefore(loadLocalMapButton, clearWallsButton);
            } else {
                wallControlsContainer.appendChild(loadLocalMapButton);
            }
            
            // Add event listener for the Load Local Map button
            loadLocalMapButton.addEventListener('click', function() {
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
                            
                            // Create jellyorb swarm after loading the map
                            createJellyorbSwarm();
                            
                            // Show the joystick controls
                            showJoystickControls();
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
                
                // Hide joystick controls when walls are cleared
                const joystickControls = document.getElementById('joystickControls');
                if (joystickControls) {
                    joystickControls.style.display = 'none';
                }
            });
        }
    }
    
    // Setup joystick controls
    function setupJoystickControls() {
        if (typeof ZotCentricMobility === 'undefined') {
            console.error("ZotCentricMobility system not available for joystick controls");
            return;
        }
        
        // Setup sliders for different joystick parameters
        setupRangeInput('deadZonePercent', function(value) {
            ZotCentricMobility.updateSettings('deadZonePercent', value);
            // Update the display value to show as percentage
            const valueDisplay = document.getElementById('deadZonePercentValue');
            if (valueDisplay) {
                valueDisplay.textContent = `${Math.round(value * 100)}%`;
            }
        });
        
        setupRangeInput('responseCurvePower', function(value) {
            ZotCentricMobility.updateSettings('responseCurvePower', value);
        });
        
        setupRangeInput('maxSteeringForce', function(value) {
            ZotCentricMobility.updateSettings('maxSteeringForce', value);
        });
        
        setupRangeInput('maxCenteringForce', function(value) {
            ZotCentricMobility.updateSettings('maxCenteringForce', value);
            // Also update min centering force to be proportional
            ZotCentricMobility.updateSettings('minCenteringForce', value / 3);
        });
        
        setupRangeInput('smoothingFactor', function(value) {
            ZotCentricMobility.updateSettings('smoothingFactor', value);
        });
        
        setupRangeInput('swarmCenterAttraction', function(value) {
            ZotCentricMobility.updateSettings('swarmCenterAttraction', value);
        });
        
        // Set initial values from ZotCentricMobility
        updateJoystickControlsFromSystem();
    }
    
    // Update joystick control values from the current system settings
    function updateJoystickControlsFromSystem() {
        if (typeof ZotCentricMobility === 'undefined' || !ZotCentricMobility.getSettings) {
            return;
        }
        
        const settings = ZotCentricMobility.getSettings();
        
        // Update slider values
        for (const [key, value] of Object.entries(settings)) {
            const slider = document.getElementById(key);
            if (slider) {
                slider.value = value;
                
                // Update display value
                const valueDisplay = document.getElementById(key + 'Value');
                if (valueDisplay) {
                    if (key === 'deadZonePercent') {
                        valueDisplay.textContent = `${Math.round(value * 100)}%`;
                    } else {
                        valueDisplay.textContent = value.toFixed(value < 1 ? 2 : 1);
                    }
                }
            }
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

// Update the animation loop to include ZotCentricMobility updates
function updateAnimationLoop() {
    // Check if ParticleSystem has an update override function for animation
    if (typeof ParticleSystem !== 'undefined' && ParticleSystem.hasOwnProperty('updateAnimation')) {
        // First update ZotCentricMobility if available
        if (typeof ZotCentricMobility !== 'undefined') {
            ZotCentricMobility.update();
        }
        
        // Then update the particle system
        requestAnimationFrame(ParticleSystem.updateAnimation);
    } else {
        console.error("ParticleSystem updateAnimation method not found");
    }
}