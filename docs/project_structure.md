# Projektstruktur för skalbar SEO-sajt (Astro)

```
seo-shenanigans/
├── apps/marketing/              # Frontend (Astro) projektrot
│   ├── src/
│   │   ├── pages/          # Genererade sidor (MD/MDX + .astro)
│   │   ├── layouts/        # Layoutkomponenter (SEO, nav, artikelsidor)
│   │   ├── components/     # UI-moduler (breadcrumbs, relaterade artiklar)
│   │   └── content.config  # Astro Content Collections definitioner
│   ├── content/
│   │   ├── guides/         # Pillar & djupa guider
│   │   ├── checklistor/    # Listor, checklistor, QA
│   │   ├── budget/
│   │   ├── inspiration/
│   │   ├── leverantorer/
│   │   ├── traditioner/
│   │   └── _shared/        # Delade moduler (FAQ, callouts)
│   ├── public/
│   │   └── assets/         # Optimerade bilder, ikoner
│   ├── data/
│   │   ├── keywords.csv    # Huvudkeyword, volym, intent
│   │   ├── entities.yaml   # Namngivna entiteter, schema-data
│   │   ├── interlinks.yaml # Definierar relationer mellan artiklar
│   │   └── briefs/         # JSON/YAML med artikelbriefs
│   ├── scripts/
│   │   ├── generate-links.ts   # Bygger relaterade artiklar från interlinks.yaml
│   │   ├── build-schema.ts     # Skapar JSON-LD
│   │   └── sync-keywords.ts    # Hämtar/uppdaterar keyword-data (manuell import)
│   ├── styles/
│   │   └── base.css         # Basdesign optimerad för Core Web Vitals
│   └── package.json         # Projektberoenden
├── docs/                   # Strategi, riktlinjer, dokumentation
├── research/               # Rådata från research (CSV, markdown)
├── templates/              # Metadatamallar, outline-mallar
└── tools/                  # CLI-verktyg, scripts (ex. Python) som stöd
```

## Skalbarhet & Automatisering
- Content Collections säkerställer validerade frontmatter-fält (titel, slug, huvudkeyword, schema-type, CTA, status).
- `interlinks.yaml` mappar artiklar → automatisering genererar block för relaterat innehåll.
- Scripts mappar keyword-intent till artiklar och flaggar luckor.
- Möjlighet att använda CMS (Sanity/Contentful) via API senare; behåll statiska filer för initial MVP.

## Versionshantering av innehåll
- Markdown/MDX med frontmatter för metadata, källor, FAQ.
- `content/_shared` innehåller återanvändbara komponenter (t.ex. CTA-block, sponsorinfo).
- Standardiserad `updatedAt` i frontmatter + changelog i artikelns slut.

## Lokalisering
- `i18n.config.ts` (på sikt) för andra språk; just nu `sv-SE` som default.
- Alt-texter och metadata på svenska.

## SEO & Performance
- Layout med `Astro SEO` helper, genererar meta, Open Graph, Twitter Cards.
- Använd `astro-icon` och `@astrojs/image` för optimerade bilder.
- CSS modulär och light, prioriterad CLS/INP.

## Deploy & Infrastruktur
- Build statiskt till `dist/`. Kan hostas på Vercel/Netlify. Med CI (GitHub Actions) för build + link kontroll.
- Plan för generering av sitemap/robots via Astro integrasjoner.

## Filnamn & Slugs
- Filnamn i kebab-case (`bröllopsbudget-grundkurs.mdx`). Slug definieras i frontmatter för flexibilitet.

## Kvalitetskontroller
- ESLint/Prettier för kod.
- Turborepo (på sikt) om fler appar (admin, API).
- Markdown linting (remark) + SEO-check script (kontrollerar nyckelfält, intern länkar, ordantal).
