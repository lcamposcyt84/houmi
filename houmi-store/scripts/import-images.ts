/**
 * Script to import images from local folders to the project
 * - Copies logo to /public/brand/
 * - Copies product images to /public/products/
 * - Generates catalog.generated.json with product data
 */

import * as fs from "fs";
import * as path from "path";

// Paths configuration
const SOURCE_LOGO_PATH = "C:\\Users\\USER\\Desktop\\Houmi";
const SOURCE_PRODUCTS_PATH = "C:\\Users\\USER\\Desktop\\Houmi\\LISTO";
const DEST_BRAND_PATH = path.join(process.cwd(), "public", "brand");
const DEST_PRODUCTS_PATH = path.join(process.cwd(), "public", "products");
const CATALOG_OUTPUT_PATH = path.join(process.cwd(), "data", "catalog.generated.json");

// Image extensions to process
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

// Folders to skip (not product categories)
const SKIP_FOLDERS = ["SCRIPT", "LISTO_PROCESADAS"];

interface ProductEntry {
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
  products: ProductEntry[];
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function isImageFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function copyFile(src: string, dest: string): void {
  const destDir = path.dirname(dest);
  ensureDir(destDir);
  fs.copyFileSync(src, dest);
}

function findLargestImage(dirPath: string): string | null {
  const files = fs.readdirSync(dirPath);
  let largestFile: string | null = null;
  let largestSize = 0;

  for (const file of files) {
    if (!isImageFile(file)) continue;
    
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile() && stats.size > largestSize) {
      largestSize = stats.size;
      largestFile = filePath;
    }
  }

  return largestFile;
}

function copyLogo(): void {
  console.log("\n🎨 Copying logo...");
  
  ensureDir(DEST_BRAND_PATH);
  
  // Find the largest logo image (version 2 imagotipo preferred)
  const logoFiles = fs.readdirSync(SOURCE_LOGO_PATH).filter(
    (f) => f.toLowerCase().includes("imagotipo") && isImageFile(f)
  );

  if (logoFiles.length === 0) {
    console.log("⚠️ No logo files found");
    return;
  }

  // Prefer version 2
  let selectedLogo = logoFiles.find((f) => f.includes("version 2"));
  if (!selectedLogo) {
    selectedLogo = logoFiles[0];
  }

  const srcPath = path.join(SOURCE_LOGO_PATH, selectedLogo);
  const destPath = path.join(DEST_BRAND_PATH, "logo.png");
  
  copyFile(srcPath, destPath);
  console.log(`✅ Logo copied: ${selectedLogo} -> logo.png`);

  // Also copy isotipo (icon only)
  const isotipoFiles = fs.readdirSync(SOURCE_LOGO_PATH).filter(
    (f) => f.toLowerCase().includes("isotipo") && isImageFile(f)
  );

  if (isotipoFiles.length > 0) {
    let selectedIsotipo = isotipoFiles.find((f) => f.includes("version 2"));
    if (!selectedIsotipo) {
      selectedIsotipo = isotipoFiles[0];
    }
    const srcIsoPath = path.join(SOURCE_LOGO_PATH, selectedIsotipo);
    const destIsoPath = path.join(DEST_BRAND_PATH, "icon.png");
    copyFile(srcIsoPath, destIsoPath);
    console.log(`✅ Icon copied: ${selectedIsotipo} -> icon.png`);
  }
}

