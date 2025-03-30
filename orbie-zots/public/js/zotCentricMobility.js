// zotCentricMobility.js - Zot-centric mobility where zot swarm acts as an analog joystick control
const ZotCentricMobility = (function() {
    // Private variables
    let enabled = false;
    let screenWidth, screenHeight;
    let screenCenterX, screenCenterY;
    
    // Camera/map offset
    let offsetX = 0;
    let offsetY = 0;
    let targetOffsetX = 0;
    let targetOffsetY = 0;
    
    // Visual indicators for joystick
    let pulsePhase = 0;
    let swarmCenterX = 0;
    let swarmCenterY = 0;
    
    // Parameters for analog-like control - moved to settings object for UI control
    let settings = {
        deadZonePercent: 0.05,       // 5% dead zone
        responseCurvePower: 1.5,     // Non-linear response curve
        maxSteeringForce: 4.0,       // Maximum steering force
        minCenteringForce: 0.05,     // Minimum centering force when near center
        maxCenteringForce: 0.15,     // Maximum centering force when far from center
        smoothingFactor: 0.15,       // Camera smoothing factor
        swarmCenterAttraction: 0.05  // How strongly the swarm is attracted to screen center
    };
    
    // SVG dimensions (for boundaries)
    let svgWidth = 0;
    let svgHeight = 0;
    
    // References to other systems
    let particleSystem;
    let wallSystem;
    let canvas, ctx;
    
    // Initialize the system
    function init(systems) {
        particleSystem = systems.particleSystem;
        wallSystem = systems.wallSystem;
        canvas = systems.canvas;
        ctx = canvas.getContext('2d');
        
        // Get screen dimensions
        updateScreenDimensions();
        
        // Listen for screen resize
        window.addEventListener('resize', updateScreenDimensions);
        
        // Initialize swarm center position to screen center
        swarmCenterX = screenCenterX;
        swarmCenterY = screenCenterY;
        
        console.log('Zot-Centric Mobility System initialized');
    }
    
    // Draw visual indicators when zot-centric mobility is active
    function drawVisualIndicators() {
        if (!enabled || !ctx) return;
        
        // Draw screen center indicator (joystick axis)
        // Enhanced crosshair design
        const crosshairSize = 15; // Increased size
        const ringRadius = 20;    // Increased ring size
        const dotRadius = 3;      // Center dot size
        
        ctx.save();
        
        // Draw outer ring with gradient
        const ringGradient = ctx.createRadialGradient(
            screenCenterX, screenCenterY, ringRadius * 0.8,
            screenCenterX, screenCenterY, ringRadius
        );
        ringGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        ringGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(screenCenterX, screenCenterY, ringRadius, 0, Math.PI * 2);
        ctx.fillStyle = ringGradient;
        ctx.fill();
        
        // Draw crosshair lines with gradient
        const lineGradient = ctx.createLinearGradient(
            screenCenterX - crosshairSize, screenCenterY,
            screenCenterX + crosshairSize, screenCenterY
        );
        lineGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        lineGradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
        lineGradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.8)');
        lineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        // Horizontal line
        ctx.moveTo(screenCenterX - crosshairSize, screenCenterY);
        ctx.lineTo(screenCenterX + crosshairSize, screenCenterY);
        // Vertical line
        ctx.moveTo(screenCenterX, screenCenterY - crosshairSize);
        ctx.lineTo(screenCenterX, screenCenterY + crosshairSize);
        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw center dot
        ctx.beginPath();
        ctx.arc(screenCenterX, screenCenterY, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        
        // Draw the swarm's center point (pulses)
        pulsePhase += 0.1;
        if (pulsePhase > Math.PI * 2) pulsePhase = 0;
        
        const pulseSize = 5 + Math.sin(pulsePhase) * 2; // 3-7px radius pulsating
        
        ctx.beginPath();
        ctx.arc(swarmCenterX, swarmCenterY, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 255, 200, 0.7)';
        ctx.fill();
        
        // Draw line connecting center and swarm center (the "joystick")
        ctx.beginPath();
        ctx.moveTo(screenCenterX, screenCenterY);
        ctx.lineTo(swarmCenterX, swarmCenterY);
        ctx.strokeStyle = 'rgba(200, 255, 200, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
    
    // Calculate swarm center position based on all active swarms
    function calculateSwarmCenter() {
        if (!particleSystem || !enabled) {
            swarmCenterX = screenCenterX;
            swarmCenterY = screenCenterY;
            return;
        }
        
        try {
            // Get the touch position to simulate the swarm center
            if (particleSystem.isTouchActive && particleSystem.isTouchActive()) {
                const touchPos = particleSystem.getTouchPosition ? 
                    particleSystem.getTouchPosition() : 
                    { x: screenCenterX, y: screenCenterY };
                
                // Move swarm center toward touch position with some smoothing
                swarmCenterX += (touchPos.x - swarmCenterX) * 0.2;
                swarmCenterY += (touchPos.y - swarmCenterY) * 0.2;
            } else {
                // When not touching, gradually move swarm center back to screen center
                swarmCenterX += (screenCenterX - swarmCenterX) * settings.swarmCenterAttraction;
                swarmCenterY += (screenCenterY - swarmCenterY) * settings.swarmCenterAttraction;
            }
            
            // Try to get actual zot positions if available
            const swarms = particleSystem.getZotSwarms ? particleSystem.getZotSwarms() : [];
            
            if (swarms.length > 0 && particleSystem.getZotPositions) {
                // If there's a method to get zot positions
                const positions = particleSystem.getZotPositions();
                if (positions && positions.length > 0) {
                    let totalX = 0;
                    let totalY = 0;
                    
                    positions.forEach(pos => {
                        totalX += pos.x;
                        totalY += pos.y;
                    });
                    
                    // Update swarm center with actual average position
                    const avgX = totalX / positions.length;
                    const avgY = totalY / positions.length;
                    
                    // Blend between touch position and actual swarm average with smoothing
                    swarmCenterX = swarmCenterX * 0.7 + avgX * 0.3;
                    swarmCenterY = swarmCenterY * 0.7 + avgY * 0.3;
                }
            }
        } catch (error) {
            console.error("Error calculating swarm center:", error);
        }
    }
    
    // Update screen dimensions
    function updateScreenDimensions() {
        screenWidth = window.innerWidth;
        screenHeight = window.innerHeight;
        screenCenterX = screenWidth / 2;
        screenCenterY = screenHeight / 2;
    }
    
    // Enable zot-centric mobility without disturbing existing zots
    function enable(svgDimensions) {
        console.log("ZotCentricMobility: Enabling with dimensions", svgDimensions);
        
        if (svgDimensions) {
            svgWidth = svgDimensions.width || screenWidth * 2;
            svgHeight = svgDimensions.height || screenHeight * 2;
        } else {
            // Default to 2x screen size if dimensions not provided
            svgWidth = screenWidth * 2;
            svgHeight = screenHeight * 2;
        }
        
        // Reset offsets to ensure we start centered
        offsetX = 0;
        offsetY = 0;
        targetOffsetX = 0;
        targetOffsetY = 0;
        
        // Initialize swarm center position to screen center
        swarmCenterX = screenCenterX;
        swarmCenterY = screenCenterY;
        
        enabled = true;
        console.log('Zot-Centric Mobility enabled with dimensions:', svgWidth, 'x', svgHeight);
    }
    
    // Disable zot-centric mobility
    function disable() {
        enabled = false;
        
        // Reset offsets
        offsetX = 0;
        offsetY = 0;
        targetOffsetX = 0;
        targetOffsetY = 0;
        
        console.log('Zot-Centric Mobility disabled');
    }
    
    // Calculate the camera offset based on swarm center position
    function calculateCameraOffset() {
        if (!enabled) return;
        
        try {
            // Calculate swarm center position
            calculateSwarmCenter();
            
            // Calculate displacement from screen center
            const displacementX = swarmCenterX - screenCenterX;
            const displacementY = swarmCenterY - screenCenterY;
            
            // Calculate displacement distance and direction
            const distance = Math.sqrt(displacementX * displacementX + displacementY * displacementY);
            
            // Apply dead zone
            const deadZoneRadius = Math.min(screenWidth, screenHeight) * settings.deadZonePercent;
            
            if (distance < deadZoneRadius) {
                // Inside dead zone - apply strong centering to return to center
                targetOffsetX *= 0.8;
                targetOffsetY *= 0.8;
                return;
            }
            
            // Calculate normalized direction
            const dirX = displacementX / distance;
            const dirY = displacementY / distance;
            
            // Apply non-linear response curve
            const adjustedDistance = Math.min(distance - deadZoneRadius, screenWidth / 2);
            const normalizedDistance = adjustedDistance / (screenWidth / 2);
            const responseValue = Math.min(Math.pow(normalizedDistance, settings.responseCurvePower), 1.0);
            
            // Calculate steering force
            const steeringForce = responseValue * settings.maxSteeringForce;
            
            // Calculate centering force based on distance from center
            const centeringForcePercent = settings.minCenteringForce + 
                (settings.maxCenteringForce - settings.minCenteringForce) * normalizedDistance;
            
            // Calculate target offset (move opposite to swarm displacement)
            targetOffsetX -= dirX * steeringForce;
            targetOffsetY -= dirY * steeringForce;
            
            // Apply centering force to gradually bring camera back to center
            targetOffsetX *= (1 - centeringForcePercent);
            targetOffsetY *= (1 - centeringForcePercent);
            
            // Apply boundaries
            const maxOffsetX = svgWidth / 2;
            const maxOffsetY = svgHeight / 2;
            
            targetOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, targetOffsetX));
            targetOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, targetOffsetY));
        } catch (error) {
            console.error("Error in calculateCameraOffset:", error);
            // In case of error, gradually center the camera
            targetOffsetX *= 0.95;
            targetOffsetY *= 0.95;
        }
    }
    
    // Update camera position with smoothing
    function updateCamera() {
        if (!enabled) return;
        
        try {
            // Calculate the desired camera offset
            calculateCameraOffset();
            
            // Apply smoothing to camera movement
            offsetX += (targetOffsetX - offsetX) * settings.smoothingFactor;
            offsetY += (targetOffsetY - offsetY) * settings.smoothingFactor;
            
            // Draw the visual indicators
            drawVisualIndicators();
        } catch (error) {
            console.error("Error in updateCamera:", error);
            // In case of error, don't update the camera
        }
    }
    
    // Get current camera offset
    function getOffset() {
        return {
            x: offsetX,
            y: offsetY
        };
    }
    
    // Check if zot-centric mobility is enabled
    function isEnabled() {
        return enabled;
    }
    
    // Get current swarm center position
    function getSwarmCenter() {
        return {
            x: swarmCenterX,
            y: swarmCenterY
        };
    }
    
    // Apply wall offset for rendering
    function applyWallOffset(ctx) {
        if (!enabled) return;
        
        // Apply translation based on camera offset
        ctx.save();
        ctx.translate(offsetX, offsetY);
    }
    
    // Restore wall rendering context
    function restoreWallOffset(ctx) {
        if (!enabled) return;
        
        ctx.restore();
    }
    
    // Apply offset to a point (for collision detection and world-to-screen conversion)
    function applyOffsetToPoint(point) {
        if (!enabled || !point) return point;
        
        // Create a simple new point object with just x and y transformed
        // Copy any other properties directly without complex spread operations
        const result = {};
        
        // Copy all properties from the original point
        for (const key in point) {
            result[key] = point[key];
        }
        
        // Transform the coordinates
        result.x = point.x - offsetX;
        result.y = point.y - offsetY;
        
        return result;
    }
    
    // Remove offset from a point (for screen-to-world conversion)
    function removeOffsetFromPoint(point) {
        if (!enabled || !point) return point;
        
        // Create a simple new point object with just x and y transformed
        // Copy any other properties directly without complex spread operations
        const result = {};
        
        // Copy all properties from the original point
        for (const key in point) {
            result[key] = point[key];
        }
        
        // Transform the coordinates
        result.x = point.x + offsetX;
        result.y = point.y + offsetY;
        
        return result;
    }
    
    // Update settings from UI
    function updateSettings(property, value) {
        if (property in settings) {
            settings[property] = parseFloat(value);
            console.log(`Updated ZotCentricMobility setting: ${property} = ${value}`);
        }
    }
    
    // Get current settings
    function getSettings() {
        return { ...settings };
    }
    
    // Get a specific setting value
    function getSettingValue(property) {
        return settings[property];
    }
    
    // Public API
    return {
        init: init,
        enable: enable,
        disable: disable,
        update: updateCamera,
        getOffset: getOffset,
        isEnabled: isEnabled,
        getSwarmCenter: getSwarmCenter,
        applyWallOffset: applyWallOffset,
        restoreWallOffset: restoreWallOffset,
        applyOffsetToPoint: applyOffsetToPoint,
        removeOffsetFromPoint: removeOffsetFromPoint,
        // Add new settings-related methods
        updateSettings: updateSettings,
        getSettings: getSettings,
        getSettingValue: getSettingValue
    };
})(); 