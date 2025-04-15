// zotCentricControls.js - Joystick-like map navigation using zot swarms
const ZotCentricControls = (function() {
    // Private variables
    let canvas;
    let ctx;
    let width, height;
    let isActive = false;
    let crosshairElement = null;
    let crosshairSize = 20; // Size of the crosshair in pixels
    let crosshairColor = 'rgba(255, 255, 255, 0.8)'; // Semi-transparent white
    let crosshairStrokeWidth = 2;
    
    // Initialize the control system
    function init(canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        width = window.innerWidth;
        height = window.innerHeight;
        
        // Listen for window resize to update the center position
        window.addEventListener('resize', handleResize);
        
        // console.log('ZotCentricControls initialized');
        
        return {
            activate,
            deactivate
        };
    }
    
    // Handle window resize
    function handleResize() {
        width = window.innerWidth;
        height = window.innerHeight;
        
        // Update crosshair position if it exists
        if (crosshairElement) {
            positionCrosshair();
        }
    }
    
    // Create and show the crosshair
    function createCrosshair() {
        // Remove existing crosshair if present
        removeCrosshair();
        
        // Create the crosshair element
        crosshairElement = document.createElement('div');
        crosshairElement.id = 'map-crosshair';
        crosshairElement.className = 'map-crosshair';
        
        // Create horizontal line
        const horizontalLine = document.createElement('div');
        horizontalLine.className = 'crosshair-line horizontal';
        
        // Create vertical line
        const verticalLine = document.createElement('div');
        verticalLine.className = 'crosshair-line vertical';
        
        // Create center dot
        const centerDot = document.createElement('div');
        centerDot.className = 'crosshair-center';
        
        // Add all parts to the crosshair
        crosshairElement.appendChild(horizontalLine);
        crosshairElement.appendChild(verticalLine);
        crosshairElement.appendChild(centerDot);
        
        // Add crosshair to the document body
        document.body.appendChild(crosshairElement);
        
        // Position the crosshair
        positionCrosshair();
        
        // Add CSS styles for the crosshair
        addCrosshairStyles();
    }
    
    // Position the crosshair in the center of the screen
    function positionCrosshair() {
        if (!crosshairElement) return;
        
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
        
        crosshairElement.style.left = `${centerX}px`;
        crosshairElement.style.top = `${centerY}px`;
    }
    
    // Add CSS styles for the crosshair
    function addCrosshairStyles() {
        // Check if styles already exist
        if (document.getElementById('zot-centric-controls-styles')) return;
        
        // Create style element
        const style = document.createElement('style');
        style.id = 'zot-centric-controls-styles';
        
        // Define CSS
        style.textContent = `
            .map-crosshair {
                position: absolute;
                pointer-events: none;
                transform: translate(-50%, -50%);
                z-index: 1000;
            }
            
            .crosshair-line {
                position: absolute;
                background-color: ${crosshairColor};
                pointer-events: none;
            }
            
            .crosshair-line.horizontal {
                width: ${crosshairSize}px;
                height: ${crosshairStrokeWidth}px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
            
            .crosshair-line.vertical {
                width: ${crosshairStrokeWidth}px;
                height: ${crosshairSize}px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
            
            .crosshair-center {
                position: absolute;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background-color: ${crosshairColor};
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
        `;
        
        // Add to document head
        document.head.appendChild(style);
    }
    
    // Remove the crosshair
    function removeCrosshair() {
        if (crosshairElement) {
            crosshairElement.remove();
            crosshairElement = null;
        }
    }
    
    // Activate the control system (called when an SVG map is loaded)
    function activate() {
        if (isActive) return;
        
        isActive = true;
        createCrosshair();
        // console.log('ZotCentricControls activated');
    }
    
    // Deactivate the control system (called when the map is cleared/removed)
    function deactivate() {
        if (!isActive) return;
        
        isActive = false;
        removeCrosshair();
        // console.log('ZotCentricControls deactivated');
    }
    
    // Public API
    return {
        init,
        activate,
        deactivate
    };
})(); 