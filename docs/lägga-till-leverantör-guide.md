# Guide: Lägga till ny leverantör

Denna guide beskriver processen för att lägga till nya leverantörer till wedding directory, inklusive automatisk Instagram-integration.

## Steg 1: Skapa leverantörsfil

Skapa en ny `.mdx`-fil i lämplig kategori under `apps/marketing/src/content/suppliers/[kategori]/`.

### Frontmatter-mall

```yaml
---
title: "Leverantörens namn"
description: "Kort beskrivning för SEO (max 160 tecken)"
summary: "Längre beskrivning av leverantören och deras tjänster"
category: "fotograf|florist|musik|koordinator|catering|skyltar|har-och-smink"
city: "Huvudsaklig stad"
serviceArea: "Geografiskt serviceområde"
startPrice: 15000
packages: "Kort beskrivning av paket/tjänster"
website: "https://leverantor.se"
instagram: "https://instagram.com/leverantor"
email: "kontakt@leverantor.se"
phone: "+4612345678"
image: "/assets/directories/suppliers/placeholder-supplier.svg"
latitude: "59.3326"
longitude: "18.0649"
notes: "Interna anteckningar om leverantören"
related:
  - "guides/relaterad-guide"
  - "leverantorer/relaterad-kategori"
status: "draft|in-review|published"
schemaType: "Organization"
---
```

### Innehållsstruktur

```markdown
## Tjänster

Lista över tjänster som leverantören erbjuder.

## Stil och process

Beskrivning av leverantörens stil och arbetsprocess.

## Logistik

Information om priser, leverans, geografisk räckvidd etc.

## Kontakt

Kontaktinformation (genereras automatiskt från frontmatter).

## Tips från oss

Redaktionella tips och rekommendationer.
```

## Steg 2: Automatisk Instagram-bearbetning

När du sparar filen med en Instagram-länk, kör automatisk bearbetning:

### För ny leverantör
```bash
node add-supplier-hook.js apps/marketing/src/content/suppliers/[kategori]/[filnamn].mdx
```

### För alla leverantörer (batch)
```bash
node instagram-gallery-scraper.js
```

### Vad händer automatiskt

1. **Profilbild hämtas** från Instagram och sparas som:
   - `/apps/marketing/public/assets/directories/suppliers/[saniterat-namn].jpg`
   - `image`-fältet uppdateras automatiskt

2. **Galleri-bilder hämtas** (upp till 6 st) och sparas som:
   - `/apps/marketing/public/assets/directories/suppliers/gallery/[saniterat-namn]/[namn]-1.jpg`
   - `/apps/marketing/public/assets/directories/suppliers/gallery/[saniterat-namn]/[namn]-2.jpg`
   - osv...

3. **Frontmatter uppdateras** med:
   ```yaml
   image: "/assets/directories/suppliers/leverantor-namn.jpg"
   instagramGallery:
     - "/assets/directories/suppliers/gallery/leverantor-namn/leverantor-namn-1.jpg"
     - "/assets/directories/suppliers/gallery/leverantor-namn/leverantor-namn-2.jpg"
     - "/assets/directories/suppliers/gallery/leverantor-namn/leverantor-namn-3.jpg"
   ```

## Steg 3: Manuell kvalitetskontroll

### Kontrollera resultat

1. **Verifiera profilbild** - Kontrollera att rätt bild hämtades
2. **Granska galleri** - Se till att bilderna är relevanta och av bra kvalitet
3. **Testa sidan** - Besök leverantörssidan och kontrollera att allt visas korrekt

### Vid problem

Om automatisk hämtning misslyckas:

1. **Privat Instagram-konto** - Hämta bilder manuellt
2. **Fel användarnamn** - Kontrollera Instagram-URL:en
3. **Inga bilder** - Konto kanske inte har några inlägg

### Manuell bildhantering

Om automatik inte fungerar, lägg bilder manuellt:

```bash
# Skapa mapp för leverantör
mkdir -p apps/marketing/public/assets/directories/suppliers/gallery/leverantor-namn

# Kopiera bilder
cp profilbild.jpg apps/marketing/public/assets/directories/suppliers/leverantor-namn.jpg
cp bild1.jpg apps/marketing/public/assets/directories/suppliers/gallery/leverantor-namn/leverantor-namn-1.jpg
```

Uppdatera sedan frontmatter manuellt.

## Steg 4: Publicering

1. Ändra `status: "draft"` till `status: "published"`
2. Lägg till i git: `git add .`
3. Commit: `git commit -m "Add new supplier: [Leverantörens namn]"`

## Kategorier

Giltiga kategorier för `category`-fältet:

- `fotograf` - Bröllopsfotografer
- `florist` - Florister och blomsterdekoratörer
- `musik` - DJ:s, band, musiker
- `koordinator` - Bröllopskoordinatorer och planerare
- `catering` - Catering och mat
- `skyltar` - Skyltar och dekorationer
- `har-och-smink` - Hår och smink

## Relaterade filer

När du lägger till en leverantör, överväg att också:

1. **Uppdatera guide-artiklar** med referenser till den nya leverantören
2. **Lägg till i interlinks.json** för intern länkstruktur
3. **Skapa kategori-specifik artikel** om kategorin saknar guide

## Tekniska detaljer

### Filstruktur
```
apps/marketing/src/content/suppliers/
├── fotograf/
│   ├── leverantor-1.mdx
│   └── leverantor-2.mdx
├── florist/
│   └── leverantor-3.mdx
└── musik/
    └── leverantor-4.mdx

apps/marketing/public/assets/directories/suppliers/
├── leverantor-1.jpg
├── leverantor-2.jpg
└── gallery/
    ├── leverantor-1/
    │   ├── leverantor-1-1.jpg
    │   └── leverantor-1-2.jpg
    └── leverantor-2/
        ├── leverantor-2-1.jpg
        └── leverantor-2-2.jpg
```

### Scripts

- `instagram-scraper.js` - Grundläggande profilbild-hämtare
- `instagram-gallery-scraper.js` - Avancerad galleri-hämtare
- `add-supplier-hook.js` - Hook för nya leverantörer

### Komponenter

- `InstagramGallery.astro` - Visar Instagram-galleriet på leverantörssidor
- `DirectoryCard.astro` - Leverantörskort i listor

## Felsökning

### Vanliga problem

1. **"page.waitForTimeout is not a function"**
   - Puppeteer-versionsproblem, kör `npm update puppeteer`

2. **"Kunde inte hitta profilbild"**
   - Instagram kanske har ändrat struktur, kontrollera selektorer i script

3. **Timeout-fel**
   - Instagram kan vara långsamt eller blockera, försök igen senare

4. **Bilderna visas inte**
   - Kontrollera att `instagramGallery` finns i frontmatter
   - Verifiera att bildfilerna existerar i assets-mappen

### Debug-läge

För debugging, kör script med extra logging:
```bash
DEBUG=true node instagram-gallery-scraper.js new path/to/file.mdx
```

## Säkerhet och prestanda

- Scripts använder rate limiting (3-5 sekunder mellan requests)
- User agent sätts för att undvika bot-detection
- Bilder komprimeras automatiskt som JPEG
- Max 6 galleri-bilder per leverantör för att undvika överbelastning

## Backup och återställning

Innan bulk-uppdateringar, säkerhetskopiera:
```bash
cp -r apps/marketing/src/content/suppliers suppliers-backup
cp -r apps/marketing/public/assets/directories/suppliers assets-backup
```