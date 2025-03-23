// touch.js - Touch interaction handler with visual feedback
const TouchHandler = (function() {
    // Private variables
    let canvas;
    let touchActive = false;
    let touchX = 0;
    let touchY = 0;
    let lastTouchTime = 0;
    let touchPulseElement = null;
    
    // Callbacks for integration with particle system
    let callbacks = {
        onTouchStart: null,
        onTouchMove: null,
        onTouchEnd: null,
        onDoubleTap: null,
        isAttractMode: null
    };
    
    // Throttle function for performance optimization
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Touch event handlers
    function handleTouchStart(e) {
        e.preventDefault(); // Prevent scrolling
        
        if (e.touches && e.touches[0]) {
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;
            
            touchX = x;
            touchY = y;
            touchActive = true;
            
            // Detect double tap
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - lastTouchTime;
            
            if (timeDiff < 300) { // Double tap detected
                if (callbacks.onDoubleTap) {
                    callbacks.onDoubleTap(x, y);
                    // After the mode changes, update the visual effect
                    createModeChangedEffect(x, y);
                    
                    // Also update the existing pulse if present
                    if (touchPulseElement) {
                        touchPulseElement.classList.remove('touch-pulse-attract', 'touch-pulse-repel');
                        if (callbacks.isAttractMode && callbacks.isAttractMode()) {
                            touchPulseElement.classList.add('touch-pulse-attract');
                        } else {
                            touchPulseElement.classList.add('touch-pulse-repel');
                        }
                    }
                }
            }
            
            lastTouchTime = currentTime;
            
            // Create visual effects
            createTouchRipple(x, y);
            createTouchPulse(x, y);
            
            // Call the callback
            if (callbacks.onTouchStart) {
                callbacks.onTouchStart(x, y);
            }
        }
    }
    
    // Throttled touch move handler for better performance
    const handleTouchMove = throttle(function(e) {
        e.preventDefault();
        
        if (touchActive && e.touches && e.touches[0]) {
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;
            
            touchX = x;
            touchY = y;
            
            // Update pulse position
            updateTouchPulse(x, y);
            
            // Call the callback
            if (callbacks.onTouchMove) {
                callbacks.onTouchMove(x, y);
            }
        }
    }, 16); // ~60fps
    
    function handleTouchEnd(e) {
        e.preventDefault();
        
        // Remove pulse effect
        removeTouchPulse();
        
        touchActive = false;
        
        // Call the callback
        if (callbacks.onTouchEnd) {
            callbacks.onTouchEnd();
        }
    }
    
    // Visual effect functions
    function createTouchRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple';
        
        // Add appropriate class based on mode - checking more safely
        const isAttract = callbacks.isAttractMode ? callbacks.isAttractMode() : false;
        if (isAttract) {
            ripple.classList.add('touch-ripple-attract');
        } else {
            ripple.classList.add('touch-ripple-repel');
        }
        
        const rippleSize = 20;
        
        // Center the ripple on the touch point
        ripple.style.left = `${x - rippleSize/2}px`;
        ripple.style.top = `${y - rippleSize/2}px`;
        ripple.style.width = `${rippleSize}px`;
        ripple.style.height = `${rippleSize}px`;
        
        document.body.appendChild(ripple);
        
        // Remove after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 400);
    }
    
    // Create continuous pulse effect at touch point
    function createTouchPulse(x, y) {
        removeTouchPulse(); // Remove any existing pulse
        
        const pulse = document.createElement('div');
        pulse.className = 'touch-pulse';
        
        // Add appropriate class based on mode - checking with callbacks.isAttractMode
        const isAttract = callbacks.isAttractMode ? callbacks.isAttractMode() : false;
        if (isAttract) {
            pulse.classList.add('touch-pulse-attract');
        } else {
            pulse.classList.add('touch-pulse-repel');
        }
        
        // Position the pulse (CSS handles centering with margin)
        pulse.style.left = `${x}px`;
        pulse.style.top = `${y}px`;
        
        document.body.appendChild(pulse);
        touchPulseElement = pulse;
    }
    
    // Update pulse position when touch moves
    function updateTouchPulse(x, y) {
        if (touchPulseElement) {
            touchPulseElement.style.left = `${x}px`;
            touchPulseElement.style.top = `${y}px`;
        }
    }
    
    // Remove pulse element
    function removeTouchPulse() {
        if (touchPulseElement) {
            touchPulseElement.remove();
            touchPulseElement = null;
        }
    }
    
    // Create special effect for mode change (attract/repel toggle)
    function createModeChangedEffect(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple mode-change-ripple';
        
        // Add appropriate class based on new mode
        // We'll always show the effect but the color will depend on the new mode
        // The callback will reflect the UPDATED state after the toggle
        const isAttract = callbacks.isAttractMode ? callbacks.isAttractMode() : false;
        if (isAttract) {
            ripple.classList.add('touch-ripple-attract');
        } else {
            ripple.classList.add('touch-ripple-repel');
        }
        
        const rippleSize = 40;
        
        // Center the ripple on the touch point
        ripple.style.left = `${x - rippleSize/2}px`;
        ripple.style.top = `${y - rippleSize/2}px`;
        ripple.style.width = `${rippleSize}px`;
        ripple.style.height = `${rippleSize}px`;
        
        document.body.appendChild(ripple);
        
        // Remove after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Public API
    return {
        init: function(canvasElement, callbacksObj) {
            canvas = canvasElement;
            
            // Merge provided callbacks with defaults
            if (callbacksObj) {
                callbacks = {...callbacks, ...callbacksObj};
            }
            
            // Add touch event listeners
            canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
            canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
        },
        
        // Get current touch position info
        getTouchPosition: function() {
            return {
                x: touchX,
                y: touchY,
                active: touchActive
            };
        }
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = TouchHandler;
}