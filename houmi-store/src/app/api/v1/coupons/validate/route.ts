import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const ValidateCouponSchema = z.object({
  code: z.string().min(1).max(50),
  totalUsd: z.number().positive(),
});

// POST /api/v1/coupons/validate — validate a coupon code and return discount amount
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = ValidateCouponSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { code, totalUsd } = parsed.data;
  const now = new Date();

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "Cupón inválido o inactivo", valid: false }, { status: 404 });
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    return NextResponse.json({ error: "El cupón ha expirado", valid: false }, { status: 400 });
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    return NextResponse.json({ error: "El cupón aún no está activo", valid: false }, { status: 400 });
  }

  if (coupon.maxUses != null && coupon.currentUses >= coupon.maxUses) {
    return NextResponse.json({ error: "El cupón ha alcanzado su límite de usos", valid: false }, { status: 400 });
  }

  if (coupon.minPurchaseUsd != null && totalUsd < coupon.minPurchaseUsd) {
    return NextResponse.json({
      error: `El monto mínimo de compra es $${coupon.minPurchaseUsd.toFixed(2)}`,
      valid: false,
    }, { status: 400 });
  }

  // Calculate discount
  let discountUsd = 0;
  if (coupon.discountType === "percentage") {
    discountUsd = (totalUsd * coupon.discountValue) / 100;
    if (coupon.maxDiscountUsd) discountUsd = Math.min(discountUsd, coupon.maxDiscountUsd);
  } else if (coupon.discountType === "fixed_usd") {
    discountUsd = Math.min(coupon.discountValue, totalUsd);
  }

  return NextResponse.json({
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
    discountUsd: parseFloat(discountUsd.toFixed(2)),
    finalTotalUsd: parseFloat((totalUsd - discountUsd).toFixed(2)),
  });
}
