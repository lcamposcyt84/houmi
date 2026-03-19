import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface CatalogProduct {
  categoria: string;
  categoriaSlug: string;
  codigo: string;
  nombre: string;
  slug: string;
  rutaImagenPrincipal: string;
  rutasImagenes: string[];
}

interface CatalogData {
  generatedAt: string;
  categories: string[];
  products: CatalogProduct[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Generate random price between min and max
function randomPrice(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Generate random stock
function randomStock(): number {
  const weights = [0, 0, 0, 1, 2, 3, 5, 8, 10, 15, 20, 25, 30];
  return weights[Math.floor(Math.random() * weights.length)];
}

// Price ranges by category
const priceRanges: Record<string, { min: number; max: number }> = {
  BICICLETAS: { min: 80, max: 350 },
  CAMARAS: { min: 25, max: 120 },
  CARRO: { min: 150, max: 500 },
  "CONSOLAS DE VIDEOJUEGOS": { min: 30, max: 80 },
  CORNETAS: { min: 20, max: 200 },
  ELECTRODOMESTICOS: { min: 15, max: 300 },
  "MICROFONO Y ECUALIZDOR": { min: 25, max: 100 },
  TV: { min: 150, max: 600 },
};

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Check if catalog exists
  const catalogPath = path.join(process.cwd(), "data", "catalog.generated.json");
  
  if (!fs.existsSync(catalogPath)) {
    console.log("⚠️  Catalog file not found. Creating sample data...\n");
    await createSampleData();
    return;
  }

  const catalogRaw = fs.readFileSync(catalogPath, "utf-8");
  const catalog: CatalogData = JSON.parse(catalogRaw);

  console.log(`📦 Found ${catalog.products.length} products in ${catalog.categories.length} categories\n`);

  // Create settings
  console.log("⚙️  Creating settings...");
  await prisma.settings.upsert({
    where: { id: "main" },
    update: {
      mercantilIdComercio: process.env.MERCANTIL_MERCHANT_ID,
      mercantilMasterKey: process.env.MERCANTIL_ENCRYPTION_KEY,
      mercantilApiUrl: process.env.MERCANTIL_API_URL,
    },
    create: {
      id: "main",
      exchangeRateUsdToVes: parseFloat(process.env.DEFAULT_EXCHANGE_RATE || "40.00"),
      storeName: "Houmi Store",
      storeDescription: "Tu tienda de confianza",
      mercantilIdComercio: process.env.MERCANTIL_MERCHANT_ID,
      mercantilMasterKey: process.env.MERCANTIL_ENCRYPTION_KEY,
      mercantilApiUrl: process.env.MERCANTIL_API_URL,
    },
  });

  // Create categories
  console.log("📂 Creating categories...");
  const categoryMap = new Map<string, string>();

  for (const categoryName of catalog.categories) {
    const slug = slugify(categoryName);
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name: categoryName },
      create: {
        name: categoryName,
        slug,
      },
    });
    categoryMap.set(categoryName, category.id);
    console.log(`   ✅ ${categoryName}`);
  }

  // Create products
  console.log("\n📦 Creating products...");
  let created = 0;
  let updated = 0;

  for (const product of catalog.products) {
    const categoryId = categoryMap.get(product.categoria);
    if (!categoryId) {
      console.log(`   ⚠️  Category not found for ${product.codigo}`);
      continue;
    }

    const priceRange = priceRanges[product.categoria] || { min: 20, max: 150 };
    const priceUsd = randomPrice(priceRange.min, priceRange.max);
    const stock = randomStock();

    try {
      const existingProduct = await prisma.product.findUnique({
        where: { code: product.codigo },
      });

      if (existingProduct) {
        await prisma.product.update({
          where: { code: product.codigo },
          data: {
            name: product.nombre,
            images: JSON.stringify(product.rutasImagenes),
          },
        });
        updated++;
      } else {
        await prisma.product.create({
          data: {
            code: product.codigo,
            name: product.nombre,
            slug: product.slug,
            description: `${product.nombre} - ${product.categoria}`,
            images: JSON.stringify(product.rutasImagenes),
            isActive: true,
            categoryId,
            inventory: {
              create: {
                stock,
              },
            },
            pricing: {
              create: {
                priceUsd,
                manualVes: false,
              },
            },
          },
        });
        created++;
      }
    } catch (error) {
      console.log(`   ⚠️  Error with ${product.codigo}:`, error);
    }
  }

  console.log(`\n✅ Created ${created} products, updated ${updated} products`);
  console.log("🌱 Seed completed successfully!\n");
}

async function createSampleData() {
  // Create settings
  await prisma.settings.upsert({
    where: { id: "main" },
    update: {
      mercantilIdComercio: process.env.MERCANTIL_MERCHANT_ID,
      mercantilMasterKey: process.env.MERCANTIL_ENCRYPTION_KEY,
      mercantilApiUrl: process.env.MERCANTIL_API_URL,
    },
    create: {
      id: "main",
      exchangeRateUsdToVes: 40.0,
      storeName: "Houmi Store",
      storeDescription: "Tu tienda de confianza",
      mercantilIdComercio: process.env.MERCANTIL_MERCHANT_ID,
      mercantilMasterKey: process.env.MERCANTIL_ENCRYPTION_KEY,
      mercantilApiUrl: process.env.MERCANTIL_API_URL,
    },
  });

  // Create sample categories
  const categories = [
    { name: "Bicicletas", slug: "bicicletas" },
    { name: "Cámaras", slug: "camaras" },
    { name: "Electrónicos", slug: "electronicos" },
    { name: "Electrodomésticos", slug: "electrodomesticos" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Create sample products
  const sampleProducts = [
    {
      code: "SAMPLE001",
      name: "Producto de Ejemplo 1",
      slug: "producto-ejemplo-1",
      categorySlug: "electronicos",
      price: 99.99,
      stock: 10,
    },
    {
      code: "SAMPLE002",
      name: "Producto de Ejemplo 2",
      slug: "producto-ejemplo-2",
      categorySlug: "electrodomesticos",
      price: 149.99,
      stock: 5,
    },
  ];

  for (const prod of sampleProducts) {
    const category = await prisma.category.findUnique({
      where: { slug: prod.categorySlug },
    });

    if (!category) continue;

    await prisma.product.upsert({
      where: { code: prod.code },
      update: {},
      create: {
        code: prod.code,
        name: prod.name,
        slug: prod.slug,
        description: `Descripción de ${prod.name}`,
        images: JSON.stringify(["/placeholder.svg"]),
        isActive: true,
        categoryId: category.id,
        inventory: {
          create: { stock: prod.stock },
        },
        pricing: {
          create: { priceUsd: prod.price, manualVes: false },
        },
      },
    });
  }

  console.log("✅ Sample data created");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

