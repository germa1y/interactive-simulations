// simple-server.js - Simple HTTP server for local testing with audio debugging
const http = require('http');
const fs = require('fs');
const path = require('path');

// Port for the server
const PORT = 8080;

// Debug audio requests
const DEBUG_AUDIO = true;

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// Create the server
const server = http.createServer((req, res) => {
  // Add CORS headers for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Log request with highlighting for audio files
  const isAudio = req.url.endsWith('.mp3');
  if (isAudio && DEBUG_AUDIO) {
    console.log(`\x1b[33m🎵 AUDIO REQUEST: ${req.url}\x1b[0m`);
  } else {
    console.log(`Request: ${req.url}`);
  }

  // Handle root route
  let filePath = req.url === '/' 
    ? './index.html' 
    : '.' + req.url;

  // Get file extension
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        console.log(`\x1b[31mFile not found: ${filePath}\x1b[0m`);
        
        // Special handling for audio files - try to locate them in different folders
        if (isAudio) {
          const alternativePaths = [
            filePath.replace('./music/', './src/music/'),
            filePath.replace('./music/', './public/music/'),
            filePath.replace('./', './public/')
          ];
          
          console.log(`\x1b[33mTrying alternative audio paths:\x1b[0m`);
          alternativePaths.forEach(path => console.log(`- ${path}`));
          
          // Try each alternative path
          let foundAlternative = false;
          for (const altPath of alternativePaths) {
            try {
              if (fs.existsSync(altPath)) {
                console.log(`\x1b[32mFound audio at alternative path: ${altPath}\x1b[0m`);
                const altContent = fs.readFileSync(altPath);
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(altContent);
                foundAlternative = true;
                break;
              }
            } catch (fsErr) {
              // Ignore and try next path
            }
          }
          
          if (!foundAlternative) {
            res.writeHead(404);
            res.end('Audio file not found in any location');
          }
          return;
        }
        
        res.writeHead(404);
        res.end('File not found');
      } else {
        // Server error
        console.error(`\x1b[31mServer error: ${err.code}\x1b[0m`);
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      if (isAudio && DEBUG_AUDIO) {
        console.log(`\x1b[32m✓ Serving audio: ${filePath} (${content.length} bytes)\x1b[0m`);
      }
      
      // For audio files, add special headers
      if (isAudio) {
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Content-Length': content.length,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache'
        });
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
      }
      
      res.end(content);
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`\x1b[32m===================================\x1b[0m`);
  console.log(`\x1b[32mAudio Debug Server running at:\x1b[0m`);
  console.log(`\x1b[32mhttp://localhost:${PORT}/\x1b[0m`);
  console.log(`\x1b[32m===================================\x1b[0m`);
  console.log(`\nTo test on mobile, visit http://YOUR_COMPUTER_IP:${PORT}/`);
  console.log(`To find your IP, use ipconfig (Windows) or ifconfig (Mac/Linux)`);
  console.log(`\nTo test the audio issues:`);
  console.log(`1. Open browser dev tools (F12)`);
  console.log(`2. Navigate to the Network tab`);
  console.log(`3. Filter for "Media" to watch audio file requests`);
  console.log(`4. Toggle mobile emulation mode to compare behaviors`);
  console.log(`\nAudio files will be highlighted in the logs`);
});

/* 
   HOW TO USE:
   1. In the project folder run: node refresh-tooltip.js
   2. Open http://localhost:8080/ in your browser
   3. Test on mobile devices using your computer's IP address
   4. The server will try multiple paths if audio files aren't found
*/
