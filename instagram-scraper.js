const fs = require('fs');
const path = require('path');
const https = require('https');
const puppeteer = require('puppeteer');
const matter = require('gray-matter');

const SUPPLIERS_DIR = './apps/marketing/src/content/suppliers';
const ASSETS_DIR = './apps/marketing/public/assets/directories/suppliers';

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

      // Sätt user agent för att undvika bot-detection
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      await page.goto(`https://www.instagram.com/${username}/`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Vänta lite för att sidan ska laddas
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Försök olika selektorer för profilbild
      const profilePicUrl = await page.evaluate(() => {
        // Försök flera olika selektorer
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

      // Vänta innan nästa försök
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
        fs.unlink(filepath, () => {}); // Ta bort ofullständig fil
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

async function processSupplierFile(filePath) {
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

    console.log(`Bearbetar ${frontmatter.title} (@${username})`);

    // Hämta profilbild
    const profilePicUrl = await getInstagramProfilePic(username);
    if (!profilePicUrl) {
      return;
    }

    // Skapa filnamn
    const sanitizedTitle = frontmatter.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const imageFileName = `${sanitizedTitle}.jpg`;
    const imagePath = path.join(ASSETS_DIR, imageFileName);

    // Skapa assets-mapp om den inte finns
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    // Ladda ner bild
    try {
      await downloadImage(profilePicUrl, imagePath);
      console.log(`✓ Sparade bild: ${imageFileName}`);

      // Uppdatera frontmatter
      frontmatter.image = `/assets/directories/suppliers/${imageFileName}`;

      // Skriv tillbaka till fil
      const updatedContent = matter.stringify(body, frontmatter);
      fs.writeFileSync(filePath, updatedContent);

      console.log(`✓ Uppdaterade ${path.basename(filePath)}`);

    } catch (error) {
      console.log(`✗ Kunde inte ladda ner bild för @${username}:`, error.message);
    }

    // Paus mellan requests för att vara snäll mot Instagram
    await new Promise(resolve => setTimeout(resolve, 3000));

  } catch (error) {
    console.log(`✗ Fel vid bearbetning av ${filePath}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Startar Instagram profilbild-hämtare...\n');

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
    await processSupplierFile(supplierFiles[i]);
  }

  console.log('\n✅ Klart! Alla leverantörer bearbetade.');
}

// Kör scriptet om det kallas direkt
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { getInstagramProfilePic, processSupplierFile };