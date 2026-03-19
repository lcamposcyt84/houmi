import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createTestCustomer() {
  const email = "cliente@houmi.com";
  const password = "Houmi2024!";

  console.log("Creando cliente de prueba...");

  const existing = await prisma.customer.findUnique({ where: { email } });

  if (existing) {
    console.log(`✅ El cliente ya existe: ${email}`);
    console.log(`   Password: ${password}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.customer.create({
    data: {
      email,
      password: hashedPassword,
      firstName: "Cliente",
      lastName: "Prueba",
      phone: "+58 412 000 0000",
      isActive: true,
      emailVerified: true,
    },
  });

  console.log("✅ Cliente creado exitosamente:");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   URL:      http://localhost:3000/login`);
}

createTestCustomer()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
