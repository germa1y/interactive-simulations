// membrane.js - Membrane system for particle permeability effects
const MembraneSystem = (function() {
    // Debug flag
    const DEBUG = true;
    
    // Membrane collection
    let membranes = [];
    
    // Membrane field and properties
    let membraneField = null; // Will be initialized as Float32Array
    let fieldWidth = 0;
    let fieldHeight = 0;
    
    // Membrane properties
    const membraneSettings = {
        permeabilityBase: 0.5,      // Base permeability value (0-1)
        permeabilityVariance: 0.2,   // How much permeability can vary
        permeabilityDecay: 0.05,     // How fast permeability returns to base value
        visualThickness: 3,          // Visual thickness of membranes
        color: 'rgba(80, 200, 255, 0.7)',  // Default membrane color
        glowColor: 'rgba(80, 200, 255, 0.4)', // Glow effect color
        glowRadius: 8,               // Glow effect radius
        energyTransfer: 0.1,         // Energy particles transfer to membrane on crossing
        energyLoss: 0.1,             // Energy particles lose when crossing membrane
        toroidalWrapping: true       // Whether membranes allow toroidal wrapping
    };
    
    // Membrane presets
    const MEMBRANE_PRESETS = {
        STANDARD: {
            color: 'rgba(80, 200, 255, 0.7)',
            glowColor: 'rgba(80, 200, 255, 0.4)',
            permeabilityBase: 0.5,
            energyTransfer: 0.1
        },
        HIGH_PERMEABILITY: {
            color: 'rgba(0, 255, 136, 0.6)',
            glowColor: 'rgba(0, 255, 136, 0.3)',
            permeabilityBase: 0.8,
            energyTransfer: 0.05
        },
        LOW_PERMEABILITY: {
            color: 'rgba(255, 51, 102, 0.7)',
            glowColor: 'rgba(255, 51, 102, 0.3)',
            permeabilityBase: 0.2,
            energyTransfer: 0.15
        },
        ADAPTIVE: {
            color: 'rgba(255, 215, 0, 0.6)',
            glowColor: 'rgba(255, 215, 0, 0.3)',
            permeabilityBase: 0.5,
            permeabilityVariance: 0.4,
            energyTransfer: 0.2
        }
    };
    
    // Initialize membrane system
    function init(canvasWidth, canvasHeight) {
        if (DEBUG) console.log("MembraneSystem.init called with dimensions:", canvasWidth, canvasHeight);
        
        fieldWidth = canvasWidth;
        fieldHeight = canvasHeight;
        
        // Initialize the permeability field
        try {
            membraneField = new Float32Array(fieldWidth * fieldHeight);
            
            // Set default values
            resetMembraneField();
            
            if (DEBUG) console.log("MembraneSystem initialized:", fieldWidth, "x", fieldHeight);
            return true;
        } catch (error) {
            console.error("Error initializing MembraneSystem:", error);
            return false;
        }
    }
    
    // Debug function to check if the module is loaded properly
    function debug() {
        console.log("MembraneSystem is loaded and debug function is accessible!");
        return true;
    }
    
    // Reset the membrane field to base values
    function resetMembraneField() {
        const baseValue = membraneSettings.permeabilityBase;
        for (let i = 0; i < membraneField.length; i++) {
            membraneField[i] = baseValue;
        }
    }
    
    // Create a new membrane
    function createMembrane(x1, y1, x2, y2, preset = 'STANDARD') {
        const presetConfig = MEMBRANE_PRESETS[preset] || MEMBRANE_PRESETS.STANDARD;
        
        const membrane = {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            permeabilityBase: presetConfig.permeabilityBase || membraneSettings.permeabilityBase,
            color: presetConfig.color || membraneSettings.color,
            glowColor: presetConfig.glowColor || membraneSettings.glowColor,
            energyTransfer: presetConfig.energyTransfer || membraneSettings.energyTransfer,
            energyLevel: 0,  // Current energy level affects permeability and visual effects
            permeabilityMap: new Float32Array(100)  // Store permeability along the membrane
        };
        
        // Initialize permeability map
        for (let i = 0; i < membrane.permeabilityMap.length; i++) {
            membrane.permeabilityMap[i] = membrane.permeabilityBase;
        }
        
        membranes.push(membrane);
        return membranes.length - 1;  // Return index of new membrane
    }
    
    // Remove a membrane by index
    function removeMembrane(index) {
        if (index >= 0 && index < membranes.length) {
            membranes.splice(index, 1);
            return true;
        }
        return false;
    }
    
    // Get permeability at a specific position
    function getPermeabilityAt(x, y) {
        if (x < 0 || x >= fieldWidth || y < 0 || y >= fieldHeight) {
            return membraneSettings.permeabilityBase; // Default for out of bounds
        }
        
        const index = Math.floor(y) * fieldWidth + Math.floor(x);
        return membraneField[index];
    }
    
    // Update membrane permeability based on particle interaction
    function updateMembranePermeability(x, y, energy) {
        // Find the membrane point closest to the particle
        let closestMembrane = null;
        let closestDistance = Infinity;
        let closestMembranePoint = null;
        
        for (const membrane of membranes) {
            const distance = distToSegment(x, y, membrane.x1, membrane.y1, membrane.x2, membrane.y2);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestMembrane = membrane;
                
                // Calculate the closest point on the membrane
                const segmentLength = Math.sqrt(
                    Math.pow(membrane.x2 - membrane.x1, 2) + 
                    Math.pow(membrane.y2 - membrane.y1, 2)
                );
                
                // Project particle position onto membrane line
                const dx = membrane.x2 - membrane.x1;
                const dy = membrane.y2 - membrane.y1;
                
                // Parametric value along the line (0 to 1)
                let t = ((x - membrane.x1) * dx + (y - membrane.y1) * dy) / 
                        (dx * dx + dy * dy);
                
                // Clamp to line segment
                t = Math.max(0, Math.min(1, t));
                
                // Position along membrane (0 to permeabilityMap.length-1)
                const mapIndex = Math.floor(t * (membrane.permeabilityMap.length - 1));
                closestMembranePoint = {
                    membrane: closestMembrane,
                    index: mapIndex
                };
            }
        }
        
        // If we found a close membrane, update its permeability at that point
        if (closestMembrane && closestDistance < membraneSettings.visualThickness * 2) {
            const idx = closestMembranePoint.index;
            const energyImpact = energy * membraneSettings.energyTransfer;
            
            // Increase permeability in this local area
            closestMembrane.permeabilityMap[idx] = Math.min(
                1.0, 
                closestMembrane.permeabilityMap[idx] + energyImpact
            );
            
            // Also affect adjacent points with less intensity
            const spread = 5; // How many adjacent points are affected
            for (let i = 1; i <= spread; i++) {
                const factor = (spread - i + 1) / (spread + 1); // Decreasing factor
                
                // Update permeability to the left
                if (idx - i >= 0) {
                    closestMembrane.permeabilityMap[idx - i] = Math.min(
                        1.0,
                        closestMembrane.permeabilityMap[idx - i] + energyImpact * factor
                    );
                }
                
                // Update permeability to the right
                if (idx + i < closestMembrane.permeabilityMap.length) {
                    closestMembrane.permeabilityMap[idx + i] = Math.min(
                        1.0,
                        closestMembrane.permeabilityMap[idx + i] + energyImpact * factor
                    );
                }
            }
            
            closestMembrane.energyLevel += energyImpact;
            
            return {
                didCross: Math.random() < closestMembrane.permeabilityMap[idx],
                energyLoss: membraneSettings.energyLoss
            };
        }
        
        return {
            didCross: true,
            energyLoss: 0
        };
    }
    
    // Decay permeability back to base values over time
    function updateMembranes() {
        // Update all membrane permeabilities
        for (const membrane of membranes) {
            // Decay each point in the permeability map
            for (let i = 0; i < membrane.permeabilityMap.length; i++) {
                const currentValue = membrane.permeabilityMap[i];
                const baseValue = membrane.permeabilityBase;
                
                // Move current value toward base value
                if (currentValue > baseValue) {
                    membrane.permeabilityMap[i] = Math.max(
                        baseValue,
                        currentValue - membraneSettings.permeabilityDecay
                    );
                } else if (currentValue < baseValue) {
                    membrane.permeabilityMap[i] = Math.min(
                        baseValue,
                        currentValue + membraneSettings.permeabilityDecay
                    );
                }
            }
            
            // Decay overall energy level
            membrane.energyLevel *= (1 - membraneSettings.permeabilityDecay);
        }
    }
    
    // Apply membrane interaction effects to a particle
    function applyMembraneEffects(particle, prevX, prevY) {
        // If particle crossed a significant distance, check for membrane crossings
        const dx = particle.x - prevX;
        const dy = particle.y - prevY;
        const distanceMoved = Math.sqrt(dx * dx + dy * dy);
        
        if (distanceMoved > 1) {
            // Check if the particle path crosses any membrane
            for (const membrane of membranes) {
                if (lineSegmentsIntersect(
                    prevX, prevY, particle.x, particle.y,
                    membrane.x1, membrane.y1, membrane.x2, membrane.y2
                )) {
                    // Calculate particle energy (based on velocity magnitude)
                    const energy = Math.sqrt(
                        particle.vx * particle.vx + 
                        particle.vy * particle.vy
                    );
                    
                    // Apply permeability effects
                    const result = updateMembranePermeability(
                        (prevX + particle.x) / 2, 
                        (prevY + particle.y) / 2, 
                        energy
                    );
                    
                    // Decide whether to allow crossing or bounce
                    if (!result.didCross) {
                        // Bounce (reflect velocity)
                        // Calculate the normal vector to the membrane
                        const normal = normalToSegment(
                            particle.x, particle.y,
                            membrane.x1, membrane.y1,
                            membrane.x2, membrane.y2
                        );
                        
                        // Reflect velocity across the normal
                        const dot = particle.vx * normal.x + particle.vy * normal.y;
                        particle.vx -= 2 * dot * normal.x;
                        particle.vy -= 2 * dot * normal.y;
                        
                        // Apply energy loss from bounce
                        particle.vx *= (1 - result.energyLoss);
                        particle.vy *= (1 - result.energyLoss);
                        
                        // Move particle back to just before the membrane
                        const t = lineIntersectionParameter(
                            prevX, prevY, particle.x, particle.y,
                            membrane.x1, membrane.y1, membrane.x2, membrane.y2
                        );
                        
                        if (t >= 0 && t <= 1) {
                            // Place particle just before the intersection
                            particle.x = prevX + (particle.x - prevX) * (t - 0.01);
                            particle.y = prevY + (particle.y - prevY) * (t - 0.01);
                        }
                        
                        return false; // Did not cross
                    } else {
                        // Allow crossing but reduce energy
                        particle.vx *= (1 - result.energyLoss);
                        particle.vy *= (1 - result.energyLoss);
                        return true; // Did cross
                    }
                }
            }
        }
        
        return true; // No membrane interaction
    }
    
    // Calculate parameter t for line intersection
    function lineIntersectionParameter(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        if (denom === 0) {
            return -1; // Parallel lines
        }
        
        return (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
    }
    
    // Distance from point to line segment (same as in WallSystem)
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
    
    // Calculate normal vector to a line segment (same as in WallSystem)
    function normalToSegment(px, py, x1, y1, x2, y2) {
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
        
        // Vector from closest point to particle
        const dx = px - xx;
        const dy = py - yy;
        
        // Normalize
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return { x: 0, y: 0 };
        
        return { x: dx / dist, y: dy / dist };
    }
    
    // Check if line segments intersect (same as in WallSystem)
    function lineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        if (denom === 0) {
            return false; // Parallel lines
        }
        
        const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
        const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
        
        return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
    }
    
    // Render all membranes
    function renderMembranes(ctx) {
        if (!membranes.length) return;
        
        // Draw each membrane
        for (const membrane of membranes) {
            // Calculate color based on energy level
            const baseColor = membrane.color;
            const glowColor = membrane.glowColor;
            
            // Draw glow effect
            ctx.beginPath();
            ctx.strokeStyle = glowColor;
            ctx.lineWidth = membraneSettings.visualThickness + membrane.energyLevel * 5;
            ctx.lineCap = 'round';
            ctx.moveTo(membrane.x1, membrane.y1);
            ctx.lineTo(membrane.x2, membrane.y2);
            ctx.stroke();
            
            // Draw the permeability variation along the membrane
            const length = Math.sqrt(
                Math.pow(membrane.x2 - membrane.x1, 2) + 
                Math.pow(membrane.y2 - membrane.y1, 2)
            );
            
            // If the membrane is long enough, draw permeability indicators
            if (length > 30) {
                const segmentCount = Math.min(membrane.permeabilityMap.length, Math.floor(length / 5));
                const dx = (membrane.x2 - membrane.x1) / segmentCount;
                const dy = (membrane.y2 - membrane.y1) / segmentCount;
                
                for (let i = 0; i < segmentCount; i++) {
                    const x = membrane.x1 + i * dx;
                    const y = membrane.y1 + i * dy;
                    
                    // Get permeability at this point
                    const mapIndex = Math.floor(i * membrane.permeabilityMap.length / segmentCount);
                    const permeability = membrane.permeabilityMap[mapIndex];
                    
                    // Draw permeability indicator - more transparent = more permeable
                    const alpha = 0.8 - permeability * 0.6; // 0.2 to 0.8 opacity
                    
                    // Extract RGB from baseColor and create new rgba
                    let r, g, b;
                    if (baseColor.startsWith('rgba')) {
                        const parts = baseColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
                        if (parts) {
                            r = parts[1];
                            g = parts[2];
                            b = parts[3];
                        }
                    } else if (baseColor.startsWith('rgb')) {
                        const parts = baseColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                        if (parts) {
                            r = parts[1];
                            g = parts[2];
                            b = parts[3];
                        }
                    } else {
                        // Default if color parsing fails
                        r = 80;
                        g = 200;
                        b = 255;
                    }
                    
                    const color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    
                    // Draw a small segment
                    ctx.beginPath();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = membraneSettings.visualThickness;
                    ctx.lineCap = 'butt';
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + dx, y + dy);
                    ctx.stroke();
                }
            } else {
                // For short membranes, just draw with average permeability
                let avgPermeability = 0;
                for (let i = 0; i < membrane.permeabilityMap.length; i++) {
                    avgPermeability += membrane.permeabilityMap[i];
                }
                avgPermeability /= membrane.permeabilityMap.length;
                
                const alpha = 0.8 - avgPermeability * 0.6;
                
                // Extract RGB components
                let r, g, b;
                if (baseColor.startsWith('rgba')) {
                    const parts = baseColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
                    if (parts) {
                        r = parts[1];
                        g = parts[2];
                        b = parts[3];
                    }
                } else if (baseColor.startsWith('rgb')) {
                    const parts = baseColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    if (parts) {
                        r = parts[1];
                        g = parts[2];
                        b = parts[3];
                    }
                } else {
                    // Default if color parsing fails
                    r = 80;
                    g = 200;
                    b = 255;
                }
                
                const color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                
                // Draw the membrane
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = membraneSettings.visualThickness;
                ctx.lineCap = 'round';
                ctx.moveTo(membrane.x1, membrane.y1);
                ctx.lineTo(membrane.x2, membrane.y2);
                ctx.stroke();
            }
        }
    }
    
    // Handle toroidal wrapping near membranes
    function handleToroidalWrapping(particle, width, height) {
        if (!membraneSettings.toroidalWrapping) return false;
        
        let wrapped = false;
        const edgeThreshold = 10;
        
        // Check if particle is near an edge
        if (particle.x < edgeThreshold || particle.x > width - edgeThreshold || 
            particle.y < edgeThreshold || particle.y > height - edgeThreshold) {
            
            // Check for membrane proximity
            for (const membrane of membranes) {
                const distance = distToSegment(
                    particle.x, particle.y,
                    membrane.x1, membrane.y1,
                    membrane.x2, membrane.y2
                );
                
                if (distance < membraneSettings.visualThickness * 2) {
                    // Particle is near a membrane and near the edge
                    // Get the permeability at this location
                    const energy = Math.sqrt(
                        particle.vx * particle.vx + 
                        particle.vy * particle.vy
                    );
                    
                    const result = updateMembranePermeability(
                        particle.x, particle.y, 
                        energy
                    );
                    
                    // Determine if particle should wrap
                    if (Math.random() < result.didCross) {
                        // Apply toroidal wrapping with energy loss
                        if (particle.x < edgeThreshold) {
                            particle.x += width;
                            wrapped = true;
                        } else if (particle.x > width - edgeThreshold) {
                            particle.x -= width;
                            wrapped = true;
                        }
                        
                        if (particle.y < edgeThreshold) {
                            particle.y += height;
                            wrapped = true;
                        } else if (particle.y > height - edgeThreshold) {
                            particle.y -= height;
                            wrapped = true;
                        }
                        
                        // Apply energy loss from crossing
                        if (wrapped) {
                            particle.vx *= (1 - result.energyLoss);
                            particle.vy *= (1 - result.energyLoss);
                        }
                    }
                    
                    return wrapped;
                }
            }
        }
        
        return false;
    }
    
    // Update settings
    function updateSettings(newSettings) {
        Object.assign(membraneSettings, newSettings);
    }
    
    // Public API
    return {
        init,
        debug,
        createMembrane,
        removeMembrane,
        updateMembranes,
        applyMembraneEffects,
        handleToroidalWrapping,
        renderMembranes,
        updateSettings,
        getPresets: function() {
            return MEMBRANE_PRESETS;
        }
    };
})();

// Add this for CommonJS module compatibility
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = MembraneSystem;
} 