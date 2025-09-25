const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

class SwedishVenueScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.venues = [];
    this.baseUrl = 'https://xn--brllopslokaler-wpb.nu';
    this.listingUrl = 'https://xn--brllopslokaler-wpb.nu/fina-brollopslokaler/?search_region=0&search_categories%5B%5D=&submit=';
    this.outputDir = './scraped-venues';
    this.imagesDir = path.join(this.outputDir, 'images');
  }

  async init() {
    // Create output directories
    await this.ensureDirectories();

    // Launch browser
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for production
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    this.page = await this.browser.newPage();

    // Set user agent to avoid detection
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      await fs.mkdir(this.imagesDir, { recursive: true });
    } catch (error) {
      console.log('Directories already exist or created successfully');
    }
  }

  async scrapeVenueListings() {
    console.log('🚀 Starting venue listings scrape...');

    await this.page.goto(this.listingUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for the main content to load
    await this.page.waitForSelector('.search-results', { timeout: 10000 });

    let previousHeight = 0;
    let venueUrls = new Set();
    let scrollAttempts = 0;
    const maxScrollAttempts = 50;

    console.log('📜 Handling infinite scroll...');

    while (scrollAttempts < maxScrollAttempts) {
      // Extract venue URLs from current view
      const currentUrls = await this.page.evaluate((baseUrl) => {
        const venueCards = document.querySelectorAll('a[href*="/brollop-och-festlokaler/"]');
        return Array.from(venueCards).map(card => {
          const href = card.getAttribute('href');
          return href.startsWith('http') ? href : baseUrl + href;
        });
      }, this.baseUrl);

      // Add to our set
      currentUrls.forEach(url => venueUrls.add(url));

      console.log(`Found ${venueUrls.size} unique venues so far...`);

      // Scroll to bottom
      previousHeight = await this.page.evaluate(() => document.body.scrollHeight);

      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Wait for potential new content to load
      try {
        await this.page.waitForFunction(
          `document.body.scrollHeight > ${previousHeight}`,
          { timeout: 5000 }
        );
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        // No new content loaded, we've reached the end
        console.log('✅ Reached end of listings');
        break;
      }

      scrollAttempts++;
    }

    console.log(`🎯 Total venues found: ${venueUrls.size}`);
    return Array.from(venueUrls);
  }

  async scrapeIndividualVenue(venueUrl) {
    console.log(`🏰 Scraping venue: ${venueUrl}`);

    try {
      await this.page.goto(venueUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for main content
      await this.page.waitForSelector('h1', { timeout: 10000 });

      const venueData = await this.page.evaluate((url) => {
        const data = {
          url: url,
          scrapedAt: new Date().toISOString()
        };

        // Basic venue information
        const title = document.querySelector('h1')?.textContent?.trim();
        if (title) data.title = title;

        // Address/location info
        const addressElement = document.querySelector('.venue-address, .address, [class*="address"]');
        if (addressElement) {
          data.address = addressElement.textContent.trim();
        }

        // Extract location from breadcrumbs or address
        const breadcrumbs = document.querySelector('.breadcrumbs, nav[aria-label="breadcrumb"]');
        if (breadcrumbs) {
          data.breadcrumbs = breadcrumbs.textContent.trim();
        }

        // Description/content
        const contentSections = document.querySelectorAll('section, .content, .description, [class*="content"]');
        const descriptions = [];
        contentSections.forEach(section => {
          const text = section.textContent?.trim();
          if (text && text.length > 50) {
            descriptions.push(text);
          }
        });
        data.descriptions = descriptions;

        // Extract all text content
        const textElements = document.querySelectorAll('p, div:not(script):not(style)');
        const allText = [];
        textElements.forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 20 && !text.includes('©') && !text.includes('cookie')) {
            allText.push(text);
          }
        });
        data.allText = allText;

        // Images
        const images = [];
        const imgElements = document.querySelectorAll('img[src]');
        imgElements.forEach(img => {
          const src = img.getAttribute('src');
          const alt = img.getAttribute('alt') || '';
          if (src && !src.includes('data:image') && !src.includes('base64')) {
            images.push({
              src: src.startsWith('http') ? src : window.location.origin + src,
              alt: alt,
              title: img.getAttribute('title') || ''
            });
          }
        });
        data.images = images;

        // Contact information
        const contactElements = document.querySelectorAll('[href*="mailto"], [href*="tel"], .phone, .email, [class*="contact"]');
        const contacts = [];
        contactElements.forEach(el => {
          if (el.href) {
            contacts.push({
              type: el.href.startsWith('mailto:') ? 'email' : el.href.startsWith('tel:') ? 'phone' : 'other',
              value: el.href,
              text: el.textContent?.trim()
            });
          } else {
            contacts.push({
              type: 'info',
              text: el.textContent?.trim()
            });
          }
        });
        data.contacts = contacts;

        // Meta information
        const metaTags = document.querySelectorAll('meta[name], meta[property]');
        const meta = {};
        metaTags.forEach(tag => {
          const name = tag.getAttribute('name') || tag.getAttribute('property');
          const content = tag.getAttribute('content');
          if (name && content) {
            meta[name] = content;
          }
        });
        data.meta = meta;

        // Capacity/guest info (look for numbers that might be guest capacity)
        const capacityMatches = document.body.textContent.match(/(\d+)\s*(gäster|personer|platser)/gi);
        if (capacityMatches) {
          data.capacity = capacityMatches.map(match => match.trim());
        }

        // Price information
        const priceMatches = document.body.textContent.match(/(\d+(?:\s?\d{3})*)\s*(kr|kronor|SEK)/gi);
        if (priceMatches) {
          data.prices = priceMatches.map(match => match.trim());
        }

        return data;
      }, venueUrl);

      // Download images for this venue
      if (venueData.images && venueData.images.length > 0) {
        const venueSlug = this.createSlug(venueData.title || 'unknown-venue');
        venueData.localImages = await this.downloadVenueImages(venueData.images, venueSlug);
      }

      return venueData;

    } catch (error) {
      console.error(`❌ Error scraping venue ${venueUrl}:`, error.message);
      return {
        url: venueUrl,
        error: error.message,
        scrapedAt: new Date().toISOString()
      };
    }
  }

  async downloadVenueImages(images, venueSlug) {
    const localImages = [];
    const venueImageDir = path.join(this.imagesDir, venueSlug);

    try {
      await fs.mkdir(venueImageDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    for (let i = 0; i < Math.min(images.length, 10); i++) { // Limit to 10 images per venue
      const image = images[i];
      try {
        const imageExtension = path.extname(new URL(image.src).pathname) || '.jpg';
        const fileName = `${venueSlug}-${i + 1}${imageExtension}`;
        const filePath = path.join(venueImageDir, fileName);

        await this.downloadImage(image.src, filePath);

        localImages.push({
          ...image,
          localPath: filePath,
          fileName: fileName
        });

        console.log(`📸 Downloaded: ${fileName}`);
      } catch (error) {
        console.error(`❌ Failed to download image ${image.src}:`, error.message);
      }
    }

    return localImages;
  }

  async downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https:') ? https : http;

      const request = protocol.get(url, (response) => {
        if (response.statusCode === 200) {
          const fileStream = require('fs').createWriteStream(filepath);
          response.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close();
            resolve();
          });

          fileStream.on('error', reject);
        } else {
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      });

      request.on('error', reject);
      request.setTimeout(10000, () => {
        request.abort();
        reject(new Error('Download timeout'));
      });
    });
  }

  createSlug(text) {
    return text
      .toLowerCase()
      .replace(/[åä]/g, 'a')
      .replace(/[ö]/g, 'o')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async generateMDXFiles() {
    console.log('📝 Generating MDX files for venues...');

    const mdxDir = path.join(this.outputDir, 'mdx-files');
    await fs.mkdir(mdxDir, { recursive: true });

    for (const venue of this.venues) {
      if (venue.error) continue;

      const slug = this.createSlug(venue.title || 'unknown-venue');
      const mdxContent = this.createMDXContent(venue, slug);
      const filePath = path.join(mdxDir, `${slug}.mdx`);

      await fs.writeFile(filePath, mdxContent, 'utf8');
      console.log(`✅ Generated MDX: ${slug}.mdx`);
    }
  }

  createMDXContent(venue, slug) {
    // Extract key information
    const title = venue.title || 'Venue Name';
    const description = this.extractDescription(venue);
    const city = this.extractCity(venue);
    const region = this.extractRegion(venue);
    const capacity = this.extractCapacity(venue);
    const startPrice = this.extractPrice(venue);

    return `---
title: "${title}"
description: "${description}"
summary: "Bröllopslokal i ${city} med plats för ${capacity || 'flera'} gäster. ${description.substring(0, 100)}..."
category: venue
city: ${city}
region: ${region}
serviceArea: ${region}
startPrice: ${startPrice || 0}
capacity: ${capacity || 0}
website: "${venue.url}"
image: "${venue.localImages?.[0]?.fileName ? `/assets/venues/${slug}/${venue.localImages[0].fileName}` : '/assets/venues/placeholder-venue.jpg'}"
latitude: ""
longitude: ""
notes: "${this.extractNotes(venue)}"
related:
  - "guides/brollopsplanering-grundkurs"
  - "guides/brollopslokaler-sverige-komplett-guide"
status: draft
schemaType: Place
---

## Om lokalen

${description}

${venue.descriptions?.length > 0 ? venue.descriptions.join('\n\n') : ''}

## Kontaktinformation

${venue.contacts?.map(contact => {
  if (contact.type === 'email') return `**E-post:** ${contact.text || contact.value}`;
  if (contact.type === 'phone') return `**Telefon:** ${contact.text || contact.value}`;
  return contact.text;
}).join('\n') || 'Kontaktinformation kommer att uppdateras.'}

## Kapacitet och faciliteter

${capacity ? `**Kapacitet:** ${capacity} gäster` : ''}
${startPrice ? `**Från:** ${startPrice} kr` : ''}

${venue.capacity?.length > 0 ? venue.capacity.join('\n') : ''}

## Bilder

${venue.localImages?.map((img, index) =>
  `![${img.alt || title}](/assets/venues/${slug}/${img.fileName})`
).join('\n\n') || ''}

---

*Information hämtad från ${venue.url}*
*Senast uppdaterad: ${new Date(venue.scrapedAt).toLocaleDateString('sv-SE')}*
`;
  }

  extractDescription(venue) {
    if (venue.meta?.description) return venue.meta.description;
    if (venue.descriptions?.length > 0) return venue.descriptions[0].substring(0, 200);
    if (venue.allText?.length > 0) return venue.allText[0].substring(0, 200);
    return 'Vacker bröllopslokal i Sverige.';
  }

  extractCity(venue) {
    // Try to extract city from address, breadcrumbs, or URL
    const text = `${venue.address || ''} ${venue.breadcrumbs || ''} ${venue.url}`.toLowerCase();

    const cities = ['stockholm', 'göteborg', 'malmö', 'uppsala', 'linköping', 'örebro', 'västerås', 'norrköping', 'helsingborg', 'jönköping'];

    for (const city of cities) {
      if (text.includes(city)) {
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }

    return 'Sverige'; // Fallback
  }

  extractRegion(venue) {
    const text = `${venue.address || ''} ${venue.breadcrumbs || ''}`.toLowerCase();

    if (text.includes('stockholm') || text.includes('sörmland') || text.includes('södermanland')) return 'Stockholm';
    if (text.includes('göteborg') || text.includes('västra götaland')) return 'Västra Götaland';
    if (text.includes('malmö') || text.includes('skåne')) return 'Skåne';
    if (text.includes('uppsala') || text.includes('uppland')) return 'Uppsala';
    if (text.includes('örebro')) return 'Örebro';
    if (text.includes('västerås') || text.includes('västmanland')) return 'Västmanland';
    if (text.includes('norrköping') || text.includes('östergötland')) return 'Östergötland';
    if (text.includes('helsingborg')) return 'Skåne';
    if (text.includes('jönköping') || text.includes('småland')) return 'Jönköping';

    return 'Sverige';
  }

  extractCapacity(venue) {
    if (venue.capacity?.length > 0) {
      const numbers = venue.capacity[0].match(/\d+/);
      return numbers ? parseInt(numbers[0]) : null;
    }
    return null;
  }

  extractPrice(venue) {
    if (venue.prices?.length > 0) {
      const numbers = venue.prices[0].match(/\d+(?:\s?\d{3})*/);
      return numbers ? parseInt(numbers[0].replace(/\s/g, '')) : null;
    }
    return null;
  }

  extractNotes(venue) {
    const notes = [];
    if (venue.capacity?.length > 0) notes.push(`Kapacitet: ${venue.capacity[0]}`);
    if (venue.prices?.length > 0) notes.push(`Priser: ${venue.prices[0]}`);
    return notes.join(', ') || 'Vacker bröllopslokal';
  }

  async saveResults() {
    const resultsFile = path.join(this.outputDir, 'scraped-venues.json');
    await fs.writeFile(resultsFile, JSON.stringify(this.venues, null, 2));
    console.log(`💾 Saved ${this.venues.length} venues to ${resultsFile}`);

    // Generate summary
    const summary = {
      totalVenues: this.venues.length,
      successful: this.venues.filter(v => !v.error).length,
      errors: this.venues.filter(v => v.error).length,
      scrapedAt: new Date().toISOString(),
      cities: [...new Set(this.venues.filter(v => !v.error).map(v => this.extractCity(v)))],
      totalImages: this.venues.reduce((sum, v) => sum + (v.localImages?.length || 0), 0)
    };

    const summaryFile = path.join(this.outputDir, 'scraping-summary.json');
    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));
    console.log('📊 Scraping summary:', summary);
  }

  async run() {
    try {
      console.log('🎯 Starting Swedish Venue Scraper...');

      await this.init();

      // Step 1: Get all venue URLs
      const venueUrls = await this.scrapeVenueListings();

      // Step 2: Scrape each venue (with rate limiting)
      console.log(`🏰 Starting individual venue scraping for ${venueUrls.length} venues...`);

      let processed = 0;
      for (const venueUrl of venueUrls) {
        const venueData = await this.scrapeIndividualVenue(venueUrl);
        this.venues.push(venueData);

        processed++;
        console.log(`✅ Progress: ${processed}/${venueUrls.length} venues processed`);

        // Rate limiting: wait between requests
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Save progress every 10 venues
        if (processed % 10 === 0) {
          await this.saveResults();
          console.log('💾 Progress saved!');
        }
      }

      // Step 3: Generate MDX files
      await this.generateMDXFiles();

      // Step 4: Save final results
      await this.saveResults();

      console.log('🎉 Scraping completed successfully!');

    } catch (error) {
      console.error('❌ Scraping failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the scraper
if (require.main === module) {
  const scraper = new SwedishVenueScraper();
  scraper.run().catch(console.error);
}

module.exports = SwedishVenueScraper;