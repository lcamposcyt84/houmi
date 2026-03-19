/**
 * Ejecuta el SQL para añadir columnas mercantilApiKey y mercantilApiSecret a Settings.
 * Se usa en vercel-build cuando la DB no tiene historial de migraciones (P3005).
 * ADD COLUMN IF NOT EXISTS es seguro ejecutarlo varias veces.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "mercantilApiUrl" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "mercantilApiPath" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "mercantilApiKey" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "mercantilApiSecret" TEXT;
    `);
    console.log('Settings columns OK');
  } catch (e) {
    console.error('run-settings-migration:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
