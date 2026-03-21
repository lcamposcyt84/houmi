import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { getPhpApiBaseUrl } from "@/lib/php-api-base-url";
import { PurchasesTable } from "./PurchasesTable";

export const metadata: Metadata = {
  title: "Compras | Admin",
  description: "Gestión de compras e inventario entrante",
};

async function getPurchases() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const API_URL = getPhpApiBaseUrl();

  let purchases: any[] = [];
  let exchangeRate = 40;

  try {
    const [res, settingsRes] = await Promise.all([
      fetch(`${API_URL}/admin/purchases/get.php`, {
        headers: { Cookie: `admin_token=${token}` },
        cache: "no-store",
      }),
      fetch(`${API_URL}/admin/settings/get.php`, {
        headers: { Cookie: `admin_token=${token}` },
        cache: "no-store",
      }),
    ]);

    if (res.ok) {
      const data = await res.json();
      purchases = data.purchases || [];
    }
    if (settingsRes.ok) {
      const sd = await settingsRes.json();
      exchangeRate = sd.settings?.exchangeRateUsdToVes || 40;
    }
  } catch (e) {
    console.error("Failed to fetch purchases from PHP API", e);
  }

  return { purchases, exchangeRate };
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
