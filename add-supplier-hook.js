#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { processNewSupplier } = require('./instagram-gallery-scraper.js');

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node add-supplier-hook.js <path-to-supplier-file>');
    process.exit(1);
  }

  const filePath = args[0];

  // Kontrollera att filen finns
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Filen finns inte: ${filePath}`);
    process.exit(1);
  }

  // Kontrollera att det är en leverantörsfil
  if (!filePath.includes('/suppliers/') || !filePath.endsWith('.mdx')) {
    console.log(`ℹ️  Filen ${filePath} är inte en leverantörsfil, hoppar över Instagram-bearbetning`);
    process.exit(0);
  }

  console.log(`🔄 Bearbetar ny leverantör: ${path.basename(filePath)}`);

  try {
    await processNewSupplier(filePath);
    console.log('✅ Leverantör bearbetad framgångsrikt!');
  } catch (error) {
    console.error('❌ Fel vid bearbetning:', error.message);
    process.exit(1);
  }
}

main();