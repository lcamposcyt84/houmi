/**
 * Ejecuta el SQL para añadir columnas mercantilApiKey y mercantilApiSecret a Settings.
 * Se usa en vercel-build cuando la DB no tiene historial de migraciones (P3005).
 * ADD COLUMN IF NOT EXISTS es seguro ejecutarlo varias veces.
 *
 * En Vercel no hay MySQL en localhost: el build debe pasar; aplica el SQL en Hostinger/phpMyAdmin o con Prisma desde tu PC contra la URL de producción.
 */
if (process.env.VERCEL === '1' || process.env.SKIP_SETTINGS_MIGRATION === '1') {
  console.log('run-settings-migration: omitido en build remoto (VERCEL o SKIP_SETTINGS_MIGRATION)');
  process.exit(0);
}

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
