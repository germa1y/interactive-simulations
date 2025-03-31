// simple-server.js - Simple HTTP server for local testing
const http = require('http');
const fs = require('fs');
const path = require('path');

// Port for the server
const PORT = 8080;

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
  console.log(`Request: ${req.url}`);

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
        console.log(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end('File not found');
      } else {
        // Server error
        console.error(`Server error: ${err.code}`);
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`To test on mobile, visit http://YOUR_COMPUTER_IP:${PORT}/`);
  console.log(`To find your IP, use ipconfig (Windows) or ifconfig (Mac/Linux)`);
  console.log(`\nTo test the audio issues:`);
  console.log(`1. Open browser dev tools (F12)`);
  console.log(`2. Navigate to the Network tab`);
  console.log(`3. Filter for "Media" to watch audio file requests`);
  console.log(`4. Toggle mobile emulation mode to compare behaviors`);
});

/* 
   HOW TO USE:
   1. In the project folder run: node simple-server.js
   2. Open http://localhost:8080/ in your browser
   3. To test on mobile devices on the same network, use your computer's IP address
   4. Keep terminal window open to see requests logged
*/
