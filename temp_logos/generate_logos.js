const fs = require('fs');
const { createCanvas } = require('canvas');

// Function to create a logo
function createLogo(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#00796B';
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${size/4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EMS', size/2, size/2);
  
  return canvas.toBuffer();
}

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Generate and save logo192.png
const logo192 = createLogo(192);
fs.writeFileSync('public/logo192.png', logo192);
console.log('Generated public/logo192.png');

// Generate and save logo512.png
const logo512 = createLogo(512);
fs.writeFileSync('public/logo512.png', logo512);
console.log('Generated public/logo512.png');

console.log('Logo generation complete!');
