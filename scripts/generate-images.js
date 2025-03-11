const fs = require('fs');
const { createCanvas } = require('canvas');

// Create blue favicon/logo
function createBlueLogo(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fill with Brandeis blue
  ctx.fillStyle = '#003865';
  ctx.fillRect(0, 0, size, size);
  
  // Optional: Add a subtle "s." in white
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.5}px "Courier New"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('s.', size/2, size/2);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created ${outputPath}`);
}

// Create OG image for social media
function createOGImage(outputPath) {
  // Standard OG image size
  const width = 1200;
  const height = 630;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fill with light blue gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#e6f2ff');
  gradient.addColorStop(1, '#ffffff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add title
  ctx.fillStyle = '#003865';
  ctx.font = 'bold 80px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('brandeis strangers.', width/2, height/2 - 50);
  
  // Add tagline
  ctx.font = '40px "Courier New"';
  ctx.fillText('brandeis meal match', width/2, height/2 + 50);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created ${outputPath}`);
}

// Create the directories if they don't exist
const publicDir = './public';
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate the images
createBlueLogo(64, `${publicDir}/favicon.ico`);
createBlueLogo(192, `${publicDir}/logo192.png`);
createBlueLogo(512, `${publicDir}/logo512.png`);
createOGImage(`${publicDir}/og-image.png`);

console.log('All images generated successfully!'); 