// colors.js - Color themes and generators for particles
const ColorThemes = (function() {
    // Current active theme
    let currentTheme = 'sparkle';
    
    // Sparkle settings
    let sparkleSettings = {
        grayscaleChance: 0.8,       // Chance of grayscale vs. color (0-1)
        colorSaturation: 15,        // Saturation for colored particles (0-100)
        brightnessFactor: 1.0       // Multiplier for particle brightness
    };
    
    // Color theme generators
    const generators = {
        // Rainbow theme with full spectrum
        rainbow: function() {
            return `hsl(${Math.random() * 360}, 70%, 60%)`;
        },
        
        // Blue theme with variations
        blue: function() {
            const hue = 200 + Math.random() * 60; // Range from 200-260 (blues to purples)
            const saturation = 50 + Math.random() * 50; // 50-100% saturation
            const lightness = 30 + Math.random() * 50; // 30-80% lightness
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        },
        
        // Green theme with variations
        green: function() {
            const hue = 80 + Math.random() * 80; // Range from 80-160 (yellowy greens to blue-greens)
            const saturation = 50 + Math.random() * 50; // 50-100% saturation
            const lightness = 30 + Math.random() * 50; // 30-80% lightness
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        },
        
        // Fire theme (reds, oranges)
        fire: function() {
            const hue = Math.random() * 40; // Reds to oranges
            const saturation = 70 + Math.random() * 30; // High saturation
            const lightness = 40 + Math.random() * 30; // Medium to high brightness 
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        },
        
        // Neon theme with bright, vibrant colors
        neon: function() {
            const hues = [320, 280, 180, 140]; // magenta, purple, cyan, green
            return `hsl(${hues[Math.floor(Math.random() * hues.length)]}, 100%, 60%)`;
        },
        
        // Gold theme with yellow/gold hues
        gold: function() {
            const hue = 40 + Math.random() * 20; // Range from 40-60 (gold to yellow)
            const saturation = 70 + Math.random() * 30; // 70-100% saturation
            const lightness = 40 + Math.random() * 30; // 40-70% lightness
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        },
        
        // Sparkle theme - primarily grayscale with occasional color hints
        sparkle: function() {
            // Decide if this particle will be grayscale or have a subtle color
            const isGrayscale = Math.random() < sparkleSettings.grayscaleChance;
            
            if (isGrayscale) {
                // Pure grayscale sparkle with varying brightness
                const sparkleType = Math.floor(Math.random() * 4);
                const brightnessFactor = sparkleSettings.brightnessFactor;
                
                switch (sparkleType) {
                    case 0: // Bright white
                        return `hsl(0, 0%, ${Math.min(100, 85 * brightnessFactor + Math.random() * 15 * brightnessFactor)}%)`;
                        
                    case 1: // Light gray
                        return `hsl(0, 0%, ${Math.min(100, 65 * brightnessFactor + Math.random() * 15 * brightnessFactor)}%)`;
                        
                    case 2: // Medium gray
                        return `hsl(0, 0%, ${Math.min(100, 40 * brightnessFactor + Math.random() * 20 * brightnessFactor)}%)`;
                        
                    case 3: // Dark sparkle (more rare)
                        return `hsl(0, 0%, ${Math.min(100, 15 * brightnessFactor + Math.random() * 20 * brightnessFactor)}%)`;
                }
            } else {
                // Subtle color hint (based on color settings)
                const colorType = Math.floor(Math.random() * 3);
                const saturation = sparkleSettings.colorSaturation;
                
                switch (colorType) {
                    case 0: // Very subtle gold hint
                        const goldHue = 45 + Math.random() * 10; // Gold hue range
                        const goldLight = 60 + Math.random() * 25; // Medium to high brightness
                        return `hsl(${goldHue}, ${saturation}%, ${goldLight}%)`;
                        
                    case 1: // Very subtle blue hint
                        const blueHue = 210 + Math.random() * 30; // Blue hue range
                        const blueLight = 60 + Math.random() * 30; // Medium to high brightness
                        return `hsl(${blueHue}, ${saturation}%, ${blueLight}%)`;
                        
                    case 2: // Very subtle cool gray (slight blue undertone)
                        const coolGrayHue = 210;
                        const coolGraySat = Math.max(1, saturation * 0.3); // Lower saturation than others
                        const coolGrayLight = 40 + Math.random() * 50; // Wide brightness range
                        return `hsl(${coolGrayHue}, ${coolGraySat}%, ${coolGrayLight}%)`;
                }
            }
            
            // Fallback - pure white
            return 'hsl(0, 0%, 100%)';
        },
        
        // Colorblind-friendly theme
        colorblind: function() {
            // Colors chosen for deuteranopia and protanopia visibility
            const colorblindSafe = [
                '211, 100%, 50%',  // Blue
                '60, 100%, 50%',   // Yellow
                '180, 100%, 30%',  // Teal
                '27, 100%, 50%',   // Orange
                '270, 100%, 60%'   // Purple
            ];
            return `hsl(${colorblindSafe[Math.floor(Math.random() * colorblindSafe.length)]})`;
        }
    };
    
    // Public API
    return {
        // Get a color using the current theme
        getColor: function() {
            if (generators[currentTheme]) {
                return generators[currentTheme]();
            }
            // Fallback to rainbow if theme not found
            return generators.rainbow();
        },
        
        // Get a color for a specific theme
        getColorForTheme: function(theme) {
            if (generators[theme]) {
                return generators[theme]();
            }
            return generators.rainbow();
        },
        
        // Change the current theme
        setTheme: function(themeName) {
            if (generators[themeName]) {
                currentTheme = themeName;
                return true;
            }
            return false;
        },
        
        // Get current theme name
        getCurrentTheme: function() {
            return currentTheme;
        },
        
        // Get list of available themes
        getThemeList: function() {
            return Object.keys(generators);
        },
        
        // Update sparkle theme settings
        updateSparkleSettings: function(settings) {
            if (settings) {
                if (typeof settings.grayscaleChance !== 'undefined') {
                    sparkleSettings.grayscaleChance = settings.grayscaleChance;
                }
                if (typeof settings.colorSaturation !== 'undefined') {
                    sparkleSettings.colorSaturation = settings.colorSaturation;
                }
                if (typeof settings.brightnessFactor !== 'undefined') {
                    sparkleSettings.brightnessFactor = settings.brightnessFactor;
                }
            }
        },
        
        // Get current sparkle settings
        getSparkleSettings: function() {
            return {...sparkleSettings};
        }
    };
})();

// Export for module system
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ColorThemes;
}