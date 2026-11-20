const fs = require('fs');
// Let's get image dimensions with node
const imgPath = 'C:/Users/emman/.gemini/antigravity/brain/f0e4c08d-9b15-4edf-bb37-bb2e37afd9f4/.user_uploaded/media_1795157018577_21eef302.png';
const buf = fs.readFileSync(imgPath);
// PNG width is at byte 16, height at byte 20 (4 bytes BE each)
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
console.log('Image dimensions:', width, 'x', height);
