import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const dataDir = path.join(root, "data", "directories");
const contentDir = path.join(root, "src", "content");
const suppliersDir = path.join(contentDir, "suppliers");
const venuesDir = path.join(contentDir, "venues");

const ensureDir = async (dir) => mkdir(dir, { recursive: true });
const csvLineBreak = /\r?\n/;

const parseCsv = (text) => {
  const [headerLine, ...lines] = text.trim().split(csvLineBreak);
  const headers = headerLine.split(",");
  return lines.filter(Boolean).map((line) => {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    const entry = {};
    headers.forEach((header, index) => {
      const raw = values[index] ?? "";
      entry[header] = raw.replace(/^"|"$/g, "");
    });
    return entry;
  });
};

const formatValue = (value) => {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value;
  return value;
};

const toFrontmatter = (record) => {
  const lines = Object.entries(record).map(([key, raw]) => {
    const value = formatValue(raw);
    if (Array.isArray(value)) {
      const arr = value.map((item) => `  - ${JSON.stringify(item)}`).join("\n");
      return `${key}:\n${arr}`;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return `${key}: ${value}`;
    }
    return `${key}: ${JSON.stringify(value)}`;
  });
  return `---\n${lines.join("\n")}\n---\n\n`;
};

const normaliseVenue = (venue) => ({
  ...venue,
  capacity: Number(venue.capacity || 0),
  start_price: Number(venue.start_price || 0),
  image: venue.image || "/assets/directories/venues/placeholder-venue.svg",
});

const normaliseSupplier = (supplier) => ({
  ...supplier,
  start_price: Number(supplier.start_price || 0),
  image:
    supplier.image || "/assets/directories/suppliers/placeholder-supplier.svg",
});

const createVenueContent = (venue) => {
  const related = [
    "budget/brollopsbudget-2025",
    "guides/brollopsplanering-grundkurs",
  ];
  const frontmatter = toFrontmatter({
    title: venue.name,
    description: `${venue.style} för upp till ${venue.capacity} gäster i ${venue.city}.`,
    summary: `Bröllopslokal i ${venue.city} med plats för ${venue.capacity} gäster. Startpris från ${venue.start_price} kr.`,
    city: venue.city,
    region: venue.region,
    style: venue.style,
    capacity: venue.capacity,
    startPrice: venue.start_price,
    website: venue.website,
    email: venue.email,
    phone: venue.phone,
    image: venue.image,
    latitude: venue.latitude,
    longitude: venue.longitude,
    notes: venue.notes,
    related,
    status: "draft",
    schemaType: "Place",
  });

  return `${frontmatter}## Om lokalen\n${venue.notes || "Beskrivning saknas"}\n\n## Fakta\n- Kapacitet: ${venue.capacity} gäster\n- Startpris: ${venue.start_price.toLocaleString()} kr\n- Plats: ${venue.city}, ${venue.region}\n\n## Kontakt\n- Webb: ${venue.website}\n- E-post: ${venue.email}\n- Telefon: ${venue.phone}\n`;
};

const createSupplierContent = (supplier) => {
  const related = ["guides/brollopsplanering-grundkurs"];
  const frontmatter = toFrontmatter({
    title: supplier.name,
    description: `${supplier.category} i ${supplier.city} med startpris ${supplier.start_price} kr.`,
    summary: `${supplier.name} erbjuder ${supplier.packages} i ${supplier.service_area}.`,
    category: supplier.category,
    city: supplier.city,
    serviceArea: supplier.service_area,
    startPrice: supplier.start_price,
    packages: supplier.packages,
    website: supplier.website,
    instagram: supplier.instagram,
    email: supplier.email,
    phone: supplier.phone,
    image: supplier.image,
    latitude: supplier.latitude,
    longitude: supplier.longitude,
    notes: supplier.notes,
    related,
    status: "draft",
    schemaType: "Organization",
  });

  return `${frontmatter}## Tjänster\n${supplier.packages}\n\n## Kontakt\n- Webb: ${supplier.website}\n- Instagram: ${supplier.instagram}\n- E-post: ${supplier.email}\n- Telefon: ${supplier.phone}\n\n## Om leverantören\n${supplier.notes}\n`;
};

const run = async () => {
  await Promise.all([ensureDir(venuesDir), ensureDir(suppliersDir)]);

  const venuesCsv = await readFile(path.join(dataDir, "venues.csv"), "utf-8");
  const suppliersCsv = await readFile(
    path.join(dataDir, "suppliers.csv"),
    "utf-8",
  );

  const venues = parseCsv(venuesCsv).map(normaliseVenue);
  const suppliers = parseCsv(suppliersCsv).map(normaliseSupplier);

  for (const venue of venues) {
    const filePath = path.join(venuesDir, `${venue.id}.mdx`);
    await writeFile(filePath, createVenueContent(venue), "utf-8");
  }

  const groupedSuppliers = suppliers.reduce((map, supplier) => {
    const category = supplier.category ?? "ovrigt";
    const dir = path.join(suppliersDir, category);
    map.set(category, dir);
    return map;
  }, new Map());

  for (const dir of groupedSuppliers.values()) {
    await ensureDir(dir);
  }

  for (const supplier of suppliers) {
    const category = supplier.category ?? "ovrigt";
    const dir = groupedSuppliers.get(category) ?? suppliersDir;
    const filePath = path.join(dir, `${supplier.id}.mdx`);
    await writeFile(filePath, createSupplierContent(supplier), "utf-8");
  }

  console.log(
    `Genererade ${venues.length} venues och ${suppliers.length} leverantörer.`,
  );
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
