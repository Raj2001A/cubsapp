import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Simple 1x1 pixel transparent PNG (base64 encoded)
const transparentPixelPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

// Create logo192.png
fs.writeFileSync(path.join(publicDir, 'logo192.png'), transparentPixelPNG);
console.log('Created logo192.png');

// Create logo512.png
fs.writeFileSync(path.join(publicDir, 'logo512.png'), transparentPixelPNG);
console.log('Created logo512.png');

console.log('Logo files created successfully!');
