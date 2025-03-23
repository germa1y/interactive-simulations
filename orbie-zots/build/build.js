// Simple build script for combining and minifying JS files - Windows compatible
const fs = require('fs');
const path = require('path');

// Paths using path.join for cross-platform compatibility
const srcDir = path.join(__dirname, '..', 'src', 'js');
const distDir = path.join(__dirname, '..', 'public', 'dist');

// Files to include in the bundle (order matters)
const jsFiles = [
    'colors.js',     // Should be first as other modules may depend on it
    'presets.js',
    'touch.js',      // TouchHandler needs to be available before it's used
    'menu.js',       // MenuSystem needs to be available before it's used 
    'particles.js',  // ParticleSystem depends on the above
    'walls.js',      // Wall system should be after particles.js
    'demoMode.js',   // Demo mode needs to be before main.js
    'main.js'        // Main.js should always be last as it uses all the above
];

console.log('Building bundle...');

// Create dist directory if it doesn't exist
try {
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
        console.log(`Created directory: ${distDir}`);
    }
} catch (err) {
    console.error(`Error creating directory: ${err.message}`);
    process.exit(1);
}

// Combine all JavaScript files
let combinedCode = '';

// Add a banner comment
combinedCode += '/**\n';
combinedCode += ' * Orbie Zots - Particle Swarm Simulation\n';
combinedCode += ' * Copyright (c) ' + new Date().getFullYear() + '\n';
combinedCode += ' * Built: ' + new Date().toISOString() + '\n';
combinedCode += ' */\n\n';

// Read and combine files in specified order
for (const file of jsFiles) {
    const filePath = path.join(srcDir, file);
    try {
        console.log(`Processing: ${filePath}`);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            combinedCode += content + '\n\n';
            console.log(`Added ${file} to bundle`);
        } else {
            console.error(`File not found: ${filePath}`);
            process.exit(1);
        }
    } catch (err) {
        console.error(`Error reading file ${file}: ${err.message}`);
        process.exit(1);
    }
}

// Write the bundle file
const bundlePath = path.join(distDir, 'bundle.js');
try {
    fs.writeFileSync(bundlePath, combinedCode);
    console.log(`Successfully created bundle at: ${bundlePath}`);
} catch (err) {
    console.error(`Error writing bundle: ${err.message}`);
    process.exit(1);
}

console.log('Build completed successfully!');