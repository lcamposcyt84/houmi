import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Allow access to login page without auth
  // The login page will handle its own redirect if already authenticated

  return (
    <div className="min-h-screen bg-gray-50">
      {session ? (
        <div className="flex">
          <AdminSidebar />
          <div className="flex-1 ml-64">
            <AdminHeader />
            <main className="p-6">{children}</main>
          </div>
        </div>
      ) : (
        <main>{children}</main>
      )}
    </div>
  );
}





