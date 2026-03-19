import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the local .env file explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function main() {
  console.log("Starting admin user creation...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@houmi.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "houmi2024secure";

  console.log(`Checking for existing admin: ${adminEmail}`);

  try {
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`Admin ${adminEmail} already exists. Updating password...`);
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await prisma.admin.update({
        where: { email: adminEmail },
        data: { password: hashedPassword }
      });
      
      console.log("Admin password updated successfully.");
    } else {
      console.log(`Creating new admin: ${adminEmail}...`);
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await prisma.admin.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: "Administrator",
          role: "superadmin",
          isActive: true
        }
      });
      
      console.log("Admin user created successfully.");
    }
  } catch (error) {
    console.error("Error creating/updating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
