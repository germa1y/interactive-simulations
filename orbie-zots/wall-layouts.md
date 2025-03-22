# Wall Layouts for Orbie & Zots

## Overview

The simulation can load walls from SVG files containing path elements that define segments for the walls. These walls can now have different interaction properties with various entities in the simulation, allowing for more complex and engaging gameplay.

## Wall Properties

Walls in the Orbie & Zots simulation have the following properties:

- **Color**: The visual color of the wall, defined by the `stroke` attribute in SVG
- **Width**: The visual thickness of the wall, defined by the `stroke-width` attribute
- **Force**: The repulsion strength of the wall, defined by the `data-force` attribute
- **Interaction Type**: Determines which entities interact with the wall, defined by `data-wall-type` or `data-interaction`

## Wall Types

The simulation now supports several preset wall types, each with unique interaction behaviors and visual styling:

### Standard Walls
- **Color**: White
- **Appearance**: Solid with soft glow
- **Behavior**: Blocks all entities (Orbie, OrbieSwarm, Zots, ZotSwarm)
- **SVG Attribute**: `data-wall-type="STANDARD"`

### Golden Path
- **Color**: Gold (#FFD700)
- **Appearance**: Golden with pulsing glow
- **Behavior**: Allows Orbie and OrbieSwarm to pass through, blocks all Zots
- **SVG Attribute**: `data-wall-type="GOLDEN_PATH"` or simply use `stroke="gold"`

### Ghost Walls
- **Color**: Semi-transparent blue
- **Appearance**: Ethereal blue with subtle glow
- **Behavior**: Blocks Zots and ZotSwarm, allowing Orbie entities to pass through
- **SVG Attribute**: `data-wall-type="GHOST_WALL"`

### Orbie-Only Barrier
- **Color**: Pink (#FF66AA)
- **Appearance**: Pink with matching glow
- **Behavior**: Only blocks Orbie and OrbieSwarm, allowing Zots to pass through
- **SVG Attribute**: `data-wall-type="ORBIE_ONLY"`

### Energy Field
- **Color**: Green (#33FF99)
- **Appearance**: Bright green with subtle glow
- **Behavior**: Blocks all entities but with reduced repulsion force
- **SVG Attribute**: `data-wall-type="ENERGY_FIELD"`

## Curve Support

Curves are approximated as straight line segments for compatibility with the physics engine. The simulation supports:
- Cubic Bezier curves (`C` command)
- Quadratic Bezier curves (`Q` command)
- Elliptical arcs (`A` command)

The resolution of curve approximation can be adjusted in the wall settings.

## Creating Wall Layouts

SVG path elements can contain various commands:
- `M x,y` - Move to point
- `L x,y` - Line to point
- `C x1,y1 x2,y2 x,y` - Cubic Bezier curve
- `Q x1,y1 x,y` - Quadratic Bezier curve
- `A rx,ry rotation large-arc-flag sweep-flag x,y` - Elliptical arc
- `Z` - Close path

### Custom Interaction Types

For advanced users, you can specify custom interaction types using the `data-interaction` attribute:
- `data-interaction="ALL"` - Wall affects all entities
- `data-interaction="NONE"` - Wall affects no entities (decorative only)
- `data-interaction="ORBIE_ONLY"` - Wall only affects Orbie
- `data-interaction="NOT_ORBIE_FAMILY"` - Wall affects everything except Orbie and OrbieSwarm

## Design Guidelines

1. **Use Color Coding**: Follow the color scheme established by the presets for intuitive gameplay
2. **Layer Complexity**: Combine different wall types to create interesting puzzles and challenges
3. **Consider Performance**: Complex designs with many curve segments may impact performance
4. **Guide the Player**: Use Golden Paths to subtly guide the player in the right direction
5. **Create Challenges**: Use Orbie-Only barriers to create sections that separate Orbie from Zots

## Example Layouts

1. **Simple Maze**: Use standard walls to create a basic maze
2. **Advanced Gameplay**: Combine golden paths, ghost walls, and barriers for complex puzzles where Orbie must navigate one path while Zots follow another

## Testing Wall Layouts

Always test your wall layouts by:
1. Observing interactions between different entities and wall types
2. Checking for gaps or unintended path crossings
3. Ensuring performance is acceptable with the number of wall segments

## Sample Wall Files

The repository includes sample wall layouts:
- `basic-walls.svg` - Simple straight walls
- `curves-sample.svg` - Advanced curved walls with different interaction types

## SVG Wall Format

The simulation can load walls from SVG files. These files should contain path elements that define segments for the walls. The simulation parses the SVG paths and creates wall segments.

### Basic Structure

A valid wall layout SVG file should:

1. Be a valid SVG file with standard XML declaration
2. Contain one or more `<path>` elements with the `d` attribute defining the path
3. Optionally include metadata attributes for customization

Example:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <path d="M 50,50 L 750,50 L 750,550 L 50,550 Z" 
        fill="none" 
        stroke="#ffffff" 
        stroke-width="2"
        data-force="2.0" />
</svg>
```

### Path Commands

The parser supports the following SVG path commands:

- `M x,y` - Move to (x,y) - Starting point for wall segments
- `L x,y` - Line to (x,y) - Creates a wall segment from current position to (x,y)
- `C x1,y1 x2,y2 x,y` - Cubic Bezier curve - Creates a curve from current position to (x,y) with control points (x1,y1) and (x2,y2)
- `Q x1,y1 x,y` - Quadratic Bezier curve - Creates a curve from current position to (x,y) with control point (x1,y1)
- `A rx,ry angle large-arc-flag sweep-flag x,y` - Elliptical Arc - Creates an arc from current position to (x,y)
- `Z` - Close path - Creates a wall segment from current position back to the first point

### Curve Support

Curves are approximated as a series of straight line segments for compatibility with the physics engine. Key features:

- **Bezier Curves**: Both cubic (`C`) and quadratic (`Q`) Bezier curves are supported, allowing for smooth curved walls.
- **Elliptical Arcs**: The `A` command creates elliptical arcs, useful for circular obstacles and rounded corners.
- **Adjustable Resolution**: The system uses a default of 10 segments per curve, which provides a good balance of smoothness and performance.

Example of curved wall:

```xml
<path d="M 100,100 Q 200,50 300,100" 
      stroke="#88aaff" 
      data-force="1.0" />
```

### Metadata Attributes

You can customize walls using the following attributes on path elements:

1. `stroke` - Wall color (hex or rgba format)
2. `data-force` - Custom force strength for this wall path (floating point value)

Example:

```xml
<path d="M 200,150 L 500,150 L 500,400 L 200,400" 
      fill="none" 
      stroke="#88aaff" 
      stroke-width="2"
      data-force="1.0" />
```

## Importing into the Simulation

1. Open the Orbie & Zots simulation
2. Navigate to the "Walls" control panel
3. Click the "Load Walls from SVG" button
4. Select your SVG file from the file dialog

The simulation will parse the SVG file and create wall segments for each line and curve in the paths.

## Tips for Effective Wall Layouts

1. **Curve Complexity**: More complex curves will be approximated with more line segments, which can affect performance. Use appropriate complexity.
2. **Wall Force**: Higher force values create stronger repulsion; use this for boundaries.
3. **Visual Design**: Use different colors to indicate different force strengths or functional areas.
4. **Closed Shapes**: Use the `Z` command to close paths and create enclosed areas.
5. **Testing**: Test your layout with different particle types to see how they interact.
6. **Iteration**: Refine your design based on how particles interact with the walls.

## Technical Details

The SVG parsing is handled by the WallSystem module in the simulation code. The parser:

1. Loads the SVG file
2. Parses the XML structure
3. Extracts path elements and their attributes
4. For each path, extracts the path data (d attribute)
5. Converts the path commands into wall segments, approximating curves as needed
6. Applies metadata (colors, forces) from the attributes
7. Adds the walls to the simulation

For debugging, you can check the browser console which will show how many wall segments were loaded. 