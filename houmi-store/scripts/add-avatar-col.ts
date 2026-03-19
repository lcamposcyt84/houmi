import { prisma } from "../src/lib/db";

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE Customer ADD COLUMN avatarUrl VARCHAR(255) NULL`);
    console.log("Column avatarUrl added successfully via raw SQL");
  } catch (e) {
    console.error("Error or column already exists:", e);
  }
}

main().catch(console.error).finally(() => process.exit(0));
