# Automatiserat flöde för artikelproduktion

Den här instruktionen används varje gång en ny artikel ska tas fram. Följ stegen i ordning och dokumentera resultatet i respektive mapp (`research/`, `apps/marketing/data/briefs/`, `apps/marketing/src/content/...`).

## 0. Förutsättningar & verktyg
- Säkerställ att `seo_strategy.md`, `project_structure.md` och relevanta briefs är uppdaterade.
- Verktyg som används vid behov:
  - **Webbsök** (Google/Ahrefs/Semrush). Behöver ev. nätverksgodkännande.
  - **SERP-scraper** (ex. `serpapi`, `scrapingbee`, `playwright`). Respektera robots.txt och använd cache.
  - **Innehållsextraktion** (Readability, `trafilatura`) för att hämta text från topprankade artiklar.
  - **Embeddings/LLM** för sammanfattning/synkronisering (lagra output i `research/notes/`).
  - **Plagiatkontroll** (Copyscape eller liknande) innan publicering.

## 1. Keyword selection & intent validation
1. Välj målkeyword från `apps/marketing/data/keywords.csv` eller lägg till nytt efter research.
2. Validera att keyword matchar våra prioriterade kluster och att sökintentionen är tydlig (informativ/transactional/kommersiell).
3. Uppdatera rad i `keywords.csv` med:
   - `status` (idé/pågående/klar)
   - SERP-feature observationer (FAQ, video, karta, etc.)
   - Primära konkurrenter och url:er.

## 2. SERP intelligence (top 5–10 resultat)
1. Kör webbsök via valt verktyg (kräver ibland nätverkstillgång). Dokumentera datum, plats (svenska resultat), enheter.
2. Spara SERP-export i `research/serp/<slug>-YYYYMMDD.json`.
3. Identifiera content-gap:
   - Rubriker, sekundära keyword, People Also Ask-frågor.
   - Schema-typer som används (FAQ, HowTo, ItemList).
4. Bedöm E-E-A-T-signaler (författare, citat, data) i topprankade artiklar.

## 3. Konkurrentanalys & kunskapsbank
1. **Scraping:** Hämta HTML från top 3–5 artiklar (respektera robots och licenser). Spara råkopia i `research/scrapes/<domän>/slug.html` och extraherad text i `.md` eller `.txt`.
2. **Parsa innehåll** med Readability/trafilatura. Extrahera:
   - H1–H4 rubriker
   - Listor och tabeller (t.ex. budgettabeller)
   - FAQ-avsnitt
   - Källor/externa länkar
3. Lagra strukturerad data i `research/parsed/<slug>.json` för återanvändning av fraser (utan att plagiera).
4. Kör semantisk sammanfattning/cluster (embeddings) för att identifiera tematiska luckor.

## 4. Outline & brief update
1. Om brief saknas – skapa/uppdatera i `apps/marketing/data/briefs/<slug>.md` med insikter från research (nya PAA-frågor, schema-behov).
2. Skapa outline i `research/outlines/<slug>-YYYYMMDD.md`:
   - H1/H2/H3-struktur
   - Snabbsvar/TL;DR (AI-optimering)
   - Tabell- och checklisteidéer
   - Internlänkar (koppla mot `interlinks.yaml` och `related` i frontmatter)
   - Externa källor som ska citeras (myndigheter, organisationer)
3. Bekräfta CTA och lead magnet enligt strategin.

## 5. Datainsamling & fakta
1. Hämta aktuella siffror (SCB, Skatteverket, branschrapporter). Spara i `research/data/<slug>.csv`.
2. Notera citat/insikter från experter (planera outreach vid behov).
3. Tagga varje datapunkt med källa + datum.

## 6. Drafting (produktion)
1. Skapa ny MD/MDX-fil i korrekt collection (`apps/marketing/src/content/...`). Använd frontmatter-mallen.
2. Skriv draft med följande checklista:
   - Snabbsvar/TL;DR i början.
   - Primär keyword i H1, första 150 ord, meta description.
   - Sekundära keywords i H2/H3.
   - Infoga tabeller/listor baserade på research.
   - Citat/källor med länkar (minst 3 auktoritativa).
   - FAQ med 3–5 frågor som matchar PAA/AI.
   - CTA block enligt brief.
3. Återanvänd konkurrentinsikter, men skriv om med egen vinkel och uppdaterade data.
4. Löpande uppdatera `related`-fältet och `interlinks.yaml`.

## 7. QA & optimering
1. **Fakta**: Kontrollera alla siffror mot källor, uppdatera datum.
2. **SEO**: Kontrollera titlar, meta, slug, H-taggar, bild-alt, schema-typ.
3. **AI readiness**: Säkerställ korta svar, tabell med nyckeltal, tydlig struktur.
4. **Plagiatcheck**: Kör Copyscape/liknande (logga resultat i `research/reports/<slug>-plagiarism.txt`).
5. **LIX/Lesbarhet**: Kontrollera att text är lättläst (mål LIX 35–45). Justera.
6. **Tillgänglighet**: Bekräfta att listor/tabeller har rubriker och alt-text.

## 8. Publicering & uppföljning
1. Sätt `status: in-review` → `published` när granskad.
2. Kör `npm run prebuild` för att uppdatera interlänkar och därefter `npm run build` för validering.
3. Uppdatera `content/calendar.csv` och `keywords.csv` med status + noter (t.ex. datum för uppdatering).
4. Skapa changelog i slutet av artikeln (manuell sektion) med datum + uppdatering.
5. Logga publiceringen i `research/logs/article-publications.csv` med datum, keyword, författare, ansvarig.

## 9. Distribution & feedback-loop
1. Planera internt/extern distribution (nyhetsbrev, sociala kanaler) – dokumentera i `research/distribution/<slug>.md`.
2. Efter 30 dagar: analysera GSC-data (CTR, position, frågor) och uppdatera brief med insikter.
3. Identifiera uppdateringsbehov (lägga till FAQ, nya data) och markera `status: refresh` vid behov.

## Automatiseringsidéer
- Script för att trigga SERP-insamling + scraping baserat på keywordlista.
- Automatiserat genererande av outline via LLM prompt (skriv ut krav på att använda data i `research/`).
- Workflow som synkar `interlinks.yaml` → genererar block i artiklar.
- CI-jobb som stoppar merge om frontmatter saknar obligatoriska fält eller källor.

**Viktigt:** Följ alltid denna instruktion. Lagra research och beslut i repo så att nästa skribent kan replikera processen.
