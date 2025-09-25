const fs = require('fs');
const path = require('path');
const https = require('https');
const puppeteer = require('puppeteer');
const matter = require('gray-matter');

const SUPPLIERS_DIR = './apps/marketing/src/content/suppliers';
const ASSETS_DIR = './apps/marketing/public/assets/directories/suppliers';
const GALLERY_DIR = './apps/marketing/public/assets/directories/suppliers/gallery';

async function getInstagramGallery(username, maxImages = 6, retries = 3) {
  let browser;

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Hämtar galleri för @${username} (försök ${i + 1}/${retries})`);

      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      const page = await browser.newPage();

      // Sätt user agent för att undvika bot-detection
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      await page.goto(`https://www.instagram.com/${username}/`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Vänta för att sidan ska laddas
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Hämta bilder från galleri
      const images = await page.evaluate((maxImages) => {
        const imageElements = document.querySelectorAll('article img, a img[src*="scontent"]');
        const imageUrls = [];

        for (let i = 0; i < imageElements.length && imageUrls.length < maxImages; i++) {
          const img = imageElements[i];
          if (img.src &&
              img.src.includes('scontent') &&
              !img.src.includes('profile_pics') &&
              img.src.startsWith('https://')) {
            imageUrls.push(img.src);
          }
        }

        return [...new Set(imageUrls)]; // Ta bort dubletter
      }, maxImages);

      await browser.close();

      if (images.length > 0) {
        console.log(`✓ Hittade ${images.length} bilder för @${username}`);
        return images;
      } else {
        console.log(`⚠ Kunde inte hitta bilder för @${username}`);
        return [];
      }

    } catch (error) {
      console.log(`✗ Fel för @${username}:`, error.message);

      if (browser) {
        await browser.close();
      }

      if (i === retries - 1) {
        return [];
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return [];
}

async function getInstagramProfilePic(username, retries = 3) {
  let browser;

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Hämtar profilbild för @${username} (försök ${i + 1}/${retries})`);

      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      await page.goto(`https://www.instagram.com/${username}/`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const profilePicUrl = await page.evaluate(() => {
        const selectors = [
          'img[alt*="profile picture"]',
          'img[alt*="profilbild"]',
          'header img',
          'article header img',
          'img[src*="profile_pics"]'
        ];

        for (const selector of selectors) {
          const img = document.querySelector(selector);
          if (img && img.src) {
            return img.src;
          }
        }
        return null;
      });

      await browser.close();

      if (profilePicUrl) {
        console.log(`✓ Hittade profilbild för @${username}`);
        return profilePicUrl;
      } else {
        console.log(`⚠ Kunde inte hitta profilbild för @${username}`);
        return null;
      }

    } catch (error) {
      console.log(`✗ Fel för @${username}:`, error.message);

      if (browser) {
        await browser.close();
      }

      if (i === retries - 1) {
        return null;
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return null;
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

function extractUsernameFromInstagramUrl(url) {
  if (!url) return null;
  const match = url.match(/instagram\.com\/([^\/\?]+)/);
  return match ? match[1] : null;
}

function sanitizeFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function processSupplierForGallery(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: body } = matter(content);

    if (!frontmatter.instagram) {
      console.log(`⚠ Ingen Instagram-länk i ${path.basename(filePath)}`);
      return;
    }

    const username = extractUsernameFromInstagramUrl(frontmatter.instagram);
    if (!username) {
      console.log(`⚠ Kunde inte extrahera användarnamn från ${frontmatter.instagram}`);
      return;
    }

    console.log(`\nBearbetar ${frontmatter.title} (@${username})`);

    const sanitizedTitle = sanitizeFilename(frontmatter.title);

    // Skapa mappar om de inte finns
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }
    if (!fs.existsSync(GALLERY_DIR)) {
      fs.mkdirSync(GALLERY_DIR, { recursive: true });
    }

    const supplierGalleryDir = path.join(GALLERY_DIR, sanitizedTitle);
    if (!fs.existsSync(supplierGalleryDir)) {
      fs.mkdirSync(supplierGalleryDir, { recursive: true });
    }

    // Hämta profilbild om den inte finns
    let needsProfilePic = false;
    if (!frontmatter.image || frontmatter.image.includes('placeholder-supplier.svg')) {
      needsProfilePic = true;
    }

    if (needsProfilePic) {
      console.log('📸 Hämtar profilbild...');
      const profilePicUrl = await getInstagramProfilePic(username);

      if (profilePicUrl) {
        const imageFileName = `${sanitizedTitle}.jpg`;
        const imagePath = path.join(ASSETS_DIR, imageFileName);

        try {
          await downloadImage(profilePicUrl, imagePath);
          console.log(`✓ Sparade profilbild: ${imageFileName}`);

          frontmatter.image = `/assets/directories/suppliers/${imageFileName}`;
        } catch (error) {
          console.log(`✗ Kunde inte ladda ner profilbild: ${error.message}`);
        }
      }
    }

    // Hämta galleri-bilder
    console.log('🖼️  Hämtar galleri-bilder...');
    const galleryImages = await getInstagramGallery(username, 6);

    const galleryPaths = [];

    for (let i = 0; i < galleryImages.length; i++) {
      const imageUrl = galleryImages[i];
      const fileName = `${sanitizedTitle}-${i + 1}.jpg`;
      const filePath = path.join(supplierGalleryDir, fileName);

      try {
        await downloadImage(imageUrl, filePath);
        const relativePath = `/assets/directories/suppliers/gallery/${sanitizedTitle}/${fileName}`;
        galleryPaths.push(relativePath);
        console.log(`✓ Sparade galleri-bild ${i + 1}: ${fileName}`);
      } catch (error) {
        console.log(`✗ Kunde inte ladda ner galleri-bild ${i + 1}: ${error.message}`);
      }
    }

    // Uppdatera frontmatter med galleri
    if (galleryPaths.length > 0) {
      frontmatter.instagramGallery = galleryPaths;
    }

    // Skriv tillbaka till fil
    const updatedContent = matter.stringify(body, frontmatter);
    fs.writeFileSync(filePath, updatedContent);

    console.log(`✅ Uppdaterade ${path.basename(filePath)} med ${galleryPaths.length} galleri-bilder`);

    // Paus mellan requests
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.log(`✗ Fel vid bearbetning av ${filePath}:`, error.message);
  }
}

