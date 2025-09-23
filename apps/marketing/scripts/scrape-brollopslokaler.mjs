/**
 * Scraper för bröllopslokaler.nu – hämtar namn, stad, pris och bild-URL.
 *
 * OBS! Körs utanför denna miljö (kräver nätverksåtkomst). Justera CSS-selektorerna
 * efter den faktiska HTML-strukturen. Scriptet är idempotent och skriver data till
 * `apps/marketing/data/directories/venues.csv` samt laddar ner bilder till
 * `apps/marketing/public/assets/directories/venues/`.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { createWriteStream as createWriteStreamSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputCsv = path.join(root, "data", "directories", "venues.csv");
const imageDir = path.join(root, "public", "assets", "directories", "venues");

const BASE_URL = "https://xn--brllopslokaler-wpb.nu";
const LISTING_PATH = "/fina-brollopslokaler/";
const REGION_PARAM = "92"; // Stockholms län i exemplet

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureDir = async (dir) => {
  await mkdir(dir, { recursive: true });
};

const fetchPage = async (url) => {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; SvenskaBrollopsakademien/1.0)",
    },
  });
  if (!res.ok) throw new Error(`Hämtning misslyckades ${res.status}: ${url}`);
  return res.text();
};

const parseListingPage = ($) => {
  const cards = [];
  $("article.listing-item").each((_, el) => {
    const $el = $(el);
    const title = $el.find(".listing-title").text().trim();
    const city = $el.find(".listing-location").text().trim();
    const priceText = $el
      .find(".listing-price")
      .text()
      .replace(/[^0-9]/g, "");
    const detailUrl = $el.find("a.listing-link").attr("href");
    const image =
      $el.find("img").attr("data-src") || $el.find("img").attr("src");

    if (!title || !detailUrl) return;

    cards.push({
      title,
      city,
      price: priceText ? Number(priceText) : 0,
      detailUrl: detailUrl.startsWith("http")
        ? detailUrl
        : `${BASE_URL}${detailUrl}`,
      imageUrl: image
        ? image.startsWith("http")
          ? image
          : `${BASE_URL}${image}`
        : null,
    });
  });
  const nextUrl = $(".pagination .next a").attr("href");
  return {
    cards,
    nextPage: nextUrl
      ? nextUrl.startsWith("http")
        ? nextUrl
        : `${BASE_URL}${nextUrl}`
      : null,
  };
};

const scrapeDetail = async (url) => {
  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const notes = $(".listing-description").text().trim();
  const latitude = $("[data-lat]").attr("data-lat") || "";
  const longitude = $("[data-lng]").attr("data-lng") || "";
  return { notes, latitude, longitude };
};

const downloadImage = async (url, filename) => {
  if (!url) return "/assets/directories/venues/placeholder-venue.svg";
  const res = await fetch(url);
  if (!res.ok) return "/assets/directories/venues/placeholder-venue.svg";
  const ext = path.extname(new URL(url).pathname) || ".jpg";
  const filePath = path.join(imageDir, `${filename}${ext}`);
  const fileStream = createWriteStreamSync(filePath);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
  return `/assets/directories/venues/${filename}${ext}`;
};

const main = async () => {
  await ensureDir(imageDir);

  const startUrl = `${BASE_URL}${LISTING_PATH}?search_region=${REGION_PARAM}&submit=`;
  const results = [];
  const seen = new Set();
  let url = startUrl;

  while (url) {
    console.log(`Hämtar ${url}`);
    const html = await fetchPage(url);
    const $ = cheerio.load(html);
    const { cards, nextPage } = parseListingPage($);

    for (const card of cards) {
      if (seen.has(card.detailUrl)) continue;
      seen.add(card.detailUrl);

      await delay(300 + Math.random() * 200); // snällare mot servern
      const detail = await scrapeDetail(card.detailUrl);
      const imagePath = await downloadImage(
        card.imageUrl,
        card.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      );

      results.push({
        id: card.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: card.title,
        city: card.city || "Stockholm",
        region: "Stockholm",
        style: "",
        capacity: 0,
        start_price: card.price,
        website: card.detailUrl,
        email: "",
        phone: "",
        image: imagePath,
        latitude: detail.latitude,
        longitude: detail.longitude,
        notes: detail.notes,
      });
    }

    if (!nextPage || nextPage === url) break;
    url = nextPage;
    await delay(800 + Math.random() * 400);
  }

  const csvHeader =
    "id,name,city,region,style,capacity,start_price,website,email,phone,image,latitude,longitude,notes\n";
  const csvLines = results.map((row) =>
    [
      row.id,
      row.name,
      row.city,
      row.region,
      row.style,
      row.capacity,
      row.start_price,
      row.website,
      row.email,
      row.phone,
      row.image,
      row.latitude,
      row.longitude,
      row.notes.replace(/\n+/g, " "),
    ]
      .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
      .join(","),
  );

  await writeFile(outputCsv, csvHeader + csvLines.join("\n") + "\n", "utf-8");
  console.log(`Sparade ${results.length} lokaler till ${outputCsv}`);
};

if (process.argv.includes("--run")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
} else {
  console.log(
    "Detta script är avsett att köras manuellt med nätverksåtkomst. Kör t.ex.:",
  );
  console.log("  node apps/marketing/scripts/scrape-brollopslokaler.mjs --run");
}
