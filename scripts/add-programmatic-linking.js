#!/usr/bin/env node

/**
 * Programmatic Internal Linking System
 * Automatically updates the interlinks.json file with programmatic content relationships
 */

const fs = require('fs');
const path = require('path');
const cities = require('../apps/marketing/data/cities.json');

// Load existing interlinks
const interlinksPath = path.join(__dirname, '../apps/marketing/src/content/shared/interlinks.json');
const existingInterlinks = JSON.parse(fs.readFileSync(interlinksPath, 'utf8'));

// Generate programmatic links
function generateProgrammaticLinks() {
  const services = ['bröllopsfotograf', 'bröllopslokal'];
  const currentYear = new Date().getFullYear();
  const newLinks = { ...existingInterlinks };

  // Add programmatic pages to existing content
  Object.entries(cities).forEach(([cityKey, cityData]) => {
    services.forEach(service => {
      if (!cityData.pricing[service]) return;

      const programmaticSlug = `leverantorer/${service}/${cityKey}`;

      // Add to relevant existing pages
      if (newLinks['guides/brollopsplanering-grundkurs']) {
        if (!newLinks['guides/brollopsplanering-grundkurs'].includes(programmaticSlug)) {
          newLinks['guides/brollopsplanering-grundkurs'].push(programmaticSlug);
        }
      }

      if (newLinks['budget/brollopsbudget-2025']) {
        if (!newLinks['budget/brollopsbudget-2025'].includes(programmaticSlug)) {
          newLinks['budget/brollopsbudget-2025'].push(programmaticSlug);
        }
      }

      // Create links for the programmatic page itself
      newLinks[programmaticSlug] = [
        'guides/brollopsplanering-grundkurs',
        'budget/brollopsbudget-2025',
        'checklistor/brollopsbudget-checklista'
      ];

      // Add related city pages
      Object.entries(cities).forEach(([otherCityKey, otherCityData]) => {
        if (otherCityKey !== cityKey && otherCityData.pricing[service]) {
          const relatedSlug = `leverantorer/${service}/${otherCityKey}`;
          if (!newLinks[programmaticSlug].includes(relatedSlug)) {
            newLinks[programmaticSlug].push(relatedSlug);
          }
        }
      });

      // Add related service pages in same city
      services.forEach(otherService => {
        if (otherService !== service && cityData.pricing[otherService]) {
          const relatedServiceSlug = `leverantorer/${otherService}/${cityKey}`;
          if (!newLinks[programmaticSlug].includes(relatedServiceSlug)) {
            newLinks[programmaticSlug].push(relatedServiceSlug);
          }
        }
      });

      // Add relevant existing content based on service type
      if (service === 'bröllopsfotograf') {
        newLinks[programmaticSlug].push('checklistor/fragor-till-brollopsfotograf');
      }

      if (service === 'bröllopslokal') {
        newLinks[programmaticSlug].push('guides/detaljer-alla-brollopsplanerare-missar');
      }
    });
  });

  // Update existing location-based content to link to programmatic pages
  const locationPages = [
    'leverantorer/brollopsfotograf-stockholm',
    'leverantorer/brollopsfotograf-goteborg',
    'leverantorer/brollopsfotograf-malmo',
    'leverantorer/brollopsfotograf-uppsala',
    'leverantorer/brollopsfotograf-gotland',
    'leverantorer/brollopslokal-stockholm',
    'leverantorer/brollopslokal-goteborg',
    'leverantorer/brollopslokal-skargarden'
  ];

  locationPages.forEach(page => {
    if (newLinks[page]) {
      // Extract city and service from page slug
      const parts = page.split('-');
      const service = parts[1] === 'brollopsfotograf' ? 'bröllopsfotograf' : 'bröllopslokal';

      // Map city names
      const cityMap = {
        'stockholm': 'stockholm',
        'goteborg': 'göteborg',
        'malmo': 'malmö',
        'uppsala': 'uppsala',
        'gotland': 'stockholm' // Fallback to Stockholm for Gotland
      };

      const cityFromPage = parts[2] || parts[1].replace('brollopsfotograf', '').replace('brollopslokal', '');
      const cityKey = cityMap[cityFromPage] || 'stockholm';

      if (cities[cityKey] && cities[cityKey].pricing[service]) {
        const programmaticLink = `leverantorer/${service}/${cityKey}`;
        if (!newLinks[page].includes(programmaticLink)) {
          newLinks[page].push(programmaticLink);
        }
      }
    }
  });

  return newLinks;
}

// Run the linking update
function updateProgrammaticLinking() {
  try {
    const updatedLinks = generateProgrammaticLinks();

    fs.writeFileSync(interlinksPath, JSON.stringify(updatedLinks, null, 2), 'utf8');

    console.log('✅ Updated interlinks.json with programmatic content');

    // Count new programmatic links
    const programmaticCount = Object.keys(updatedLinks).filter(key =>
      key.startsWith('leverantorer/') && key.split('/').length === 3
    ).length;

    console.log(`📊 Added ${programmaticCount} programmatic pages to internal linking system`);

    // Count total relationships
    const totalRelationships = Object.values(updatedLinks).reduce((sum, links) =>
      sum + links.length, 0
    );

    console.log(`🔗 Total internal links: ${totalRelationships}`);

  } catch (error) {
    console.error('❌ Error updating programmatic linking:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  updateProgrammaticLinking();
}

module.exports = { updateProgrammaticLinking, generateProgrammaticLinks };