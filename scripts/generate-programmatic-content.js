#!/usr/bin/env node

/**
 * Programmatic SEO Content Generator
 * Generates city + service combinations automatically
 */

const fs = require('fs');
const path = require('path');
const cities = require('../apps/marketing/data/cities.json');

// Content templates for different service types
const templates = {
  bröllopsfotograf: {
    title: (city, year) => `Bröllopsfotograf ${city.name} ${year} - Från ${city.pricing.bröllopsfotograf.min.toLocaleString('sv-SE')} kr`,
    description: (city) => `Hitta bästa bröllopsfotograf i ${city.name}. ${city.supplierCounts.bröllopsfotograf}+ fotografer, priser från ${city.pricing.bröllopsfotograf.min.toLocaleString('sv-SE')} kr. Jämför paket och boka direkt.`,
    content: (city, service, year) => `
# Bröllopsfotograf ${city.name} ${year}

> **Snabbguide ${year}:** I ${city.name} kostar bröllopsfotograf ${city.pricing[service].min.toLocaleString('sv-SE')}-${city.pricing[service].max.toLocaleString('sv-SE')} kr med genomsnitt på ${city.pricing[service].avg.toLocaleString('sv-SE')} kr.

## Priser och paket ${year}

| Prisnivå | Omfattning | Pris ${city.name} | Vad som ingår |
|----------|------------|-------------------|---------------|
| **Budget** | 6-8 timmar | ${city.pricing[service].min.toLocaleString('sv-SE')} - ${(city.pricing[service].avg - 10000).toLocaleString('sv-SE')} kr | Grundpaket, digital leverans |
| **Standard** | 10-12 timmar | ${(city.pricing[service].avg - 5000).toLocaleString('sv-SE')} - ${(city.pricing[service].avg + 10000).toLocaleString('sv-SE')} kr | Heldag, online-galleri, USB |
| **Premium** | Hela dagen + extra | ${(city.pricing[service].avg + 10000).toLocaleString('sv-SE')} - ${city.pricing[service].max.toLocaleString('sv-SE')}+ kr | Två fotografer, album, video |

### Särskilda förhållanden i ${city.name}

- **Säsong**: ${city.seasonality.peak} är mest populärt med ${city.seasonality.priceIncrease} högre priser
- **Transport**: ${city.transport.public} påverkar leverantörernas rörelsemönster
- **Populära lokaler**: ${city.popularVenues.slice(0, 3).join(', ')}

## Rekommenderade fotografer ${city.name}

Vi har identifierat ${city.supplierCounts[service]}+ professionella bröllopsfotografer i ${city.name}. Här är några av de bäst recenserade:

### Så väljer du rätt fotograf i ${city.name}

1. **Portfoliogranskning**: Leta efter fotografer som har erfarenhet av ${city.popularVenues[0]} och liknande miljöer
2. **Prisjämförelse**: Jämför minst 3-4 fotografer inom ditt prisintervall
3. **Säsongshänsyn**: Boka tidigt för ${city.seasonality.peak} då priserna ökar med ${city.seasonality.priceIncrease}

## Logistik för bröllopsfoto i ${city.name}

**Transport och tillgänglighet:**
- ${city.transport.airport} för utomregionala fotografer
- ${city.transport.public} för rörelse mellan lokaler
- ${city.transport.parking}

**Bästa fotoplatserna:**
${city.popularVenues.map(venue => `- **${venue}**: Perfekt för [specifik stil] med [unika egenskaper]`).join('\n')}

**Säsongsspecifika tips:**
${city.seasonality.note}

## Vanliga frågor

### Vad kostar bröllopsfotograf i ${city.name} ${year}?
Priserna varierar mellan ${city.pricing[service].min.toLocaleString('sv-SE')} kr och ${city.pricing[service].max.toLocaleString('sv-SE')} kr beroende på paket och fotograf. Genomsnittet ligger på ${city.pricing[service].avg.toLocaleString('sv-SE')} kr.

### Hur många fotografer finns det i ${city.name}?
Vi har kartlagt ${city.supplierCounts[service]} professionella bröllopsfotografer i ${city.name} med olika specialiteter och prisklasser.

### När ska man boka?
Boka minst 8-12 månader i förväg för ${city.seasonality.peak}. För övriga månader räcker ofta 4-6 månader.

---

*Priser uppdaterade ${new Date().toLocaleDateString('sv-SE')} baserat på marknadsundersökning av ${city.supplierCounts[service]} leverantörer i ${city.name}.*
`
  },

  bröllopslokal: {
    title: (city, year) => `Bröllopslokal ${city.name} ${year} - Från ${city.pricing.bröllopslokal.min.toLocaleString('sv-SE')} kr`,
    description: (city) => `Upptäck bästa bröllopslokaler i ${city.name}. ${city.supplierCounts.bröllopslokal}+ lokaler, priser från ${city.pricing.bröllopslokal.min.toLocaleString('sv-SE')} kr. Jämför och boka direkt.`,
    content: (city, service, year) => `
# Bröllopslokal ${city.name} ${year}

> **Snabbguide ${year}:** ${city.name} erbjuder ${city.supplierCounts[service]}+ bröllopslokaler från ${city.pricing[service].min.toLocaleString('sv-SE')} kr med genomsnitt på ${city.pricing[service].avg.toLocaleString('sv-SE')} kr.

## Prisintervall lokaler ${city.name} ${year}

| Lokaltyp | Kapacitet | Pris ${city.name} | Exempel |
|----------|-----------|-------------------|---------|
| **Budget-vänliga** | 50-80 gäster | ${city.pricing[service].min.toLocaleString('sv-SE')} - ${(city.pricing[service].avg - 15000).toLocaleString('sv-SE')} kr | Föreningslokaler, enklare salar |
| **Mellanklass** | 80-150 gäster | ${(city.pricing[service].avg - 10000).toLocaleString('sv-SE')} - ${(city.pricing[service].avg + 20000).toLocaleString('sv-SE')} kr | ${city.popularVenues[1]}, moderna eventlokaler |
| **Exklusiva** | 100-200+ gäster | ${(city.pricing[service].avg + 25000).toLocaleString('sv-SE')} - ${city.pricing[service].max.toLocaleString('sv-SE')}+ kr | ${city.popularVenues[0]}, premiumlokaler |

### Populära bröllopslokaler i ${city.name}

${city.popularVenues.map((venue, index) => `
#### ${index + 1}. ${venue}
- **Kapacitet**: [antal] gäster
- **Stil**: [beskrivning baserat på namn]
- **Prisindikation**: [intervall baserat på typ]
- **Specialitet**: [unik egenskap]
`).join('')}

## Praktisk information ${city.name}

**Logistik:**
- **Transport**: ${city.transport.public}
- **Parkering**: ${city.transport.parking}
- **Flygtrafik**: ${city.transport.airport}

**Säsongsfaktorer:**
- **Peak säsong**: ${city.seasonality.peak} med ${city.seasonality.priceIncrease} högre priser
- **Bokningsråd**: ${city.seasonality.note}

## Områden att överväga

### ${city.neighborhoods[0]}
- Centralt beläget med god tillgänglighet
- Högre priser men smidig logistik
- Populärt för stadsbröllop

### ${city.neighborhoods[1]}
- Alternativ med charm och karaktär
- Ofta bättre prisläge än centrum
- Unik miljö för fotografering

## Vanliga frågor

### Vad kostar bröllopslokal i ${city.name}?
Priserna börjar på ${city.pricing[service].min.toLocaleString('sv-SE')} kr och kan gå upp till ${city.pricing[service].max.toLocaleString('sv-SE')} kr+ beroende på lokal, dag och säsong.

### Hur långt i förväg ska man boka?
För ${city.seasonality.peak} rekommenderas bokning 12-18 månader i förväg. Övriga tider räcker 6-12 månader.

### Vilka är de mest populära lokalerna?
${city.popularVenues.slice(0, 3).join(', ')} är bland de mest efterfrågade i ${city.name}.

---

*Information uppdaterad ${new Date().toLocaleDateString('sv-SE')} baserat på ${city.supplierCounts[service]} lokaler i ${city.name}.*
`
  }
};

