const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

class OptimizedVenueScraper {
  constructor(options = {}) {
    this.browser = null;
    this.page = null;
    this.venues = [];
    this.baseUrl = 'https://xn--brllopslokaler-wpb.nu';
    this.listingUrl = 'https://xn--brllopslokaler-wpb.nu/fina-brollopslokaler/?search_region=0&search_categories%5B%5D=&submit=';
    this.outputDir = './scraped-venues';
    this.imagesDir = path.join(this.outputDir, 'images');
    this.errors = [];
    this.chromeProfileDir = path.join(this.outputDir, '.chrome-profile');
    this.puppeteerHome = path.join(this.outputDir, '.puppeteer-home');
    this.originalHome = process.env.HOME;
    this.options = {
      startIndex: Math.max(parseInt(options.startIndex, 10) || 0, 0),
      maxScrollAttempts: Math.max(parseInt(options.maxScrollAttempts, 10) || 40, 1),
      scrollDelayMs: Math.max(parseInt(options.scrollDelayMs, 10) || 3000, 250)
    };
  }

  async init() {
    console.log('🚀 Initializing Optimized Venue Scraper...');

    await this.ensureDirectories();

    process.env.HOME = this.puppeteerHome;

    this.browser = await puppeteer.launch({
      headless: 'new',
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-crash-reporter',
        '--no-crashpad'
      ],
      userDataDir: this.chromeProfileDir
    });

    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Block unnecessary resources to speed up scraping
    await this.page.setRequestInterception(true);
    this.page.on('request', (req) => {
      if (req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      await fs.mkdir(this.imagesDir, { recursive: true });
      await fs.mkdir(path.join(this.outputDir, 'mdx-files'), { recursive: true });
      await fs.mkdir(this.chromeProfileDir, { recursive: true });
      await fs.mkdir(this.puppeteerHome, { recursive: true });
      await fs.mkdir(path.join(this.puppeteerHome, 'Library/Application Support/Google/Chrome for Testing/Crashpad'), { recursive: true });
    } catch (error) {
      console.log('📁 Directories created successfully');
    }
  }

  async scrapeVenueListingsOptimized() {
    console.log('📋 Starting optimized venue listings scrape...');

    await this.page.goto(this.listingUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for content to load
    await this.page.waitForSelector('article.card--listing', { timeout: 15000 });
    console.log('✅ Page loaded, starting infinite scroll...');

    // Optimized infinite scroll based on analysis findings
    let previousCount = 0;
    let scrollAttempts = 0;
    const maxAttempts = this.options.maxScrollAttempts;

    while (scrollAttempts < maxAttempts) {
      // Get current venue count
      const currentCount = await this.page.evaluate(() =>
        document.querySelectorAll('article.card--listing').length
      );

      console.log(`📊 Found ${currentCount} venues (was ${previousCount})`);

      // If no new venues loaded, we're done
      if (currentCount === previousCount && scrollAttempts > 2) {
        console.log('🏁 No more venues to load');
        break;
      }

      previousCount = currentCount;

      // Smooth scroll to bottom
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Wait for new content
      await new Promise(resolve => setTimeout(resolve, this.options.scrollDelayMs));
      scrollAttempts++;
    }

    // Extract all venue data from listing page (optimized based on analysis)
    console.log('🔍 Extracting venue data from listings...');

    const venueListings = await this.page.evaluate((baseUrl) => {
      const venues = [];
      const cards = document.querySelectorAll('article.card--listing');

      console.log(`Processing ${cards.length} venue cards...`);

      cards.forEach((card, index) => {
        try {
          const venue = {
            index: index,
            scrapedAt: new Date().toISOString()
          };

          // Get URL from card link
          const link = card.querySelector('a.card__link');
          if (link) {
            venue.url = link.href.startsWith('http') ? link.href : baseUrl + link.href;
          }

          // Get venue name from hidden h3
          const nameElement = card.querySelector('h3.gt3_hidden');
          if (nameElement) {
            venue.name = nameElement.textContent.trim();
          }

          // Extract rich data from card attributes
          venue.latitude = card.getAttribute('data-latitude');
          venue.longitude = card.getAttribute('data-longitude');
          venue.mainImage = card.getAttribute('data-img');
          venue.categories = card.getAttribute('data-categories');
          venue.postId = card.getAttribute('data-postid');

          // Get phone from itemprop
          const phoneElement = card.querySelector('meta[itemprop="telephone"]');
          if (phoneElement) {
            venue.phone = phoneElement.getAttribute('content');
          }

          // Get additional info from card content
          const cardTitle = card.querySelector('.card__title');
          if (cardTitle) {
            venue.displayName = cardTitle.textContent.trim();
          }

          // Extract any visible text content
          const contentInfo = card.querySelector('.card__content_info');
          if (contentInfo) {
            venue.shortDescription = contentInfo.textContent.trim();
          }

          // Look for capacity info
          const cardText = card.textContent;
          const capacityMatch = cardText.match(/(\d+)\s*(gäster|personer|platser)/i);
          if (capacityMatch) {
            venue.capacityFromListing = capacityMatch[0];
          }

          venues.push(venue);
        } catch (error) {
          console.error(`Error processing card ${index}:`, error);
        }
      });

      return venues;
    }, this.baseUrl);

    console.log(`✅ Extracted ${venueListings.length} venues from listings`);
    return venueListings;
  }

  async scrapeVenueDetailsOptimized(venue) {
    console.log(`🏰 Scraping venue details: ${venue.name || 'Unknown'}`);

    try {
      await this.page.goto(venue.url, {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });

      // Wait for main content
      await this.page.waitForSelector('h1', { timeout: 10000 });

      const detailedData = await this.page.evaluate(() => {
        const details = {};

        // Title
        const h1 = document.querySelector('h1');
        if (h1) details.title = h1.textContent.trim();

        // Address (optimized selector based on analysis)
        const addressElement = document.querySelector('.contact_widget_address');
        if (addressElement) {
          details.address = addressElement.textContent.trim();
          // Extract coordinate from maps link
          const mapsLink = addressElement.querySelector('a[href*="maps.google.com"]');
          if (mapsLink) {
            const coordMatch = mapsLink.href.match(/daddr=([^&]+)/);
            if (coordMatch) {
              details.coordinates = coordMatch[1];
            }
          }
        }

        // Contact information (based on analysis findings)
        details.contacts = {
          email: null,
          phone: null,
          website: null
        };

        // Email
        const emailElement = document.querySelector('.contact_widget_email, a[href^="mailto:"]');
        if (emailElement) {
          details.contacts.email = emailElement.textContent.trim() ||
                                   emailElement.href?.replace('mailto:', '');
        }

        // Phone
        const phoneElement = document.querySelector('.contact_widget_phone, a[href^="tel:"]');
        if (phoneElement) {
          details.contacts.phone = phoneElement.textContent.trim() ||
                                   phoneElement.href?.replace('tel:', '');
        }

        // Main content (based on analysis)
        const contentSelectors = [
          '.single_job_description',
          '.job_description',
          '.listing_post_main_content'
        ];

        details.descriptions = [];
        contentSelectors.forEach(selector => {
          const element = document.querySelector(selector);
          if (element) {
            const text = element.textContent.trim();
            if (text.length > 100) {
              details.descriptions.push(text);
            }
          }
        });

        // Capacity information (confirmed working from analysis)
        const bodyText = document.body.textContent;
        const capacityMatches = bodyText.match(/(\d+)\s*(gäster|personer|platser)/gi) || [];
        details.capacity = [...new Set(capacityMatches)]; // Remove duplicates

        // Price information
        const priceMatches = bodyText.match(/(\d+(?:\s?\d{3})*)\s*(kr|kronor|SEK)/gi) || [];
        details.prices = [...new Set(priceMatches)];

        // Images - look for gallery images and background images
        details.images = [];

        // Standard img tags
        document.querySelectorAll('img[src]').forEach(img => {
          if (img.src && !img.src.includes('data:') && !img.src.includes('logo') && !img.src.includes('icon')) {
            details.images.push({
              src: img.src,
              alt: img.alt || '',
              width: img.width,
              height: img.height
            });
          }
        });

        // Background images from style attributes
        document.querySelectorAll('[style*="background-image"]').forEach(el => {
          const style = el.getAttribute('style');
          const bgMatch = style.match(/background-image:\s*url\(['"]?(.*?)['"]?\)/);
          if (bgMatch) {
            const imgUrl = bgMatch[1].startsWith('http') ? bgMatch[1] : window.location.origin + bgMatch[1];
            details.images.push({
              src: imgUrl,
              alt: 'Background image',
              type: 'background'
            });
          }
        });

        // Meta information
        details.meta = {};
        document.querySelectorAll('meta[name], meta[property]').forEach(meta => {
          const name = meta.getAttribute('name') || meta.getAttribute('property');
          const content = meta.getAttribute('content');
          if (name && content) {
            details.meta[name] = content;
          }
        });

        return details;
      });

      // Merge listing data with detailed data
      const enrichedVenue = {
        ...venue,
        ...detailedData,
        scrapedDetailAt: new Date().toISOString()
      };

      // Download images for this venue
      if (detailedData.images?.length > 0) {
        const venueSlug = this.createSlug(detailedData.title || venue.name || 'unknown');
        enrichedVenue.localImages = await this.downloadVenueImages(detailedData.images, venueSlug);
      }

      return enrichedVenue;

    } catch (error) {
      console.error(`❌ Error scraping details for ${venue.url}:`, error.message);
      this.errors.push({
        url: venue.url,
        name: venue.name,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      return {
        ...venue,
        error: error.message,
        scrapedDetailAt: new Date().toISOString()
      };
    }
  }

  async downloadVenueImages(images, venueSlug) {
    const localImages = [];
    const venueImageDir = path.join(this.imagesDir, venueSlug);

    try {
      await fs.mkdir(venueImageDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }

    // Download up to 8 images per venue
    const imagesToDownload = images.filter(img =>
      img.src &&
      !img.src.includes('data:') &&
      !img.src.includes('placeholder')
    ).slice(0, 8);

    for (let i = 0; i < imagesToDownload.length; i++) {
      const image = imagesToDownload[i];
      try {
        const url = new URL(image.src);
        const imageExtension = path.extname(url.pathname) || '.jpg';
        const fileName = `${venueSlug}-${i + 1}${imageExtension}`;
        const filePath = path.join(venueImageDir, fileName);

        await this.downloadImage(image.src, filePath);

        localImages.push({
          ...image,
          localPath: filePath,
          fileName: fileName,
          relativePath: `venues/${venueSlug}/${fileName}`
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
        } else if (response.statusCode === 301 || response.statusCode === 302) {
          // Handle redirect
          this.downloadImage(response.headers.location, filepath)
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      });

      request.on('error', reject);
      request.setTimeout(15000, () => {
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

  async generateVenuesMDX() {
    console.log('📝 Generating MDX files for venues...');

    const mdxDir = path.join(this.outputDir, 'mdx-files');
    let generated = 0;

    for (const venue of this.venues) {
      if (venue.error) continue;

      try {
        const slug = this.createSlug(venue.title || venue.name || 'unknown-venue');
        const mdxContent = this.createVenueMDX(venue, slug);
        const filePath = path.join(mdxDir, `${slug}.mdx`);

        await fs.writeFile(filePath, mdxContent, 'utf8');
        generated++;
        console.log(`✅ Generated: ${slug}.mdx`);
      } catch (error) {
        console.error(`❌ Failed to generate MDX for venue:`, error.message);
      }
    }

    console.log(`📝 Generated ${generated} MDX files`);
  }

  createVenueMDX(venue, slug) {
    const title = venue.title || venue.name || 'Swedish Wedding Venue';
    const description = this.extractDescription(venue);
    const city = this.extractCity(venue);
    const region = this.extractRegion(venue);
    const capacity = this.extractCapacity(venue);
    const startPrice = this.extractPrice(venue);
    const coordinates = this.extractCoordinates(venue);

    return `---
title: "${title}"
description: "${description}"
summary: "${description.substring(0, 150)}..."
category: venue
city: ${city}
region: ${region}
serviceArea: ${region}
startPrice: ${startPrice || 0}
capacity: ${capacity || 0}
website: "${venue.url}"
email: "${venue.contacts?.email || ''}"
phone: "${venue.contacts?.phone || ''}"
image: "${venue.localImages?.[0]?.relativePath ? `/assets/venues/${venue.localImages[0].relativePath}` : '/assets/venues/placeholder-venue.jpg'}"
latitude: "${coordinates?.lat || venue.latitude || ''}"
longitude: "${coordinates?.lng || venue.longitude || ''}"
categories: "${venue.categories || ''}"
notes: "${this.extractNotes(venue)}"
related:
  - "guides/brollopsplanering-grundkurs"
  - "guides/brollopslokaler-sverige-komplett-guide"
status: published
schemaType: Place
---

## Om ${title}

${description}

${venue.descriptions?.length > 0 ? venue.descriptions.map(desc => `${desc}\n\n`).join('') : ''}

## Kontaktinformation

${venue.contacts?.email ? `**E-post:** [${venue.contacts.email}](mailto:${venue.contacts.email})` : ''}
${venue.contacts?.phone ? `**Telefon:** [${venue.contacts.phone}](tel:${venue.contacts.phone})` : ''}
${venue.address ? `**Adress:** ${venue.address.replace(/\n/g, ', ')}` : ''}

## Kapacitet och faciliteter

${capacity ? `**Kapacitet:** ${capacity} gäster` : ''}
${startPrice ? `**Startpris:** Från ${startPrice} kr` : ''}

${venue.capacity?.length > 0 ? venue.capacity.map(cap => `- ${cap}`).join('\n') : ''}

## Kategorier

${venue.categories ? venue.categories.split(',').map(cat => `- ${cat.trim()}`).join('\n') : ''}

${venue.prices?.length > 0 ? `## Priser\n\n${venue.prices.map(price => `- ${price}`).join('\n')}\n\n` : ''}

## Bilder

${venue.localImages?.map((img, index) =>
  `![${img.alt || title} ${index + 1}](/assets/${img.relativePath})`
).join('\n\n') || ''}

---

*Informationen hämtades från [${venue.url}](${venue.url})*
*Senast uppdaterad: ${new Date(venue.scrapedDetailAt || venue.scrapedAt).toLocaleDateString('sv-SE')}*
*Koordinater: ${coordinates?.lat || venue.latitude}, ${coordinates?.lng || venue.longitude}*
`;
  }

  extractDescription(venue) {
    if (venue.meta?.description) return venue.meta.description;
    if (venue.descriptions?.length > 0) {
      return venue.descriptions[0].substring(0, 300).replace(/\n/g, ' ').trim();
    }
    return `${venue.title || venue.name} är en vacker bröllopslokal i ${this.extractCity(venue)}.`;
  }

  extractCity(venue) {
    // Try multiple sources for city
    const sources = [
      venue.address,
      venue.shortDescription,
      venue.url,
      venue.meta?.description
    ].filter(Boolean);

    const swedishCities = [
      'stockholm', 'göteborg', 'malmö', 'uppsala', 'västerås', 'örebro', 'linköping',
      'helsingborg', 'jönköping', 'norrköping', 'lund', 'umeå', 'gävle', 'borås',
      'eskilstuna', 'södertälje', 'karlstad', 'täby', 'växjö', 'halmstad', 'sundsvall',
      'luleå', 'trollhättan', 'östersund', 'borlänge', 'tumba', 'solna', 'kiruna',
      'kalmar', 'kristianstad', 'skövde', 'falun', 'sandviken', 'varberg', 'trelleborg',
      'lidingö', 'uddevalla', 'visby', 'mörbylånga'
    ];

    for (const source of sources) {
      const lowerSource = source.toLowerCase();
      for (const city of swedishCities) {
        if (lowerSource.includes(city)) {
          return city.charAt(0).toUpperCase() + city.slice(1);
        }
      }
    }

    return 'Sverige'; // Fallback
  }

  extractRegion(venue) {
    const city = this.extractCity(venue).toLowerCase();
    const regionMap = {
      'stockholm': 'Stockholm',
      'göteborg': 'Västra Götaland',
      'malmö': 'Skåne',
      'uppsala': 'Uppsala',
      'västerås': 'Västmanland',
      'örebro': 'Örebro',
      'linköping': 'Östergötland',
      'helsingborg': 'Skåne',
      'kalmar': 'Kalmar',
      'mörbylånga': 'Kalmar'
    };

    return regionMap[city] || 'Sverige';
  }

  extractCapacity(venue) {
    if (venue.capacityFromListing) {
      const match = venue.capacityFromListing.match(/\d+/);
      return match ? parseInt(match[0]) : null;
    }

    if (venue.capacity?.length > 0) {
      const match = venue.capacity[0].match(/\d+/);
      return match ? parseInt(match[0]) : null;
    }

    return null;
  }

  extractPrice(venue) {
    if (venue.prices?.length > 0) {
      const match = venue.prices[0].match(/\d+(?:\s?\d{3})*/);
      return match ? parseInt(match[0].replace(/\s/g, '')) : null;
    }
    return null;
  }

  extractCoordinates(venue) {
    if (venue.coordinates) {
      const [lat, lng] = venue.coordinates.split(',');
      return { lat: lat.trim(), lng: lng.trim() };
    }
    if (venue.latitude && venue.longitude) {
      return { lat: venue.latitude, lng: venue.longitude };
    }
    return null;
  }

  extractNotes(venue) {
    const notes = [];
    if (venue.categories) notes.push(venue.categories);
    if (venue.capacityFromListing) notes.push(`Kapacitet: ${venue.capacityFromListing}`);
    if (venue.prices?.length > 0) notes.push(`Priser: ${venue.prices[0]}`);
    return notes.join(' | ') || `Bröllopslokal i ${this.extractCity(venue)}`;
  }

  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Save main results
    const resultsFile = path.join(this.outputDir, `venues-${timestamp}.json`);
    await fs.writeFile(resultsFile, JSON.stringify(this.venues, null, 2));
    console.log(`💾 Saved ${this.venues.length} venues to ${resultsFile}`);

    // Save errors
    if (this.errors.length > 0) {
      const errorsFile = path.join(this.outputDir, `errors-${timestamp}.json`);
      await fs.writeFile(errorsFile, JSON.stringify(this.errors, null, 2));
      console.log(`⚠️  Saved ${this.errors.length} errors to ${errorsFile}`);
    }

    // Generate summary
    const summary = {
      totalVenues: this.venues.length,
      successful: this.venues.filter(v => !v.error).length,
      errors: this.errors.length,
      withImages: this.venues.filter(v => v.localImages?.length > 0).length,
      withContact: this.venues.filter(v => v.contacts?.email || v.contacts?.phone).length,
      withCapacity: this.venues.filter(v => v.capacity?.length > 0).length,
      cities: [...new Set(this.venues.filter(v => !v.error).map(v => this.extractCity(v)))],
      totalImages: this.venues.reduce((sum, v) => sum + (v.localImages?.length || 0), 0),
      scrapedAt: new Date().toISOString(),
      startIndex: this.options.startIndex
    };

    const summaryFile = path.join(this.outputDir, `summary-${timestamp}.json`);
    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));
    console.log('\n📊 SCRAPING SUMMARY:', summary);
  }

  async run() {
    try {
      console.log('🎯 Starting Optimized Swedish Venue Scraper...');
      console.log('Target: 363 venues from bröllopslokaler.nu');
      if (this.options.startIndex > 0) {
        console.log(`⏩ Resuming from listing index ${this.options.startIndex}`);
      }

      await this.init();

      // Step 1: Get all venue listings with rich data
      const venueListings = await this.scrapeVenueListingsOptimized();
      console.log(`📋 Phase 1 complete: ${venueListings.length} venues extracted from listings`);

      if (this.options.startIndex >= venueListings.length) {
        console.log(`ℹ️  Start index ${this.options.startIndex} is beyond available listings (${venueListings.length}). Nothing to process.`);
        return;
      }

      // Step 2: Scrape detailed information for each venue
      console.log('🏰 Phase 2: Scraping detailed venue information...');

      const listingsToProcess = venueListings.slice(this.options.startIndex);
      const totalToProcess = listingsToProcess.length;

      let processed = 0;
      for (const [offset, venue] of listingsToProcess.entries()) {
        const detailedVenue = await this.scrapeVenueDetailsOptimized(venue);
        this.venues.push(detailedVenue);

        processed++;
        const progress = ((processed / totalToProcess) * 100).toFixed(1);
        const absoluteIndex = this.options.startIndex + offset + 1;
        console.log(`✅ Progress: ${absoluteIndex}/${venueListings.length} (${progress}%) - ${venue.name || 'Unknown'}`);

        // Rate limiting and progress saving
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s delay

        if (processed % 25 === 0) {
          await this.saveResults();
          console.log('💾 Progress checkpoint saved!');
        }
      }

      // Step 3: Generate MDX files
      console.log('📝 Phase 3: Generating MDX files...');
      await this.generateVenuesMDX();

      // Step 4: Final save
      await this.saveResults();

      console.log('\n🎉 SCRAPING COMPLETED SUCCESSFULLY!');
      console.log(`✅ ${this.venues.length} venues processed`);
      console.log(`📸 ${this.venues.reduce((sum, v) => sum + (v.localImages?.length || 0), 0)} images downloaded`);
      console.log(`📝 MDX files generated in ${this.outputDir}/mdx-files/`);

    } catch (error) {
      console.error('❌ SCRAPING FAILED:', error);
      await this.saveResults(); // Save whatever we have
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
      if (this.originalHome !== undefined) {
        process.env.HOME = this.originalHome;
      }
    }
  }
}

// Run the scraper
if (require.main === module) {
  const cliOptions = parseCliOptions(process.argv.slice(2));
  const scraper = new OptimizedVenueScraper(cliOptions);
  scraper.run().catch(console.error);
}

module.exports = OptimizedVenueScraper;

function parseCliOptions(argv) {
  const options = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (!arg.startsWith('--')) continue;

    let key;
    let value;

    const eqIndex = arg.indexOf('=');
    if (eqIndex !== -1) {
      key = arg.slice(2, eqIndex);
      value = arg.slice(eqIndex + 1);
    } else {
      key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        value = next;
        i++;
      } else {
        value = 'true';
      }
    }

    key = key.replace(/-([a-z])/g, (_, chr) => chr.toUpperCase());
    options[key] = value;
  }

  return options;
}
