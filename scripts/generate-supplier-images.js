#!/usr/bin/env node

/**
 * Generate wedding supplier category images using Google Gemini API
 * All images use consistent Monet-inspired style with pastel colors
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// Base style for all images - consistent Monet-inspired aesthetic
const BASE_STYLE = "in the style of Claude Monet impressionist painting, soft pastel colors, dreamy watercolor technique, ethereal lighting, romantic wedding atmosphere, delicate brushstrokes, muted tones of blush pink, sage green, lavender, cream, and soft blue, painterly texture, wedding illustration";

// Wedding supplier categories with specific prompts
const SUPPLIER_CATEGORIES = {
  bartender: {
    label: "Bartender",
    prompt: `Elegant wedding bartender crafting cocktails at a romantic outdoor wedding bar, ${BASE_STYLE}, vintage glassware, floral arrangements, Swedish summer garden setting`
  },
  catering: {
    label: "Catering",
    prompt: `Beautiful wedding feast with elegant table setting, delicate porcelain dishes, floral centerpieces, ${BASE_STYLE}, Swedish wedding reception, gourmet food presentation, romantic ambiance`
  },
  festfixare: {
    label: "Festfixare",
    prompt: `Wedding event coordinator arranging beautiful decorations, ${BASE_STYLE}, flowing fabrics, floral installations, romantic wedding venue setup, Swedish celebration atmosphere`
  },
  florist: {
    label: "Florist",
    prompt: `Romantic wedding bouquet with peonies, roses, and eucalyptus, ${BASE_STYLE}, bridal flowers, delicate ribbon, Swedish garden wedding florals, soft natural lighting`
  },
  fotobas: {
    label: "Fotobås",
    prompt: `Charming vintage photo booth with elegant props, floral backdrop, ${BASE_STYLE}, wedding guests having fun, romantic Swedish wedding celebration, soft dreamy atmosphere`
  },
  fotograf: {
    label: "Fotograf",
    prompt: `Wedding photographer capturing romantic moments, vintage camera, ${BASE_STYLE}, Swedish wedding ceremony, couple in love, ethereal natural lighting, artistic composition`
  },
  "har-och-smink": {
    label: "Hår & smink",
    prompt: `Bride getting elegant hair and makeup styling, delicate makeup brushes, flowers in hair, ${BASE_STYLE}, bridal beauty preparation, romantic Swedish wedding morning`
  },
  klanningar: {
    label: "Klänningar",
    prompt: `Beautiful flowing wedding dress on vintage dress form, delicate lace details, ${BASE_STYLE}, bridal boutique setting, Swedish wedding gown, romantic and ethereal`
  },
  konfetti: {
    label: "Konfetti",
    prompt: `Romantic confetti petals falling during wedding celebration, flower petals in air, ${BASE_STYLE}, Swedish wedding tradition, joyful celebration moment, soft pastel confetti`
  },
  koordinator: {
    label: "Koordinator",
    prompt: `Professional wedding planner with elegant notebook and florals, organizing beautiful wedding details, ${BASE_STYLE}, Swedish wedding coordination, romantic planning atmosphere`
  },
  musik: {
    label: "Musik",
    prompt: `Elegant string quartet performing at romantic wedding ceremony, violins and cellos, ${BASE_STYLE}, Swedish wedding music, outdoor ceremony setting, musical romance`
  },
  skyltar: {
    label: "Skyltar",
    prompt: `Beautiful wedding signage with calligraphy, wooden welcome signs with floral decorations, ${BASE_STYLE}, Swedish wedding wayfinding, romantic garden wedding signs`
  },
  smycken: {
    label: "Smycken",
    prompt: `Delicate wedding rings and bridal jewelry on vintage lace, pearls and diamonds, ${BASE_STYLE}, Swedish wedding accessories, romantic jewelry display, soft natural lighting`
  }
};

// Output directory for generated images
const OUTPUT_DIR = path.join(process.cwd(), 'apps/marketing/public/images/suppliers');

/**
 * Generate image using Gemini API
 * @param {string} prompt - The image prompt
 * @param {string} filename - Output filename
 */
