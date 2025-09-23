# Arbetsflöde för innehåll

1. **Keyword research**
   - Uppdatera `apps/marketing/data/keywords.csv` med sökvolym, intent, SERP features.
   - Markera prioriterade kluster (planering, budget, etikett, regionala sökningar).

2. **Brief**
   - Skapa brief i `apps/marketing/data/briefs/<slug>.md` med:
     - Sökintention, målgrupp, ton, struktur (H1–H3), FAQ, CTA.
     - Top konkurrenter + SERP-gapanalys.
   - Lägg in föreslagna interna/externa länkar.

3. **Utkast**
   - Skriv artikel i `src/content/<collection>/<slug>.md` enligt mallen.
   - Inkludera "Snabba svar"-block (60–80 ord) i början för AI-svar.
   - Lista källor nederst (myndigheter, statistik, branschorganisationer).

4. **Faktakontroll**
   - Verifiera siffror mot officiella svenska källor.
   - Kontrollera att url:er är HTTPS och aktiva.

5. **SEO-review**
   - Säkerställ primärnyckelord i H1, title, första 100 ord, ALT.
   - Lägg till CTA i mitten/slutet.
   - Uppdatera `related` i frontmatter och `interlinks.yaml`.

6. **Publicering**
   - Sätt `status: published`, `publishedAt` och kör `npm run build`.
   - Uppdatera `content/calendar.csv` med status.

7. **Uppdateringar**
   - För evergreen-innehåll, planera uppdatering varje kvartal. Sätt `status: refresh` när analys visar tapp.
