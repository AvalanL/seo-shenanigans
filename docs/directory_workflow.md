# Workflow för katalogdata

## Dataset
- `apps/marketing/data/directories/venues.csv` – lokaler
- `apps/marketing/data/directories/suppliers.csv` – leverantörer per kategori
- Bilder sparas i `apps/marketing/public/assets/directories/venues/` respektive `suppliers/`

## Generering
1. Uppdatera CSV-filerna (manuellt eller via scraper). Fälten `capacity` och `start_price` förväntas vara numeriska.
2. Kör `npm run generate:directory` från repo-roten. Det skapar/uppdaterar MDX-filer i:
   - `src/content/venues/*.mdx`
   - `src/content/suppliers/<kategori>/*.mdx`
3. Kör `npm run lint:marketing` för att säkerställa att schema och formattering är korrekt.

## Scraping (extern körning)
- Script: `apps/marketing/scripts/scrape-brollopslokaler.mjs`
- Kör från rot: `npm run scrape:venues`
- Scriptet hämtar listor från bröllopslokaler.nu, sparar CSV och laddar ner bilder.
- CSS-selektorerna kan behöva anpassas om sajten ändrar HTML-struktur.
- Rekommendation: kör i miljö med nätverksåtkomst, versionera CSV och bilder efter kontroll.

## Kartstöd
- Lokalsidan (`/lokaler`) visar alla venues på en Leaflet-karta (OpenStreetMap). Se `VenueMap.astro`.
- Kontrollera att `latitude` och `longitude` finns i CSV för att markera på karta.

## Distribution
- Efter uppdatering av kataloger, trigga `docs/distribution_playbook.md` steg för att annonsera nya lokaler/leverantörer i nyhetsbrev och sociala kanaler.
