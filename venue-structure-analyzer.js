const puppeteer = require('puppeteer');
const fs = require('fs').promises;

class VenueStructureAnalyzer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'https://xn--brllopslokaler-wpb.nu';
    this.listingUrl = 'https://xn--brllopslokaler-wpb.nu/fina-brollopslokaler/?search_region=0&search_categories%5B%5D=&submit=';
    this.sampleVenueUrl = 'https://xn--brllopslokaler-wpb.nu/brollop-och-festlokaler/allegarden-kastlosa/';
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: false, // Keep visible for debugging
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  }

  async analyzeListingPage() {
    console.log('🔍 Analyzing listing page structure...');

    await this.page.goto(this.listingUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait a bit for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Save screenshot
    await this.page.screenshot({ path: './listing-page-analysis.png', fullPage: true });

    // Save HTML
    const html = await this.page.content();
    await fs.writeFile('./listing-page.html', html);

    // Analyze structure
    const analysis = await this.page.evaluate(() => {
      const result = {
        title: document.title,
        totalText: document.body.textContent.includes('568 Results') || document.body.textContent.match(/(\d+)\s*Results?/i),
        venueCards: [],
        possibleSelectors: {
          cards: [],
          titles: [],
          links: [],
          images: [],
          locations: [],
          capacities: []
        }
      };

      // Find all possible venue card containers
      const potentialCardElements = [
        ...document.querySelectorAll('article'),
        ...document.querySelectorAll('[class*="card"]'),
        ...document.querySelectorAll('[class*="item"]'),
        ...document.querySelectorAll('[class*="venue"]'),
        ...document.querySelectorAll('[class*="result"]'),
        ...document.querySelectorAll('a[href*="/brollop-och-festlokaler/"]')
      ];

      console.log('Found potential card elements:', potentialCardElements.length);

      // Analyze the first few venue cards
      const venueLinks = document.querySelectorAll('a[href*="/brollop-och-festlokaler/"]');
      console.log('Found venue links:', venueLinks.length);

      result.totalVenueLinks = venueLinks.length;

      // Get parent containers of venue links to understand card structure
      Array.from(venueLinks).slice(0, 5).forEach((link, index) => {
        const card = {
          index: index,
          href: link.href,
          text: link.textContent?.trim(),
          outerHTML: link.outerHTML.substring(0, 500),
          parent: link.parentElement?.outerHTML?.substring(0, 1000),
          grandParent: link.parentElement?.parentElement?.outerHTML?.substring(0, 1500)
        };

        // Look for images in the same card
        const cardContainer = link.closest('[class*="card"], article, .item, .venue-item') || link.parentElement;
        if (cardContainer) {
          const images = cardContainer.querySelectorAll('img');
          card.images = Array.from(images).map(img => ({
            src: img.src,
            alt: img.alt,
            classes: img.className
          }));

          // Look for capacity info
          const text = cardContainer.textContent;
          const capacityMatch = text.match(/(\d+)\s*(gäster|personer|platser)/i);
          if (capacityMatch) card.capacity = capacityMatch[0];

          // Look for location info
          const locationElements = cardContainer.querySelectorAll('[class*="location"], [class*="address"], [class*="region"]');
          card.locations = Array.from(locationElements).map(el => el.textContent.trim());
        }

        result.venueCards.push(card);
      });

      // Find common selectors
      const cardContainers = document.querySelectorAll('a[href*="/brollop-och-festlokaler/"]')
        .forEach(link => {
          const container = link.closest('[class]');
          if (container && container.className) {
            result.possibleSelectors.cards.push(container.className);
          }
        });

      // Look for pagination or infinite scroll indicators
      result.scrollIndicators = {
        hasLoadMoreButton: !!document.querySelector('[class*="load"], [class*="more"], button[onclick*="more"]'),
        hasPageNumbers: !!document.querySelector('.pagination, [class*="page"]'),
        bodyHeight: document.body.scrollHeight,
        viewHeight: window.innerHeight
      };

      return result;
    });

    console.log('📊 Listing page analysis:', JSON.stringify(analysis, null, 2));
    await fs.writeFile('./listing-analysis.json', JSON.stringify(analysis, null, 2));

    return analysis;
  }

  async analyzeVenuePage() {
    console.log('🏰 Analyzing individual venue page structure...');

    await this.page.goto(this.sampleVenueUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Save screenshot
    await this.page.screenshot({ path: './venue-page-analysis.png', fullPage: true });

    // Save HTML
    const html = await this.page.content();
    await fs.writeFile('./venue-page.html', html);

    // Analyze venue page structure
    const venueAnalysis = await this.page.evaluate(() => {
      const result = {
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim(),
        url: window.location.href,
        structure: {}
      };

      // Find title
      const titleSelectors = ['h1', '.title', '[class*="title"]', '.venue-name', '[class*="name"]'];
      titleSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element && !result.structure.title) {
          result.structure.title = {
            selector: selector,
            text: element.textContent?.trim(),
            outerHTML: element.outerHTML.substring(0, 200)
          };
        }
      });

      // Find address/location
      const addressSelectors = ['.address', '[class*="address"]', '.location', '[class*="location"]', '.venue-info'];
      addressSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element && !result.structure.address) {
          result.structure.address = {
            selector: selector,
            text: element.textContent?.trim(),
            outerHTML: element.outerHTML.substring(0, 300)
          };
        }
      });

      // Find images
      const images = Array.from(document.querySelectorAll('img[src]')).map(img => ({
        src: img.src,
        alt: img.alt || '',
        classes: img.className,
        parent: img.parentElement?.className || '',
        isLarge: img.width > 200 || img.height > 200
      })).filter(img =>
        !img.src.includes('data:image') &&
        !img.src.includes('logo') &&
        !img.src.includes('icon') &&
        img.isLarge
      );

      result.structure.images = {
        total: images.length,
        samples: images.slice(0, 5)
      };

      // Find description/content areas
      const contentSelectors = [
        'section', '.content', '[class*="content"]', '.description', '[class*="description"]',
        '.about', '[class*="about"]', '.info', '[class*="info"]', 'article'
      ];

      const contentAreas = [];
      contentSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 50 && text.length < 2000) {
            contentAreas.push({
              selector: selector,
              textLength: text.length,
              preview: text.substring(0, 100) + '...',
              classes: el.className
            });
          }
        });
      });

      result.structure.contentAreas = contentAreas.slice(0, 10);

      // Find contact information
      const contactElements = [
        ...document.querySelectorAll('[href*="mailto"]'),
        ...document.querySelectorAll('[href*="tel"]'),
        ...document.querySelectorAll('.phone, .email, [class*="contact"]')
      ];

      result.structure.contacts = contactElements.map(el => ({
        type: el.href?.startsWith('mailto:') ? 'email' : el.href?.startsWith('tel:') ? 'phone' : 'other',
        href: el.href || '',
        text: el.textContent?.trim(),
        classes: el.className
      }));

      // Find capacity/guest info
      const textContent = document.body.textContent;
      const capacityMatches = textContent.match(/(\d+)\s*(gäster|personer|platser)/gi) || [];
      const priceMatches = textContent.match(/(\d+(?:\s?\d{3})*)\s*(kr|kronor|SEK)/gi) || [];

      result.structure.capacity = capacityMatches.slice(0, 3);
      result.structure.prices = priceMatches.slice(0, 3);

      // Find meta tags
      const metaTags = {};
      document.querySelectorAll('meta[name], meta[property]').forEach(tag => {
        const name = tag.getAttribute('name') || tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (name && content) {
          metaTags[name] = content;
        }
      });
      result.structure.meta = metaTags;

      return result;
    });

    console.log('🏰 Venue page analysis:', JSON.stringify(venueAnalysis, null, 2));
    await fs.writeFile('./venue-analysis.json', JSON.stringify(venueAnalysis, null, 2));

    return venueAnalysis;
  }

  async testScrollBehavior() {
    console.log('📜 Testing scroll behavior on listing page...');

    await this.page.goto(this.listingUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    let initialHeight = await this.page.evaluate(() => document.body.scrollHeight);
    let venueCount = await this.page.evaluate(() =>
      document.querySelectorAll('a[href*="/brollop-och-festlokaler/"]').length
    );

    console.log(`Initial state: ${venueCount} venues, height: ${initialHeight}px`);

    // Scroll to bottom
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for potential new content
    await new Promise(resolve => setTimeout(resolve, 5000));

    let newHeight = await this.page.evaluate(() => document.body.scrollHeight);
    let newVenueCount = await this.page.evaluate(() =>
      document.querySelectorAll('a[href*="/brollop-och-festlokaler/"]').length
    );

    console.log(`After scroll: ${newVenueCount} venues, height: ${newHeight}px`);

    const scrollResult = {
      initialVenues: venueCount,
      afterScrollVenues: newVenueCount,
      initialHeight: initialHeight,
      afterScrollHeight: newHeight,
      hasInfiniteScroll: newVenueCount > venueCount || newHeight > initialHeight
    };

    await fs.writeFile('./scroll-test.json', JSON.stringify(scrollResult, null, 2));
    console.log('📜 Scroll test result:', scrollResult);

    return scrollResult;
  }

  async run() {
    try {
      console.log('🕵️ Starting venue structure analysis...');

      await this.init();

      // Analyze listing page
      const listingAnalysis = await this.analyzeListingPage();

      // Test scroll behavior
      const scrollTest = await this.testScrollBehavior();

      // Analyze venue page
      const venueAnalysis = await this.analyzeVenuePage();

      console.log('\n🎯 ANALYSIS SUMMARY:');
      console.log(`📋 Found ${listingAnalysis.totalVenueLinks} venue links on listing page`);
      console.log(`📜 Infinite scroll: ${scrollTest.hasInfiniteScroll ? 'YES' : 'NO'}`);
      console.log(`🏰 Venue page title structure: ${venueAnalysis.structure.title?.selector}`);
      console.log(`🖼️  Images per venue: ~${venueAnalysis.structure.images.total}`);
      console.log(`📝 Content areas found: ${venueAnalysis.structure.contentAreas.length}`);

      // Generate recommended selectors
      const recommendations = {
        listingPage: {
          venueLinks: 'a[href*="/brollop-och-festlokaler/"]',
          scrollMethod: scrollTest.hasInfiniteScroll ? 'infinite-scroll' : 'pagination'
        },
        venuePage: {
          title: venueAnalysis.structure.title?.selector || 'h1',
          address: venueAnalysis.structure.address?.selector || '.address, [class*="address"]',
          images: 'img[src]',
          contentAreas: 'section, .content, [class*="content"]'
        }
      };

      await fs.writeFile('./scraper-recommendations.json', JSON.stringify(recommendations, null, 2));
      console.log('\n✅ Analysis complete! Check the generated files for detailed insights.');

    } catch (error) {
      console.error('❌ Analysis failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new VenueStructureAnalyzer();
  analyzer.run().catch(console.error);
}

module.exports = VenueStructureAnalyzer;