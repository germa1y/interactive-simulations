// swipeSplitSystem.js - Handle swipe path drawing and effects
const SwipeSplitSystem = (function() {
    // Private variables
    let canvas;
    let ctx;
    let swipePaths = []; // Array to hold multiple swipe paths
    let activePathIndex = -1; // Index of the currently active path
    let pathWidth = 6;
    let isAttractMode = false; // Track if we're in attract (pull) or repel (push) mode
    
    // Force field parameters
    let forceRadius = 75;         // How far the force extends from the path
    let forceIntensity = 2;       // Base intensity of the force
    let attractMultiplier = 0.2;  // Multiplier for attract force strength
    let repelMultiplier = 3.0;    // Multiplier for repel force strength
    let forceDecayFactor = 0.98;  // How quickly force decays per frame
    let forceActive = true;       // Whether forces are active
    let baseDuration = 800;       // Base duration in milliseconds for path visibility (reduced from 3000)
    let decayDelay = 1000;        // Delay in ms before decay starts (1 second)
    
    // Path colors based on mode
    const pathColors = {
        attract: 'rgba(0, 150, 255, 0.8)',  // Blue for attract/pull
        repel: 'rgba(255, 100, 0, 0.8)'     // Orange for repel/push
    };
    let pathColor = pathColors.repel; // Default to repel color
    
    let lastPointTime = 0;
    let pointsAddedSinceDecay = 0;
    let pathCreationTime = 0;     // Time when the path was created
    
    // Settings for path decay
    let currentDecaySpeed = 0.01; // How quickly the path fades out (will be dynamically adjusted)
    const decayInterval = 16;     // Update interval in ms
    const minOpacity = 0.1;       // Minimum opacity while actively drawing
    
    // Calculate path duration based on force parameters
    function calculatePathDuration() {
        // Get current multiplier based on mode
        const modeMultiplier = isAttractMode ? attractMultiplier : repelMultiplier;
        
        // Original decay speed was 0.01 per 16ms interval
        const originalDecayRatePerSecond = 0.01 * (1000 / decayInterval);
        
        // Calculate a factor based on force parameters - now with much less influence
        // We're keeping a small influence but greatly reducing it
        const radiusFactor = 1.0 + (forceRadius / 50 - 1) * 0.15;       // 15% influence
        const intensityFactor = 1.0 + (forceIntensity / 0.8 - 1) * 0.15; // 15% influence
        const multiplierFactor = 1.0 + (modeMultiplier / 1.0 - 1) * 0.15; // 15% influence
        
        // Combined factor with extremely reduced impact
        const combinedFactor = Math.min(radiusFactor * intensityFactor * multiplierFactor, 1.5);
        
        // Cap the max duration to prevent extremely slow decay
        return Math.min(baseDuration * combinedFactor, 1200);
    }
    
    // Internal methods
    function drawPaths() {
        if (!ctx) return;
        
        // Draw each path
        swipePaths.forEach(path => {
            if (path.points.length < 2) return;
            
            ctx.save();
            
            // Set drawing properties
            ctx.globalAlpha = path.opacity;
            ctx.strokeStyle = path.color;
            ctx.lineWidth = pathWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // Begin path drawing
            ctx.beginPath();
            ctx.moveTo(path.points[0].x, path.points[0].y);
            
            // Draw path through all points
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i].x, path.points[i].y);
            }
            
            ctx.stroke();
            ctx.restore();
        });
    }
    
    // Create a decay timer for a specific path
    function startPathDecay(pathIndex, isFinalDecay = false) {
        const path = swipePaths[pathIndex];
        if (!path) return;
        
        // Clear any existing decay timer for this path
        if (path.decayTimer) {
            clearInterval(path.decayTimer);
        }
        
        // Calculate decay speed based on the path's properties
        const modeMultiplier = path.isAttract ? attractMultiplier : repelMultiplier;
        const radiusFactor = 1.0 + (forceRadius / 50 - 1) * 0.15;
        const intensityFactor = 1.0 + (forceIntensity / 0.8 - 1) * 0.15;
        const multiplierFactor = 1.0 + (modeMultiplier / 1.0 - 1) * 0.15;
        
        const combinedFactor = Math.min(radiusFactor * intensityFactor * multiplierFactor, 1.5);
        const pathDuration = Math.min(baseDuration * combinedFactor, 1200);
        const decaySpeed = 1.0 / (pathDuration / decayInterval);
        
        // Always add delay before starting decay, even for "final" decay
        // If path doesn't have a decayStartTime yet, set it
        if (!path.decayStartTime || path.decayStartTime < Date.now()) {
            path.decayStartTime = Date.now() + decayDelay;
        }
        
        // Store the final decay state for later
        path.pendingFinalDecay = isFinalDecay;
        
        // Save pathIndex and reference to the actual path object to prevent index confusion
        const pathRef = path;
        const savedPathIndex = path.pathIndex;
        
        // Start a new decay timer
        path.decayTimer = setInterval(() => {
            // Get current index from the saved reference rather than using the original pathIndex
            // This ensures we always operate on the correct path even if indices have changed
            const currentPathIndex = pathRef.pathIndex;
            
            // Safety check to make sure this path still exists in the array
            if (!swipePaths.includes(pathRef)) {
                clearInterval(pathRef.decayTimer);
                return;
            }
            
            const now = Date.now();
            
            // Skip decay if we're still in the delay period
            if (now < pathRef.decayStartTime) {
                return;
            }
            
            // Once delay period is over, check if this should be a final decay
            const shouldFinalDecay = pathRef.pendingFinalDecay;
            
            if (shouldFinalDecay) {
                // Final decay - fade out completely
                pathRef.opacity -= decaySpeed * 2;
                
                if (pathRef.opacity <= 0) {
                    clearInterval(pathRef.decayTimer);
                    pathRef.decayTimer = null;
                    
                    // Find the current index of this path and remove it
                    const currentIndex = swipePaths.indexOf(pathRef);
                    if (currentIndex !== -1) {
                        swipePaths.splice(currentIndex, 1);
                        
                        // Update activePathIndex if needed
                        if (activePathIndex >= currentIndex) {
                            activePathIndex = Math.max(-1, activePathIndex - 1);
                        }
                        
                        // Reassign all path indices to ensure consistency
                        swipePaths.forEach((p, i) => {
                            p.pathIndex = i;
                        });
                    }
                }
            } else {
                // Active decay - diminish but maintain minimum opacity if still adding points
                const inactiveTime = Date.now() - pathRef.lastPointTime;
                
                // If we haven't added points for a while, switch to final decay
                if (inactiveTime > 100 && currentPathIndex === activePathIndex) {
                    clearInterval(pathRef.decayTimer);
                    
                    // Mark this path as no longer active
                    if (activePathIndex === currentPathIndex) {
                        activePathIndex = -1;
                    }
                    
                    // Start final decay
                    pathRef.pendingFinalDecay = true;
                    startPathDecay(currentPathIndex, true);
                    return;
                }
                
                // Only decrease opacity if we haven't added new points recently
                if (pathRef.pointsAddedSinceDecay === 0) {
                    pathRef.opacity = Math.max(pathRef.opacity - decaySpeed, pathRef.isActive ? minOpacity : 0);
                } else {
                    // Reset counter after processing decay
                    pathRef.pointsAddedSinceDecay = 0;
                }
            }
        }, decayInterval);
    }
    
    // Update color based on current attract/repel mode
    function updatePathColor() {
        pathColor = isAttractMode ? pathColors.attract : pathColors.repel;
    }
    
    // Calculate distance from point to line segment
    function distToSegment(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        
        if (len_sq !== 0) {
            param = dot / len_sq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Calculate the force applied to a particle from all active paths
    function calculateForce(particle) {
        if (!forceActive || swipePaths.length === 0) return { fx: 0, fy: 0 };
        
        let totalFx = 0;
        let totalFy = 0;
        
        // Apply forces from all paths
        swipePaths.forEach(path => {
            if (path.points.length < 2) return;
            
            let minDist = Infinity;
            let closestPoint = { x: 0, y: 0 };
            
            // Find the closest point on this path to the particle
            for (let i = 1; i < path.points.length; i++) {
                const p1 = path.points[i-1];
                const p2 = path.points[i];
                
                // Calculate distance to this segment
                const dist = distToSegment(particle.x, particle.y, p1.x, p1.y, p2.x, p2.y);
                
                if (dist < minDist) {
                    minDist = dist;
                    
                    // Find the closest point on the segment (for force direction)
                    const A = particle.x - p1.x;
                    const B = particle.y - p1.y;
                    const C = p2.x - p1.x;
                    const D = p2.y - p1.y;
                    
                    const dot = A * C + B * D;
                    const len_sq = C * C + D * D;
                    let param = -1;
                    
                    if (len_sq !== 0) {
                        param = dot / len_sq;
                    }
                    
                    if (param < 0) {
                        closestPoint = { x: p1.x, y: p1.y };
                    } else if (param > 1) {
                        closestPoint = { x: p2.x, y: p2.y };
                    } else {
                        closestPoint = { 
                            x: p1.x + param * C,
                            y: p1.y + param * D
                        };
                    }
                }
            }
            
            // Calculate force if within range
            if (minDist < forceRadius) {
                // Force direction
                let dx = particle.x - closestPoint.x;
                let dy = particle.y - closestPoint.y;
                
                // Normalize direction
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    dx /= dist;
                    dy /= dist;
                }
                
                // If in attract mode, reverse the direction
                if (path.isAttract) {
                    dx = -dx;
                    dy = -dy;
                }
                
                // Calculate force strength (stronger when closer to the path)
                const forceFactor = (1 - minDist / forceRadius);
                
                // Apply appropriate multiplier based on mode
                const modeMultiplier = path.isAttract ? attractMultiplier : repelMultiplier;
                
                // Calculate force components for this path and add to total
                totalFx += dx * forceFactor * forceIntensity * modeMultiplier * path.opacity;
                totalFy += dy * forceFactor * forceIntensity * modeMultiplier * path.opacity;
            }
        });
        
        return { fx: totalFx, fy: totalFy };
    }
    
    // Public API
    return {
        init: function(canvasElement) {
            canvas = canvasElement;
            ctx = canvas.getContext('2d');
            
            // console.log("SwipeSplitSystem initialized");
            return this;
        },
        
        // Set attract/repel mode and update color
        setAttractMode: function(attractMode) {
            isAttractMode = attractMode;
            updatePathColor();
            return this;
        },
        
        // Start a new swipe path at the given coordinates
        startSwipePath: function(x, y) {
            // Create a new path
            const newPathIndex = swipePaths.length;
            const newPath = {
                points: [{ x, y }],
                isActive: true,
                opacity: 1.0,
                lastPointTime: Date.now(),
                creationTime: Date.now(),
                pointsAddedSinceDecay: 0,
                decayTimer: null,
                color: isAttractMode ? pathColors.attract : pathColors.repel,
                isAttract: isAttractMode,
                pathIndex: newPathIndex
            };
            
            // Add to paths array
            swipePaths.push(newPath);
            activePathIndex = newPathIndex;
            
            // Start the diminishing effect immediately
            startPathDecay(newPathIndex);
            
            // Ensure all paths have their correct pathIndex after adding a new one
            // This prevents index confusion when adding/removing paths
            swipePaths.forEach((path, idx) => {
                path.pathIndex = idx;
            });
            
            // console.log("Swipe path started at", x, y, "- Path #", newPathIndex);
            return this;
        },
        
        // Add a point to the current swipe path
        addPointToSwipePath: function(x, y) {
            // If no active path, ignore
            if (activePathIndex < 0 || activePathIndex >= swipePaths.length) return this;
            
            const path = swipePaths[activePathIndex];
            
            // Add the point to the active path
            path.points.push({ x, y });
            path.lastPointTime = Date.now();
            path.pointsAddedSinceDecay++;
            
            // Boost opacity slightly when adding new points to keep the line visible
            path.opacity = Math.min(path.opacity + 0.05, 1.0);
            
            return this;
        },
        
        // End the current swipe path and begin final decay
        endSwipePath: function() {
            // If no active path, ignore
            if (activePathIndex < 0 || activePathIndex >= swipePaths.length) return this;
            
            const path = swipePaths[activePathIndex];
            
            // console.log("Swipe path ended with", path.points.length, "points - Path #", activePathIndex);
            
            // Mark as inactive but keep it in the array to continue fading
            path.isActive = false;
            
            // Mark for final decay after the delay period
            path.pendingFinalDecay = true;
            
            // Make sure we have a decay timer running
            if (!path.decayTimer) {
                // If no timer exists, create one that will honor the delay
                startPathDecay(activePathIndex, true);
            }
            
            // No active path now
            activePathIndex = -1;
            
            return this;
        },
        
        // Draw the current swipe path (called from animation loop)
        draw: function() {
            if (swipePaths.length > 0) {
                drawPaths();
            }
            return this;
        },
        
        // Apply forces to a particle - returns the force to apply
        applyForces: function(particle) {
            if (!forceActive || swipePaths.length === 0) return { fx: 0, fy: 0 };
            return calculateForce(particle);
        },
        
        // Check if a swipe is currently active
        isSwipeActive: function() {
            return swipePaths.length > 0;
        },
        
        // Check if forces are active
        areForceEffectsActive: function() {
            return forceActive && swipePaths.length > 0;
        },
        
        // Update path and force settings (batch update)
        updateSettings: function(settings) {
            if (settings.pathColor) pathColor = settings.pathColor;
            if (settings.pathWidth) pathWidth = settings.pathWidth;
            if (settings.isAttractMode !== undefined) {
                isAttractMode = settings.isAttractMode;
                updatePathColor();
            }
            
            // Force settings
            if (settings.forceRadius !== undefined) {
                forceRadius = settings.forceRadius;
                // Update displayed value
                const radiusDisplay = document.getElementById('swipeForceRadiusValue');
                if (radiusDisplay) {
                    radiusDisplay.textContent = forceRadius;
                }
            }
            if (settings.forceIntensity !== undefined) {
                forceIntensity = settings.forceIntensity;
                // Update displayed value
                const intensityDisplay = document.getElementById('swipeForceIntensityValue');
                if (intensityDisplay) {
                    intensityDisplay.textContent = forceIntensity.toFixed(1);
                }
            }
            if (settings.attractMultiplier !== undefined) {
                attractMultiplier = settings.attractMultiplier;
                // Update displayed value
                const attractDisplay = document.getElementById('swipeAttractMultiplierValue');
                if (attractDisplay) {
                    attractDisplay.textContent = attractMultiplier.toFixed(1);
                }
            }
            if (settings.repelMultiplier !== undefined) {
                repelMultiplier = settings.repelMultiplier;
                // Update displayed value
                const repelDisplay = document.getElementById('swipeRepelMultiplierValue');
                if (repelDisplay) {
                    repelDisplay.textContent = repelMultiplier.toFixed(1);
                }
            }
            if (settings.forceActive !== undefined) forceActive = settings.forceActive;
            
            // If we have an active path, recalculate the decay speed
            if (activePathIndex >= 0 && swipePaths[activePathIndex].decayTimer) {
                clearInterval(swipePaths[activePathIndex].decayTimer);
                startPathDecay(activePathIndex, false);
            }
            
            return this;
        },
        
        // Get all settings for saving
        getSettings: function() {
            return {
                forceRadius,
                forceIntensity,
                attractMultiplier,
                repelMultiplier,
                forceActive,
                pathCount: swipePaths.length
            };
        },
        
        // Update a single setting - used when loading saved swarms
        updateSetting: function(key, value) {
            // Only update valid settings
            if (key === 'forceRadius' && typeof value === 'number') {
                forceRadius = value;
                // Update UI if present
                const radiusSlider = document.getElementById('swipeForceRadius');
                if (radiusSlider) radiusSlider.value = value;
                const radiusValue = document.getElementById('swipeForceRadiusValue');
                if (radiusValue) radiusValue.textContent = value;
            } 
            else if (key === 'forceIntensity' && typeof value === 'number') {
                forceIntensity = value;
                // Update UI if present
                const intensitySlider = document.getElementById('swipeForceIntensity');
                if (intensitySlider) intensitySlider.value = value;
                const intensityValue = document.getElementById('swipeForceIntensityValue');
                if (intensityValue) intensityValue.textContent = value;
            }
            else if (key === 'attractMultiplier' && typeof value === 'number') {
                attractMultiplier = value;
                // Update UI if present
                const attractSlider = document.getElementById('swipeAttractMultiplier');
                if (attractSlider) attractSlider.value = value;
                const attractValue = document.getElementById('swipeAttractMultiplierValue');
                if (attractValue) attractValue.textContent = value;
            }
            else if (key === 'repelMultiplier' && typeof value === 'number') {
                repelMultiplier = value;
                // Update UI if present
                const repelSlider = document.getElementById('swipeRepelMultiplier');
                if (repelSlider) repelSlider.value = value;
                const repelValue = document.getElementById('swipeRepelMultiplierValue');
                if (repelValue) repelValue.textContent = value;
            }
            else if (key === 'forceActive' && typeof value === 'boolean') {
                forceActive = value;
                // Update UI if present
                const forceToggle = document.getElementById('swipeForcesEnabled');
                if (forceToggle) forceToggle.checked = value;
            }
            return true;
        }
    };
})(); 