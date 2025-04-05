// slider-tooltip.js - Double-tap tooltip implementation for sliders
const SliderTooltip = (function() {
    // Variables for tracking double-tap
    let lastTapTime = 0;
    const doubleTapDelay = 300; // ms between taps
    let activeTooltip = null;
    let isInitialized = false;
    let tooltipHideTimeout = null; // Track the hide timeout
    
    // Slider descriptions object - maps slider IDs to descriptive tooltip text
    const sliderDescriptions = {
        // Orbie parameters
        'orbieInfluenceRadius': 'Controls how far Orbie\'s influence extends to affect nearby particles. Higher values create a wider area of effect, allowing Orbie to interact with particles from greater distances.',
        'orbieInfluenceIntensity': 'Controls how strongly Orbie affects nearby particles. Higher values make particles respond more dramatically to Orbie\'s presence, while lower values create subtler interactions.',
        'orbieSize': 'Adjusts the visual size of Orbie. Larger sizes make Orbie more prominent but may feel less responsive in dense particle areas. Smaller sizes allow for more precise positioning.',
        'orbieSpeed': 'Controls how quickly Orbie moves around. Higher values make Orbie more responsive but potentially harder to control precisely. Lower values allow for more deliberate movements.',
        'orbieGlowSize': 'Adjusts the size of the glow effect around Orbie. Larger glow helps visualize Orbie\'s influence radius and creates a more dramatic visual presence.',
        'orbieGlowOpacity': 'Controls the transparency of Orbie\'s glow effect. Higher values make the glow more visible and create stronger visual impact. Lower values offer more subtle visuals.',
        'orbiePulseIntensity': 'Controls how strongly Orbie pulses visually. Higher values create more dramatic, attention-grabbing pulses. Lower values provide a gentler, more subtle visual rhythm.',
        'orbiePulseSpeed': 'Controls how rapidly Orbie pulses visually. Higher values create faster, more energetic pulsing. Lower values create a slower, calmer visual effect.',
        
        // Orbie swarm parameters
        'orbieSwarmSpeed': 'Controls how quickly the Orbie swarm members move. Higher speeds create more energetic, chaotic movement. Lower speeds result in more gentle, peaceful motion.',
        'orbieSwarmDampening': 'Controls how quickly the Orbie swarm slows down. Higher values (closer to 1.0) create more sluggish movement with less momentum. Lower values allow for more persistent motion and inertia.',
        'orbieSwarmSeparation': 'Controls how strongly swarm members avoid each other. Higher values prevent clumping, keeping particles well-spaced. Lower values allow particles to move closer together.',
        'orbieSwarmAlignment': 'Controls how strongly swarm members align their direction with neighbors. Higher values create more uniform, flock-like movement. Lower values allow for more independent motion.',
        'orbieSwarmCohesion': 'Controls how strongly swarm members are attracted to each other. Higher values pull particles together into tighter groups. Lower values allow particles to spread out more widely.',
        'orbieSwarmPerception': 'Controls how far swarm members can perceive their neighbors. Higher values let particles respond to others from greater distances, creating larger coordinated groups. Lower values create more localized interactions.',
        'orbieSwarmSparkleRate': 'Controls how frequently swarm members emit sparkle effects. Higher values create more numerous sparkles for a more energetic visual. Lower values create more occasional, subtle sparkles.',
        
        // Zot swarm creation parameters
        'newSwarmZotCount': 'Sets how many Zots will be in the new swarm. Larger swarms create more dramatic visual effects but may impact performance. Find the right balance for your device.',
        'newSwarmMinSize': 'Sets the minimum size of individual Zots in the swarm. This establishes the smallest Zots that will appear. Smaller minimum sizes allow for more variation in your swarm.',
        'newSwarmMaxSize': 'Sets the maximum size of individual Zots in the swarm. This establishes the largest Zots that will appear. Larger maximum sizes create more variety and visual interest.',
        'newSwarmSpeed': 'Controls how quickly the Zots move in the swarm. Higher speeds create more dynamic, energetic movement. Lower speeds create calmer, more controlled behaviors.',
        'newSwarmSeparation': 'Controls how strongly Zots avoid each other. Higher values (above 1.0) cause Zots to actively maintain distance from each other. Lower values allow for more grouping and clustering.',
        'newSwarmAlignment': 'Controls how strongly Zots align with neighbors. Higher values (above 0.5) cause Zots to follow the same direction as nearby Zots, creating flowing, stream-like motion.',
        'newSwarmCohesion': 'Controls how strongly Zots are attracted to their group. Higher values create tightly clustered swarms that stick together. Lower values allow for more scattered, independent movement.',
        'newSwarmPerception': 'Controls how far Zots can perceive their neighbors. Higher values (above 50) allow for larger scale coordinated behaviors. Lower values create more local, smaller group behaviors.',
        
        // Forces parameters
        'touchForce': 'Controls how strongly your touch affects particles. Higher values create more dramatic push/pull effects when interacting. Lower values allow for more gentle, subtle influences.',
        'orbieTouchMultiplier': 'Controls how strongly Orbie is affected by touch. Higher values make Orbie more responsive to your touch. Lower values make Orbie more independent and steady.',
        'swipeForceRadius': 'Controls the area of effect for swipe gestures. Larger radius affects more particles across a wider area. Smaller radius creates more focused, precise interactions.',
        'swipeForceIntensity': 'Controls how strongly swipe gestures affect particles. Higher values create more dramatic reactions to swipes. Lower values create more subtle, gentle responses.',
        'swipeRepelMultiplier': 'Controls how strongly particles are repelled during swipes. Higher values push particles away more forcefully. Lower values create gentler repulsion effects.',
        'swipeAttractMultiplier': 'Controls how strongly particles are attracted during swipes. Higher values pull particles in more powerfully. Lower values create more gentle attraction forces.',
        
        // Wall parameters
        'wallsForce': 'Controls how strongly walls repel particles. Higher values create firmer boundaries that particles strongly avoid. Lower values allow particles to approach or slightly penetrate walls.',
        'wallPerception': 'Controls how far particles can detect walls. Higher values make particles respond to walls from greater distances. Lower values allow particles to get closer before responding.'
    };
    
    // Toggle checkbox descriptions - maps toggle IDs to descriptive tooltip text
    const toggleDescriptions = {
        'orbieEnabled': 'Toggles Orbie presence in the simulation. When enabled, Orbie appears and influences nearby particles based on influence settings. When disabled, Orbie is removed from the simulation.',
        'zotTouchEnabled': 'Toggles touch interaction with Zot particles. When enabled, your touch directly influences Zot particles, allowing you to push, pull, and guide them. When disabled, your touch won\'t affect Zots.',
        'zotSwarmInteractionEnabled': 'Toggles whether Zots in different swarms interact with each other. When enabled, Zots from different swarms influence each other\'s movement. When disabled, each swarm behaves independently.',
        'swipeForcesEnabled': 'Toggles swipe gesture forces. When enabled, quick swipe gestures create force fields that push or pull particles along your swipe direction. When disabled, swipe gestures have no effect.'
    };
    
    /**
     * Initialize tooltip functionality for all slider components
     */
    function init() {
        if (isInitialized) return;
        
        console.log('Slider Tooltip: Initializing...');
        setupTooltips();
        setupToggleTooltips();
        isInitialized = true;
    }
    
    /**
     * Set up tooltips for all toggle checkbox elements
     */
    function setupToggleTooltips() {
        console.log('Setting up tooltips for toggle components');
        
        // Find all toggle containers
        const toggleContainers = document.querySelectorAll('.toggle-container');
        
        toggleContainers.forEach(container => {
            // Find the checkbox within this container
            const checkbox = container.querySelector('input[type="checkbox"]');
            if (!checkbox) return;
            
            // Get the tooltip text
            let tooltipText;
            
            // First try to use our detailed descriptions by checkbox ID
            if (checkbox.id && toggleDescriptions[checkbox.id]) {
                tooltipText = toggleDescriptions[checkbox.id];
            } else {
                // Fall back to label text
                const labelText = container.querySelector('span') ? 
                    container.querySelector('span').textContent.trim() : '';
                tooltipText = labelText ? 
                    `Toggle ${labelText.toLowerCase()} on or off` : 
                    'Toggle this feature on or off';
            }
            
            // Store tooltip text as data attribute
            checkbox.setAttribute('data-tooltip', tooltipText);
            
            // Also add tooltip to the label and toggle slider for easier tap target
            const toggleSwitch = container.querySelector('.toggle-switch');
            const toggleSlider = container.querySelector('.toggle-slider');
            const labelSpan = container.querySelector('span');
            
            if (toggleSwitch) toggleSwitch.setAttribute('data-tooltip', tooltipText);
            if (toggleSlider) toggleSlider.setAttribute('data-tooltip', tooltipText);
            if (labelSpan) labelSpan.setAttribute('data-tooltip', tooltipText);
            
            // Add listeners to all elements
            setupDoubleTapListeners(checkbox);
            if (toggleSwitch) setupDoubleTapListeners(toggleSwitch);
            if (toggleSlider) setupDoubleTapListeners(toggleSlider);
            if (labelSpan) setupDoubleTapListeners(labelSpan);
            
            // Add tooltip to the entire container for easier tapping
            container.setAttribute('data-tooltip', tooltipText);
            setupDoubleTapListeners(container);
        });
    }
    
    /**
     * Set up tooltips for all slider elements
     */
    function setupTooltips() {
        // Find all slider elements, their labels, and track elements
        const sliders = document.querySelectorAll('input[type="range"]');
        const sliderContainers = document.querySelectorAll('.slider-overlay-container, .range-slider-container');
        
        // Set up tooltip containers for each slider
        sliderContainers.forEach(container => {
            // Find the slider within this container
            const slider = container.querySelector('input[type="range"]');
            if (!slider) return;
            
            // Get the tooltip text from our descriptions object, data attribute, or use the label text
            let tooltipText;
            
            // First try to use our detailed descriptions by slider ID
            if (slider.id && sliderDescriptions[slider.id]) {
                tooltipText = sliderDescriptions[slider.id];
            } else {
                // Fall back to data attribute or label
                tooltipText = container.getAttribute('data-tooltip');
                
                // If no data attribute, use label text but with better description
                if (!tooltipText) {
                    const label = container.querySelector('.slider-overlay-label');
                    const labelText = label ? label.textContent.trim() : '';
                    tooltipText = labelText ? 
                        `Adjust the ${labelText.toLowerCase()} parameter` : 
                        'Adjust this parameter value';
                }
            }
            
            // Store tooltip text as data attribute on specific elements but NOT on the container
            slider.setAttribute('data-tooltip', tooltipText);
            
            // Create an array of elements to set up listeners on (specifically exclude container and buttons)
            const elementsForTooltips = [];
            
            // Add the slider element itself
            elementsForTooltips.push(slider);
            
            // Get the label if it exists
            const label = container.querySelector('.slider-overlay-label');
            if (label) {
                label.setAttribute('data-tooltip', tooltipText);
                elementsForTooltips.push(label);
            }
            
            // Get track elements (for range sliders)
            const track = container.querySelector('.range-slider');
            if (track) {
                track.setAttribute('data-tooltip', tooltipText);
                elementsForTooltips.push(track);
            }
            
            // Store all button elements to mark them as not eligible for tooltips
            const buttons = container.querySelectorAll('button');
            buttons.forEach(button => {
                button.setAttribute('data-no-tooltip', 'true');
                // Make sure to remove any existing tooltip listeners from buttons
                button.removeEventListener('touchstart', handleTouchStart);
                button.removeEventListener('touchend', handleTouchEnd);
                button.removeEventListener('touchcancel', handleTouchCancel);
            });
            
            // Finally, add listeners to our filtered elements, but NOT to the container itself
            elementsForTooltips.forEach(element => {
                setupDoubleTapListeners(element);
            });
            
            // Also make sure thumb is accessible to touch events
            if (slider) {
                slider.style.pointerEvents = 'auto';
            }
        });
        
        // For sliders that are not in containers (if any)
        sliders.forEach(slider => {
            if (!slider.closest('.slider-overlay-container, .range-slider-container')) {
                // Get description from our mapping or create a generic one
                let tooltipText;
                if (slider.id && sliderDescriptions[slider.id]) {
                    tooltipText = sliderDescriptions[slider.id];
                } else {
                    const sliderName = slider.getAttribute('name') || slider.id || 'parameter';
                    tooltipText = `Adjust the ${sliderName.toLowerCase()} value`;
                }
                
                slider.setAttribute('data-tooltip', tooltipText);
                setupDoubleTapListeners(slider);
            }
        });
    }
    
    /**
     * Set up double-tap detection for an element
     */
    function setupDoubleTapListeners(element) {
        // Remove any existing listeners first
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
        element.removeEventListener('touchcancel', handleTouchCancel);
        
        // Add event listeners
        element.addEventListener('touchstart', handleTouchStart);
        element.addEventListener('touchend', handleTouchEnd);
        element.addEventListener('touchcancel', handleTouchCancel);
    }
    
    /**
     * Handle touch start event for double-tap detection
     */
    function handleTouchStart(e) {
        // More thorough check for buttons to prevent tooltips
        // 1. Check if the target itself is a button
        if (e.target.tagName === 'BUTTON') {
            return;
        }
        
        // 2. Check if the target has a parent button
        if (e.target.closest('button')) {
            return;
        }
        
        // 3. Check if the target or any parent has the data-no-tooltip attribute
        if (e.target.hasAttribute('data-no-tooltip') || e.target.closest('[data-no-tooltip]')) {
            return;
        }
        
        // 4. Check if we're inside a button element regardless of how it's tagged
        if (e.target.closest('.button, [role="button"]')) {
            return;
        }
        
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        
        if (tapLength < doubleTapDelay && tapLength > 0) {
            // Double-tap detected, show tooltip
            
            // Only prevent default if the event is cancelable to avoid browser warnings
            if (e.cancelable) {
                e.preventDefault(); // Prevent default to avoid inadvertent slider adjustment
            }
            
            // Get the closest element with a tooltip attribute
            const tooltipElement = e.target.closest('[data-tooltip]') || e.currentTarget;
            showTooltip(tooltipElement);
            
            // Reset last tap time to prevent triple-tap triggering 
            lastTapTime = 0;
            return;
        }
        
        lastTapTime = currentTime;
    }
    
    /**
     * Handle touch end event
     */
    function handleTouchEnd(e) {
        // Keep tooltip visible, will be auto-hidden after a delay
    }
    
    /**
     * Handle touch cancel event
     */
    function handleTouchCancel(e) {
        // Hide tooltip on cancel
        hideTooltip();
    }
    
    /**
     * Show tooltip for an element
     */
    function showTooltip(element) {
        // Hide any existing tooltip first with complete cleanup
        hideTooltip();
        
        // Get tooltip text from the element
        const tooltipText = element.getAttribute('data-tooltip');
        if (!tooltipText) return;
        
        // Create overlay to capture taps but prevent them from reaching menu elements
        const overlay = document.createElement('div');
        overlay.className = 'tooltip-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            zIndex: '2000', // Below tooltip but above everything else
            backgroundColor: 'transparent'
        });
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'mobile-slider-tooltip';
        
        // Create a text container for the main tooltip text
        const textContainer = document.createElement('div');
        textContainer.textContent = tooltipText;
        tooltip.appendChild(textContainer);
        
        // Apply styles to the tooltip
        Object.assign(tooltip.style, {
            position: 'fixed',
            zIndex: '2001',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            padding: '0.8rem 1.2rem',
            borderRadius: '12px',
            fontSize: '0.95rem',
            lineHeight: '1.5',
            maxWidth: '80vw',
            whiteSpace: 'normal',
            textAlign: 'left',
            opacity: '0',
            transform: 'translateY(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none', // Keep tooltip non-interactive, rely on overlay for interaction
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        });
        
        // Add overlay to DOM first, then tooltip
        document.body.appendChild(overlay);
        document.body.appendChild(tooltip);
        
        // Position the tooltip above the element
        const elementRect = element.getBoundingClientRect();
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        
        let left = elementRect.left + (elementRect.width - tooltipWidth) / 2;
        let top = elementRect.top - tooltipHeight - 10;
        
        // Ensure tooltip stays within viewport
        if (left < 20) left = 20;
        if (left + tooltipWidth > window.innerWidth - 20) {
            left = window.innerWidth - tooltipWidth - 20;
        }
        if (top < 20) {
            // If there's not enough space above, position below
            top = elementRect.bottom + 10;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        
        // Show tooltip with animation
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        });
        
        // Add pulse animation
        tooltip.style.animation = 'tooltipPulse 2s infinite';
        
        // Add keyframes for pulse animation if not already added
        if (!document.getElementById('tooltip-pulse-keyframes')) {
            const style = document.createElement('style');
            style.id = 'tooltip-pulse-keyframes';
            style.textContent = `
                @keyframes tooltipPulse {
                    0% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
                    50% { box-shadow: 0 4px 25px rgba(76, 175, 80, 0.3); }
                    100% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add tap-to-dismiss on the overlay
        overlay.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hideTooltip();
            return false;
        });
        
        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hideTooltip();
            return false;
        });
        
        // Store active elements
        activeTooltip = tooltip;
        activeOverlay = overlay;
        
        // Clear any existing timeout
        if (tooltipHideTimeout) {
            clearTimeout(tooltipHideTimeout);
        }
        
        // Hide tooltip after delay - increased to 9700ms
        tooltipHideTimeout = setTimeout(hideTooltip, 9700);
    }
    
    // Add variable for tracking overlay
    let activeOverlay = null;
    
    /**
     * Hide the currently active tooltip
     */
    function hideTooltip() {
        // Clear any existing timeout to prevent conflicts
        if (tooltipHideTimeout) {
            clearTimeout(tooltipHideTimeout);
            tooltipHideTimeout = null;
        }
        
        // Handle tooltip removal
        if (activeTooltip) {
            // Fade out with animation
            activeTooltip.style.opacity = '0';
            activeTooltip.style.transform = 'translateY(10px)';
            
            const tooltipToRemove = activeTooltip;
            
            // Remove from DOM after animation completes
            setTimeout(() => {
                if (tooltipToRemove && tooltipToRemove.parentNode) {
                    tooltipToRemove.parentNode.removeChild(tooltipToRemove);
                }
            }, 300);
            
            // Clear active tooltip reference immediately
            activeTooltip = null;
        }
        
        // Handle overlay removal
        if (activeOverlay) {
            const overlayToRemove = activeOverlay;
            // Remove overlay immediately as it's not animated
            if (overlayToRemove && overlayToRemove.parentNode) {
                overlayToRemove.parentNode.removeChild(overlayToRemove);
            }
            activeOverlay = null;
        }
    }
    
    /**
     * Refresh tooltips (for public access)
     */
    function refreshTooltip() {
        // Re-initialize tooltips
        isInitialized = false;
        init();
        console.log('Slider Tooltip: Refreshed all tooltips');
    }
    
    // Return public API
    return {
        init: init,
        refreshTooltip: refreshTooltip
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    SliderTooltip.init();
});

// Make it globally accessible
window.SliderTooltip = SliderTooltip; 