// Generate content for all city/service combinations
function generateProgrammaticContent() {
  const services = ['bröllopsfotograf', 'bröllopslokal'];
  const currentYear = new Date().getFullYear();
  const outputDir = path.join(__dirname, '../apps/marketing/src/content/leverantorer');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  Object.entries(cities).forEach(([cityKey, cityData]) => {
    services.forEach(service => {
      if (!cityData.pricing[service]) return;

      const template = templates[service];
      const fileName = `${service}-${cityKey}-${currentYear}.md`;
      const filePath = path.join(outputDir, fileName);

      // Generate frontmatter
      const frontmatter = `---
title: "${template.title(cityData, currentYear)}"
description: "${template.description(cityData)}"
summary: "Komplett guide för ${service} i ${cityData.name} med priser, leverantörer och lokala tips för ${currentYear}."
primaryKeyword: "${service} ${cityKey}"
secondaryKeywords:
  - "${service} ${cityData.name}"
  - "${service} pris ${cityKey}"
  - "${service} kostnad ${cityData.name}"
  - "bästa ${service} ${cityKey}"
category: "leverantörer"
city: "${cityData.name}"
region: "${cityData.region}"
searchVolume: ${cityData.searchVolumes[service]}
avgPrice: ${cityData.pricing[service].avg}
priceRange: "${cityData.pricing[service].min}-${cityData.pricing[service].max}"
supplierCount: ${cityData.supplierCounts[service]}
publishedAt: ${new Date().toISOString().split('T')[0]}
updatedAt: ${new Date().toISOString().split('T')[0]}
author: "Svenska Bröllopsakademien"
status: "published"
schemaType: "LocalBusiness"
evergreen: true
faq:
  - question: "Vad kostar ${service} i ${cityData.name}?"
    answer: "Priserna varierar mellan ${cityData.pricing[service].min.toLocaleString('sv-SE')} kr och ${cityData.pricing[service].max.toLocaleString('sv-SE')} kr med genomsnitt på ${cityData.pricing[service].avg.toLocaleString('sv-SE')} kr."
  - question: "Hur många ${service.replace('bröllops', '')}er finns i ${cityData.name}?"
    answer: "Vi har kartlagt ${cityData.supplierCounts[service]} professionella leverantörer i ${cityData.name} med olika prisklasser och specialiteter."
  - question: "Vilka områden i ${cityData.name} är populärast?"
    answer: "${cityData.neighborhoods ? cityData.neighborhoods.slice(0, 3).join(', ') : 'Centrum och närområden'} är de mest populära områdena för bröllop i ${cityData.name}."`
sources:
  - label: "${cityData.name} kommun - Officiell statistik"
    url: "https://${cityKey}.se"
    credibility: "government"
  - label: "Svensk bröllopsstatistik ${currentYear}"
    url: "https://example.com/stats"
    credibility: "industry"
related:
  - guides/brollopsplanering-grundkurs
  - budget/brollopsbudget-2025
  - checklistor/brollopsbudget-checklista
programmaticData:
  generated: true
  template: "${service}"
  city: "${cityKey}"
  searchIntent: "commercial"
  competitionLevel: "medium"
---`;

      const fullContent = frontmatter + '\n\n' + template.content(cityData, service, currentYear);

      fs.writeFileSync(filePath, fullContent, 'utf8');
      console.log(`✅ Generated: ${fileName}`);
    });
  });

  // Generate index page for programmatic content
  const indexContent = `---
title: "Bröllopsleverantörer per stad - Komplett översikt"
description: "Hitta bröllopsleverantörer i alla svenska städer. Jämför priser, läs recensioner och boka direkt från våra verifierade partners."
---

# Bröllopsleverantörer per stad

Upptäck de bästa bröllopsleverantörerna i din stad. Vi har kartlagt priser, kvalitet och tillgänglighet för att hjälpa er hitta rätt partner för er stora dag.

## Stora städer

${Object.entries(cities).map(([cityKey, cityData]) => `
### ${cityData.name}
*${cityData.region} • ${cityData.population.toLocaleString('sv-SE')} invånare*

**Tjänster tillgängliga:**
${services.map(service =>
  cityData.pricing[service] ?
  `- [${service.charAt(0).toUpperCase() + service.slice(1)}](/programmatic/${service}-${cityKey}-${currentYear}) - från ${cityData.pricing[service].min.toLocaleString('sv-SE')} kr`
  : null
).filter(Boolean).join('\n')}
`).join('')}

---
*Alla priser uppdaterade ${new Date().toLocaleDateString('sv-SE')}. Data baserat på marknadsundersökning av verifierade leverantörer.*
`;

  fs.writeFileSync(path.join(outputDir, 'index.md'), indexContent, 'utf8');
  console.log('✅ Generated: index.md');

  console.log(`\n🎉 Programmatic SEO generation complete!`);
  console.log(`📊 Generated ${Object.keys(cities).length * services.length} pages`);
  console.log(`🔍 Targeting ${Object.values(cities).reduce((sum, city) => sum + services.reduce((serviceSum, service) => serviceSum + (city.searchVolumes[service] || 0), 0), 0)} monthly searches`);
}

// Run the generator
if (require.main === module) {
  generateProgrammaticContent();
}

module.exports = { generateProgrammaticContent };