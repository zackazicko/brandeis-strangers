const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create logo function
function createLogo(size, text, bgColor, textColor, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = textColor;
  ctx.font = `bold ${size * 0.3}px 'Courier New'`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 2);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created ${outputPath}`);
}

// Create OG image
function createOGImage(width, height, text, bgColor, textColor, outputPath) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = textColor;
  ctx.font = `bold ${width * 0.1}px 'Courier New'`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  // Subtext
  ctx.font = `${width * 0.04}px 'Courier New'`;
  ctx.fillText('brandeis meal match', width / 2, height * 0.65);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created ${outputPath}`);
}

// Create the output directory if it doesn't exist
const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create the logo files
createLogo(192, 's.', '#003865', 'white', path.join(publicDir, 'logo192.png'));
createLogo(512, 's.', '#003865', 'white', path.join(publicDir, 'logo512.png'));

// Create the OG image
createOGImage(1200, 630, 'strangers.', '#e6f2ff', '#003865', path.join(publicDir, 'og-image.png'));

console.log('Logo and OG image generation complete!'); 