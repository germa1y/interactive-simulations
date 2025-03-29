// submitSwarms.js - Handle zot swarm submission

const SubmitSwarms = (function() {
    // Track popup state
    let isPopupOpen = false;
    let popupOverlay = null;
    let popupContainer = null;
    
    // Initialize the submit button in the UI
    function init() {
        // Find the button group container
        const buttonGroup = document.querySelector('#zotSwarmsParams .button-group');
        if (!buttonGroup) return;
        
        // Create the submit button
        const submitButton = document.createElement('button');
        submitButton.id = 'submitSwarmsButton';
        submitButton.textContent = 'Submit Your Zots';
        submitButton.className = 'submit-swarms-btn';
        
        // Insert between Create and Clear buttons
        const clearButton = document.getElementById('clearSwarmsButton');
        if (clearButton) {
            buttonGroup.insertBefore(submitButton, clearButton);
        } else {
            buttonGroup.appendChild(submitButton);
        }
        
        // Add click event to the submit button
        submitButton.addEventListener('click', showSubmitPopup);
        
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
            }
            
            .submit-swarms-btn:hover {
                background-color: #388E3C;
            }
            
            .error-message {
                color: #ff6b6b;
                margin-top: 10px;
                font-size: 14px;
            }
        `;
        document.head.appendChild(styleEl);
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
        
        // Popup content
        popupContainer.innerHTML = `
            <h3 class="popup-title">Submit Your Zots</h3>
            <div class="popup-content">
                Are you ready to submit your zot swarms?
            </div>
            <div id="submitError" class="error-message" style="display: none;"></div>
            <div class="popup-buttons">
                <button class="popup-button submit">Submit</button>
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
            console.log('[SUBMIT] Submit button clicked');
            
            // Validate if there are particles on screen
            if (typeof ParticleSystem !== 'undefined' && ParticleSystem.getZotSwarms) {
                console.log('[SUBMIT] ParticleSystem is available');
                
                const swarms = ParticleSystem.getZotSwarms();
                console.log(`[SUBMIT] Found ${swarms ? swarms.length : 0} swarms`);
                
                if (!swarms || swarms.length === 0) {
                    // Show error message if no particles
                    console.error('[SUBMIT] No swarms found');
                    errorElement.textContent = "No zot swarms found! Please create at least one swarm.";
                    errorElement.style.display = "block";
                    return;
                }
                
                // Try to save the data, but we'll show an error if it fails
                try {
                    // Create and save the JSON file
                    const result = saveZotSwarms(swarms);
                    
                    // Show error message about filesystem limitations
                    errorElement.innerHTML = "Browser security prevents saving directly to the feedback folder.<br>Check the browser console (F12) for more details.";
                    errorElement.style.display = "block";
                    
                    // Don't close the popup so user can see the error
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Error";
                } catch (error) {
                    console.error('[SUBMIT] Error during save:', error);
                    errorElement.textContent = "An error occurred: " + error.message;
                    errorElement.style.display = "block";
                }
            } else {
                console.error('[SUBMIT] ParticleSystem not available');
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
            // Create data object with swarm settings and metadata
            const data = {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                screenSize: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                swarms: swarms.map(swarm => ({
                    id: swarm.id,
                    zotCount: swarm.zotCount,
                    settings: swarm.settings,
                    // Get particles position data
                    particles: swarm.particles ? swarm.particles.map(p => ({
                        x: p.x,
                        y: p.y,
                        size: p.size,
                        color: p.color
                    })) : []
                }))
            };
            
            // Convert to JSON string
            const jsonString = JSON.stringify(data, null, 2);
            
            // Create a Blob with the JSON data
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // Create a unique timestamp filename (no underscores or spaces)
            const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '');
            const filename = `preset${timestamp}.json`;
            
            console.log(`[SUBMIT] Attempting to save data to ${filename}`);
            console.log(`[SUBMIT] Data size: ${Math.round(jsonString.length / 1024)} KB`);
            console.log(`[SUBMIT] Number of swarms: ${swarms.length}`);
            
            // Important: Browser JavaScript cannot directly write to server filesystem
            // We need to inform the user of this limitation
            console.error(`[SUBMIT] ERROR: Cannot save directly to feedback folder`);
            console.error(`[SUBMIT] Browser security restrictions prevent JavaScript from writing directly to the server filesystem`);
            console.error(`[SUBMIT] This would require a server-side API endpoint to handle file uploads`);
            
            // Log the data we would have saved (limited to prevent console flooding)
            console.log(`[SUBMIT] Data that would be saved (truncated):`, {
                timestamp: data.timestamp,
                screenSize: data.screenSize,
                swarmCount: data.swarms.length
            });
            
            return false;
        } catch (error) {
            console.error(`[SUBMIT] ERROR: Failed to process swarm data`);
            console.error(`[SUBMIT] Error details:`, error);
            console.error(`[SUBMIT] Error name: ${error.name}`);
            console.error(`[SUBMIT] Error message: ${error.message}`);
            console.error(`[SUBMIT] Error stack:`, error.stack);
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