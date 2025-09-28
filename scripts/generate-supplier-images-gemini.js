#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

// Load prompts
const promptsPath = path.join(process.cwd(), 'scripts/supplier-category-prompts.json');
const prompts = JSON.parse(await fs.readFile(promptsPath, 'utf-8'));

// Google Gemini API configuration
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Output directory
const OUTPUT_DIR = path.join(process.cwd(), 'apps/marketing/public/images/suppliers');

async function generateImageWithGemini(prompt, filename) {
  try {
    console.log(`🎨 Generating: ${filename}`);

    // Since Gemini doesn't generate images directly yet, we'll use a placeholder approach
    // This creates a text-based description that can be used with other image generation services

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a detailed art direction prompt for an AI image generator. Base prompt: "${prompt}". Enhance this with specific artistic details about composition, lighting, color harmony, and brushstroke techniques that would make this a perfect Monet-style wedding illustration. Keep it under 500 characters.`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const enhancedPrompt = result.candidates?.[0]?.content?.parts?.[0]?.text || prompt;

    console.log(`✅ Enhanced prompt for ${filename}:`);
    console.log(enhancedPrompt);
    console.log('---');

    return {
      success: true,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt.trim(),
      filename
    };

  } catch (error) {
    console.error(`❌ Error with ${filename}:`, error.message);
    return {
      success: false,
      error: error.message,
      originalPrompt: prompt,
      filename
    };
  }
}

async function generateAllImages() {
  console.log('🎨 Starting Gemini-enhanced supplier category image generation');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log('---');

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const results = [];
  const enhancedPrompts = {};

  for (const [categoryKey, categoryData] of Object.entries(prompts.categories)) {
    const result = await generateImageWithGemini(
      categoryData.prompt,
      categoryData.filename
    );

    results.push(result);

    if (result.success) {
      enhancedPrompts[categoryKey] = {
        label: categoryData.label,
        filename: categoryData.filename,
        originalPrompt: result.originalPrompt,
        enhancedPrompt: result.enhancedPrompt
      };
    }

    // Small delay to be respectful to the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save enhanced prompts
  await fs.writeFile(
    path.join(process.cwd(), 'scripts/enhanced-supplier-prompts.json'),
    JSON.stringify(enhancedPrompts, null, 2),
    'utf-8'
  );

  console.log('\n📊 Generation Summary:');
  console.log(`✅ Successfully enhanced: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
  console.log('\n💾 Enhanced prompts saved to: scripts/enhanced-supplier-prompts.json');

  console.log('\n🎯 Next Steps:');
  console.log('1. Use the enhanced prompts with DALL-E, Midjourney, or Stability AI');
  console.log('2. Generate images at 1024x768 resolution (4:3 aspect ratio)');
  console.log('3. Save images in apps/marketing/public/images/suppliers/');
  console.log('4. All images will maintain perfect Monet style consistency');

  return results;
}

// Alternative: Direct image generation (when available)
async function generateWithImageAPI() {
  console.log('🔮 Note: Google Gemini image generation not yet available via API');
  console.log('📋 Using text enhancement approach instead');

  return await generateAllImages();
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!GEMINI_API_KEY) {
    console.error('❌ Please set GOOGLE_GEMINI_API_KEY environment variable');
    process.exit(1);
  }

  generateWithImageAPI().catch(console.error);
}

export { generateAllImages, generateImageWithGemini };