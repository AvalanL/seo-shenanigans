#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mime = require('mime');

const API_KEY = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Missing API key. Set GOOGLE_AI_STUDIO_API_KEY (preferred) or GOOGLE_API_KEY/GEMINI_API_KEY in your environment.');
  process.exit(1);
}

const prompt = process.argv.filter((arg, index) => index > 1).join(' ').trim() || 'Nano Banano brand illustration, vibrant, vector art';
const model = process.env.GOOGLE_IMAGEN_MODEL || process.env.GOOGLE_GENAI_MODEL || 'gemini-2.5-flash-image-preview';
const outDir = process.env.GOOGLE_IMAGE_OUTPUT_DIR || path.join(process.cwd(), 'generated-images');
const outFile = path.join(outDir, `${Date.now()}-${model.replace(/[^a-z0-9.-]+/gi, '')}.png`);

async function main() {
  const isGemini = model.startsWith('gemini');

  if (isGemini) {
    await generateWithGemini();
    return;
  }

  await generateWithImagen();
}

main().catch((error) => {
  console.error('Unexpected failure while calling Google AI Studio:', error);
  process.exit(1);
});

async function generateWithImagen() {
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

async function generateWithGemini() {
  const { GoogleGenAI } = await import('@google/genai');
  const client = new GoogleGenAI({ apiKey: API_KEY });

  const stream = await client.models.generateContentStream({
    model,
    config: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  });

  const images = [];
  const texts = [];

  for await (const chunk of stream) {
    const candidates = chunk?.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate?.content?.parts || [];
      for (const part of parts) {
        if (part?.inlineData?.data) {
          images.push(part.inlineData);
        }
        if (typeof part?.text === 'string' && part.text.trim().length > 0) {
          texts.push(part.text.trim());
        }
      }
    }
  }

  texts.forEach((text) => console.log(text));

  if (images.length === 0) {
    console.error('No image data found in Gemini response.');
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  images.forEach((inlineData, index) => {
    const fileExtension = mime.getExtension(inlineData.mimeType || 'image/png') || 'png';
    const filePath = index === 0 && images.length === 1
      ? outFile
      : path.join(outDir, `${Date.now()}-${index}.${fileExtension}`);
    fs.writeFileSync(filePath, Buffer.from(inlineData.data, 'base64'));
    console.log(`Image written to ${filePath}`);
  });
}
