import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Configuration
const CSV_PATH = 'd:/houmi/LISTO/LISTO_PROCESADAS/links.csv';

// Price ranges by category (Approximate Ves/USD ratio will be applied)
const CATEGORY_PRICES: Record<string, { min: number; max: number }> = {
    'TV': { min: 180, max: 600 },
    'ELECTRODOMESTICOS': { min: 25, max: 150 },
    'LICUADORAS': { min: 25, max: 80 },
    'COCINAS': { min: 40, max: 200 },
    'BICICLETAS': { min: 90, max: 250 },
    'CORNETAS': { min: 10, max: 120 },
    'CAMARAS': { min: 30, max: 90 },
    'CONSOLAS': { min: 25, max: 150 },
    'DEFAULT': { min: 15, max: 50 },
};

function getRandomPrice(categoryName: string): number {
    let range = CATEGORY_PRICES['DEFAULT'];

    for (const key of Object.keys(CATEGORY_PRICES)) {
        if (categoryName.toUpperCase().includes(key)) {
            range = CATEGORY_PRICES[key];
            break;
        }
    }

    const price = Math.random() * (range.max - range.min) + range.min;
    return parseFloat(price.toFixed(2));
}

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

async function main() {
    console.log('🌱 Starting product seeded from LISTO CSV...');

    if (!fs.existsSync(CSV_PATH)) {
        console.error(`❌ CSV file not found at: ${CSV_PATH}`);
        process.exit(1);
    }

    // Read CSV using XLSX
    const workbook = XLSX.readFile(CSV_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${rows.length} rows in CSV.`);

    let productsCount = 0;

    for (const row of rows) {
        // Extract fields keys (handling encoding issues)
        // Keys found in debug: 'CategorÃ­a', 'Archivo', 'Ruta local', 'URL pÃºblica'
        const rawCategory = row['Categoría'] || row['CategorÃ­a'] || '';
        const filename = row['Archivo'] || '';
        const publicUrl = row['URL pública'] || row['URL pÃºblica'] || '';

        // Skip invalid rows
        if (!publicUrl || publicUrl === 'ERROR' || !filename) continue;

        // Process Category: "ELECTRODOMESTICOS\RAF\LISTO\BATIDORAS" -> "BATIDORAS"
        const categoryParts = rawCategory.split('\\');
        let categoryName = categoryParts[categoryParts.length - 1].trim();
        if (!categoryName) categoryName = "VARIOS";

        // Clean Category Name (remove special chars if any)
        categoryName = categoryName.toUpperCase().replace(/[^A-Z0-9\s,.-]/g, '');

        // Process Product Name (Remove extension)
        // Filenames like "SAT00142-12.png" or "Q2MINI.PNG"
        const code = filename.replace(/\.(jpg|png|jpeg|webp|PNG|JPG)$/, '').trim();
        const name = code; // Use code as name for catalog

        // Generate Slug
        // Add randomness if slug exists? But code is unique.
        let slug = slugify(`${categoryName}-${name}`);
        if (slug.length === 0) slug = slugify(code);

        // Generate Price
        const priceUsd = getRandomPrice(categoryName);
        const priceVes = parseFloat((priceUsd * 40).toFixed(2)); // Approx rate

        try {
            // Upsert Category
            const category = await prisma.category.upsert({
                where: { slug: slugify(categoryName) },
                update: {},
                create: {
                    name: categoryName,
                    slug: slugify(categoryName),
                },
            });

            // Upsert Product (WITHOUT price fields)
            await prisma.product.upsert({
                where: { code: code },
                update: {
                    images: JSON.stringify([publicUrl]),
                    isActive: true,
                    categoryId: category.id,
                },
                create: {
                    code: code,
                    name: name,
                    slug: slug,
                    description: `Producto importado de categoría ${categoryName}`,
                    images: JSON.stringify([publicUrl]),
                    isActive: true,
                    categoryId: category.id,
                },
            });

            const product = await prisma.product.findUnique({ where: { code } });
            if (product) {
                // Upsert Inventory
                await prisma.inventory.upsert({
                    where: { productId: product.id },
                    update: { stock: 100 },
                    create: {
                        productId: product.id,
                        stock: 100,
                    }
                });

                // Upsert Pricing (THIS IS WHERE PRICE GOES)
                await prisma.pricing.upsert({
                    where: { productId: product.id },
                    update: { priceUsd, priceVes },
                    create: {
                        productId: product.id,
                        priceUsd,
                        priceVes
                    }
                });
            }

            productsCount++;
            if (productsCount % 50 === 0) console.log(`   Processed ${productsCount} products...`);

        } catch (error) {
            console.error(`❌ Error importing ${filename}:`, error);
        }
    }

    console.log(`✅ Successfully seeded ${productsCount} products.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