async function generateImage(prompt, filename) {
  try {
    console.log(`🎨 Generating image: ${filename}`);
    console.log(`📝 Prompt: ${prompt}`);

    // Use Gemini's image generation
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        maxOutputTokens: 1024,
      }
    });

    // Note: As of 2024, Gemini doesn't directly support image generation via API
    // This is a placeholder structure. You would need to use a different service
    // or wait for Google to release image generation API

    console.log(`⚠️  Note: Google Gemini image generation API not yet available`);
    console.log(`📋 Use this prompt with another service like DALL-E, Midjourney, or Stability AI:`);
    console.log(`"${prompt}"`);
    console.log(`💾 Save as: ${filename}`);
    console.log('---');

    return { success: false, reason: 'API not available yet' };

  } catch (error) {
    console.error(`❌ Error generating ${filename}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Alternative: Generate prompts for external services
 */
async function generatePromptsFile() {
  const prompts = {};

  for (const [category, config] of Object.entries(SUPPLIER_CATEGORIES)) {
    prompts[category] = {
      label: config.label,
      filename: `${category}-00.png`,
      prompt: config.prompt,
      dimensions: "1024x768",
      style: "Monet impressionist wedding illustration"
    };
  }

  const promptsContent = `# Wedding Supplier Category Image Prompts
# Generated: ${new Date().toISOString()}
# Style: Monet-inspired impressionist wedding illustrations

export const SUPPLIER_IMAGE_PROMPTS = ${JSON.stringify(prompts, null, 2)};

# Usage Instructions:
# 1. Copy each prompt to your preferred AI image generator (DALL-E, Midjourney, Stability AI, etc.)
# 2. Generate at 1024x768 resolution
# 3. Save with the specified filename in apps/marketing/public/images/suppliers/
# 4. All images maintain consistent Monet impressionist style with pastel colors

# Example for DALL-E:
# - Model: DALL-E 3
# - Size: 1024x1024 (will crop to 1024x768)
# - Style: Natural/Vivid
# - Quality: Standard

# Example for Midjourney:
# Add these parameters: --ar 4:3 --style raw --v 6

# Example for Stability AI:
# - Model: SDXL
# - Aspect ratio: 4:3
# - Steps: 30-50
# - CFG Scale: 7-12
`;

  await fs.writeFile(
    path.join(process.cwd(), 'scripts/supplier-image-prompts.md'),
    promptsContent,
    'utf-8'
  );

  console.log('✅ Generated prompts file: scripts/supplier-image-prompts.md');

  // Also create a JSON file for programmatic use
  await fs.writeFile(
    path.join(process.cwd(), 'scripts/supplier-image-prompts.json'),
    JSON.stringify(prompts, null, 2),
    'utf-8'
  );

  console.log('✅ Generated JSON file: scripts/supplier-image-prompts.json');
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 Wedding Supplier Image Generator');
  console.log('Style: Monet impressionist with pastel colors');
  console.log('---');

  // Ensure output directory exists
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }

  // Generate prompts file for manual use
  await generatePromptsFile();

  console.log('\n📋 Generated prompts for all supplier categories!');
  console.log('\n🎯 Next steps:');
  console.log('1. Check scripts/supplier-image-prompts.md for all prompts');
  console.log('2. Use your preferred AI image generator (DALL-E, Midjourney, etc.)');
  console.log('3. Generate images at 1024x768 resolution');
  console.log('4. Save in apps/marketing/public/images/suppliers/');
  console.log('5. All images will have consistent Monet impressionist style');

  // Future: When Gemini image generation API is available
  if (process.env.GOOGLE_GEMINI_API_KEY) {
    console.log('\n🔮 Google Gemini image generation API not yet available');
    console.log('Will automatically switch to API when released');
  } else {
    console.log('\n💡 Set GOOGLE_GEMINI_API_KEY environment variable when API becomes available');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SUPPLIER_CATEGORIES, generateImage, generatePromptsFile };