import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ExpensesTable } from "./ExpensesTable";

export const metadata: Metadata = {
  title: "Gastos | Admin",
  description: "Gestión de gastos operativos",
};

async function getExpenses() {
  const [expenses, settings] = await Promise.all([
    prisma.expense.findMany({
      orderBy: { date: "desc" },
    }),
    prisma.settings.findUnique({ where: { id: "main" } }),
  ]);

  return {
    expenses,
    exchangeRate: settings?.exchangeRateUsdToVes || 40,
  };
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
