// walls.js - Wall system for Orbie & Zot interactions
const WallSystem = (function() {
    // Wall collection
    let walls = [];
    
    // Wall properties
    const wallSettings = {
        wallForce: 1.0,        // Strength of wall repulsion
        wallPerception: 30,    // Distance at which particles detect walls
        visualThickness: 2,    // Visual thickness of walls
        color: '#ffffff',      // Default wall color
        glowColor: 'rgba(255, 255, 255, 0.3)', // Glow effect color
        glowRadius: 5,         // Glow effect radius
        segmentCount: 10       // Segments to approximate curves
    };
    
    // Wall interaction types - bitmask for entities that are blocked by this wall
    const INTERACTION_TYPES = {
        ALL: 0b1111,            // Blocks everything
        NONE: 0b0000,           // Blocks nothing
        ORBIE: 0b0001,          // Blocks Orbie
        ORBIE_SWARM: 0b0010,    // Blocks Orbie's swarm
        ZOT: 0b0100,            // Blocks individual Zots
        ZOT_SWARM: 0b1000,      // Blocks Zot swarms
        NOT_ORBIE: 0b1110,      // Blocks everything except Orbie
        NOT_ORBIE_FAMILY: 0b1100, // Blocks only Zots and Zot swarms
        ONLY_ZOTS: 0b0100       // Blocks only individual Zots
    };
    
    // Color presets for wall types
    const WALL_PRESETS = {
        STANDARD: {
            color: '#ffffff',
            glowColor: 'rgba(255, 255, 255, 0.3)',
            interactionType: INTERACTION_TYPES.ALL,
            force: 1.0
        },
        ORBIE_ONLY: {
            color: '#ff3366',
            glowColor: 'rgba(255, 51, 102, 0.3)',
            interactionType: INTERACTION_TYPES.ORBIE,
            force: 1.0
        },
        GOLDEN_PATH: {
            color: '#ffd700',
            glowColor: 'rgba(255, 215, 0, 0.5)',
            interactionType: INTERACTION_TYPES.NOT_ORBIE_FAMILY,
            force: 1.5
        },
        GHOST_WALL: {
            color: 'rgba(80, 200, 255, 0.7)',
            glowColor: 'rgba(80, 200, 255, 0.3)',
            interactionType: INTERACTION_TYPES.ZOT,
            force: 0.5
        },
        ENERGY_FIELD: {
            color: '#00ff88',
            glowColor: 'rgba(0, 255, 136, 0.4)',
            interactionType: INTERACTION_TYPES.ALL,
            force: 0.3
        }
    };
    
    // Physics utility functions
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
    
    // Calculate normal vector to a line segment
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
    
    // Check if line segments intersect (for collision detection)
    function lineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        if (denom === 0) {
            return false; // Parallel lines
        }
        
        const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
        const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
        
        return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
    }
    
    // Add curve utilities for bezier and arc approximation
    function approximateCubicBezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2, segmentCount = 10) {
        const points = [];
        for (let i = 0; i <= segmentCount; i++) {
            const t = i / segmentCount;
            
            // Cubic Bezier formula
            const u = 1 - t;
            const tt = t * t;
            const uu = u * u;
            const uuu = uu * u;
            const ttt = tt * t;
            
            const x = uuu * x1 + 3 * uu * t * cx1 + 3 * u * tt * cx2 + ttt * x2;
            const y = uuu * y1 + 3 * uu * t * cy1 + 3 * u * tt * cy2 + ttt * y2;
            
            points.push({ x, y });
        }
        return points;
    }
    
    function approximateQuadraticBezier(x1, y1, cx, cy, x2, y2, segmentCount = 10) {
        const points = [];
        for (let i = 0; i <= segmentCount; i++) {
            const t = i / segmentCount;
            
            // Quadratic Bezier formula
            const u = 1 - t;
            const tt = t * t;
            const uu = u * u;
            
            const x = uu * x1 + 2 * u * t * cx + tt * x2;
            const y = uu * y1 + 2 * u * t * cy + tt * y2;
            
            points.push({ x, y });
        }
        return points;
    }
    
    function approximateArc(x1, y1, rx, ry, angle, largeArc, sweep, x2, y2, segmentCount = 10) {
        // Convert angle from degrees to radians
        const angleRad = (angle * Math.PI) / 180;
        
        // Center parameterization of the elliptical arc
        // This is a simplified implementation and might not handle all edge cases
        
        // First, transform to the ellipse coordinate system
        const dx = (x1 - x2) / 2;
        const dy = (y1 - y2) / 2;
        
        // Apply the rotation to align with the ellipse
        const x1p = Math.cos(angleRad) * dx + Math.sin(angleRad) * dy;
        const y1p = -Math.sin(angleRad) * dx + Math.cos(angleRad) * dy;
        
        // Ensure radii are large enough
        rx = Math.abs(rx);
        ry = Math.abs(ry);
        
        // Scale up the radii if needed
        const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
        if (lambda > 1) {
            rx *= Math.sqrt(lambda);
            ry *= Math.sqrt(lambda);
        }
        
        // Calculate the center
        const sign = largeArc !== sweep ? 1 : -1;
        let sq = ((rx * rx * ry * ry) - (rx * rx * y1p * y1p) - (ry * ry * x1p * x1p)) / 
                 ((rx * rx * y1p * y1p) + (ry * ry * x1p * x1p));
        sq = sq < 0 ? 0 : sq; // Avoid negative sqrt
        
        const coef = sign * Math.sqrt(sq);
        const cxp = coef * ((rx * y1p) / ry);
        const cyp = coef * -((ry * x1p) / rx);
        
        // Transform back to the original coordinate system
        const cx = Math.cos(angleRad) * cxp - Math.sin(angleRad) * cyp + (x1 + x2) / 2;
        const cy = Math.sin(angleRad) * cxp + Math.cos(angleRad) * cyp + (y1 + y2) / 2;
        
        // Calculate start and end angles
        const startAngle = Math.atan2((y1p - cyp) / ry, (x1p - cxp) / rx);
        const endAngle = Math.atan2((-y1p - cyp) / ry, (-x1p - cxp) / rx);
        
        let deltaAngle = endAngle - startAngle;
        
        // Ensure correct sweep
        if (sweep === 0 && deltaAngle > 0) {
            deltaAngle -= 2 * Math.PI;
        } else if (sweep === 1 && deltaAngle < 0) {
            deltaAngle += 2 * Math.PI;
        }
        
        // Generate points along the arc
        const points = [];
        for (let i = 0; i <= segmentCount; i++) {
            const t = i / segmentCount;
            const angle = startAngle + t * deltaAngle;
            
            const x = cx + rx * Math.cos(angle) * Math.cos(angleRad) - ry * Math.sin(angle) * Math.sin(angleRad);
            const y = cy + rx * Math.cos(angle) * Math.sin(angleRad) + ry * Math.sin(angle) * Math.cos(angleRad);
            
            points.push({ x, y });
        }
        
        return points;
    }
    
    // Parse SVG path data to extract wall segments with updated handling of interaction types
    function parseSVGPath(pathData) {
        // Enhanced parser for SVG path data
        // It handles 'M' (move to), 'L' (line to), 'C' (cubic bezier),
        // 'Q' (quadratic bezier), 'A' (arc), and 'Z' (close path) commands
        
        // Regular expression to match path commands with their parameters
        const pathRegex = /([MLCQAZ])([^MLCQAZ]*)/gi;
        const points = [];
        let currentX = 0, currentY = 0;
        let firstX = 0, firstY = 0;
        let segmentCount = wallSettings.segmentCount; // Number of segments to approximate curves
        
        let match;
        while ((match = pathRegex.exec(pathData)) !== null) {
            const command = match[1].toUpperCase();
            const params = match[2].trim().split(/[\s,]+/).filter(p => p !== '').map(parseFloat);
            
            switch (command) {
                case 'M': // Move to
                    if (params.length >= 2) {
                        currentX = params[0];
                        currentY = params[1];
                        firstX = currentX; // Remember first point for 'Z' command
                        firstY = currentY;
                        points.push({ x: currentX, y: currentY });
                    }
                    break;
                    
                case 'L': // Line to
                    if (params.length >= 2) {
                        const newX = params[0];
                        const newY = params[1];
                        
                        walls.push({
                            x1: currentX,
                            y1: currentY,
                            x2: newX,
                            y2: newY,
                            color: wallSettings.color,
                            glowColor: wallSettings.glowColor,
                            force: wallSettings.wallForce,
                            interactionType: wallSettings.interactionType || INTERACTION_TYPES.ALL
                        });
                        
                        currentX = newX;
                        currentY = newY;
                    }
                    break;
                    
                case 'C': // Cubic Bezier curve
                    if (params.length >= 6) {
                        const cx1 = params[0];
                        const cy1 = params[1];
                        const cx2 = params[2];
                        const cy2 = params[3];
                        const x2 = params[4];
                        const y2 = params[5];
                        
                        // Approximate the curve with line segments
                        const curvePoints = approximateCubicBezier(
                            currentX, currentY, cx1, cy1, cx2, cy2, x2, y2, segmentCount
                        );
                        
                        // Create wall segments between the points
                        for (let i = 0; i < curvePoints.length - 1; i++) {
                            walls.push({
                                x1: curvePoints[i].x,
                                y1: curvePoints[i].y,
                                x2: curvePoints[i+1].x,
                                y2: curvePoints[i+1].y,
                                color: wallSettings.color,
                                glowColor: wallSettings.glowColor,
                                force: wallSettings.wallForce,
                                interactionType: wallSettings.interactionType || INTERACTION_TYPES.ALL
                            });
                        }
                        
                        currentX = x2;
                        currentY = y2;
                    }
                    break;
                    
                case 'Q': // Quadratic Bezier curve
                    if (params.length >= 4) {
                        const cx = params[0];
                        const cy = params[1];
                        const x2 = params[2];
                        const y2 = params[3];
                        
                        // Approximate the curve with line segments
                        const curvePoints = approximateQuadraticBezier(
                            currentX, currentY, cx, cy, x2, y2, segmentCount
                        );
                        
                        // Create wall segments between the points
                        for (let i = 0; i < curvePoints.length - 1; i++) {
                            walls.push({
                                x1: curvePoints[i].x,
                                y1: curvePoints[i].y,
                                x2: curvePoints[i+1].x,
                                y2: curvePoints[i+1].y,
                                color: wallSettings.color,
                                glowColor: wallSettings.glowColor,
                                force: wallSettings.wallForce,
                                interactionType: wallSettings.interactionType || INTERACTION_TYPES.ALL
                            });
                        }
                        
                        currentX = x2;
                        currentY = y2;
                    }
                    break;
                    
                case 'A': // Elliptical Arc
                    if (params.length >= 7) {
                        const rx = params[0];
                        const ry = params[1];
                        const angle = params[2];
                        const largeArc = params[3];
                        const sweep = params[4];
                        const x2 = params[5];
                        const y2 = params[6];
                        
                        // Approximate the arc with line segments
                        const arcPoints = approximateArc(
                            currentX, currentY, rx, ry, angle, largeArc, sweep, x2, y2, segmentCount
                        );
                        
                        // Create wall segments between the points
                        for (let i = 0; i < arcPoints.length - 1; i++) {
                            walls.push({
                                x1: arcPoints[i].x,
                                y1: arcPoints[i].y,
                                x2: arcPoints[i+1].x,
                                y2: arcPoints[i+1].y,
                                color: wallSettings.color,
                                glowColor: wallSettings.glowColor,
                                force: wallSettings.wallForce,
                                interactionType: wallSettings.interactionType || INTERACTION_TYPES.ALL
                            });
                        }
                        
                        currentX = x2;
                        currentY = y2;
                    }
                    break;
                    
                case 'Z': // Close path
                    walls.push({
                        x1: currentX,
                        y1: currentY,
                        x2: firstX,
                        y2: firstY,
                        color: wallSettings.color,
                        glowColor: wallSettings.glowColor,
                        force: wallSettings.wallForce,
                        interactionType: wallSettings.interactionType || INTERACTION_TYPES.ALL
                    });
                    
                    currentX = firstX;
                    currentY = firstY;
                    break;
            }
        }
        
        return walls;
    }
    
    // Load walls from an SVG file
    function loadWallsFromSVG(svgText) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const paths = svgDoc.querySelectorAll('path');
        
        // Clear existing walls
        walls = [];
        
        // Extract SVG dimensions if available
        const svgRoot = svgDoc.querySelector('svg');
        const svgWidth = svgRoot ? parseFloat(svgRoot.getAttribute('width') || 800) : 800;
        const svgHeight = svgRoot ? parseFloat(svgRoot.getAttribute('height') || 600) : 600;
        
        // Enable ZotCentricMobility if available
        if (typeof ZotCentricMobility !== 'undefined') {
            ZotCentricMobility.enable({
                width: svgWidth,
                height: svgHeight
            });
        }
        
        // Create a 200 jellyorb zot swarm
        setTimeout(() => {
            if (typeof ParticleSystem !== 'undefined' && ParticleSystem.createZotSwarm) {
                // Get the jellyOrbs preset parameters
                const preset = Presets.swarmPresets.jellyOrbs;
                
                // Use the jellyOrbs preset with 200 zots
                const config = {
                    presetName: 'jellyOrbs',
                    zotCount: 200,
                    speed: preset.speed,
                    separation: preset.separation,
                    alignment: preset.alignment,
                    cohesion: preset.cohesion,
                    perception: preset.perception,
                    colorTheme: preset.colorTheme,
                    centerX: window.innerWidth / 2,
                    centerY: window.innerHeight / 2
                };
                
                console.log("Creating 200 jellyorb zot swarm for the new map");
                ParticleSystem.createZotSwarm(config);
            }
        }, 100); // Short delay to ensure the map is fully loaded
        
        paths.forEach(path => {
            const pathData = path.getAttribute('d');
            const wallColor = path.getAttribute('stroke') || wallSettings.color;
            const wallForce = parseFloat(path.getAttribute('data-force') || wallSettings.wallForce);
            const wallGlowColor = path.getAttribute('data-glow-color') || getGlowColorFromStroke(wallColor);
            
            // Get the interaction type from data attribute or determine based on color
            let interactionType = INTERACTION_TYPES.ALL;
            
            // Check for data-interaction attribute first
            if (path.hasAttribute('data-interaction')) {
                const interactionName = path.getAttribute('data-interaction').toUpperCase();
                if (INTERACTION_TYPES[interactionName] !== undefined) {
                    interactionType = INTERACTION_TYPES[interactionName];
                }
            } 
            // Check for data-wall-type attribute
            else if (path.hasAttribute('data-wall-type')) {
                const wallType = path.getAttribute('data-wall-type').toUpperCase();
                if (WALL_PRESETS[wallType]) {
                    Object.assign(wallSettings, WALL_PRESETS[wallType]);
                    interactionType = WALL_PRESETS[wallType].interactionType;
                }
            }
            // If gold colored and no explicit type, assume golden path
            else if (wallColor.toLowerCase() === '#ffd700' || wallColor.toLowerCase() === 'gold') {
                Object.assign(wallSettings, WALL_PRESETS.GOLDEN_PATH);
                interactionType = INTERACTION_TYPES.NOT_ORBIE_FAMILY;
            }
            
            // Store original settings for this batch of walls
            const originalSettings = { ...wallSettings };
            
            // Apply current path settings
            wallSettings.color = wallColor;
            wallSettings.glowColor = wallGlowColor;
            wallSettings.wallForce = wallForce;
            wallSettings.interactionType = interactionType;
            
            // Parse the path data to extract wall segments
            parseSVGPath(pathData);
            
            // Restore original settings
            Object.assign(wallSettings, originalSettings);
        });
        
        return walls.length;
    }
    
    // Helper to generate a semi-transparent glow color from a stroke color
    function getGlowColorFromStroke(strokeColor) {
        // If it's already rgba, just adjust the alpha
        if (strokeColor.startsWith('rgba')) {
            return strokeColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d\.]+\)/, 'rgba($1, $2, $3, 0.3)');
        }
        
        // If it's hex format
        if (strokeColor.startsWith('#')) {
            let r, g, b;
            // Convert short hex (#RGB) to full hex (#RRGGBB)
            if (strokeColor.length === 4) {
                r = parseInt(strokeColor[1] + strokeColor[1], 16);
                g = parseInt(strokeColor[2] + strokeColor[2], 16);
                b = parseInt(strokeColor[3] + strokeColor[3], 16);
            } else {
                r = parseInt(strokeColor.substring(1, 3), 16);
                g = parseInt(strokeColor.substring(3, 5), 16);
                b = parseInt(strokeColor.substring(5, 7), 16);
            }
            return `rgba(${r}, ${g}, ${b}, 0.3)`;
        }
        
        // Default for other color formats
        return 'rgba(255, 255, 255, 0.3)';
    }
    
    // Render walls with enhanced visuals
    function renderWalls(ctx) {
        if (walls.length === 0) return;
        
        // Apply ZotCentricMobility offset if available and enabled
        const hasMobility = typeof ZotCentricMobility !== 'undefined';
        
        // Save context state before any transformations
        ctx.save();
        
        if (hasMobility && ZotCentricMobility.isEnabled()) {
            // Apply the offset - translate the context
            const offset = ZotCentricMobility.getOffset();
            ctx.translate(offset.x, offset.y);
        }
        
        walls.forEach(wall => {
            // Set wall styles based on properties
            ctx.strokeStyle = wall.color || wallSettings.color;
            ctx.shadowColor = wall.glowColor || wallSettings.glowColor;
            ctx.shadowBlur = wallSettings.glowRadius;
            ctx.lineWidth = wallSettings.visualThickness;
            
            // Special rendering for golden walls
            if (wall.interactionType === INTERACTION_TYPES.NOT_ORBIE_FAMILY || 
                (wall.color && wall.color.toLowerCase() === '#ffd700')) {
                // Gold-specific glow effect
                ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
                ctx.shadowBlur = wallSettings.glowRadius * 1.5;
                
                // Golden pulse effect (optional)
                const time = Date.now() / 1000;
                const pulseIntensity = 0.5 + 0.5 * Math.sin(time * 2);
                ctx.shadowBlur = wallSettings.glowRadius * (1 + pulseIntensity);
            }
            
            // Draw the wall
            ctx.beginPath();
            ctx.moveTo(wall.x1, wall.y1);
            ctx.lineTo(wall.x2, wall.y2);
            ctx.stroke();
        });
        
        // Restore the context to remove all transformations
        ctx.restore();
    }
    
    // Apply wall forces to a particle based on interaction type
    function applyWallForces(particle, prevX, prevY, collisionEnabled = true) {
        // Skip processing if there are no walls or collision is disabled
        if (walls.length === 0 || !collisionEnabled) return false;
        
        // Apply ZotCentricMobility offset if available and enabled
        const hasMobility = typeof ZotCentricMobility !== 'undefined';
        let adjustedParticle = particle;
        
        if (hasMobility && ZotCentricMobility.isEnabled()) {
            // Adjust particle position to account for camera offset
            adjustedParticle = ZotCentricMobility.applyOffsetToPoint(particle);
            
            // If prevX and prevY are provided, adjust them too
            if (prevX !== undefined && prevY !== undefined) {
                const adjustedPrev = ZotCentricMobility.applyOffsetToPoint({x: prevX, y: prevY});
                prevX = adjustedPrev.x;
                prevY = adjustedPrev.y;
            }
        }
        
        let hasCollided = false;
        
        // Determine entity type for interaction filtering
        let entityType = INTERACTION_TYPES.ZOT; // Default to ZOT
        
        if (adjustedParticle.isOrbie) {
            entityType = INTERACTION_TYPES.ORBIE;
        } else if (adjustedParticle.isOrbieSwarm) {
            entityType = INTERACTION_TYPES.ORBIE_SWARM;
        } else if (adjustedParticle.isZotSwarm) {
            entityType = INTERACTION_TYPES.ZOT_SWARM;
        }
        
        // Process fewer walls on mobile for performance
        const wallStep = window.innerWidth < 768 ? 2 : 1;
        
        for (let w = 0; w < walls.length; w += wallStep) {
            const wall = walls[w];
            const wallForce = wall.force || wallSettings.wallForce;
            const interactionType = wall.interactionType || INTERACTION_TYPES.ALL;
            
            // Skip walls that don't interact with this entity type
            if ((interactionType & entityType) === 0) {
                continue;
            }
            
            // First check for collisions if enabled
            if (collisionEnabled && lineSegmentsIntersect(
                prevX, prevY, adjustedParticle.x, adjustedParticle.y, 
                wall.x1, wall.y1, wall.x2, wall.y2
            )) {
                // Particle has crossed through wall, perform reflection
                const normal = normalToSegment(adjustedParticle.x, adjustedParticle.y, wall.x1, wall.y1, wall.x2, wall.y2);
                const dot = adjustedParticle.vx * normal.x + adjustedParticle.vy * normal.y;
                
                // Reflect velocity vector around the normal vector
                adjustedParticle.vx -= 2 * dot * normal.x;
                adjustedParticle.vy -= 2 * dot * normal.y;
                
                // Move particle slightly away from the wall
                adjustedParticle.x = prevX + adjustedParticle.vx * 0.5;
                adjustedParticle.y = prevY + adjustedParticle.vy * 0.5;
                
                // Apply some energy loss on collision
                adjustedParticle.vx *= 0.8;
                adjustedParticle.vy *= 0.8;
                
                hasCollided = true;
            }
            
            // Apply repulsion force when close to the wall
            const dist = distToSegment(adjustedParticle.x, adjustedParticle.y, wall.x1, wall.y1, wall.x2, wall.y2);
            if (dist < wallSettings.wallPerception) {
                const normal = normalToSegment(adjustedParticle.x, adjustedParticle.y, wall.x1, wall.y1, wall.x2, wall.y2);
                const force = (wallSettings.wallPerception - dist) / wallSettings.wallPerception * wallForce;
                
                adjustedParticle.vx += normal.x * force;
                adjustedParticle.vy += normal.y * force;
            }
        }
        
        // Collision handling will use adjustedParticle but apply forces to original particle
        
        // Return collision status
        return hasCollided;
    }
    
    // Public API
    return {
        // Initialize wall system
        init: function(settings = {}) {
            // Apply custom settings if provided
            Object.assign(wallSettings, settings);
            walls = [];
        },
        
        // Get the current walls array
        getWalls: function() {
            return walls;
        },
        
        // Get the current wall settings
        getSettings: function() {
            return wallSettings;
        },
        
        // Update wall settings
        updateSettings: function(settings = {}) {
            Object.assign(wallSettings, settings);
        },
        
        // Add a single wall segment
        addWall: function(x1, y1, x2, y2, options = {}) {
            const wall = {
                x1, y1, x2, y2,
                color: options.color || wallSettings.color,
                force: options.force || wallSettings.wallForce
            };
            walls.push(wall);
            return walls.length - 1; // Return index of the new wall
        },
        
        // Load walls from SVG string
        loadFromSVG: function(svgText) {
            return loadWallsFromSVG(svgText);
        },
        
        // Load walls from SVG file
        loadFromSVGFile: async function(filePath) {
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`Failed to load SVG file: ${response.statusText}`);
                }
                const svgText = await response.text();
                return loadWallsFromSVG(svgText);
            } catch (error) {
                console.error("Error loading SVG file:", error);
                return 0;
            }
        },
        
        // Clear all walls
        clearWalls: function() {
            walls = [];
            
            // Disable ZotCentricMobility if available
            if (typeof ZotCentricMobility !== 'undefined') {
                ZotCentricMobility.disable();
            }
        },
        
        // Apply wall forces to a particle
        applyForces: function(particle, prevX, prevY, collisionEnabled = true) {
            return applyWallForces(particle, prevX, prevY, collisionEnabled);
        },
        
        // Render walls
        render: function(ctx) {
            renderWalls(ctx);
        },
        
        // Export utility functions for external use
        utils: {
            distToSegment,
            normalToSegment,
            lineSegmentsIntersect
        }
    };
})(); 