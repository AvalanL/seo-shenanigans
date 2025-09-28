import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import mime from 'mime';

import { createServiceFromEnv } from './lib/googleGenAIImageService';

const prompt = process.argv.slice(2).join(' ').trim() || 'Nano Banano brand illustration, vibrant vector art';
const model = process.env.GOOGLE_GENAI_MODEL ?? process.env.GOOGLE_IMAGEN_MODEL;
const outputDir = process.env.GOOGLE_IMAGE_OUTPUT_DIR ?? path.join(process.cwd(), 'generated-images');
const baseFileName = process.env.GOOGLE_IMAGE_BASENAME ?? 'google-genai-image';

async function saveBinaryFile(filePath: string, content: Buffer): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
  console.log(`File saved: ${filePath}`);
}

async function main(): Promise<void> {
const service = createServiceFromEnv({ defaultModel: 'gemini-2.5-flash-image-preview' });

  let imageCount = 0;

  const { texts } = await service.generate({
    prompt,
    model,
    onImage: async (image) => {
      const extension = mime.getExtension(image.mimeType) ?? 'bin';
      const fileName = `${baseFileName}-${image.index.toString().padStart(2, '0')}.${extension}`;
      const filePath = path.join(outputDir, fileName);
      await saveBinaryFile(filePath, image.buffer);
      imageCount += 1;
    },
    onText: (chunk) => {
      console.log(chunk.text);
    },
  });

  if (imageCount === 0) {
    console.warn('Stream completed without any image chunks. Verify the model supports IMAGE output.');
  }

  if (texts.length === 0) {
    console.warn('No text commentary received from the model.');
  }
}

main().catch((error) => {
  console.error('Failed while streaming from Google GenAI:', error);
  process.exit(1);
});
