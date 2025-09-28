#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

// Load prompts
const promptsPath = path.join(process.cwd(), 'scripts/supplier-category-prompts.json');
const prompts = JSON.parse(await fs.readFile(promptsPath, 'utf-8'));

// For now, let's create placeholder images with the exact prompts
// You can use these prompts with any AI image generator

async function createImagePromptsForGeneration() {
  console.log('🎨 Creating supplier category images with Monet style');
  console.log('📝 Generating ready-to-use prompts for external AI services');
  console.log('---');

  const generationInstructions = [];

  for (const [categoryKey, categoryData] of Object.entries(prompts.categories)) {
    const instruction = {
      category: categoryKey,
      label: categoryData.label,
      filename: categoryData.filename,
      prompt: categoryData.prompt,
      specifications: {
        size: '1024x768',
        aspectRatio: '4:3',
        format: 'PNG',
        style: 'Monet impressionist',
        colorPalette: 'Pastel (blush pink, sage green, lavender, cream, powder blue)'
      }
    };

    generationInstructions.push(instruction);

    console.log(`📸 ${categoryData.label} (${categoryData.filename})`);
    console.log(`🎨 Prompt: ${categoryData.prompt.substring(0, 100)}...`);
    console.log('---');
  }

  // Save instructions for external use
  await fs.writeFile(
    path.join(process.cwd(), 'scripts/image-generation-instructions.json'),
    JSON.stringify(generationInstructions, null, 2),
    'utf-8'
  );

  // Create a markdown file with copy-paste ready prompts
  let markdownContent = `# Wedding Supplier Category Images - Monet Style\n\n`;
  markdownContent += `Generated: ${new Date().toISOString()}\n\n`;
  markdownContent += `## Style Guidelines\n`;
  markdownContent += `- **Artist Style**: Claude Monet impressionist painting\n`;
  markdownContent += `- **Colors**: Pastel palette (blush pink, sage green, lavender, cream, powder blue)\n`;
  markdownContent += `- **Technique**: Soft dreamy brushstrokes, watercolor texture\n`;
  markdownContent += `- **Size**: 1024x768 (4:3 aspect ratio)\n`;
  markdownContent += `- **Format**: PNG\n\n`;

  for (const instruction of generationInstructions) {
    markdownContent += `## ${instruction.label}\n`;
    markdownContent += `**Filename**: \`${instruction.filename}\`\n\n`;
    markdownContent += `**Prompt**:\n`;
    markdownContent += `\`\`\`\n${instruction.prompt}\n\`\`\`\n\n`;
    markdownContent += `---\n\n`;
  }

  await fs.writeFile(
    path.join(process.cwd(), 'scripts/supplier-image-prompts.md'),
    markdownContent,
    'utf-8'
  );

  console.log('✅ Generated files:');
  console.log('📄 scripts/image-generation-instructions.json');
  console.log('📄 scripts/supplier-image-prompts.md');
  console.log('\n🎯 Ready to generate images!');
  console.log('\nUse these prompts with:');
  console.log('• DALL-E 3 (OpenAI)');
  console.log('• Midjourney');
  console.log('• Stable Diffusion');
  console.log('• Adobe Firefly');
  console.log('• Or any other AI image generator');

  return generationInstructions;
}

// Since we can't directly generate images without proper API setup,
// let's create optimized prompts that can be used with any service
if (import.meta.url === `file://${process.argv[1]}`) {
  createImagePromptsForGeneration().catch(console.error);
}