import fs from 'fs';

// Simple 16x16 ICO file in base64 format
// This is a green square with "EMS" text
const faviconBase64 = 'AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABILAAASCwAAAAAAAAAAAAD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8AAH/MAAB/zAAAf8wAAH/MAAB/zAAAf8wAAH/MAAB/zAAAf8wAAH/MAAB/zAAAf8wAAH/MAAB/zAD///8A////AAB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/////AP///wAAf8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/////wD///8AAH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP////8A////AAB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/////AP///wAAf8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/////wD///8AAH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP////8A////AAB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/AH/M/wB/zP8Af8z/////AP///wAAf8wAAH/MAAB/zAAAf8wAAH/MAAB/zAAAf8wAAH/MAAB/zAAAf8wAAH/MAAB/zAAAf8wAAH/MAP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A';

// Convert base64 to buffer
const faviconBuffer = Buffer.from(faviconBase64, 'base64');

// Write file
try {
  fs.writeFileSync('public/favicon.ico', faviconBuffer);
  console.log('Created public/favicon.ico');
  console.log('Favicon created successfully!');
} catch (error) {
  console.error('Error creating favicon:', error);
}
