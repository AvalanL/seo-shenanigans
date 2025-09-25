# Programmatisk SEO-strategi: Bröllopssidan.se

## Analys av möjligheter

### Nuvarande struktur
- ✅ Dynamic routing redan implementerat (`[category]/[slug]`)
- ✅ Content collections strukturerade
- ✅ 69+ artiklar som bas för interlänkning
- ✅ Keywords.csv med volymdata

### Identifierade gaps för automation

## 1. GEOGRAFISK EXPANSION (Högsta prioritet)

### Pattern: Leverantörer × Städer
**Volym**: 50-4400 sökningar/månad per kombination

```javascript
const cities = [
  'stockholm', 'göteborg', 'malmö', 'uppsala', 'västerås',
  'örebro', 'linköping', 'helsingborg', 'jönköping', 'norrköping',
  'lund', 'umeå', 'växjö', 'kalmar', 'karlstad', 'sundsvall',
  'eskilstuna', 'halmstad', 'borås', 'kristianstad'
];

const services = [
  'bröllopsfotograf', 'bröllopscatering', 'bröllopslokal',
  'bröllopsflorist', 'DJ', 'bröllopskoordinator'
];
```

**Automatisera**: 20 städer × 6 tjänster = **120 sidor**
**Potentiell trafik**: ~180 000 sökningar/år

### Template: Tjänst + Stad
```astro
---
// src/pages/leverantorer/[service]/[city].astro
export async function getStaticPaths() {
  const combinations = cities.flatMap(city =>
    services.map(service => ({
      params: { service, city },
      props: { service, city }
    }))
  );
  return combinations;
}
---
```

## 2. PRISFOKUSERADE SÖKNINGAR

### Pattern: "[Tjänst] pris [år]"
**Volym**: 500-2000 sökningar/månad

**Automatisera**:
- `bröllopsfotograf-pris-2025.md`
- `bröllopslokal-kostnad-stockholm.md`
- `bröllopscatering-priser-göteborg.md`

**Data-driven innehåll**:
```yaml
# data/pricing/fotografer-2025.yaml
stockholm:
  low: 25000
  average: 45000
  high: 85000
  suppliers_count: 47
göteborg:
  low: 22000
  average: 38000
  high: 75000
  suppliers_count: 31
```

## 3. SÄSONGS- OCH MÅNADSBASERADE SÖKNINGAR

### Pattern: "[Säsong/månad]bröllop [region]"
**Volym**: 200-1500 sökningar/månad

**Automatisera**:
```
vinterbröllop-stockholm.md (dec-feb specifikt)
sommarbröllop-skärgården.md (jun-aug specifikt)
vårbröllop-göteborg.md (mar-maj specifikt)
```

## 4. JÄMFÖRELSER OCH LISTOR

### Pattern: "Bästa [tjänst] [stad]"
**Volym**: 300-1200 sökningar/månad

**Automatisera**:
- `bästa-bröllopsfotografer-stockholm.md`
- `topp-10-bröllopslokaler-göteborg.md`
- `billigaste-cateringen-malmö.md`

## 5. IMPLEMENTATIONSPLAN

### Fas 1: Geografisk expansion (Vecka 1-2)
1. **Skapa dynamiska rutter** för tjänst+stad
2. **Bygga datatsets** för varje stad (leverantörer, priser, lokaler)
3. **Template-system** som genererar unika artiklar
4. **Intern länkning** mellan relaterade geografier

### Fas 2: Prisautomation (Vecka 3)
1. **Prisdatabas** för alla tjänster per region
2. **Automatiska prisuppdateringar** från källor
3. **Jämförelsetabeller** genererade programmatiskt
4. **ROI-kalkylatorer** för olika budgetar

### Fas 3: Säsongsinnehåll (Vecka 4)
1. **Månadstemplates** med säsongsspecifik data
2. **Väderpåverkan** och logistiska överväganden
3. **Säsongsrabatter** från leverantörer
4. **Automatisk publikation** baserat på datum

## 6. TEKNISK ARKITEKTUR

### Data-driven innehåll
```astro
---
// Automatisk generering av stad-specifika sidor
const cityData = await import(`../data/cities/${city}.json`);
const serviceProviders = await getServiceProviders(service, city);
const averagePricing = calculateAveragePrice(serviceProviders);
---

<h1>{service} {city} - från {averagePricing.min} kr</h1>
<p>Vi har kartlagt {serviceProviders.length} leverantörer...</p>
```

### SEO-automation
```javascript
// Automatisk meta-generering
const generateSEOData = (service, city, year) => ({
  title: `${service} ${city} ${year} - Priser & Rekommendationer`,
  description: `Hitta bästa ${service} i ${city}. Jämför priser från ${year}, läs recensioner och boka direkt. ${providerCount}+ verifierade leverantörer.`,
  keywords: [service, city, `${service} ${city}`, `${service} pris`, year]
});
```

## 7. KVALITETSICHERHET

### Unique content per sida
- **Lokal data**: Specifik statistik för varje stad
- **Leverantörsdata**: Riktiga företag och priser
- **Kulturella nyanser**: Regionala traditioner och preferenser
- **Logistik**: Stad-specifika transport och logistikråd

### E-A-T stärkande
- **Lokala experter**: Intervjuer med leverantörer per stad
- **Användarrecensioner**: Riktiga recensioner från par
- **Branschcitat**: Auktoritativa källor per region
- **Uppdateringsfrekvens**: Kvartalsvisa prisuppdateringar

## 8. AUTOMATISERING OCH UNDERHÅLL

### Content pipeline
```mermaid
Data sources → Template engine → Content generation → SEO optimization → Publishing → Monitoring
```

### Automationsverktyg
1. **Airtable/Notion**: Leverantörsdatabas
2. **GitHub Actions**: Schemalagd innehållsuppdatering
3. **Webhooks**: Automatisk rebuild vid dataändringar
4. **Analytics API**: Performance-tracking per stad

## 9. FÖRVÄNTADE RESULTAT

### Trafikökningar (6 månader)
- **120 nya geografiska sidor**: +300% organisk trafik
- **Long-tail ranking**: Position 1-5 för 80% av target keywords
- **Interlinking boost**: Förbättrad domain authority
- **Konvertering**: Fler leads till lokala leverantörer

### ROI-projektion
- **Investering**: 40-60 timmar utveckling
- **Resultat**: 50 000+ nya besökare/månad
- **Värde**: €200 000+ i organisk trafik

## 10. NÄSTA STEG

### Omedelbart (denna vecka)
1. **Validera dataset**: Kontrollera leverantörsdata för top 5 städer
2. **Bygg prototype**: En stad × en tjänst som proof of concept
3. **SEO-audit**: Säkerställ att automation inte skapar duplicate content

### Kort sikt (månad 1)
1. **Full implementation**: Alla 20 städer × 6 tjänster
2. **Performance tracking**: Google Search Console monitoring
3. **Content optimization**: A/B-test olika templates

### Lång sikt (månad 3-6)
1. **Expansion**: Fler städer och nischade tjänster
2. **AI integration**: ChatGPT/Claude API för content enhancement
3. **Personalisering**: Location-based content serving

---

**Sammanfattning**: Programmatisk SEO kan öka trafiken med 300-500% genom att systematiskt täcka geografiska och prisfokuserade long-tail keywords som redan har sökvolym men låg konkurrens.