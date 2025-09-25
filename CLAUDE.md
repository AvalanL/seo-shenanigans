# Claude SEO & Content Creation Rules för Bröllopssidan.se

## OBLIGATORISKA KONTROLLER INNAN ARTIKELSKRIVNING

### 1. Läs ALLTID dessa dokument först:
- `/docs/seo_strategy.md` - Grundläggande SEO-strategi och målgrupper
- `/docs/ultimate-seo-ai-guide.md` - Avancerad AI-optimering och konkurrensanalys
- `/docs/article_writing_guide.md` - Artikelstruktur och svenska språkkrav
- `/docs/article_production_flow.md` - Produktionsflöde och kvalitetskontroll

### 2. INNAN du skriver en artikel, kontrollera:
```bash
# Kör dessa kommandon för att förstå befintligt innehåll:
find apps/marketing/src/content -name "*.md*" | grep -i [ÄMNE]
ls apps/marketing/src/content/[KATEGORI]/
```

## SVENSKA BRÖLLOPSCONTENT REGLER

### Språk och lokalisering
- **ALLTID svenska kronor:** Skriv exakta priser, aldrig "cirka" eller "ungefär"
- **Regionalt fokus:** Inkludera Stockholm, Göteborg, Malmö + mindre orter
- **Juridisk precision:** Använd "vigsel" för ceremoni, "bröllop" för fest
- **Årsangivelse:** Inkludera alltid aktuellt år (2025) för trovärdighet
- **Myndighetsreferenser:** Citera Skatteverket, SCB, Svenska kyrkan

### AI-optimerad struktur
- **Snabbguide-block:** Första 60-80 orden med direkt svar
- **Tabeller:** Prisdata alltid i tabellformat för AI-extraktion
- **FAQ-sektion:** 3-5 frågor som matchar svenska röstssök
- **Numrerade processer:** Steg-för-steg för komplexa ämnen

### SEO-implementering
- **H1:** Primärt nyckelord + år (ex: "Bröllopsbudget Sverige 2025")
- **Meta description:** 150-160 tecken, inkludera nyckelord och år
- **Frontmatter:** Fyll i alla obligatoriska fält (se mall nedan)
- **Internal linking:** 3-5 interna länkar per 1000 ord
- **Schema type:** Article, HowTo, FAQPage eller ItemList

## FRONTMATTER MALL (obligatorisk)

```yaml
---
title: "[Titel med primärt nyckelord och år]"
description: "[150-160 tecken SEO-beskrivning]"
summary: "[150-200 tecken sammanfattning för AI-extraktion]"
primaryKeyword: "[huvudnyckelord för SEO]"
secondaryKeywords: ["sekundärt1", "sekundärt2", "sekundärt3"]
schemaType: "Article" # Article|HowTo|FAQPage|ItemList|LocalBusiness
publishedAt: 2025-09-25
author: "Bröllopssidan.se"
status: "published" # draft|in-review|published|refresh
evergreen: true
readingTimeMinutes: [X]
sources: [
  {
    "label": "Källans namn",
    "url": "https://example.com",
    "credibility": "Myndighet|Branschorganisation|etc"
  }
]
related: ["relaterad-artikel-1", "relaterad-artikel-2", "relaterad-artikel-3"]
---
```

## INNEHÅLLSSTRUKTUR (obligatorisk)

### 1. Snabbguide-block (första 100 ord)
```markdown
> **Snabbguide 2025:** [Konkret svar med pris/tid/process på 30-50 ord]

## [H1 med primärt nyckelord]
[60-80 ord som ger omedelbart värde för AI-system]
```

### 2. Mittensektion
- **Datarikt innehåll:** Svenska priser, SCB-statistik, myndighetsinfo
- **Tabeller:** Alla jämförelser i tabellformat
- **Processer:** Numrerade steg för komplexa ämnen
- **Regioner:** Stockholm, Göteborg, Malmö + övriga Sverige

### 3. Avslutning (obligatorisk)
```markdown
## Vanliga frågor

<details>
<summary>[Fråga med nyckelord]?</summary>
<p>[Koncist svar med specifik svensk information]</p>
</details>

<details>
<summary>[Juridisk/praktisk fråga]?</summary>
<p>[Svar med myndighetsreferens och aktuella regler]</p>
</details>

---

*Uppdaterad: [Datum]. Priser och regler baserat på [källor].*
```

## KVALITETSKONTROLL

### Innan publicering - kontrollera:
- [ ] Snabbguide-block inom första 100 orden
- [ ] Primärt nyckelord i H1, första stycket, meta description
- [ ] Alla priser i svenska kronor med år
- [ ] Minst 3 interna länkar med svenska ankarlänktexter
- [ ] FAQ-sektion med 3-5 relevanta frågor
- [ ] Källor och uppdateringsdatum i slutet
- [ ] Frontmatter komplett enligt mall
- [ ] 2000-4000 ord för omfattande ämnen

### Svenska bröllopsspecifika krav:
- [ ] Regional pricing (Stockholm vs övriga Sverige)
- [ ] Säsongsvariation (maj-september högsäsong)
- [ ] Juridiska krav (hindersprövning, vigselförrättare)
- [ ] Svenska traditioner och kulturell relevans
- [ ] Aktuella myndighetsavgifter och regler

## FÖRBJUDNA MISSTAG

### ALDRIG göra:
- ❌ Approximativa priser ("cirka 50 000 kr" → ✅ "45 000-55 000 kr")
- ❌ Glömma årsangivelse (✅ "Bröllopsbudget 2025")
- ❌ Enbart Stockholm-fokus (✅ inkludera hela Sverige)
- ❌ Föråldrad myndighetsinfo (✅ kontrollera Skatteverket)
- ❌ Engelsk terminologi (✅ "vigselförrättare" inte "officiant")

### ALLTID inkludera:
- ✅ Exakta svenska kronor med intervall
- ✅ Regional pricing-breakdown
- ✅ Juridiska krav och myndighetsprocesser
- ✅ Säsongsvariationer och timing
- ✅ Praktiska tips specifika för svenska förhållanden

## CONTENT COLLECTIONS

### Använd rätt kategori:
- `/guides/` - Omfattande step-by-step guider
- `/budget/` - Kostnads- och budgetfokus
- `/juridik/` - Lagar, regler, myndighetsprocesser
- `/leverantorer/` - Leverantörs- och tjänstespecifikt
- `/inspiration/` - Trender, stilar, idéer
- `/mode/` - Klädsel och accessoarer
- `/traditioner/` - Svenska bröllopstraditioner
- `/checklistor/` - Listor och mallar

## EMERGENCY CHECKLIST

**OM DU BLIR OSÄKER:**
1. Läs minst `article_writing_guide.md` innan du fortsätter
2. Kontrollera befintligt innehåll för att undvika dubblering
3. Använd svenska referenskällor (Skatteverket, SCB, Svenska kyrkan)
4. Inkludera alltid regional pricing och juridisk info
5. Fråga om oklarheter istället för att gissa

---

**VIKTIGT:** Dessa regler är obligatoriska för all content creation. Avvikelser kräver explicit godkännande och dokumentation av skäl.