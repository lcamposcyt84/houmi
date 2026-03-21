import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.review.updateMany({ data: { isApproved: true } });
console.log('Todas las reseñas antiguas fueron aprobadas para pruebas.');
process.exit(0);
