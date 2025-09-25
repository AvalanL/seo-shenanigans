#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Missing API key. Set GOOGLE_AI_STUDIO_API_KEY (preferred) or GOOGLE_API_KEY/GEMINI_API_KEY in your environment.');
  process.exit(1);
}

const prompt = process.argv.filter((arg, index) => index > 1).join(' ').trim() || 'Nano Banano brand illustration, vibrant, vector art';
const model = process.env.GOOGLE_IMAGEN_MODEL || 'imagen-3.0-generate-001';
const outDir = process.env.GOOGLE_IMAGE_OUTPUT_DIR || path.join(process.cwd(), 'generated-images');
const outFile = path.join(outDir, `${Date.now()}-${model.replace(/[^a-z0-9.-]+/gi, '')}.png`);

async function main() {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateImage?key=${API_KEY}`;
  const body = {
    prompt: {
      text: prompt,
    },
    negativePrompt: process.env.GOOGLE_IMAGEN_NEGATIVE_PROMPT
      ? { text: process.env.GOOGLE_IMAGEN_NEGATIVE_PROMPT }
      : undefined,
    image: {
      mimeType: 'image/png',
    },
  };

  // Remove undefined keys so the API payload stays clean
  Object.keys(body).forEach((key) => body[key] === undefined && delete body[key]);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({ message: 'Unable to parse JSON response' }));

  if (!response.ok) {
    console.error('Google AI Studio returned an error:', payload);
    process.exit(1);
  }

  const imageData = payload?.images?.[0]?.imageBytes || payload?.data?.[0]?.image?.imageBytes;

  if (!imageData) {
    console.error('No image data found in API response. Full payload:', payload);
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, Buffer.from(imageData, 'base64'));
  console.log(`Image written to ${outFile}`);
}

main().catch((error) => {
  console.error('Unexpected failure while calling Google AI Studio:', error);
  process.exit(1);
});
