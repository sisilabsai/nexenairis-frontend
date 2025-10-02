const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create public/icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Base SVG icon for Nexen AIRIS
const baseSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" rx="80" fill="url(#bgGradient)" />
  
  <!-- Main Icon - Inventory/Box Symbol -->
  <rect x="100" y="120" width="312" height="272" rx="20" fill="none" stroke="url(#iconGradient)" stroke-width="8"/>
  
  <!-- Inner compartments representing inventory organization -->
  <line x1="180" y1="120" x2="180" y2="392" stroke="url(#iconGradient)" stroke-width="4"/>
  <line x1="332" y1="120" x2="332" y2="392" stroke="url(#iconGradient)" stroke-width="4"/>
  <line x1="100" y1="200" x2="412" y2="200" stroke="url(#iconGradient)" stroke-width="4"/>
  <line x1="100" y1="312" x2="412" y2="312" stroke="url(#iconGradient)" stroke-width="4"/>
  
  <!-- AI/Tech elements - Circuit pattern -->
  <circle cx="140" cy="160" r="12" fill="url(#iconGradient)"/>
  <circle cx="256" cy="160" r="12" fill="url(#iconGradient)"/>
  <circle cx="372" cy="160" r="12" fill="url(#iconGradient)"/>
  
  <!-- Barcode/Scan elements at bottom -->
  <rect x="120" y="340" width="4" height="32" fill="url(#iconGradient)"/>
  <rect x="130" y="340" width="6" height="32" fill="url(#iconGradient)"/>
  <rect x="142" y="340" width="2" height="32" fill="url(#iconGradient)"/>
  <rect x="150" y="340" width="8" height="32" fill="url(#iconGradient)"/>
  <rect x="164" y="340" width="4" height="32" fill="url(#iconGradient)"/>
  
  <!-- Brand text -->
  <text x="256" y="450" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="url(#iconGradient)" text-anchor="middle">NEXEN</text>
  <text x="256" y="480" font-family="Arial, sans-serif" font-size="20" fill="url(#iconGradient)" text-anchor="middle" opacity="0.9">AIRIS</text>
</svg>
`;

// Icon sizes required for PWA
const iconSizes = [
  72, 96, 128, 144, 152, 192, 384, 512,
  // Additional sizes for better compatibility
  16, 32, 48, 180, 256
];

// Splash screen sizes for different devices
const splashSizes = [
  { width: 320, height: 568, name: 'iphone5' },
  { width: 375, height: 667, name: 'iphone6' },
  { width: 414, height: 736, name: 'iphone6plus' },
  { width: 375, height: 812, name: 'iphonex' },
  { width: 414, height: 896, name: 'iphonexr' },
  { width: 768, height: 1024, name: 'ipad' },
  { width: 1024, height: 1366, name: 'ipadpro' },
  { width: 360, height: 640, name: 'android_small' },
  { width: 412, height: 732, name: 'android_medium' },
  { width: 480, height: 854, name: 'android_large' }
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons...');
  
  // Generate base SVG file
  fs.writeFileSync(path.join(iconsDir, 'icon-base.svg'), baseSvg);
  
  // Generate PNG icons in all required sizes
  for (const size of iconSizes) {
    try {
      await sharp(Buffer.from(baseSvg))
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
      
      console.log(`✅ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error generating ${size}x${size} icon:`, error);
    }
  }
  
  // Generate maskable icon (for Android adaptive icons)
  const maskableSvg = baseSvg.replace(
    'rx="80"',
    'rx="0"'
  ).replace(
    '<rect width="512" height="512" rx="80"',
    '<rect width="512" height="512" rx="0"'
  );
  
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512x512-maskable.png'));
  
  console.log('✅ Generated maskable icon');
}

async function generateSplashScreens() {
  console.log('🌟 Generating splash screens...');
  
  for (const splash of splashSizes) {
    try {
      // Create splash screen SVG with centered logo
      const splashSvg = `
      <svg width="${splash.width}" height="${splash.height}" viewBox="0 0 ${splash.width} ${splash.height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="${splash.width}" height="${splash.height}" fill="url(#bgGradient)" />
        
        <!-- Centered logo -->
        <g transform="translate(${splash.width/2 - 64}, ${splash.height/2 - 64})">
          <rect width="128" height="128" rx="20" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
          <rect x="20" y="30" width="88" height="68" rx="5" fill="none" stroke="white" stroke-width="2"/>
          <line x1="40" y1="30" x2="40" y2="98" stroke="white" stroke-width="1"/>
          <line x1="88" y1="30" x2="88" y2="98" stroke="white" stroke-width="1"/>
          <line x1="20" y1="50" x2="108" y2="50" stroke="white" stroke-width="1"/>
          <line x1="20" y1="78" x2="108" y2="78" stroke="white" stroke-width="1"/>
          <text x="64" y="115" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle">NEXEN AIRIS</text>
        </g>
        
        <!-- Loading indicator -->
        <g transform="translate(${splash.width/2}, ${splash.height - 100})">
          <circle cx="0" cy="0" r="20" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
          <circle cx="0" cy="0" r="20" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" 
                  stroke-dasharray="31.416" stroke-dashoffset="31.416">
            <animateTransform attributeName="transform" type="rotate" values="0;360" dur="1s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>
      `;
      
      await sharp(Buffer.from(splashSvg))
        .png()
        .toFile(path.join(iconsDir, `splash-${splash.name}-${splash.width}x${splash.height}.png`));
      
      console.log(`✅ Generated splash-${splash.name}-${splash.width}x${splash.height}.png`);
    } catch (error) {
      console.error(`❌ Error generating ${splash.name} splash:`, error);
    }
  }
}

async function generateFavicons() {
  console.log('🔖 Generating favicons...');
  
  // Generate various favicon formats
  const faviconSizes = [16, 32, 48];
  
  for (const size of faviconSizes) {
    await sharp(Buffer.from(baseSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `favicon-${size}x${size}.png`));
  }
  
  // Generate ICO file (combining multiple sizes)
  // Note: Sharp doesn't support ICO directly, so we'll create the largest PNG as favicon
  await sharp(Buffer.from(baseSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, 'public', 'favicon.ico'));
  
  console.log('✅ Generated favicon files');
}

async function main() {
  try {
    await generateIcons();
    await generateSplashScreens();
    await generateFavicons();
    
    console.log('\n🎉 All icons and splash screens generated successfully!');
    console.log('📁 Check the public/icons/ directory for all generated assets');
    console.log('\n📋 Generated files:');
    console.log('   • App icons: 72x72 to 512x512 pixels');
    console.log('   • Maskable icon for Android adaptive icons');
    console.log('   • Splash screens for iOS and Android devices');
    console.log('   • Favicon files for browser tabs');
    
  } catch (error) {
    console.error('❌ Error during icon generation:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateIcons, generateSplashScreens, generateFavicons };