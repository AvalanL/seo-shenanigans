# Budgetkalkylator – Produktkravdokument

## 1. Första principer
1. **Kontroll över helheten:** Svenska bröllopspar vill fatta informerade beslut utan att behöva excelkunskap eller engelska mallar.
2. **Svensk verklighet:** Prisnivåer, skatter och traditioner skiljer sig från internationella guider – verktyget måste spegla svensk marknad och språk.
3. **Samplanering:** Besluten tas tillsammans (partner, ofta familj) och kräver enkel delning utan konton.
4. **Tidsbesparing:** Budgetar förändras löpande; ett verktyg som sparar tid vinner lojalitet och backlinks.

## 2. Översikt
- **Produktnamn:** Interaktiv bröllopsbudgetkalkylator
- **Ägare:** Bröllopssidan.se – Produkt & Innehåll
- **Mål:** Hjälpa svenska bröllopspar att skapa, uppdatera och dela en komplett budget med lokal prisdata och rekommendationer.
- **Lanseringsfönster:** Q3 2024 (beta i juli, publik release augusti)

## 2. Bakgrund & problem
Svenska bröllopspar saknar ett verktyg som kombinerar svenska prisnivåer, kategori-fördelning och lokalt relevanta tips. Befintliga kalkylatorer är ofta engelska, generella eller kräver nedladdning av Google Sheets. Vårt mål är att minska friktionen mellan inspiration och konkret budgetarbete.

## 3. Målgrupp & use cases
1. **Förlovade par (primär):** Behöver en översiktlig budget för att fatta beslut om gästlista, lokal och prioriteringar.
2. **Bröllopskoordinatorer (sekundär):** Vill visa kunder ett modernt verktyg med svenska prisnivåer.
3. **Budgetmedvetna gäster/föräldrar (tertiär):** Vill förstå hur pengarna fördelas och var de kan bidra.

**Nyckel-scenarier:**
- Skapa första budgeten baserat på standardposter.
- Anpassa kategorier och se direkt hur totalsumman förändras.
- Exportera och dela budget med partner eller koordinator.
- Jämföra kostnad per gäst och rekommenderad buffert.

## 4. Mål & KPI:er
- **Huvudmål:** 40 % av besökare interagerar med kalkylatorn (ändrar värde eller sparar).
- **Sekundära KPI:er:**
  - 15 % exporterar eller sparar budgeten.
  - 25 % klickar sig vidare till minst en relaterad budgetguide.
  - Genomsnittlig tid på sidan > 3 min.

## 5. Produktprinciper
1. **Svensk kontext först:** Prisnivåer, texter och terminologi följer svenska förhållanden.
2. **Handlingsbara insikter:** Lyfter fram rekommenderad buffert, kostnad per gäst och prioriteringsråd.
3. **Låg friktion:** Kan användas direkt i webbläsaren utan inloggning eller nedladdning.
4. **Delningsbar:** Exporterbar CSV och tydliga CTA:er mot andra resurser.

## 6. Funktionella krav
- Förifyllda kostnadsposter (lokal, mat, foto, musik, dekor, kläder, övrigt + buffert) med svenska standardvärden.
- Möjlighet att lägga till/ta bort egna poster och omdöpa dem.
- Realtidsuppdatering av total, kostnad per gäst och buffert (10 % default, justerbar i backlogg).
- Lokalt sparande i `localStorage` (spara / ladda / rensa).
- Exportmöjligheter:
  - **CSV** (svensk semikolon-standard).
  - **Excel (.xls)** med formaterad tabell och metadata.
  - **PDF/utskrift** via print-optimerad vy.
  - **Dela** via Web Share API och länk med URL-parametrar (backlogg) för enkel samplanering.
- Gästantal som påverkar kostnad per gäst.
- Sektion för smarta tips beroende på budgetnivå + automatiskt scenarioförslag.
- FAQ med vanliga frågor kring budget och verktyget.
- Loggning av interaktioner för produktanalys.

