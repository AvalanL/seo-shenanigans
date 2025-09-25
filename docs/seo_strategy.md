# SEO-strategi för svensk bröllopsmarknad

## Affärsmål och KPI:er
- Positionera webbplatsen som främsta auktoritet för bröllopsplanering på svenska inom 12 månader.
- Driva organisk trafik med fokus på högintentionella sökord ("bröllopsplanerare", "bröllopsbudget", "checklista bröllop").
- Sekundärt mål: skapa innehåll som citeras av AI-assistenter genom tydliga fråge-/svarsformat och auktoritativa källor.
- KPI:er inkluderar organisk trafik, klickränta, andel featured snippets/AI Overviews, konverteringar till nyhetsbrev eller kontakt.

## Målgrupper
- **Bröllopspar i planeringsfasen** (12–6 månader innan bröllop) med behov av guider, checklistor, budgetverktyg.
- **Brud- och brudgumsvittnen/familj** som söker specifika uppgifter (tal, spel, traditioner).
- **Professionella bröllopsleverantörer** som vill synas via samarbeten, kataloger, gästinlägg.

## Innehållsstrategi
1. **Pillar & Cluster-struktur**
   - Pillar-sidor (2 000–3 000 ord) för områden som `Bröllopsplanering`, `Bröllopsbudget`, `Bröllopstrender 2025`, `Bröllopsleverantörer i Sverige`.
   - Klusterartiklar (800–1 500 ord) löser specifika frågor; varje kluster länkar till pillar-sidan och tvärlänkar mellan närbesläktade ämnen.
   - Mikrosidor (300–600 ord) för lokala sökningar (`Bröllopsfotograf i Malmö`), FAQ och definierade termer.

2. **Innehållsformat**
 - Steg-för-steg-guider, checklistor, priskalkyler, intervjuer med experter, templates (nedladdningsbara PDF/Google Sheets), jämförelser av leverantörer, listicles ("101 frågor att ställa..."), interaktiva verktyg.
  - Flaggskepp: **Budgetkalkylatorn** med export (CSV/Excel/PDF), delningsfunktion och scenario-presets som driver länkar och återvändande trafik.
   - Kortare svar i FAQ-format för AI och People Also Ask.

3. **Språk & Ton**
   - Moderna svenska, lättlästa meningar, mix av "du" och "ni" beroende på kontext.
   - Inkludera regionala variationer (t.ex. civilrättsliga skillnader, lokala traditioner).

4. **E-E-A-T**
   - Visa expertis via citat från bröllopskoordinatorer, officiella källor (Skatteverket, Svenska kyrkan), lokala leverantörer.
   - Författarprofiler med biografi, foton, referenser.
   - Transparens om källor och uppdateringar under varje artikel.

## SEO-taktiker
- **Teknisk SEO**: statisk site generator (Astro) med lättviktiga komponenter, schema.org-markup (Article, FAQPage, HowTo, ItemList, BreadcrumbList). Automatisera sitemap, robots.txt, hreflang (sv-SE).
- **On-page**: Huvudnyckelord i titel, H1, URL. Sekundära nyckelord i underrubriker, synonymer och long-tail. Interna länkar i brödtext och dedikerade "Relaterade artiklar"-moduler.
- **Content Velocity**: Matris/kalender för 20+ nya artiklar per vecka. Batch-produktion av rubriker, outlines, briefs via `content`-mapp.
- **AI Visibility**: QA-sektioner med koncisa svar (40–80 ord), tabeller med nyckeltal, tydliga bulletlistor.
- **Multimedia**: Lågupplösta men optimerade bilder med alt-texter, infografik, embed av Google Sheets kalkylatorer.

## Informationsarkitektur
- URL-struktur: `/guides/`, `/checklistor/`, `/budget/`, `/inspiration/`, `/leverantorer/`, `/traditioner/`.
- Taggning: `planering`, `budget`, `dekor`, `etikett`, `juridik`, `destination`, `leverantör`. Taggsidor för relaterade artiklar.
- Mega-menyer för de viktigaste kategorierna, samt breadcrumbs.
- Kapacitet att generera dynamiska listor ("Populära artiklar", "Nyligen uppdaterat", "Planera efter region").

## Länkar & Auktoritet
- Innehåll för digital PR: unika data (enkäter om svenska bröllop), kostnadsrapporter, trendrapporter.
- Outreach mot bröllopsbloggar, leverantörsnätverk, kommuner/destinationer.
- Intern länkmodul som genereras via `content/relationships.yaml` för att skala interlänkning.

## Analys och spårning
- Använd Google Search Console, GA4, samt verktyg som Ahrefs/Semrush för uppföljning (extern). Samla sökordsdata i `data/keywords.csv`.
- Tracka AI-assistentfrågor via feedback från användare och genom att strukturera QA.

## Operationalisering
- Redaktionskalender i `content/calendar.csv` med status (idé, brief, utkast, klar, uppdatera).
- Arbetsflöde: Keyword research → Brief → Utkast → Faktakontroll → SEO-check → Publicering.
- Standardiserade mallar för metadata (title, meta description, OG-data) i `templates/`.

## Kommande steg
1. Fastställ teknisk stack (Astro + Markdown + CMS-integration via Content Collections).
2. Sätt upp repo-struktur för innehåll och data + pipeline för generation.
3. Gör djup keyword research (topical map) för svensk marknad.
4. Skapa 10 initiala artiklar och briefs, publicera som MVP.
5. Automatisera generering av interna länkar, schema, och statusrapportering.
