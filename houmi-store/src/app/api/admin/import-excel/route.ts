import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";
import * as XLSX from "xlsx";

async function isAuthenticated() {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  const session = await verifyAdminToken(token);
  return session?.isAdmin === true;
}

interface ExcelRow {
  codigo?: string;
  CODIGO?: string;
  Codigo?: string;
  nombre?: string;
  NOMBRE?: string;
  Nombre?: string;
  descripcion?: string;
  DESCRIPCION?: string;
  Descripcion?: string;
  stock?: number | string;
  STOCK?: string | number;
  Stock?: string | number;
  precio?: number | string;
  PRECIO?: string | number;
  Precio?: string | number;
  precio_usd?: number | string;
  PRECIO_USD?: string | number;
  precioUsd?: string | number;
  categoria?: string;
  CATEGORIA?: string;
  Categoria?: string;
  activo?: boolean | string | number;
  ACTIVO?: boolean | string | number;
  Activo?: boolean | string | number;
}

function normalizeRow(row: ExcelRow) {
  return {
    codigo: (row.codigo || row.CODIGO || row.Codigo || "").toString().trim().toUpperCase(),
    nombre: (row.nombre || row.NOMBRE || row.Nombre || "").toString().trim(),
    descripcion: (row.descripcion || row.DESCRIPCION || row.Descripcion || "").toString().trim(),
    stock: parseInt((row.stock || row.STOCK || row.Stock || "0").toString()) || 0,
    precioUsd: parseFloat((row.precio || row.PRECIO || row.Precio || row.precio_usd || row.PRECIO_USD || row.precioUsd || "0").toString()) || 0,
    categoria: (row.categoria || row.CATEGORIA || row.Categoria || "").toString().trim(),
    activo: row.activo !== undefined ? Boolean(row.activo) : 
            row.ACTIVO !== undefined ? Boolean(row.ACTIVO) : 
            row.Activo !== undefined ? Boolean(row.Activo) : true,
  };
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó archivo" },
        { status: 400 }
      );
    }

    // Leer el archivo Excel
    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: "array" });
    
    // Obtener la primera hoja
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const rawData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

    if (rawData.length === 0) {
      return NextResponse.json(
        { error: "El archivo está vacío o no tiene el formato correcto" },
        { status: 400 }
      );
    }

    // Obtener categorías existentes
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(c => [c.slug.toLowerCase(), c.id]));
    const categoryNameMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
      skipped: 0,
    };

    for (let i = 0; i < rawData.length; i++) {
      const rowNum = i + 2; // +2 porque Excel empieza en 1 y tiene header
      const row = normalizeRow(rawData[i]);

      if (!row.codigo) {
        results.errors.push(`Fila ${rowNum}: Código vacío, saltando`);
        results.skipped++;
        continue;
      }

      try {
        // Buscar producto existente por código
        const existingProduct = await prisma.product.findUnique({
          where: { code: row.codigo },
          include: { category: true },
        });

        if (existingProduct) {
          // Actualizar producto existente
          const updateData: Record<string, unknown> = {};
          
          if (row.nombre) updateData.name = row.nombre;
          if (row.descripcion) updateData.description = row.descripcion;
          
          // Actualizar categoría si se especifica
          if (row.categoria) {
            const catId = categoryMap.get(row.categoria.toLowerCase()) || 
                         categoryNameMap.get(row.categoria.toLowerCase());
            if (catId) {
              updateData.categoryId = catId;
              // Actualizar slug con nueva categoría
              const cat = categories.find(c => c.id === catId);
              if (cat) {
                updateData.slug = `${row.codigo.toLowerCase()}-${cat.slug}`;
              }
            }
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.product.update({
              where: { id: existingProduct.id },
              data: updateData,
            });
          }

          // Actualizar inventario
          if (row.stock !== undefined) {
            await prisma.inventory.upsert({
              where: { productId: existingProduct.id },
              update: { stock: row.stock },
              create: { productId: existingProduct.id, stock: row.stock },
            });
          }

          // Actualizar precio
          if (row.precioUsd > 0) {
            await prisma.pricing.upsert({
              where: { productId: existingProduct.id },
              update: { priceUsd: row.precioUsd },
              create: { productId: existingProduct.id, priceUsd: row.precioUsd },
            });
          }

          results.updated++;
        } else {
          // Crear nuevo producto (necesita categoría)
          if (!row.categoria) {
            results.errors.push(`Fila ${rowNum}: Producto nuevo ${row.codigo} necesita categoría`);
            results.skipped++;
            continue;
          }

          const catId = categoryMap.get(row.categoria.toLowerCase()) || 
                       categoryNameMap.get(row.categoria.toLowerCase());
          
          if (!catId) {
            results.errors.push(`Fila ${rowNum}: Categoría "${row.categoria}" no encontrada para ${row.codigo}`);
            results.skipped++;
            continue;
          }

          const cat = categories.find(c => c.id === catId);
          const slug = `${row.codigo.toLowerCase()}-${cat?.slug || 'producto'}`;

          const newProduct = await prisma.product.create({
            data: {
              code: row.codigo,
              name: row.nombre || row.codigo,
              slug,
              description: row.descripcion || null,
              images: JSON.stringify(["/placeholder.svg"]),
              isActive: true,
              categoryId: catId,
            },
          });

          // Crear inventario
          await prisma.inventory.create({
            data: {
              productId: newProduct.id,
              stock: row.stock,
            },
          });

          // Crear precio
          await prisma.pricing.create({
            data: {
              productId: newProduct.id,
              priceUsd: row.precioUsd,
            },
          });

          results.created++;
        }
      } catch (err) {
        results.errors.push(`Fila ${rowNum}: Error procesando ${row.codigo} - ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Procesados ${rawData.length} registros`,
      results,
    });
  } catch (error) {
    console.error("Error importing Excel:", error);
    return NextResponse.json(
      { error: "Error al procesar archivo Excel" },
      { status: 500 }
    );
  }
}

// GET para descargar plantilla
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Obtener productos actuales para generar plantilla con datos
    const products = await prisma.product.findMany({
      include: {
        category: true,
        inventory: true,
        pricing: true,
      },
      orderBy: { code: "asc" },
    });

    const data = products.map(p => ({
      CODIGO: p.code,
      NOMBRE: p.name,
      DESCRIPCION: p.description || "",
      CATEGORIA: p.category.name,
      STOCK: p.inventory?.stock || 0,
      PRECIO_USD: p.pricing?.priceUsd || 0,
    }));

    // Crear workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar anchos de columna
    ws["!cols"] = [
      { wch: 15 }, // CODIGO
      { wch: 40 }, // NOMBRE
      { wch: 50 }, // DESCRIPCION
      { wch: 20 }, // CATEGORIA
      { wch: 10 }, // STOCK
      { wch: 12 }, // PRECIO_USD
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Productos");

    // Generar buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="productos_houmi_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { error: "Error al generar plantilla" },
      { status: 500 }
    );
  }
}
