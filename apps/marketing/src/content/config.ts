import { defineCollection, z, type ImageFunction } from "astro:content";

const baseSchema = ({ image }: { image: ImageFunction }) =>
  z.object({
    title: z.string(),
    description: z.string().max(160),
    summary: z.string().max(200),
    primaryKeyword: z.string(),
    secondaryKeywords: z.array(z.string()).default([]),
    schemaType: z
      .enum(["Article", "HowTo", "FAQPage", "ItemList", "LocalBusiness"])
      .default("Article"),
    publishedAt: z.date().optional(),
    updatedAt: z.date().optional(),
    author: z.string().default("Redaktionen"),
    status: z
      .enum(["draft", "in-review", "published", "refresh"])
      .default("draft"),
    evergreen: z.boolean().default(true),
    heroImage: image().optional(),
    heroAlt: z.string().optional(),
    readingTimeMinutes: z.number().optional(),
    ctaLabel: z.string().optional(),
    ctaUrl: z
      .string()
      .optional()
      .refine(
        (value) => !value || value.startsWith("http") || value.startsWith("/"),
        {
          message: "ctaUrl måste vara absolut eller börja med /",
        },
      ),
    sources: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
          credibility: z.string().optional()
        }),
      )
      .default([]),
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .optional(),
    related: z.array(z.string()).default([]),
  });

const venueSchema = z.object({
  title: z.string(),
  description: z.string(),
  summary: z.string(),
  city: z.string(),
  region: z.string(),
  style: z.string(),
  capacity: z.number(),
  startPrice: z.number(),
  website: z.string().url(),
  email: z.string(),
  phone: z.string(),
  image: z.string(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  notes: z.string().optional(),
  related: z.array(z.string()).default([]),
  status: z
    .enum(["draft", "in-review", "published", "refresh"])
    .default("draft"),
  schemaType: z.string().default("Place"),
});

const supplierSchema = z.object({
  title: z.string(),
  description: z.string(),
  summary: z.string(),
  category: z.string(),
  city: z.string(),
  serviceArea: z.string(),
  startPrice: z.number(),
  packages: z.string(),
  website: z.string().url(),
  instagram: z.string().optional(),
  email: z.string(),
  phone: z.string(),
  image: z.string(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  notes: z.string().optional(),
  related: z.array(z.string()).default([]),
  status: z
    .enum(["draft", "in-review", "published", "refresh"])
    .default("draft"),
  schemaType: z.string().default("Organization"),
});

const programmaticSchema = z.object({
  title: z.string(),
  description: z.string().max(160),
  summary: z.string().max(200),
  primaryKeyword: z.string(),
  secondaryKeywords: z.array(z.string()).default([]),
  category: z.string(),
  city: z.string(),
  region: z.string(),
  searchVolume: z.number(),
  avgPrice: z.number(),
  priceRange: z.string(),
  supplierCount: z.number(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  author: z.string().default("Bröllopssidan.se"),
  status: z
    .enum(["draft", "in-review", "published", "refresh"])
    .default("published"),
  schemaType: z.string().default("LocalBusiness"),
  evergreen: z.boolean().default(true),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    )
    .optional(),
  sources: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().url(),
        credibility: z.string().optional()
      }),
    )
    .default([]),
  related: z.array(z.string()).default([]),
  programmaticData: z.object({
    generated: z.boolean().default(true),
    template: z.string(),
    city: z.string(),
    searchIntent: z.string(),
    competitionLevel: z.string(),
  }).optional(),
});

const guides = defineCollection({ type: "content", schema: baseSchema });
const checklistor = defineCollection({ type: "content", schema: baseSchema });
const budget = defineCollection({ type: "content", schema: baseSchema });
const inspiration = defineCollection({ type: "content", schema: baseSchema });
const leverantorer = defineCollection({ type: "content", schema: baseSchema });
const venues = defineCollection({ type: "content", schema: venueSchema });
const suppliers = defineCollection({ type: "content", schema: supplierSchema });
const traditioner = defineCollection({ type: "content", schema: baseSchema });
const mode = defineCollection({ type: "content", schema: baseSchema });
const juridik = defineCollection({ type: "content", schema: baseSchema });
const planering = defineCollection({ type: "content", schema: baseSchema });
const programmatic = defineCollection({ type: "content", schema: programmaticSchema });
const shared = defineCollection({ type: "data" });

export const collections = {
  guides,
  checklistor,
  budget,
  inspiration,
  leverantorer,
  venues,
  suppliers,
  traditioner,
  mode,
  juridik,
  planering,
  programmatic,
  shared,
};