async function processNewSupplier(filePath) {
  console.log(`🆕 Bearbetar ny leverantör: ${path.basename(filePath)}`);
  await processSupplierForGallery(filePath);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length > 0 && args[0] === 'new' && args[1]) {
    // Bearbeta en specifik fil för ny leverantör
    const filePath = args[1];
    if (fs.existsSync(filePath)) {
      await processNewSupplier(filePath);
    } else {
      console.log('❌ Filen finns inte:', filePath);
    }
    return;
  }

  console.log('🚀 Startar Instagram galleri-hämtare...\n');

  // Hitta alla leverantörsfiler
  const supplierFiles = [];

  function findSupplierFiles(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        findSupplierFiles(fullPath);
      } else if (item.endsWith('.mdx')) {
        supplierFiles.push(fullPath);
      }
    }
  }

  findSupplierFiles(SUPPLIERS_DIR);

  console.log(`Hittade ${supplierFiles.length} leverantörsfiler\n`);

  // Bearbeta varje fil
  for (let i = 0; i < supplierFiles.length; i++) {
    console.log(`\n[${i + 1}/${supplierFiles.length}] ${path.basename(supplierFiles[i])}`);
    await processSupplierForGallery(supplierFiles[i]);
  }

  console.log('\n✅ Klart! Alla leverantörer bearbetade med galleri-bilder.');
}

// Kör scriptet om det kallas direkt
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processNewSupplier, processSupplierForGallery };