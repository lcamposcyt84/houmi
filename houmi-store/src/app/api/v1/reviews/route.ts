import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";

const ReviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
});

// GET /api/v1/reviews?productId=xxx — public: get approved reviews for a product
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId requerido" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    include: {
      customer: { select: { firstName: true, lastName: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { id: true },
  });

  return NextResponse.json({
    reviews,
    averageRating: stats._avg.rating ?? 0,
    totalReviews: stats._count.id,
  });
}

// POST /api/v1/reviews — create a review (requires login)
export async function POST(request: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Debes iniciar sesión para dejar una reseña" }, { status: 401 });

  const body = await request.json();
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { productId, rating, title, comment } = parsed.data;

  // Check if customer purchased the product (for "verified purchase" badge)
  const hasPurchased = await prisma.saleItem.findFirst({
    where: { productId, sale: { customerId: session.customerId, status: { in: ["paid", "completed"] } } },
  });

  try {
    const review = await prisma.review.create({
      data: {
        productId,
        customerId: session.customerId,
        rating,
        title,
        comment,
        isVerified: !!hasPurchased,
        isApproved: false, // Requires admin moderation
      },
    });
    return NextResponse.json({ success: true, review, message: "Tu reseña está pendiente de aprobación" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ya dejaste una reseña para este producto" }, { status: 409 });
  }
}
