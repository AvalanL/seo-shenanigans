# Svenska Bröllopsakademien – SEO-projekt

En Astro-baserad innehållsportal för att dominera svenska bröllopsrelaterade sökningar och AI-svar.

## Snabbstart
1. Installera beroenden:
   ```bash
   cd apps/marketing
   npm install
   ```
2. Generera internlänkar:
   ```bash
   npm run prebuild
   ```
3. Starta utvecklingsserver:
   ```bash
   npm run dev
   ```

> **Obs:** Nätverkstillgång krävs för att hämta NPM-paket. `site` i `astro.config.mjs` behöver uppdateras när domän är klar.

## Katalogstruktur
- `apps/marketing/` – Astro-projekt med content collections.
- `docs/` – Strategier, riktlinjer och dokumentation.
- `research/` – Keywordlistor, entiteter och analyser (kommer).
- `templates/` – Mallar för briefs, metadata m.m.

## Nästa steg
- Fyll `apps/marketing/src/content` med artiklar (se `docs/content_workflow.md` när den är skapad).
- Bygg verktyg för att importera keyworddata och generera briefs.
- Sätt upp CI för automatiska bygg/tester.
