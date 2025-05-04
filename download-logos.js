import https from 'https';
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

// Function to download an image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image, status code: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filepath}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if there's an error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Download both logo files
async function downloadLogos() {
  try {
    // Download logo192.png
    await downloadImage(
      'https://via.placeholder.com/192x192.png/00796B/FFFFFF?text=EMS',
      path.join(publicDir, 'logo192.png')
    );

    // Download logo512.png
    await downloadImage(
      'https://via.placeholder.com/512x512.png/00796B/FFFFFF?text=EMS',
      path.join(publicDir, 'logo512.png')
    );

    console.log('All logo files downloaded successfully!');
  } catch (error) {
    console.error('Error downloading logo files:', error);
  }
}

// Run the download
downloadLogos();
