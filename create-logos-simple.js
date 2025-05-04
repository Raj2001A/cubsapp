const fs = require('fs');

// Create a simple 1x1 pixel PNG file
const createSimplePng = (size) => {
  // PNG header (8 bytes)
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  ]);

  // IHDR chunk (25 bytes)
  const ihdr = Buffer.from([
    0x00, 0x00, 0x00, 0x0D, // Length of IHDR chunk data (13 bytes)
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x01, // Width (1 pixel)
    0x00, 0x00, 0x00, 0x01, // Height (1 pixel)
    0x08,                   // Bit depth (8 bits)
    0x06,                   // Color type (RGBA)
    0x00,                   // Compression method (deflate)
    0x00,                   // Filter method (standard)
    0x00,                   // Interlace method (none)
    0x1F, 0x15, 0xC4, 0x89  // CRC
  ]);

  // IDAT chunk (minimal empty image)
  const idat = Buffer.from([
    0x00, 0x00, 0x00, 0x0A, // Length of IDAT chunk data (10 bytes)
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x78, 0x9C, 0x63, 0x60, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // Minimal zlib compressed data
    0x5D, 0x38, 0x25, 0x2C  // CRC
  ]);

  // IEND chunk
  const iend = Buffer.from([
    0x00, 0x00, 0x00, 0x00, // Length of IEND chunk data (0 bytes)
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);

  // Combine all parts
  return Buffer.concat([header, ihdr, idat, iend]);
};

// Create logo files
try {
  fs.writeFileSync('public/logo192.png', createSimplePng(192));
  console.log('Created public/logo192.png');
  
  fs.writeFileSync('public/logo512.png', createSimplePng(512));
  console.log('Created public/logo512.png');
  
  console.log('Logo files created successfully!');
} catch (error) {
  console.error('Error creating logo files:', error);
}