function processProductsFolder(
  folderPath: string,
  categoryName: string,
  relativePath: string = ""
): ProductEntry[] {
  const products: ProductEntry[] = [];
  const categorySlug = slugify(categoryName);
  
  if (!fs.existsSync(folderPath)) {
    return products;
  }

  const items = fs.readdirSync(folderPath);
  
  // Group images by product code (before the extension)
  const productImages: Map<string, string[]> = new Map();
  
  for (const item of items) {
    const itemPath = path.join(folderPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Skip certain folders
      if (SKIP_FOLDERS.includes(item)) continue;
      
      // Process subfolders (like RAF/LISTO or FREIDORAS...)
      const subProducts = processProductsFolder(
        itemPath,
        categoryName,
        path.join(relativePath, item)
      );
      products.push(...subProducts);
    } else if (isImageFile(item)) {
      // Extract product code from filename
      const baseName = path.basename(item, path.extname(item));
      
      // Try to find the base code (remove size variants like -12, -16, -20)
      // Pattern: CODE-SIZE or just CODE
      const codeMatch = baseName.match(/^([A-Za-z0-9]+)(?:-\d+)?$/i);
      const code = codeMatch ? codeMatch[1].toUpperCase() : baseName.toUpperCase();
      
      if (!productImages.has(code)) {
        productImages.set(code, []);
      }
      productImages.get(code)!.push(item);
    }
  }

  // Create product entries
  for (const [code, images] of productImages) {
    // Sort images to get consistent main image
    images.sort();
    
    const destRelativePath = relativePath 
      ? `${categorySlug}/${slugify(relativePath)}`
      : categorySlug;
    
    // Copy images to destination
    const destImagePaths: string[] = [];
    for (const img of images) {
      const srcPath = path.join(folderPath, img);
      const destFileName = img.toLowerCase().replace(/\s+/g, "-");
      const destPath = path.join(DEST_PRODUCTS_PATH, destRelativePath, destFileName);
      
      copyFile(srcPath, destPath);
      destImagePaths.push(`/products/${destRelativePath}/${destFileName}`);
    }

    const catSlug = slugify(categoryName);
    const productSlug = slugify(`${code}-${catSlug}`);
    
    products.push({
      categoria: categoryName,
      categoriaSlug: catSlug,
      codigo: code,
      nombre: code, // Use code as name, can be updated later
      slug: productSlug,
      rutaImagenPrincipal: destImagePaths[0],
      rutasImagenes: destImagePaths,
    });
  }

  return products;
}

function copyProducts(): CatalogData {
  console.log("\n📦 Processing products...");
  
  ensureDir(DEST_PRODUCTS_PATH);
  
  const allProducts: ProductEntry[] = [];
  const categories: Set<string> = new Set();
  
  if (!fs.existsSync(SOURCE_PRODUCTS_PATH)) {
    console.error(`❌ Products source path not found: ${SOURCE_PRODUCTS_PATH}`);
    return {
      generatedAt: new Date().toISOString(),
      categories: [],
      products: [],
    };
  }

  const categoryFolders = fs.readdirSync(SOURCE_PRODUCTS_PATH);
  
  for (const folder of categoryFolders) {
    // Skip non-directories and special folders
    if (SKIP_FOLDERS.includes(folder)) continue;
    
    const folderPath = path.join(SOURCE_PRODUCTS_PATH, folder);
    const stat = fs.statSync(folderPath);
    
    if (!stat.isDirectory()) continue;
    
    console.log(`\n📂 Processing category: ${folder}`);
    categories.add(folder);
    
    const products = processProductsFolder(folderPath, folder);
    allProducts.push(...products);
    
    console.log(`   ✅ Found ${products.length} products`);
  }

  return {
    generatedAt: new Date().toISOString(),
    categories: Array.from(categories).sort(),
    products: allProducts,
  };
}

function saveCatalog(catalog: CatalogData): void {
  console.log("\n💾 Saving catalog...");
  
  const dataDir = path.dirname(CATALOG_OUTPUT_PATH);
  ensureDir(dataDir);
  
  fs.writeFileSync(CATALOG_OUTPUT_PATH, JSON.stringify(catalog, null, 2), "utf-8");
  
  console.log(`✅ Catalog saved to: ${CATALOG_OUTPUT_PATH}`);
  console.log(`   Categories: ${catalog.categories.length}`);
  console.log(`   Products: ${catalog.products.length}`);
}

async function main(): Promise<void> {
  console.log("🚀 Starting image import process...\n");
  console.log(`Source logo path: ${SOURCE_LOGO_PATH}`);
  console.log(`Source products path: ${SOURCE_PRODUCTS_PATH}`);
  console.log(`Destination brand path: ${DEST_BRAND_PATH}`);
  console.log(`Destination products path: ${DEST_PRODUCTS_PATH}`);

  try {
    // Copy logo
    copyLogo();
    
    // Copy products and generate catalog
    const catalog = copyProducts();
    
    // Save catalog
    saveCatalog(catalog);
    
    console.log("\n✨ Import completed successfully!");
  } catch (error) {
    console.error("\n❌ Error during import:", error);
    process.exit(1);
  }
}

main();





