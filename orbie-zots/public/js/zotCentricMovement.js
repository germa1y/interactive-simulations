// zotCentricMovement.js - Camera-like system for zot-centric world movement
const ZotCentricMovement = (function() {
    // Private variables
    let enabled = false;           // Whether zot-centric mode is active
    let offsetX = 0;               // Current X offset of the world
    let offsetY = 0;               // Current Y offset of the world
    let targetOffsetX = 0;         // Target X offset (for smooth movement)
    let targetOffsetY = 0;         // Target Y offset (for smooth movement)
    let worldWidth = 0;            // Width of the loaded map
    let worldHeight = 0;           // Height of the loaded map
    let previousSwarmCenterX = 0;  // Previous swarm center X for tracking movement
    let previousSwarmCenterY = 0;  // Previous swarm center Y for tracking movement
    let deadZoneRadius = 0.05;     // 5% dead zone as a percentage of screen size
    let maxSteeringForce = 4.0;    // Maximum steering force at edges
    let cameraSmoothFactor = 0.15; // Camera smoothing factor (0-1)
    let screenWidth = 0;           // Current screen width
    let screenHeight = 0;          // Current screen height
    let isTouchActive = false;     // Whether touch input is currently active
    let touchX = 0;                // Current touch X position
    let touchY = 0;                // Current touch Y position
    
    // Settings for the analog stick-like behavior
    const settings = {
        deadZonePercent: 0.05,     // 5% dead zone
        maxSteeringForce: 4.0,     // Maximum steering force
        powerCurve: 1.5,           // Non-linear response curve
        centeringForceMax: 0.15,   // Strong centering force when near center
        centeringForceMin: 0.05,   // Reduced centering force when far from center
        cameraSmoothFactor: 0.15,  // Camera smoothing factor
    };
    
    // Initialize the system
    function init(width, height) {
        screenWidth = width || window.innerWidth;
        screenHeight = height || window.innerHeight;
        
        // Set up window resize listener
        window.addEventListener('resize', function() {
            screenWidth = window.innerWidth;
            screenHeight = window.innerHeight;
        });
        
        console.log("ZotCentricMovement initialized with screen dimensions:", screenWidth, screenHeight);
    }
    
    // Enable zot-centric movement mode
    function enable(svgWidth, svgHeight) {
        enabled = true;
        worldWidth = svgWidth || screenWidth * 2;
        worldHeight = svgHeight || screenHeight * 2;
        
        // Reset offsets when enabling
        offsetX = 0;
        offsetY = 0;
        targetOffsetX = 0;
        targetOffsetY = 0;
        
        console.log("ZotCentricMovement enabled with world dimensions:", worldWidth, worldHeight);
    }
    
    // Disable zot-centric movement mode
    function disable() {
        enabled = false;
        offsetX = 0;
        offsetY = 0;
        targetOffsetX = 0;
        targetOffsetY = 0;
        
        console.log("ZotCentricMovement disabled");
    }
    
    // Calculate the average center position of all zot swarms
    function calculateSwarmCenter(zotSwarms) {
        if (!zotSwarms || zotSwarms.length === 0) {
            return { x: screenWidth / 2, y: screenHeight / 2 };
        }
        
        let totalX = 0;
        let totalY = 0;
        let totalZots = 0;
        
        // Sum positions of all zots in all swarms
        zotSwarms.forEach(swarm => {
            swarm.zots.forEach(zot => {
                totalX += zot.x;
                totalY += zot.y;
                totalZots++;
            });
        });
        
        // Calculate average position
        const centerX = totalZots > 0 ? totalX / totalZots : screenWidth / 2;
        const centerY = totalZots > 0 ? totalY / totalZots : screenHeight / 2;
        
        return { x: centerX, y: centerY };
    }
    
    // Update the world offset based on swarm position or touch input
    function update(zotSwarms, dt) {
        if (!enabled) return { x: 0, y: 0 };
        
        // Calculate the current center of the swarm
        const swarmCenter = calculateSwarmCenter(zotSwarms);
        
        // Calculate the screen center
        const screenCenterX = screenWidth / 2;
        const screenCenterY = screenHeight / 2;
        
        // Calculate swarm displacement from center
        const displacementX = swarmCenter.x - screenCenterX;
        const displacementY = swarmCenter.y - screenCenterY;
        
        // Calculate displacement as a percentage of screen size
        const percentX = displacementX / screenWidth;
        const percentY = displacementY / screenHeight;
        
        // Calculate displacement magnitude as percentage
        const magnitude = Math.sqrt(percentX * percentX + percentY * percentY);
        
        // If touch is active, use that for direction instead of swarm position
        if (isTouchActive) {
            // Calculate touch displacement from center
            const touchDisplacementX = touchX - screenCenterX;
            const touchDisplacementY = touchY - screenCenterY;
            
            // Calculate touch displacement as percentage of screen size
            const touchPercentX = touchDisplacementX / screenWidth;
            const touchPercentY = touchDisplacementY / screenHeight;
            
            // Calculate touch magnitude
            const touchMagnitude = Math.sqrt(touchPercentX * touchPercentX + touchPercentY * touchPercentY);
            
            // Apply dead zone
            if (touchMagnitude > settings.deadZonePercent) {
                // Normalize touch direction
                const normalizedX = touchPercentX / touchMagnitude;
                const normalizedY = touchPercentY / touchMagnitude;
                
                // Calculate force using power curve, scaled to max steering force
                const adjustedMagnitude = Math.min(1.0, touchMagnitude);
                const force = settings.maxSteeringForce * Math.pow(adjustedMagnitude, settings.powerCurve);
                
                // Calculate change in target offset based on touch
                // Note: We move the world in the opposite direction of the touch
                targetOffsetX -= normalizedX * force * dt;
                targetOffsetY -= normalizedY * force * dt;
            }
        } else {
            // Analog stick behavior when no touch is active
            
            // Apply dead zone
            if (magnitude > settings.deadZonePercent) {
                // Normalize direction
                const normalizedX = percentX / magnitude;
                const normalizedY = percentY / magnitude;
                
                // Calculate force using power curve, scaled to max steering force
                const adjustedMagnitude = Math.min(1.0, magnitude);
                const force = settings.maxSteeringForce * Math.pow(adjustedMagnitude, settings.powerCurve);
                
                // Calculate change in target offset
                // Note: We move the world in the opposite direction of the swarm displacement
                targetOffsetX -= normalizedX * force * dt;
                targetOffsetY -= normalizedY * force * dt;
            }
            
            // Apply dynamic centering force based on swarm's distance from center
            // This pulls the camera toward the swarm's position
            // Centering force decreases as swarm gets further from center
            const centeringForce = lerp(
                settings.centeringForceMax,
                settings.centeringForceMin,
                Math.min(1.0, magnitude / 0.3) // Decrease centering as we move away up to 30% screen
            );
            
            // Apply centering force (pulls the target offset toward the swarm)
            targetOffsetX += displacementX * centeringForce * dt;
            targetOffsetY += displacementY * centeringForce * dt;
        }
        
        // Boundary checking - prevent the world from moving too far away
        const maxOffsetX = worldWidth / 2;
        const maxOffsetY = worldHeight / 2;
        
        targetOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, targetOffsetX));
        targetOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, targetOffsetY));
        
        // Smooth camera movement
        offsetX = lerp(offsetX, targetOffsetX, settings.cameraSmoothFactor);
        offsetY = lerp(offsetY, targetOffsetY, settings.cameraSmoothFactor);
        
        // Store current swarm center for next frame
        previousSwarmCenterX = swarmCenter.x;
        previousSwarmCenterY = swarmCenter.y;
        
        // Return the current offset
        return { x: offsetX, y: offsetY };
    }
    
    // Linear interpolation helper function
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    // Handle touch input
    function setTouchPosition(x, y, isActive) {
        touchX = x;
        touchY = y;
        isTouchActive = isActive;
    }
    
    // Public API
    return {
        init: init,
        enable: enable,
        disable: disable,
        update: update,
        setTouchPosition: setTouchPosition,
        getOffset: function() { return { x: offsetX, y: offsetY }; },
        isEnabled: function() { return enabled; },
        updateSettings: function(newSettings) {
            Object.assign(settings, newSettings);
        }
    };
})(); 