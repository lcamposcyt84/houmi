import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";

// API to upload and set a customer's avatar
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen válida" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename: avatar-{customerId}-{timestamp}.ext
    const ext = path.extname(file.name) || ".jpg";
    const filename = `avatar-${session.customerId}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // Save locally to public/uploads/avatars
    await writeFile(filePath, buffer);

    const url = `/uploads/avatars/${filename}`;

    // Update customer in database using raw query to bypass stale Prisma client types
    await prisma.$executeRawUnsafe(
      `UPDATE Customer SET avatar = ? WHERE id = ?`,
      url,
      session.customerId
    );

    return NextResponse.json({ url, success: true });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
