import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { getPhpApiBaseUrl } from "@/lib/php-api-base-url";
import { ExpensesTable } from "./ExpensesTable";

export const metadata: Metadata = {
  title: "Gastos | Admin",
  description: "Gestión de gastos operativos",
};

async function getExpenses() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const API_URL = getPhpApiBaseUrl();

  let expenses: any[] = [];
  let exchangeRate = 40;

  try {
    const [res, settingsRes] = await Promise.all([
      fetch(`${API_URL}/admin/expenses/get.php`, {
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
      expenses = data.expenses || [];
    }
    if (settingsRes.ok) {
      const sd = await settingsRes.json();
      exchangeRate = sd.settings?.exchangeRateUsdToVes || 40;
    }
  } catch (e) {
    console.error("Failed to fetch expenses from PHP API", e);
  }

  return { expenses, exchangeRate };
}

export default async function ExpensesPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { expenses, exchangeRate } = await getExpenses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">Gastos</h1>
        <p className="text-brand-text-muted">
          Control de gastos operativos
        </p>
      </div>

      <ExpensesTable expenses={expenses} exchangeRate={exchangeRate} />
    </div>
  );
}
