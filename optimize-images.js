const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function optimizeGallery() {
  const dir = path.join(__dirname, 'assets', 'gallery');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

  console.log(`Optimizing ${files.length} gallery photos...`);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const originalBuf = fs.readFileSync(filePath);
    const beforeSize = originalBuf.length;

    // Resize to max 720px width/height, progressive JPEG, quality 80
    const optimizedBuf = await sharp(originalBuf)
      .resize({
        width: 720,
        height: 960,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 80,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer();

    fs.writeFileSync(filePath, optimizedBuf);
    const afterSize = optimizedBuf.length;
    console.log(`${file}: ${(beforeSize / 1024).toFixed(1)} KB -> ${(afterSize / 1024).toFixed(1)} KB (${Math.round((1 - afterSize / beforeSize) * 100)}% smaller)`);
  }
}

async function optimizePlaces() {
  const dir = path.join(__dirname, 'assets', 'places');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

  console.log(`\nOptimizing ${files.length} venue photos...`);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const originalBuf = fs.readFileSync(filePath);
    const beforeSize = originalBuf.length;

    const optimizedBuf = await sharp(originalBuf)
      .resize({
        width: 480,
        height: 360,
        fit: 'cover',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 80,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer();

    fs.writeFileSync(filePath, optimizedBuf);
    const afterSize = optimizedBuf.length;
    console.log(`${file}: ${(beforeSize / 1024).toFixed(1)} KB -> ${(afterSize / 1024).toFixed(1)} KB`);
  }
}

async function main() {
  await optimizeGallery();
  await optimizePlaces();
  console.log('\nAll images optimized successfully!');
}

main().catch(console.error);
