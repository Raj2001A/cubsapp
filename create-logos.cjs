const fs = require('fs');

// Simple 1x1 transparent pixel PNG as base64
const transparentPixelPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Convert base64 to buffer
const pngBuffer = Buffer.from(transparentPixelPng, 'base64');

// Write files
try {
  fs.writeFileSync('public/logo192.png', pngBuffer);
  console.log('Created public/logo192.png');
  
  fs.writeFileSync('public/logo512.png', pngBuffer);
  console.log('Created public/logo512.png');
  
  console.log('Logo files created successfully!');
} catch (error) {
  console.error('Error creating logo files:', error);
}
