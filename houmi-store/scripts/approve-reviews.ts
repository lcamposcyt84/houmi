import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.review.updateMany({
    where: {
      isApproved: false,
    },
    data: {
      isApproved: true,
    },
  })
  console.log(`✅ ${result.count} reseñas pendientes han sido aprobadas manualmente.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
