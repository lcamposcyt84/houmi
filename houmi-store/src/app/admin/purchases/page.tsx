import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PurchasesTable } from "./PurchasesTable";

export const metadata: Metadata = {
  title: "Compras | Admin",
  description: "Gestión de compras e inventario entrante",
};

async function getPurchases() {
  const [purchases, settings] = await Promise.all([
    prisma.purchase.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    }),
    prisma.settings.findUnique({ where: { id: "main" } }),
  ]);

  return {
    purchases,
    exchangeRate: settings?.exchangeRateUsdToVes || 40,
  };
}

export default async function PurchasesPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { purchases, exchangeRate } = await getPurchases();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">Compras</h1>
        <p className="text-brand-text-muted">
          Registro de compras e inventario entrante
        </p>
      </div>

      <PurchasesTable purchases={purchases} exchangeRate={exchangeRate} />
    </div>
  );
}
