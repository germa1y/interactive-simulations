// submitSwarms.js - Handle zot swarm submission and loading

const SubmitSwarms = (function() {
    // Track popup state
    let isPopupOpen = false;
    let popupOverlay = null;
    let popupContainer = null;
    let fileInput = null; // Reference to hidden file input element
    
    // Initialize the submit button in the UI
    function init() {
        // Find the button group container
        const buttonGroup = document.querySelector('#zotSwarmsParams .button-group');
        if (!buttonGroup) return;
        
        // Create the submit button
        const submitButton = document.createElement('button');
        submitButton.id = 'submitSwarmsButton';
        submitButton.textContent = 'Save';
        submitButton.className = 'submit-swarms-btn';
        
        // Insert below the button group (not between Create and Clear)
        const parentContainer = buttonGroup.parentElement;
        if (parentContainer) {
            // Create a new div for the save/load buttons that spans the width
            const saveButtonContainer = document.createElement('div');
            saveButtonContainer.className = 'save-button-container';
            saveButtonContainer.style.marginTop = '15px';
            saveButtonContainer.style.display = 'flex';
            saveButtonContainer.style.justifyContent = 'center';
            saveButtonContainer.style.flexDirection = 'column';
            saveButtonContainer.style.gap = '10px';
            
            // Add the save button
            saveButtonContainer.appendChild(submitButton);
            
            // Create load button
            const loadButton = document.createElement('button');
            loadButton.id = 'loadSwarmsButton';
            loadButton.textContent = 'Load';
            loadButton.className = 'load-swarms-btn';
            saveButtonContainer.appendChild(loadButton);
            
            // Create hidden file input for loading
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            fileInput.id = 'swarmFileInput';
            saveButtonContainer.appendChild(fileInput);
            
            // Insert below the button group
            parentContainer.insertBefore(saveButtonContainer, buttonGroup.nextSibling);
        }
        
        // Add click event to the submit button
        submitButton.addEventListener('click', showSubmitPopup);
        
        // Add click event to the load button
        const loadButton = document.getElementById('loadSwarmsButton');
        if (loadButton) {
            loadButton.addEventListener('click', () => {
                // Trigger the file input dialog
                if (fileInput) {
                    fileInput.click();
                }
            });
        }
        
        // Add change event to file input
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }
        
        // Create and add styles for the popup
        addPopupStyles();
    }
    
    // Add CSS styles for the popup
    function addPopupStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .popup-container {
                background: #333;
                border-radius: 8px;
                padding: 20px;
                width: 300px;
                max-width: 90%;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                position: relative;
                color: white;
            }
            
            .popup-title {
                margin-top: 0;
                font-size: 18px;
                border-bottom: 1px solid #444;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            
            .popup-content {
                margin-bottom: 20px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #ddd;
            }
            
            .form-group input, .form-group textarea {
                width: 100%;
                padding: 8px;
                border-radius: 4px;
                border: 1px solid #555;
                background-color: #444;
                color: white;
                font-family: inherit;
            }
            
            .form-group input:focus, .form-group textarea:focus {
                outline: none;
                border-color: #2196F3;
            }
            
            .submission-note {
                margin-top: 15px;
                padding: 10px;
                background-color: rgba(33, 150, 243, 0.1);
                border-left: 3px solid #2196F3;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .submission-note p {
                margin: 0;
                color: #bbb;
            }
            
            .popup-buttons {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .popup-button {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.2s;
            }
            
            .popup-button.submit {
                background-color: #4CAF50;
                color: white;
            }
            
            .popup-button.submit:hover {
                background-color: #388E3C;
            }
            
            .popup-button.cancel {
                background-color: #9e9e9e;
                color: white;
            }
            
            .popup-button.cancel:hover {
                background-color: #757575;
            }
            
            .submit-swarms-btn {
                background-color: #4CAF50;
                color: white;
                width: 100%;
                padding: 10px;
                font-weight: bold;
            }
            
            .submit-swarms-btn:hover {
                background-color: #388E3C;
            }
            
            .load-swarms-btn {
                background-color: #2196F3;
                color: white;
                width: 100%;
                padding: 10px;
                font-weight: bold;
            }
            
            .load-swarms-btn:hover {
                background-color: #0b7dda;
            }
            
            .error-message {
                color: #ff6b6b;
                margin-top: 10px;
                font-size: 14px;
            }
            
            .success-message {
                color: #4CAF50;
                margin-top: 10px;
                font-size: 14px;
            }
            
            .save-button-container {
                width: 100%;
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    // Handle file selection for loading
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                loadZotSwarms(data);
                // Reset file input so the same file can be selected again
                fileInput.value = '';
            } catch (error) {
                console.error('[LOAD] Error parsing JSON file:', error);
                showLoadError('Error parsing file. Please select a valid JSON file.');
                fileInput.value = '';
            }
        };
        
        reader.onerror = function() {
            console.error('[LOAD] Error reading file');
            showLoadError('Error reading file. Please try again.');
            fileInput.value = '';
        };
        
        reader.readAsText(file);
    }
    
    // Show error message for load operation
    function showLoadError(message) {
        // Create a popup for the error
        showLoadPopup('Load Error', message, 'error');
    }
    
    // Show success message for load operation
    function showLoadSuccess(message) {
        // Create a popup for the success message
        showLoadPopup('Load Successful', message, 'success');
    }
    
    // Show a popup for load operations
    function showLoadPopup(title, message, type) {
        if (isPopupOpen) closePopup();
        
        // Create overlay
        popupOverlay = document.createElement('div');
        popupOverlay.className = 'popup-overlay';
        
        // Create popup container
        popupContainer = document.createElement('div');
        popupContainer.className = 'popup-container';
        
        // Determine message class based on type
        const messageClass = type === 'error' ? 'error-message' : 'success-message';
        
        // Popup content
        popupContainer.innerHTML = `
            <h3 class="popup-title">${title}</h3>
            <div class="popup-content">
                <div class="${messageClass}">${message}</div>
            </div>
            <div class="popup-buttons">
                <button class="popup-button cancel">Close</button>
            </div>
        `;
        
        // Add to DOM
        popupOverlay.appendChild(popupContainer);
        document.body.appendChild(popupOverlay);
        
        // Set state
        isPopupOpen = true;
        
        // Add event listeners
        const closeBtn = popupContainer.querySelector('.popup-button.cancel');
        closeBtn.addEventListener('click', closePopup);
        
        // Auto-close success messages after 3 seconds
        if (type === 'success') {
            setTimeout(closePopup, 3000);
        }
    }
    
    // Load zot swarms from saved data
    function loadZotSwarms(data) {
        try {
            console.log('[LOAD] Loading swarm data:', data);
            
            if (!data || !data.swarms || !Array.isArray(data.swarms) || data.swarms.length === 0) {
                showLoadError('Invalid data format or no swarms found in file.');
                return false;
            }
            
            // Check if ParticleSystem is available
            if (typeof ParticleSystem === 'undefined' || !ParticleSystem.removeAllZotSwarms || !ParticleSystem.createZotSwarm) {
                showLoadError('ParticleSystem not available for loading swarms.');
                return false;
            }
            
            // Clear existing swarms first
            ParticleSystem.removeAllZotSwarms();
            
            // Apply global settings if available
            if (data.globalSettings) {
                if (data.globalSettings.forces && typeof ParticleSystem.updateForceSettings === 'function') {
                    Object.entries(data.globalSettings.forces).forEach(([key, value]) => {
                        ParticleSystem.updateForceSettings(key, value);
                    });
                }
                
                if (data.globalSettings.swipe && typeof SwipeSplitSystem !== 'undefined') {
                    // Apply swipe settings if SwipeSplitSystem has an update method
                    if (typeof SwipeSplitSystem.updateSetting === 'function') {
                        Object.entries(data.globalSettings.swipe).forEach(([key, value]) => {
                            if (key !== 'pathCount') { // Skip non-setting properties
                                SwipeSplitSystem.updateSetting(key, value);
                            }
                        });
                    }
                }
            }
            
            // Recreate each swarm
            const loadedSwarms = [];
            data.swarms.forEach(swarm => {
                // Ensure we have valid settings
                if (!swarm.settings) {
                    console.warn('[LOAD] Skipping swarm with missing settings:', swarm);
                    return;
                }
                
                // Calculate center position if not present
                const config = {
                    ...swarm.settings,
                    centerX: window.innerWidth / 2,  // Default center position
                    centerY: window.innerHeight / 2
                };
                
                // Create the swarm with the saved configuration
                const swarmId = ParticleSystem.createZotSwarm(config);
                if (swarmId) {
                    loadedSwarms.push(swarmId);
                }
            });
            
            // Update UI to show swarms if needed
            if (typeof updateSwarmList === 'function') {
                updateSwarmList();
            }
            
            // Show success message
            showLoadSuccess(`Successfully loaded ${loadedSwarms.length} swarm${loadedSwarms.length !== 1 ? 's' : ''}.`);
            
            return true;
        } catch (error) {
            console.error('[LOAD] Error loading swarms:', error);
            showLoadError(`Error loading swarms: ${error.message}`);
            return false;
        }
    }
    
    // Show the submit popup
    function showSubmitPopup() {
        if (isPopupOpen) return;
        
        // Create overlay
        popupOverlay = document.createElement('div');
        popupOverlay.className = 'popup-overlay';
        
        // Create popup container
        popupContainer = document.createElement('div');
        popupContainer.className = 'popup-container';
        popupContainer.style.width = '400px'; // Make wider for the input fields
        
        // Popup content
        popupContainer.innerHTML = `
            <h3 class="popup-title">Save Zots</h3>
            <div class="popup-content">
                <div class="form-group">
                    <label for="presetName">Preset Name (optional):</label>
                    <input type="text" id="presetName" placeholder="Give your creation a name">
                </div>
                <div class="form-group">
                    <label for="presetDescription">Description (optional):</label>
                    <textarea id="presetDescription" placeholder="Tell us about your swarm or any feedback" rows="3"></textarea>
                </div>
                <div class="submission-note">
                    <p>Your preset might be featured in the app or even the demo for everyone to enjoy! 
                    Share your incredible creations with the community. Be sure to tag me on TikTok @germa1y #zoticles #zotswarms</p>
                </div>
            </div>
            <div id="submitError" class="error-message" style="display: none;"></div>
            <div class="popup-buttons">
                <button class="popup-button submit">Save</button>
                <button class="popup-button cancel">Cancel</button>
            </div>
        `;
        
        // Add to DOM
        popupOverlay.appendChild(popupContainer);
        document.body.appendChild(popupOverlay);
        
        // Set state
        isPopupOpen = true;
        
        // Add event listeners
        const submitBtn = popupContainer.querySelector('.popup-button.submit');
        const cancelBtn = popupContainer.querySelector('.popup-button.cancel');
        const errorElement = popupContainer.querySelector('#submitError');
        
        submitBtn.addEventListener('click', function() {
            console.log('[SAVE] Save button clicked');
            
            // Get preset name and description
            const presetName = document.getElementById('presetName').value.trim();
            const presetDescription = document.getElementById('presetDescription').value.trim();
            
            // Validate if there are particles on screen
            if (typeof ParticleSystem !== 'undefined' && ParticleSystem.getZotSwarms) {
                console.log('[SAVE] ParticleSystem is available');
                
                const swarms = ParticleSystem.getZotSwarms();
                console.log(`[SAVE] Found ${swarms ? swarms.length : 0} swarms`);
                
                if (!swarms || swarms.length === 0) {
                    // Show error message if no particles
                    console.error('[SAVE] No swarms found');
                    errorElement.textContent = "No zot swarms found! Please create at least one swarm.";
                    errorElement.style.display = "block";
                    return;
                }
                
                // Try to save the data, but we'll show an error if it fails
                try {
                    // Create and save the JSON file
                    const result = saveZotSwarms(swarms);
                    
                    // Show success or error message
                    if (result) {
                        closePopup();
                    } else {
                        errorElement.innerHTML = "Browser security prevents saving directly.<br>Check the browser console (F12) for more details.";
                        errorElement.style.display = "block";
                        
                        // Don't close the popup so user can see the error
                        submitBtn.disabled = true;
                        submitBtn.textContent = "Error";
                    }
                } catch (error) {
                    console.error('[SAVE] Error during save:', error);
                    errorElement.textContent = "An error occurred: " + error.message;
                    errorElement.style.display = "block";
                }
            } else {
                console.error('[SAVE] ParticleSystem not available');
                errorElement.textContent = "Error: ParticleSystem not available.";
                errorElement.style.display = "block";
            }
        });
        
        cancelBtn.addEventListener('click', closePopup);
        
        // Stop propagation of clicks inside the popup
        popupContainer.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // Clicking outside the popup should not close it (events are blocked)
        popupOverlay.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Save zot swarms data as JSON file
    function saveZotSwarms(swarms) {
        try {
            // Get preset name and description from DOM elements
            const presetName = document.getElementById('presetName')?.value.trim() || '';
            const presetDescription = document.getElementById('presetDescription')?.value.trim() || '';
            
            // Collect global force settings from ParticleSystem
            const forceSettings = {};
            
            // Try to get all force-related parameters (if these methods exist)
            if (typeof ParticleSystem.getForceSettings === 'function') {
                Object.assign(forceSettings, ParticleSystem.getForceSettings());
            } else {
                // Fallback to collecting individual settings
                if (typeof ParticleSystem.getForceSettingValue === 'function') {
                    forceSettings.touchForce = ParticleSystem.getForceSettingValue('touchForce');
                    forceSettings.wallForce = ParticleSystem.getForceSettingValue('wallForce');
                    forceSettings.zotTouchEnabled = ParticleSystem.getForceSettingValue('zotTouchEnabled');
                    forceSettings.zotSwarmInteractionEnabled = ParticleSystem.getForceSettingValue('zotSwarmInteractionEnabled');
                }
            }
            
            // Wall forces removed as they're inconsequential for saving purposes
            
            // Get swipe force settings if available
            const swipeSettings = {};
            if (typeof SwipeSplitSystem !== 'undefined' && typeof SwipeSplitSystem.getSettings === 'function') {
                Object.assign(swipeSettings, SwipeSplitSystem.getSettings());
            }

            // Create data object with swarm settings and metadata
            const data = {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                presetName: presetName,
                description: presetDescription,
                screenSize: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                // Include all global settings that affect swarm behavior
                globalSettings: {
                    forces: forceSettings,
                    // walls removed as they're inconsequential for saving
                    swipe: swipeSettings
                },
                swarms: swarms.map(swarm => ({
                    id: swarm.id,
                    zotCount: swarm.zotCount,
                    // Include full settings object to ensure all parameters are saved
                    settings: swarm.settings
                    // Individual particle data removed as it's not necessary
                }))
            };
            
            // Convert to JSON string
            const jsonString = JSON.stringify(data, null, 2);
            
            // Create a Blob with the JSON data
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // Create a unique timestamp filename (no underscores or spaces)
            const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '');
            const filename = `preset${timestamp}.json`;
            
            console.log(`[SAVE] Attempting to save data to ${filename}`);
            console.log(`[SAVE] Data size: ${Math.round(jsonString.length / 1024)} KB`);
            console.log(`[SAVE] Number of swarms: ${swarms.length}`);
            
            // Attempt to trigger download for the user to save manually
            try {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log(`[SAVE] Download attempted for ${filename}`);
                return true;
            } catch (downloadError) {
                console.error(`[SAVE] Download attempt failed:`, downloadError);
                return false;
            }
        } catch (error) {
            console.error(`[SAVE] ERROR: Failed to process swarm data`);
            console.error(`[SAVE] Error details:`, error);
            console.error(`[SAVE] Error name: ${error.name}`);
            console.error(`[SAVE] Error message: ${error.message}`);
            console.error(`[SAVE] Error stack:`, error.stack);
            return false;
        }
    }
    
    // Close the popup
    function closePopup() {
        if (!isPopupOpen || !popupOverlay) return;
        
        document.body.removeChild(popupOverlay);
        popupOverlay = null;
        popupContainer = null;
        isPopupOpen = false;
    }
    
    // Public API
    return {
        init: init
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SubmitSwarms;
} 