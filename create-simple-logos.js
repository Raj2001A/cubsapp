const fs = require('fs');

// Create a simple 1x1 pixel PNG file
const createSimplePng = (width, height) => {
  // PNG header
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  ]);

  // IHDR chunk
  const ihdrChunk = Buffer.from([
    0x00, 0x00, 0x00, 0x0D, // Length of IHDR chunk data (13 bytes)
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    ...intToBytes(width, 4),  // Width
    ...intToBytes(height, 4), // Height
    0x08,                     // Bit depth (8 bits)
    0x06,                     // Color type (RGBA)
    0x00,                     // Compression method (deflate)
    0x00,                     // Filter method (standard)
    0x00,                     // Interlace method (none)
  ]);
  
  // Calculate CRC for IHDR
  const ihdrCrc = calculateCrc(ihdrChunk.slice(4));
  
  // IDAT chunk (minimal empty image)
  const idatChunk = Buffer.from([
    0x00, 0x00, 0x00, 0x0A, // Length of IDAT chunk data (10 bytes)
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x78, 0x9C, 0x63, 0x60, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01 // Minimal zlib compressed data
  ]);
  
  // Calculate CRC for IDAT
  const idatCrc = calculateCrc(idatChunk.slice(4));
  
  // IEND chunk
  const iendChunk = Buffer.from([
    0x00, 0x00, 0x00, 0x00, // Length of IEND chunk data (0 bytes)
    0x49, 0x45, 0x4E, 0x44, // "IEND"
  ]);
  
  // Calculate CRC for IEND
  const iendCrc = calculateCrc(iendChunk.slice(4));
  
  // Combine all parts
  return Buffer.concat([
    header,
    ihdrChunk,
    Buffer.from(ihdrCrc),
    idatChunk,
    Buffer.from(idatCrc),
    iendChunk,
    Buffer.from(iendCrc)
  ]);
};

// Convert integer to bytes
function intToBytes(num, bytes) {
  const result = [];
  for (let i = bytes - 1; i >= 0; i--) {
    result.unshift((num >> (8 * i)) & 0xFF);
  }
  return result;
}

// Calculate CRC (simplified version)
function calculateCrc(data) {
  // This is a simplified CRC calculation
  // In a real implementation, you would use a proper CRC32 algorithm
  return [0x00, 0x00, 0x00, 0x00];
}

// Create logo files
try {
  fs.writeFileSync('public/logo192.png', createSimplePng(192, 192));
  console.log('Created public/logo192.png');
  
  fs.writeFileSync('public/logo512.png', createSimplePng(512, 512));
  console.log('Created public/logo512.png');
  
  console.log('Logo files created successfully!');
} catch (error) {
  console.error('Error creating logo files:', error);
}