## 7. Icke-funktionella krav
- **Prestanda:** LCP < 2,5 s på mobila nät i Lighthouse test.
- **Tillgänglighet:** Möjligt att använda med tangentbord, aria-labels vid behov, färgkontrast > 4,5:1.
- **Datasäkerhet:** All data stannar lokalt i webbläsaren.
- **Responsivitet:** Full funktionalitet på mobil (360px) upp till desktop.

## 8. UX & innehåll
**Layoutstruktur:**
1. Hero med nyckelstatistik (medianbudget i Sverige, CTA att starta).
2. Snabbval: välj scenario (Smart / Standard / Premium) för autojustering.
3. Själva kalkylatorn (formulär + summering).
4. Tipssektion med kostnadsfördelning och checklista-länkar.
5. FAQ (förankrat i svensk kontext: buffert, betalningsplaner, varningar).
6. CTA till nyhetsbrev/budgetguide för fördjupning.

**Ton & microcopy:** Empatisk, handlingsorienterad, använd `ni`-tilltal. Förklara tekniska ord (t.ex. deposition).

## 9. Analys & spårning
- Event `budget_calc_interact` när användare ändrar värde.
- Event `budget_calc_save`, `budget_calc_export`, `budget_calc_share`, `budget_calc_print`.
- Scroll depth (50 % / 90 %) för att se engagemang.
- UTM-taggar på interna CTA:er (t.ex. `?ref=budgetkalkylator`).

## 10. SEO-strategi
- **Primärt sökord:** `bröllopsbudget kalkylator`
- **Sekundära sökord:** `budgetkalkylator bröllop`, `bröllopsbudget verktyg`, `bröllop kostnad beräkna`
- **URL:** `/budget/budgetkalkylator`
- **Titel:** `Budgetkalkylator för bröllop 2024 – Räkna ut kostnaderna`
- **Metabeskrivning:** 150–160 tecken med CTA.
- Intern länkning från:
  - `/budget` översikt.
  - `brollopsbudget-2025` artikel.
  - Programmatic city/service-sidor (budget CTA ersätts med denna).
  - Startsidan hero CTA (sekundär) kan länka till kalkylatorn.
- Schema: `SoftwareApplication` + `FAQPage` block.

## 11. Tekniska anteckningar
- Placera sidan i `src/pages/budget/budgetkalkylator.astro` och använd `BaseLayout`.
- Återanvänd komponent `BudgetCalculator` och utöka för scenario-presets och dynamiska poster.
- Exportfunktioner:
  - CSV: befintlig implementation.
  - Excel: generera `.xls` med semantisk tabell för kompatibilitet.
  - PDF: print-optimerad stylesheet + `window.print()`.
  - Share: Web Share API + fallback kopierad länk (backlogg: generera delbar URL med query params).
- Skapa ny komponent `BudgetScenarioSelect` vid behov (kan brytas ut från verktyget).
- Lägg till relaterade data i `src/content/budget` för att synas i listningar.
- Säkerställ mörkt läge via globala CSS-variabler.
- Möjliggör versionsmigrering av sparad data (v2 → v3 etc.).

## 12. Lanseringsplan
1. **Utkast** (v0.1): Grundläggande kalkylator + copy.
2. **v0.5:** Lägg till scenarier, custom poster och CSV-export (klart).
3. **v0.8:** Lägg till Excel-export, print/PDF och delningsknapp.
4. **Intern QA:** Fokusera på mobil, utskriftsvy och delning.
5. **Beta:** Dela med nyhetsbrevslista (50 personer) – samla feedback.
6. **Publik release:** Uppdatera startsida, sociala inlägg, pressmeddelande.
7. **Efterlansering:** A/B-test av CTA-texter på startsidan och uppföljning av events.

## 13. Risker & mitigering
- **Prisdata blir inaktuell:** Sätt påminnelse (kvartalsvis) för att revidera defaultvärden.
- **LocalStorage blockeras:** Visa fallback-meddelande och tillåt manuell export.
- **Komplexitet skrämmer bort användare:** Håll formuläret kompakt, använd scenario-knappar.

## 14. Öppna frågor
- Ska vi erbjuda inlogg som premium-funktion på sikt?
- Behöver vi visa jämförelse mellan regioner direkt i verktyget?
- Kan kalkylatorn integreras med leverantörsdatabasen för att föreslå lokala priser?
